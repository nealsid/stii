from django.conf.urls import patterns, url

from anfang import views

urlpatterns = patterns(
  '',
  url(r'^$', views.start, name='start'),
  url(r'^mark-relationship$', views.mark_relationship, name="mark_relationship"),
  url(r'^picture-save$', views.picture_save, name="picture_save"),
  url(r'^status-update$', views.new_status, name="new_status"),
  url(r'^fetch-status-updates$', views.get_status_updates_for_user, name="get_status_updates"),
  url(r'^delete-status$', views.delete_status, name="delete_status"),

  url(r'^profile_picture_upload$', views.profile_picture_upload, name='profile_picture_upload'),
  url(r'^settings_save$', views.save_settings, name='save_settings'),
  url(r'^logout$', views.logout, name="logout_no_confirm"),
)
