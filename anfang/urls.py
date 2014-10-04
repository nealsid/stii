from django.conf.urls import patterns, url

from anfang import views

urlpatterns = patterns(
    '',
    url(r'^$', views.index, name='index'),
    url(r'^process_login$', views.process_login, name='loginproc'),
    url(r'^start$', views.start, name='start'),
    url(r'^new-user$', views.new_user, name='new-user'),
    url(r'^new-user-create$', views.new_user_create, name='new-user-create'),
)
