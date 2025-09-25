# api/models.py
from django.db import models
from django.utils import timezone

class WorkoutLog(models.Model):
    workout_name = models.CharField(max_length=100)
    exercise_name = models.CharField(max_length=100)
    sets = models.IntegerField()
    reps = models.IntegerField()
    weight = models.FloatField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.exercise_name} - {self.weight}x{self.reps}"