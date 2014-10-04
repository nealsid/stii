from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^anfang/', include('anfang.urls', namespace="anfang")),
    url(r'^admin/', include(admin.site.urls)),
)
