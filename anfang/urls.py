from django.conf.urls import patterns, url

from anfang import views

urlpatterns = patterns(
    '',
    url(r'^$', views.index, name='index'),
    url(r'^start$', views.start, name='start'),
    url(r'^mark-relationship$', views.mark_relationship, name="mark_relationship"),
)
