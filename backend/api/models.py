# In api/models.py, add this new model class

from django.db import models
from django.utils import timezone

# Represents an exercise definition
class Exercise(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, default="Misc") # Add this line
    metric1_name = models.CharField(max_length=50, default="Weight")
    metric1_units = models.JSONField(default=list)
    metric2_name = models.CharField(max_length=50, default="Reps")
    metric2_units = models.JSONField(default=list)

    def __str__(self):
        return self.name
    
# Represents a single workout session on a specific day
class WorkoutSession(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} on {self.date}"

# Represents a single set within a WorkoutSession
class WorkoutSet(models.Model):
    session = models.ForeignKey(WorkoutSession, related_name='sets', on_delete=models.CASCADE)
    exercise_name = models.CharField(max_length=100) # This remains a CharField
    set_number = models.IntegerField()
    metric1_value = models.FloatField()
    metric1_unit = models.CharField(max_length=10)
    metric2_value = models.FloatField()
    metric2_unit = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.exercise_name} - Set {self.set_number}"