from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView
)

urlpatterns = [
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('createUser/', views.CreateUserView.as_view(), name="create-user"),
    path("readAllUsers/", views.readAllUsersView.as_view(), name="read-all-users"),
    path('readSelfUser/', views.ReadSelfUserView.as_view(), name="read-self-user"),
    path('updateSelfUser/', views.UpdateSelfUserView.as_view(), name="update-self-user"),
    
    path("readAllPages/", views.readAllPagesView.as_view(), name="read-all-pages"),
    path('pages/<str:page_name>/', views.readPageView.as_view(), name="read-page"),
]