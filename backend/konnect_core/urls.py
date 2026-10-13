from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Admin Interface
    path('admin/', admin.site.urls),

    # OpenAPI 3 Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc-ui'),

    # Modular API Routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/classes/', include('apps.classes.urls')),
    path('api/sessions/', include('apps.live_sessions.urls')),
    path('api/assessments/', include('apps.assessments.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/collaboration/', include('apps.collaboration.urls')),
    path('api/communication/', include('apps.communication.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/future/', include('apps.future_features.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
