import os
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Frame
from .serializers import FrameSerializer


class FrameViewSet(viewsets.ModelViewSet):
    queryset = Frame.objects.all()
    serializer_class = FrameSerializer

    def create(self, request, *args, **kwargs):
        photos = request.FILES.getlist("photos")

        if not photos:
            return Response(
                {"error": "No photos provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        created_frames = []
        for photo in photos:
            # Get the original filename without extension as the name
            name = os.path.splitext(photo.name)[0]

            frame = Frame.objects.create(name=name, photo=photo)
            created_frames.append(frame)

        serializer = self.get_serializer(created_frames, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        # Delete the photo file from filesystem before deleting the model
        if instance.photo and os.path.isfile(instance.photo.path):
            os.remove(instance.photo.path)
        instance.delete()

    @action(detail=False, methods=["post"], url_path="batch-delete")
    def batch_delete(self, request):
        ids = request.data.get("ids", [])

        if not ids:
            return Response(
                {"error": "No frame IDs provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        frames = Frame.objects.filter(id__in=ids)
        deleted_count = 0

        for frame in frames:
            # Delete the photo file from filesystem
            if frame.photo and os.path.isfile(frame.photo.path):
                os.remove(frame.photo.path)
            frame.delete()
            deleted_count += 1

        return Response(
            {"message": f"Successfully deleted {deleted_count} frames"},
            status=status.HTTP_200_OK,
        )
