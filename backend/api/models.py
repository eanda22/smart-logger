# api/models.py
from django.db import models
from django.utils import timezone

class WorkoutLog(models.Model):
    workout_name = models.CharField(max_length=100)
    exercise_name = models.CharField(max_length=100)
    set_number = models.IntegerField()
    metric1_value = models.FloatField()
    metric1_unit = models.CharField(max_length=10)
    metric2_value = models.FloatField()
    metric2_unit = models.CharField(max_length=10)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.exercise_name} - Set {self.set_number}"