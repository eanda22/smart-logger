# api/serializers.py
from rest_framework import serializers
from .models import WorkoutLog

class WorkoutLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutLog
        fields = '__all__' # Include all fields from the model