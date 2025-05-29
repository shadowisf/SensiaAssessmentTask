from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status 
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CreateUserSerializer, CustomTokenObtainPairSerializer, UpdateUserSerializer, ReadUserSerializer

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
    
class ReadUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        serializer = ReadUserSerializer(user)
        return Response(serializer.data)

class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        serializer = UpdateUserSerializer(user, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
