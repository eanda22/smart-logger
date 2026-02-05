from rest_framework import serializers
from .models import WorkoutSet, WorkoutSession, Exercise

# This serializer handles the individual sets
class WorkoutSetSerializer(serializers.ModelSerializer):
    # When reading, this will use the exercise's name.
    # When writing, it will find the Exercise object with the matching name.
    exercise = serializers.SlugRelatedField(
        queryset=Exercise.objects.all(),
        slug_field='name'
    )

    class Meta:
        model = WorkoutSet
        fields = ['id', 'exercise', 'set_number', 'metric1_value', 'metric1_unit', 'metric2_value', 'metric2_unit']

# This is the main serializer that now handles the nested creation
class WorkoutSessionSerializer(serializers.ModelSerializer):
    # This line tells the serializer to expect a list of sets
    sets = WorkoutSetSerializer(many=True)

    class Meta:
        model = WorkoutSession
        fields = ['id', 'name', 'date', 'created_at', 'sets']

    def create(self, validated_data):
        # 1. Pop the nested 'sets' data out of the main validated_data dictionary.
        sets_data = validated_data.pop('sets')
        
        # 2. Create the main WorkoutSession object with the remaining data.
        session = WorkoutSession.objects.create(**validated_data)
        
        # 3. Loop through the list of set data we popped out earlier.
        for set_data in sets_data:
            # 4. For each item in the list, create a WorkoutSet object,
            #    manually linking it to the session we just created.
            WorkoutSet.objects.create(session=session, **set_data)
            
        # 5. Return the parent session instance.
        return session

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'