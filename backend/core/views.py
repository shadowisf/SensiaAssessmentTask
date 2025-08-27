import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from core.models import Page, Comment, User, UserPageAccess
from core.serializers import CommentSerializer, CustomTokenObtainPairSerializer, PageSerializer, CreateUserSerializer, ReadUserSerializer, UpdateUserSerializer, UserAccessSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone

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

        if getattr(request.user, "role", None) != "admin":
            if comment.author != request.user:
                return Response(
                    {"detail": "You can only update your own comment."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        if comment.content != request.data.get("content", comment.content):
            comment.history.append({
                "user_id": request.user.id,
                "user_name": request.user.full_name,
                "content": comment.content,
                "timestamp": timezone.now().isoformat(),
            })
            comment.save(update_fields=["history"])

        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Comment updated successfully"},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class DeleteCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)

        if getattr(request.user, "role", None) != "admin":
            if comment.author != request.user:
                return Response(
                    {"detail": "You can only delete your own comment."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        comment.delete()
        return Response(
            {"message": "Comment deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )

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
    
class UpdateFullNameView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        new_full_name = request.data.get("full_name", "").strip()

        if not new_full_name:
            return Response(
                {"detail": "Full name cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.full_name = new_full_name
        user.save(update_fields=["full_name"])

        return Response(
            {"message": "Full name updated successfully.", "full_name": user.full_name},
            status=status.HTTP_200_OK
        )
        
class RequestOTPView(APIView):
    """
    Step 1: User enters email → we check if it exists.
    If yes, generate OTP and store it in the user model.
    """
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        otp = f"{random.randint(0, 999999):06d}"
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save(update_fields=["otp", "otp_created_at"])

        return Response(
            {
                "detail": "OTP sent successfully to your email",
                "otp": otp,
            },
            status=status.HTTP_200_OK
        )

OTP_EXPIRY_MINUTES = 10

class VerifyOTPView(APIView):
    """
    Step 2: User submits OTP → verify it.
    """
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"detail": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid email"}, status=status.HTTP_404_NOT_FOUND)

        if not user.otp or user.otp != otp:
            return Response({"detail": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > (user.otp_created_at + timezone.timedelta(minutes=OTP_EXPIRY_MINUTES)):
            return Response({"detail": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "OTP verified successfully"}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    Step 3: User submits OTP + new password → reset password.
    """
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not email or not otp or not new_password:
            return Response({"detail": "Email, OTP, and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid email"}, status=status.HTTP_404_NOT_FOUND)

        if not user.otp or user.otp != otp:
            return Response({"detail": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > (user.otp_created_at + timezone.timedelta(minutes=OTP_EXPIRY_MINUTES)):
            return Response({"detail": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.otp = None
        user.otp_created_at = None
        user.save(update_fields=["password", "otp", "otp_created_at"])

        return Response({"detail": "Password reset successfully"}, status=status.HTTP_200_OK)