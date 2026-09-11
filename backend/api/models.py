import uuid
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=100, default='Участник совещаний')

    def __str__(self):
        return self.full_name or self.user.username

class Meeting(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=255)
    date = models.DateField(auto_now_add=True)
    start_time = models.CharField(max_length=10, default='10:00')
    end_time = models.CharField(max_length=10, default='11:00')
    participants = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('scheduled', 'Запланировано'), ('in_progress', 'В процессе'), ('processed', 'Обработано')],
        default='in_progress'
    )
    summary = models.TextField(blank=True, default='')
    decisions = models.JSONField(default=list, blank=True)
    topics = models.JSONField(default=list, blank=True)
    open_questions = models.JSONField(default=list, blank=True)
    audio_file = models.FileField(upload_to='audio_recordings/', blank=True, null=True)
    audio_file_name = models.CharField(max_length=255, blank=True, default='')
    duration_seconds = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class TranscriptSegment(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='segments')
    speaker_id = models.CharField(max_length=50, default='spk-1')
    speaker_name = models.CharField(max_length=100, default='Спикер 1')
    start_time = models.FloatField(default=0)
    end_time = models.FloatField(default=0)
    text = models.TextField()
    sentiment = models.CharField(max_length=20, default='neutral')

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"[{self.start_time}s] {self.speaker_name}: {self.text[:30]}"

class ActionItem(models.Model):
    id = models.CharField(max_length=64, primary_key=True, default=uuid.uuid4)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='action_items', null=True, blank=True)
    meeting_title = models.CharField(max_length=255, blank=True, default='')
    title = models.CharField(max_length=500)
    assignee = models.CharField(max_length=255, default='Не назначен')
    deadline = models.CharField(max_length=20, blank=True, default='')
    priority = models.CharField(
        max_length=20,
        choices=[('high', 'Высокий'), ('medium', 'Средний'), ('low', 'Низкий')],
        default='medium'
    )
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'К исполнению'), ('in_progress', 'В работе'), ('completed', 'Выполнено')],
        default='pending'
    )
    source_timestamp = models.CharField(max_length=20, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.assignee})"
