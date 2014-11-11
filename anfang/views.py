from django.core.urlresolvers import reverse
from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404, render_to_response
from django.template import RequestContext, loader

from forms import ProfilePicForm, StatusUpdateForm, UploadedPictureForm
from models import UploadedPicture, UserProfile, UserRelationship, StatusUpdate
from hashers import AnfangPasswordHasher

import datetime
import logging

# Create your views here.
def index(request):
    return render(request, 'anfang/index.html')

@login_required
def new_status(request):
    if request.method == 'POST':
        form = StatusUpdateForm(request.POST)
        if form.is_valid():
            logging.info("Saving status update")
            status_update = form.save(commit=False)
            status_update.relationship = request.user.userprofile.primary_relationship
            status_update.posting_user = request.user
            status_update.time = datetime.datetime.now()
            status_update.save()
    return HttpResponseRedirect("/anfang/start")

@login_required
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

@login_required
def picture_edit(request):
    pid = request.GET['pid']
    pToEdit = UploadedPicture.objects.get(id=pid)
    context = RequestContext(request, {
        'pic_url' : pToEdit.picture.url,
        'pic': pToEdit,
        'img_height': pToEdit.picture.height,
        'img_width': pToEdit.picture.width,
    })
    return render_to_response("anfang/picture-edit.html",
                              context_instance=context)

@login_required
def picture_upload_for_editing(request):
    if request.method == "POST":
        form = UploadedPictureForm(request.POST, request.FILES)
        if form.is_valid():
            pic = form.save()
            return HttpResponseRedirect("/anfang/edit?pid=" + str(pic.id))

def handle_uploaded_file(f):
    with open('/tmp/foo.png', 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)

@login_required
def start(request):
    u = request.user
    picform = UploadedPictureForm()
    status_form = StatusUpdateForm()
    if hasattr(u, "userprofile"):
        primary_rel = u.userprofile.primary_relationship
        current_user_profile = u.userprofile
        other_user = User.objects.filter(userprofile__primary_relationship=primary_rel).exclude(id=u.id)[0]
        other_user_profile = other_user.userprofile
        potential_users = None
        status_updates = [x for x in StatusUpdate.objects.filter(relationship=primary_rel).order_by('-time') if not x.encrypted]
        user = u
    else:
        other_user = None
        potential_users = User.objects.filter(userprofile = None).exclude(id = u.id)
        other_user_profile = None
        current_user_profile = None
        status_updates = None
        user = u

    context = RequestContext(request, {
        'primaryreluser':other_user,
        'other_user_profile':other_user_profile,
        'potential_users':potential_users,
        'picform':picform,
        'status_form':status_form,
        'current_user_profile': current_user_profile,
        'status_updates':status_updates,
        'user':u
    })

    if request.GET.has_key('err') and request.GET['err'] == 'invalid_image':
        context['err'] = 'The image you uploaded does not appear to be valid'
    # template = loader.get_template('anfang/start-page.html')
    # response = HttpResponse(template.render(context),
    #                         content_type="application/xhtml+xml")
    response = render_to_response("anfang/start-page.html", context_instance=context)
    # pw_hash = u.password.split('$', 3)[3]
    # key = AnfangPasswordHasher.removeKeyForPwHash(pw_hash)
    # logging.error("looking up pw hash for key: %s" % (key))
    # if key is not None:
    #     response.set_signed_cookie("userkey", key, httponly=True)
    #     key = None
    return response

def logout(request):
    if request.user.is_authenticated:
        auth.logout(request)
    return HttpResponseRedirect(reverse('account_login'))

@login_required
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

    return HttpResponseRedirect("/anfang/start")
