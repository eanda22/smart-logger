# api/views.py
from rest_framework import viewsets
from .models import WorkoutLog
from .serializers import WorkoutLogSerializer

class WorkoutLogViewSet(viewsets.ModelViewSet):
    queryset = WorkoutLog.objects.all().order_by('-created_at')
    serializer_class = WorkoutLogSerializer