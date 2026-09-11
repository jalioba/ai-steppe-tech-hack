import os
import uuid
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import UserProfile, Meeting, TranscriptSegment, ActionItem
from .serializers import (
    UserProfileSerializer,
    MeetingSerializer,
    TranscriptSegmentSerializer,
    ActionItemSerializer
)
from .whisper_service import transcribe_audio_file
from .ollama_service import generate_protocol_from_transcript, answer_rag_question

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        full_name = request.data.get('fullName', '').strip()

        if not username or not password or not email:
            return Response({'error': 'Логин, email и пароль обязательны'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Пользователь с таким логином уже существует'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        profile = UserProfile.objects.create(user=user, full_name=full_name or username)

        return Response({
            'token': f'session-token-{user.id}-{uuid.uuid4().hex[:8]}',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'fullName': profile.full_name,
                'role': profile.role
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        user = authenticate(username=username, password=password)
        if not user:
            # Check if user exists but auth failed or create on-the-fly for seamless local test
            try:
                user = User.objects.get(username=username)
                if not user.check_password(password):
                    return Response({'error': 'Неверный пароль'}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'full_name': username})
        return Response({
            'token': f'session-token-{user.id}-{uuid.uuid4().hex[:8]}',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'fullName': profile.full_name or user.username,
                'role': profile.role
            }
        })

class MeView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            return Response({
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'fullName': profile.full_name,
                'role': profile.role
            })
        return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)

class TranscribeAudioView(APIView):
    def post(self, request):
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'error': 'Аудиофайл не прикреплен'}, status=status.HTTP_400_BAD_REQUEST)

        file_name = audio_file.name
        title = os.path.splitext(file_name)[0].replace('_', ' ').replace('-', ' ')

        # Create meeting
        meeting = Meeting.objects.create(
            title=title,
            audio_file=audio_file,
            audio_file_name=file_name,
            status='in_progress'
        )

        audio_path = meeting.audio_file.path
        raw_segments = transcribe_audio_file(audio_path)

        segments = []
        participants = set()
        for s in raw_segments:
            seg = TranscriptSegment.objects.create(
                meeting=meeting,
                speaker_id=s.get('speaker_id', 'spk-1'),
                speaker_name=s.get('speaker_name', 'Спикер 1'),
                start_time=s.get('start_time', 0.0),
                end_time=s.get('end_time', 0.0),
                text=s.get('text', ''),
                sentiment=s.get('sentiment', 'neutral')
            )
            segments.append(seg)
            participants.add(seg.speaker_name)

        meeting.participants = list(participants)
        if segments:
            meeting.duration_seconds = segments[-1].end_time
        meeting.save()

        meeting_data = MeetingSerializer(meeting, context={'request': request}).data
        segments_data = TranscriptSegmentSerializer(segments, many=True).data

        return Response({
            'meeting': meeting_data,
            'segments': segments_data
        }, status=status.HTTP_201_CREATED)

class GenerateProtocolView(APIView):
    def post(self, request):
        meeting_id = request.data.get('meetingId')
        transcript_text = request.data.get('transcriptText', '')

        meeting = None
        if meeting_id:
            meeting = Meeting.objects.filter(id=meeting_id).first()

        if not transcript_text and meeting:
            transcript_text = '\n'.join([f"{s.speaker_name}: {s.text}" for s in meeting.segments.all()])

        if not transcript_text.strip():
            return Response({'error': 'Текст стенограммы отсутствует'}, status=status.HTTP_400_BAD_REQUEST)

        extracted = generate_protocol_from_transcript(transcript_text)

        action_items_created = []
        if meeting:
            meeting.summary = extracted.get('summary', '')
            meeting.decisions = extracted.get('decisions', [])
            meeting.topics = extracted.get('topics', [])
            meeting.open_questions = extracted.get('openQuestions', [])
            meeting.status = 'processed'
            meeting.save()

            # Save action items
            for item in extracted.get('actionItems', []):
                ai = ActionItem.objects.create(
                    meeting=meeting,
                    meeting_title=meeting.title,
                    title=item.get('title', 'Без названия'),
                    assignee=item.get('assignee', 'Не назначен'),
                    deadline=item.get('deadline', ''),
                    priority=item.get('priority', 'medium'),
                    notes=item.get('notes', '')
                )
                action_items_created.append(ai)
        else:
            for item in extracted.get('actionItems', []):
                ai = ActionItem(
                    title=item.get('title', 'Без названия'),
                    assignee=item.get('assignee', 'Не назначен'),
                    deadline=item.get('deadline', ''),
                    priority=item.get('priority', 'medium'),
                    notes=item.get('notes', '')
                )
                action_items_created.append(ai)

        return Response({
            'summary': extracted.get('summary', ''),
            'decisions': extracted.get('decisions', []),
            'topics': extracted.get('topics', []),
            'openQuestions': extracted.get('openQuestions', []),
            'actionItems': ActionItemSerializer(action_items_created, many=True).data
        })

class RagChatView(APIView):
    def post(self, request):
        question = request.data.get('question', '').strip()
        mode = request.data.get('mode', 'concise')
        meeting_context = request.data.get('meetingContext', '')

        if not question:
            return Response({'error': 'Вопрос не может быть пустым'}, status=status.HTTP_400_BAD_REQUEST)

        res = answer_rag_question(question, mode, meeting_context)
        return Response(res)

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all().order_by('-created_at')
    serializer_class = MeetingSerializer

class ActionItemViewSet(viewsets.ModelViewSet):
    queryset = ActionItem.objects.all().order_by('-created_at')
    serializer_class = ActionItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        meeting_id = self.request.query_params.get('meeting')
        if meeting_id:
            qs = qs.filter(meeting_id=meeting_id)
        return qs
