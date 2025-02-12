from django.core.files import File
from django.core.urlresolvers import reverse
from django.contrib import auth
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404, render_to_response
from django.template import RequestContext, loader

from .forms import ProfilePicForm, StatusUpdateForm
from .hashers import AnfangPasswordHasher
from .key_management import user_login_and_key_required
from .models import UserProfile, UserRelationship, StatusUpdate
from .settings_dict import Settings

import datetime
import logging
import json
import tempfile
import time

def format_time_like_we_want_to(d):
  right_now = datetime.datetime.now()
  today_at_midnight = datetime.datetime.now().replace(hour=0,minute=0,second=0, microsecond=0)
  yesterday_at_midnight = today_at_midnight - datetime.timedelta(days=1)

  date_without_hms = d.replace(hour=0,minute=0,second=0, microsecond=0)
  if today_at_midnight == date_without_hms:
    return "Earlier today"
  elif yesterday_at_midnight == date_without_hms:
    return "Yesterday"
  else:
    return d.strftime("%h %d, %I:%M:%S")

@user_login_and_key_required
def get_status_updates_for_user(request):
  u = request.user
  primary_rel = u.userprofile.primary_relationship
  status_updates = [x for x in StatusUpdate.objects.filter(relationship=primary_rel).order_by('-time') if not x.encrypted]
  status_updates_python = []
  for s in status_updates:
    status_updates_python.append({
      'time':format_time_like_we_want_to(s.time),
      'text':s.text,
      'id':s.id,
      'url':s.posting_user.userprofile.profile_picture.picture.url
    })
  return HttpResponse(json.dumps(status_updates_python))

@user_login_and_key_required
def save_settings(request):
  u = request.user
  new_settings_json_string = request.GET['options_dictionary_json']
  new_settings = Settings.fromJSON(new_settings_json_string)
  user_profile = u.userprofile
  new_settings.updateUserProfile(user_profile)
  user_profile.save()
  return HttpResponse("OK");

@user_login_and_key_required
def delete_status(request):
  u = request.user
  s_id = request.GET['sid']
  to_delete = StatusUpdate.objects.filter(posting_user=u,
                                          id=s_id)
  if len(to_delete) == 1:
    to_delete.delete()
    return HttpResponse("OK")
  else:
    return HttpResponse("NOT_FOUND")

@user_login_and_key_required
def new_status(request):
  if request.method == 'POST':
    form = StatusUpdateForm(request.POST)
    if form.is_valid():
      logging.error("Saving status update")
      status_update = form.save(commit=False)
      status_update.relationship = request.user.userprofile.primary_relationship
      status_update.posting_user = request.user
      status_update.time = datetime.datetime.now()
      status_update.save()
    else:
      logging.error(form.errors)
  return HttpResponseRedirect(reverse('start'))

@user_login_and_key_required
def picture_save(request):
  if request.method == 'POST':
    form = ProfilePicForm(request.POST, request.FILES,
                          instance=request.user.userprofile.profile_picture)
    if form.is_valid():
      # file is saved
      logging.info("Saving new profile picture for " + str(request.user))
      pic = form.save(commit=False)
      pic.user_profile = request.user.userprofile
      u = request.user
      pic.save()
      u.userprofile.profile_picture = pic
      u.userprofile.save()
      return HttpResponseRedirect('/anfang/start')
    else:
      logging.warning("Invalid profile picture for " + str(request.user) + ".  " + str(form.errors))
      return HttpResponseRedirect('/anfang/start?err=invalid_image')

@user_login_and_key_required
def profile_picture_upload(request):
  if request.method == "POST":
    u = request.user
    up = u.userprofile
    ppf = request.POST['data']
    img_data = ppf.decode("base64")
    temp_image = tempfile.NamedTemporaryFile()
    temp_image.write(img_data)
    django_temp_image = File(temp_image)
    up.profile_picture.picture.save(temp_image.name, django_temp_image)
    up.save()
    logging.error("temp file: " + temp_image.name)

@user_login_and_key_required
def start(request):
  u = request.user
  status_form = StatusUpdateForm()
  if hasattr(u, "userprofile"):
    primary_rel = u.userprofile.primary_relationship
    current_user_profile = u.userprofile
    other_user = User.objects.filter(userprofile__primary_relationship=primary_rel).exclude(id=u.id)[0]
    other_user_profile = other_user.userprofile
    potential_users = None
    user = u
    settings_dict = Settings.fromUserProfile(current_user_profile).asJSON()
  else:
    other_user = None
    potential_users = User.objects.filter(userprofile = None).exclude(id = u.id)
    other_user_profile = None
    current_user_profile = None
    user = u
    settings_dict = None

  context = RequestContext(request, {
    'primaryreluser':other_user,
    'other_user_profile':other_user_profile,
    'potential_users':potential_users,
    'status_form':status_form,
    'current_user_profile': current_user_profile,
    'user':u,
    'settings_dict':settings_dict
  })

  if request.GET.has_key('err') and request.GET['err'] == 'invalid_image':
    context['err'] = 'The image you uploaded does not appear to be valid'
  response = render_to_response("anfang/start-page.html", context_instance=context)
  return response

def logout(request):
  if request.user.is_authenticated:
    auth.logout(request)
    return HttpResponseRedirect(reverse('account_login'))

@user_login_and_key_required
def mark_relationship(request):
  other_user_id = request.GET['with_id']
  dst_user = User.objects.get(id=other_user_id)
  user = request.user

  # There is a very particular order here, because Django's APi
  # seems to require objects to be saved before they can be
  # referenced by another object.  So we essentially have to
  # create/save the objects from the order of: 1) UserRelationship(1
  # instance), UserProfile (2 instances), and User(2 instances)
  rel = UserRelationship(title=u'primary')
  rel.save()

  user.userprofile = UserProfile(user=user, primary_relationship = rel)
  user.userprofile.save()
  user.save()

  dst_user.userprofile = UserProfile(user=dst_user, primary_relationship = rel)
  dst_user.userprofile.save()
  dst_user.save()

  return HttpResponseRedirect(reverse("anfang:start"))
