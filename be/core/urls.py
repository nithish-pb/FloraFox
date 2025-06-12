
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/diagnostics/', include('user.urls')),
    path('auth/', include('reguserlog.urls')),  # Add this line
    path('user/', include('reguserlog.urls')),
    path('api/v1/ai_crop_assistance/', include('ai_crop_assistance.urls')),
    path('store/', include('store.urls')),
    path("api/", include("submissions.urls")),
    path("api/", include("store.urls")),

    
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)