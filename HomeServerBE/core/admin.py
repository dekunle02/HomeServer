from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import Frame
from django.utils.html import mark_safe


class FrameAdmin(ModelAdmin):
    list_display = ("id", "name", "image_preview")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.photo:
            return mark_safe(f'<img src="{obj.photo.url}" width="50" height="50" />')
        return "No Image"

    image_preview.allow_tags = True
    image_preview.short_description = "Image Preview"


admin.site.register(Frame, FrameAdmin)
