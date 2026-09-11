from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    MeView,
    TranscribeAudioView,
    GenerateProtocolView,
    RagChatView,
    MeetingViewSet,
    ActionItemViewSet
)

router = DefaultRouter()
router.register(r'meetings', MeetingViewSet, basename='meeting')
router.register(r'action-items', ActionItemViewSet, basename='action-item')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('transcribe/', TranscribeAudioView.as_view(), name='transcribe'),
    path('generate-protocol/', GenerateProtocolView.as_view(), name='generate-protocol'),
    path('rag-chat/', RagChatView.as_view(), name='rag-chat'),
    path('', include(router.urls)),
]
