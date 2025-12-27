from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as UA
from .models import User


@admin.register(User)
class UserAdmin(UA):
    list_display = ("id", "username", "email")
