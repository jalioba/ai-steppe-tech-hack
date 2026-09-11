from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Meeting, TranscriptSegment, ActionItem

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'full_name', 'role']

class TranscriptSegmentSerializer(serializers.ModelSerializer):
    speakerId = serializers.CharField(source='speaker_id')
    speakerName = serializers.CharField(source='speaker_name')
    startTime = serializers.FloatField(source='start_time')
    endTime = serializers.FloatField(source='end_time')

    class Meta:
        model = TranscriptSegment
        fields = ['id', 'speakerId', 'speakerName', 'startTime', 'endTime', 'text', 'sentiment']

class ActionItemSerializer(serializers.ModelSerializer):
    meetingId = serializers.CharField(source='meeting.id', read_only=True)
    meetingTitle = serializers.CharField(source='meeting_title', required=False)
    sourceTimestamp = serializers.CharField(source='source_timestamp', required=False, allow_blank=True)

    class Meta:
        model = ActionItem
        fields = ['id', 'meetingId', 'meetingTitle', 'title', 'assignee', 'deadline', 'priority', 'status', 'sourceTimestamp', 'notes']

class MeetingSerializer(serializers.ModelSerializer):
    startTime = serializers.CharField(source='start_time')
    endTime = serializers.CharField(source='end_time')
    openQuestions = serializers.JSONField(source='open_questions', required=False)
    audioFileName = serializers.CharField(source='audio_file_name', required=False)
    audioUrl = serializers.SerializerMethodField()
    durationSeconds = serializers.FloatField(source='duration_seconds', required=False)
    segments = TranscriptSegmentSerializer(many=True, read_only=True)
    actionItems = ActionItemSerializer(source='action_items', many=True, read_only=True)

    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'date', 'startTime', 'endTime', 'participants', 'status',
            'summary', 'decisions', 'topics', 'openQuestions', 'audioFileName',
            'audioUrl', 'durationSeconds', 'segments', 'actionItems'
        ]

    def get_audioUrl(self, obj):
        if obj.audio_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.audio_file.url)
            return obj.audio_file.url
        return None
