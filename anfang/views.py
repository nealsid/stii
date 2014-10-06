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
        profile = u.userprofile
        return HttpResponse("hello, %(username)s, you are in a relationship with %(reluser)s" % { "username":str(u), "reluser":str(profile.relationship)})
    else:
        context = {'primaryreluser':None}
        return render(request, "anfang/start-page.html")
        return HttpResponse("Hello, %(username)s, you are NOT in a relationship with anyone" % {"username":str(u)})
