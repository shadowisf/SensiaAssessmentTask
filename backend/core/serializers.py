from rest_framework import serializers
from core.models import Comment, Page, User, UserPageAccess
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        attrs['username'] = attrs.get('email')

        user = authenticate(
            request=self.context.get('request'),
            username=attrs['username'],
            password=attrs['password'],
        )

        if not user:
            raise AuthenticationFailed('Invalid email or password')

        data = super().validate(attrs)
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'full_name': user.full_name,
        }
        return data

class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "full_name", "password", "role"]

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            role=validated_data["role"],
        )


class ReadUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "is_staff", "is_active", "is_superuser"]
        read_only_fields = fields


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name"]

    def update(self, instance, validated_data):
        instance.full_name = validated_data.get("full_name", instance.full_name)
        instance.save()
        return instance
    
class CommentSerializer(serializers.ModelSerializer):
    author = ReadUserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'history', 'created_at']

    def create(self, validated_data):
        page = self.context.get('page')
        author = self.context.get('author')
        return Comment.objects.create(page=page, author=author, **validated_data)


class PageSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = ['id', 'name', 'slug', 'content', 'comments']

class UserAccessSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    page_name = serializers.CharField(source='page.name', read_only=True)

    class Meta:
        model = UserPageAccess
        fields = ['id', 'user', 'user_email', 'page', 'page_name', 'access_level']