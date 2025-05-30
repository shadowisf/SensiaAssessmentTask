from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status 
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CreateUserSerializer, CustomTokenObtainPairSerializer, PageSerializer, UpdateUserSerializer, ReadUserSerializer
from core.models import Page, User
from django.shortcuts import get_object_or_404

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

class readAllUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(role="user")
        serializer = ReadUserSerializer(users, many=True)
        
        return Response(serializer.data)
    
class readAllPagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pages = Page.objects.all()
        serializer = PageSerializer(pages, many=True)
        
        return Response(serializer.data)
    
class readPageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, page_name):
        normalized_name = page_slug.replace('-', ' ').lower()
        page = get_object_or_404(Page, name__iexact=normalized_name)
        serializer = PageSerializer(page)
        
        return Response(serializer.data)