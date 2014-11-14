from django.conf.urls import patterns, url

from anfang import views

urlpatterns = patterns(
    '',
    url(r'^$', views.start, name='start'),
    url(r'^mark-relationship$', views.mark_relationship, name="mark_relationship"),
    url(r'^picture-save$', views.picture_save, name="picture_save"),
    url(r'^status-update$', views.new_status, name="new_status"),
    url(r'^upload$', views.picture_upload_for_editing, name="picture_upload"),
    url(r'^edit$', views.picture_edit),
    url(r'^logout$', views.logout, name="logout_no_confirm"),
)
