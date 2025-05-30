from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        extra_fields.setdefault("full_name", "")
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        
        return self.create_user(email, password, **extra_fields)

DEFAULT_PAGE_ACCESS = {
    "Products List": "none",
    "Marketing List": "none",
    "Order List": "none",
    "Media Plans": "none",
    "Offer Pricing SKUs": "none",
    "Clients": "none",
    "Suppliers": "none",
    "Customer Support": "none",
    "Sales Reports": "none",
    "Finance & Accounting": "none"
}

ACCESS_CHOICES = [
    ('all', 'all'),
    ('view', 'View'),
    ('edit', 'Edit'),
    ('delete', 'Delete'),
    ('none', 'None'),
]

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=[
        ("admin", "Super Admin"),
        ("user", "Regular User")
    ], default="user")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

    
class Page(models.Model):
    name = models.CharField(max_length=100)
    content = models.TextField()

    def __str__(self):
        return self.name
    
class UserPageAccess(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    page = models.ForeignKey(Page, on_delete=models.CASCADE)
    access_level = models.CharField(max_length=10, choices=ACCESS_CHOICES, default='none')

    class Meta:
        unique_together = ('user', 'page')

    def __str__(self):
        return f"{self.user.email} - {self.page.name}: {self.access_level}"

class Comment(models.Model):
    page = models.ForeignKey(Page, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    history = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.author} on {self.page}"