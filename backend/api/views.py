# api/views.py
from rest_framework import viewsets
from .models import WorkoutSet, WorkoutSession, Exercise
from .serializers import WorkoutSetSerializer, ExerciseSerializer, WorkoutSessionSerializer

class WorkoutSetViewSet(viewsets.ModelViewSet):
    queryset = WorkoutSet.objects.all().order_by('-set_number')
    serializer_class = WorkoutSetSerializer
    
class WorkoutSessionViewSet(viewsets.ModelViewSet):
    queryset = WorkoutSession.objects.all().order_by('-date')
    serializer_class = WorkoutSessionSerializer
    
class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all().order_by('name')
    serializer_class = ExerciseSerializer