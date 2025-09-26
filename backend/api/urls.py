# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkoutSetViewSet, WorkoutSessionViewSet, ExerciseViewSet

router = DefaultRouter()
router.register(r'workout-sets', WorkoutSetViewSet)
router.register(r'workout-sessions', WorkoutSessionViewSet)
router.register(r'exercises', ExerciseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]