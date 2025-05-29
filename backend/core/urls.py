from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenObtainPairView.as_view(), name='token_refresh'),
    path('createUser/', views.CreateUserView.as_view(), name="create-user"),
    path('readUser/', views.ReadUserView.as_view(), name="read-user"),
    path('updateUser/', views.UpdateUserView.as_view(), name="update-user"),
]