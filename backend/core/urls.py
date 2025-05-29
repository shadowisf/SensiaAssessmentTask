from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('hello/', views.hello_world),
    path('protected/', views.protected_view),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('createUser/', views.CreateUserView.as_view(), name="create-user"),
    path('updateUser/', views.UpdateUserView.as_view(), name="update-user"),
]