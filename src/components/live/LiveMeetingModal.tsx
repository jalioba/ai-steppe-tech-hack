import React, { useState } from 'react';
import { useMeetingContext } from '../../context/MeetingContext';
import { MeetingRoom } from './MeetingRoom';
import { MeetingSummaryQnA } from './MeetingSummaryQnA';

export const LiveMeetingModal: React.FC = () => {
  const { isLiveMeetingOpen, setIsLiveMeetingOpen } = useMeetingContext();
  const [mode, setMode] = useState<'in_call' | 'summary'>('in_call');
  const [meetingTranscript, setMeetingTranscript] = useState<string>('');

  if (!isLiveMeetingOpen) return null;

  const handleEndMeeting = (transcript: string) => {
    setMeetingTranscript(transcript);
    setMode('summary');
  };

  const handleClose = () => {
    setIsLiveMeetingOpen(false);
    setMode('in_call');
    setMeetingTranscript('');
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 100,
        padding: '24px',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === 'in_call' ? (
          <MeetingRoom onEndMeeting={handleEndMeeting} />
        ) : (
          <MeetingSummaryQnA transcript={meetingTranscript} onClose={handleClose} />
        )}
      </div>
    </div>
  );
};
