from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Page, User, Comment

class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ("email", "full_name", "role", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "role")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("full_name", "role")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "role", "password1", "password2", "is_staff", "is_active"),
        }),
    )
    search_fields = ("email",)
    ordering = ("email",)


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ("created_at",)
    fields = ("author", "content", "created_at")


class PageAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "content")
    inlines = [CommentInline]


class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "page", "author", "created_at")
    list_filter = ("page", "author")
    search_fields = ("content",)


admin.site.register(Page, PageAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(User, UserAdmin)