from django.conf.urls import patterns, url

from anfang import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^process_login$', views.process_login, name='loginproc'),
)
