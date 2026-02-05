# api/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WorkoutSet, WorkoutSession, Exercise
from .serializers import WorkoutSetSerializer, ExerciseSerializer, WorkoutSessionSerializer

class WorkoutSetViewSet(viewsets.ModelViewSet):
    queryset = WorkoutSet.objects.all().order_by('-set_number')
    serializer_class = WorkoutSetSerializer
    
class WorkoutSessionViewSet(viewsets.ModelViewSet):
    queryset = WorkoutSession.objects.all().order_by('-date')
    serializer_class = WorkoutSessionSerializer

    @action(detail=False, methods=['get'])
    def latest_exercises_by_name(self, request):
        """
        Finds the latest workout session by name and returns a unique, ordered
        list of exercise names from it.
        e.g., /api/workout-sessions/latest_exercises_by_name/?name=Upper%20Body
        """
        session_name = request.query_params.get('name', None)
        if session_name:
            latest_session = WorkoutSession.objects.filter(name=session_name).order_by('-date').first()
            if latest_session:
                # Get the names of all exercises from that session, preserving the
                # order they were likely added in and ensuring uniqueness.
                exercise_names = list(WorkoutSet.objects.filter(session=latest_session)
                                      .order_by('pk')
                                      .values_list('exercise__name', flat=True))
                unique_exercise_names = list(dict.fromkeys(exercise_names))
                return Response(unique_exercise_names)
        return Response([]) # Return empty list if no session found

class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all().order_by('name')
    serializer_class = ExerciseSerializer

    @action(detail=False, methods=['get'])
    def latest_sets_by_name(self, request):
        """
        A custom endpoint to get all logged sets from the most recent session
        for a specific exercise by name.
        """
        exercise_name = request.query_params.get('name', None)
        if exercise_name:
            latest_session = WorkoutSession.objects.filter(sets__exercise__name=exercise_name).order_by('-date').first()
            if latest_session:
                # Get ALL sets from that session for that exercise, not just 3
                latest_sets = WorkoutSet.objects.filter(
                    session=latest_session,
                    exercise__name=exercise_name
                ).order_by('set_number')
                
                if latest_sets.exists():
                    serializer = WorkoutSetSerializer(latest_sets, many=True)
                    return Response(serializer.data)
        return Response([])