from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpRedirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate

# Create your views here.
def index(request):
    return render(request, 'anfang/index.html')

@login_required
def main_page(request):

def process_login(request):
    email = request.POST['email']
    password = request.POST['password']
    user = authenticate(username=email, password=password)
    if user is not None:
        login(request, user)
        return HttpResponse('hello, %(email)s' % {'email':user.email})
    else:
        return HttpResponse('hello, world!')



