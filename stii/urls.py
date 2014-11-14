from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin
from anfang import views

urlpatterns = patterns(
    '',
    url(r'^$', views.start, name='start'),
    url(r'^anfang/', include('anfang.urls', namespace="anfang")),
    url(r'^admin/', include(admin.site.urls)),
    url(r"^account/", include("account.urls")),
    url(r"^anfang/", views.start, name='home')
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
