from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from core.models import Page, Comment, User, UserPageAccess
from core.serializers import CommentSerializer, CustomTokenObtainPairSerializer, PageSerializer, CreateUserSerializer, ReadUserSerializer, UpdateUserSerializer, UserAccessSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CreateUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ReadSelfUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        serializer = ReadUserSerializer(user)
        
        return Response(serializer.data)

class UpdateSelfUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        serializer = UpdateUserSerializer(user, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            
            return Response({"message": "User updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReadAllUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(role="user")
        serializer = ReadUserSerializer(users, many=True)
        
        return Response(serializer.data)
    
class ReadAllPagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pages = Page.objects.all()
        serializer = PageSerializer(pages, many=True)
        
        return Response(serializer.data)
    
class ReadPageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, page_name):
        page = get_object_or_404(Page, slug=page_name)
        serializer = PageSerializer(page)
        
        return Response(serializer.data)
    
    
class CreateCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, page_name):
        page = get_object_or_404(Page, slug=page_name)
        serializer = CommentSerializer(data=request.data, context={'page': page, 'author': request.user})
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Comment created successfully"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UpdateCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)

        if comment.author != request.user:
            return Response({"detail": "You can only update your own comment."}, status=status.HTTP_403_FORBIDDEN)

        serializer = CommentSerializer(comment, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Comment updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)

        if comment.author != request.user:
            return Response({"detail": "You can only delete your own comment."}, status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response({"message": "Comment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class ReadAllPageAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        access = UserPageAccess.objects.all()
        serializer = UserAccessSerializer(access, many=True)
        return Response(serializer.data)
    
class UpdateAccessLevelView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, user_id, slug):
        page = get_object_or_404(Page, slug=slug)
        user = get_object_or_404(User, id=user_id)

        # Extract boolean permissions from request
        can_create = request.data.get("can_create", False)
        can_view = request.data.get("can_view", False)
        can_edit = request.data.get("can_edit", False)
        can_delete = request.data.get("can_delete", False)

        access, created = UserPageAccess.objects.get_or_create(
            user=user,
            page=page,
            defaults={
                "can_create": can_create,
                "can_view": can_view,
                "can_edit": can_edit,
                "can_delete": can_delete,
            }
        )

        # If not created, update existing permissions
        if not created:
            access.can_create = can_create
            access.can_view = can_view
            access.can_edit = can_edit
            access.can_delete = can_delete
            access.save()

        serializer = UserAccessSerializer(access)
        return Response(serializer.data, status=status.HTTP_200_OK)