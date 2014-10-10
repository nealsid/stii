from django.dispatch import receiver
from django.db.models.signals import post_save
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from forms import ProfilePicForm
from models import UserProfile, UserRelationship, StatusUpdate

# Create your views here.
def index(request):
    return render(request, 'anfang/index.html')

@login_required
def picture_save(request):
    if request.method == 'POST':
        form = ProfilePicForm(request.POST, request.FILES, instance=request.user.userprofile)
        if form.is_valid():
            # file is saved
            form.save()
            return HttpResponseRedirect('/anfang/start')
        else:
            return HttpResponseRedirect('/anfang/start?err=invalid_image')

def handle_uploaded_file(f):
    with open('/tmp/foo.png', 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)

@login_required
def start(request):
    u = request.user
    picform = ProfilePicForm(instance=u)
    if hasattr(u, "userprofile"):
        primary_rel = u.userprofile.primary_relationship
        current_user_profile = u.userprofile
        other_user = User.objects.filter(userprofile__primary_relationship=primary_rel).exclude(id=u.id)
        potential_users = None
        status_updates = StatusUpdate.objects.filter(relationship=primary_rel).order_by('-time')
    else:
        other_user = None
        potential_users = User.objects.filter(userprofile = None).exclude(id = u.id)
        current_user_profile = None
        
    context = {
        'primaryreluser':other_user,
        'potential_users':potential_users,
        'picform':picform,
        'current_user_profile': current_user_profile,
        'status_updates':status_updates,
    }
    if request.GET.has_key('err') and request.GET['err'] == 'invalid_image':
        context['err'] = 'The image you uploaded does not appear to be valid'
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
