# api/admin.py
from django.contrib import admin
from .models import WorkoutSet, Exercise, WorkoutSession

admin.site.register(WorkoutSet)
admin.site.register(WorkoutSession)
admin.site.register(Exercise)