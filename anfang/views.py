from django.dispatch import receiver
from django.db.models.signals import post_save
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from models import UserProfile, UserRelationship

# Create your views here.
def index(request):
    return render(request, 'anfang/index.html')

@login_required
def start(request):
    u = request.user
    if hasattr(u, "userprofile"):
        primary_rel = u.userprofile.primary_relationship

        other_user = User.objects.filter(userprofile__primary_relationship=primary_rel).exclude(id=u.id)
        potential_users = None
    else:
        other_user = None
        potential_users = User.objects.filter(userprofile = None).exclude(id = u.id)
    context = {
        'primaryreluser':other_user,
        'potential_users':potential_users,
    }
    return render(request, "anfang/start-page.html", context)

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
