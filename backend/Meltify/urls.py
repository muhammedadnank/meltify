from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.v1.scoop.urls')),
    path('api/v1/', include('api.v1.account.urls')),
    path('api/v1/', include('api.v1.frostycart.urls')),
    path('api/v1/', include('api.v1.order.urls')),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
