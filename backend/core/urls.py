from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView
)
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('token/', csrf_exempt(views.CustomTokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('token/refresh/', csrf_exempt(TokenRefreshView.as_view()), name='token_refresh'),
    
    path('createUser/', views.CreateUserView.as_view(), name="create-user"),
    path("readAllUsers/", views.ReadAllUsersView.as_view(), name="read-all-users"),
    path('readSelfUser/', views.ReadSelfUserView.as_view(), name="read-self-user"),
    path('updateSelfUser/', views.UpdateSelfUserView.as_view(), name="update-self-user"),
    
    path("readAllPages/", views.ReadAllPagesView.as_view(), name="read-all-pages"),
    path('readPage/<str:page_name>/', views.ReadPageView.as_view(), name="read-page"),
    
    path("createComment/<slug:page_name>/", views.CreateCommentView.as_view(), name="create-comment"),
    path('updateComment/<int:comment_id>/', views.UpdateCommentView.as_view(), name="update-comment"),
    path('deleteComment/<int:comment_id>/', views.DeleteCommentView.as_view(), name="delete-comment"),
    
    path('readAllPageAccess/', views.ReadAllPageAccessView.as_view(), name="read-all-page-access"),
    path('updateAccessLevel/<int:user_id>/<slug:slug>/', views.UpdateAccessLevelView.as_view(), name='update-access-level'),
]