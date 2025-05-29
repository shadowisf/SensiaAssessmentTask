from rest_framework import serializers
from core.models import User

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
        fields = ["id", "email", "full_name", "role"]
        read_only_fields = fields


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name"]

    def update(self, instance, validated_data):
        instance.full_name = validated_data.get("full_name", instance.full_name)
        instance.save()
        return instance