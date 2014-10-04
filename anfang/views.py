from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from models import STIIUserProfile

# Create your views here.
def index(request):
    return render(request, 'anfang/index.html')

def new_user_create(request):
    return HttpResponse("Not impl")

def new_user(request):
    return render(request, "anfang/new-user.html")

@login_required
def start(request):
    u = request.user
    if hasattr(u, "stiiuserprofile"):
        profile = u.stiiuserprofile
        return HttpResponse("hello, %(username)s, you are in a relationship with %(reluser)s" % { "username":str(u), "reluser":str(profile.relationship)})
    else:
        return HttpResponse("Hello, %(username)s, you are NOT in a relationship with anyone" % {"username":str(u)})

def process_login(request):
    email = request.POST['email']
    password = request.POST['password']
    user = authenticate(username=email, password=password)
    if user is not None:
        login(request, user)
        return HttpResponseRedirect("/anfang/start")
    else:
        return HttpResponse('hello, world!')
