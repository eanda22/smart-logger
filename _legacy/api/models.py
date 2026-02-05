from django.db import models
from django.utils import timezone

class Exercise(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, default="Misc")
    metric1_name = models.CharField(max_length=50, default="Weight")
    metric1_units = models.JSONField(default=list)
    metric2_name = models.CharField(max_length=50, default="Reps")
    metric2_units = models.JSONField(default=list)

    def __str__(self):
        return self.name

class WorkoutSession(models.Model):
    name = models.CharField(max_length=100, default="Workout")
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} on {self.date}"

class WorkoutSet(models.Model):
    session = models.ForeignKey(WorkoutSession, related_name='sets', on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    set_number = models.IntegerField()
    metric1_value = models.FloatField()
    metric1_unit = models.CharField(max_length=10)
    metric2_value = models.FloatField()
    metric2_unit = models.CharField(max_length=10)

    def __str__(self):
        return f"Set {self.set_number} of {self.exercise.name}"

