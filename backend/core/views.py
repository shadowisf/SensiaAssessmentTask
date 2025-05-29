from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status 
from .serializers import CreateUserSerializer, UpdateUserSerializer, ReadUserSerializer

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
