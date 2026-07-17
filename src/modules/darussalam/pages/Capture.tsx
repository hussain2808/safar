import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb as TipsIcon, Settings, Mic, Camera, Video, Pencil, Link2, AudioWaveform,
  Clock, Sparkles,
} from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { useRecentIdeas, captureNote, captureLink, captureMedia } from '@/modules/darussalam/features/ideas/hooks/useIdeas';
import { pickSupportedAudioMimeType, isVoiceRecordingSupported } from '@/modules/darussalam/lib/audioRecording';
import { IdeaListRow } from '@/modules/darussalam/shared/components/IdeaListRow';

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = 60_000, hr = 3_600_000, day = 86_400_000;
  if (diff < min) return 'Just now';
  if (diff < hr) return `${Math.round(diff / min)} min ago`;
  if (diff < day) return `${Math.round(diff / hr)} hr ago`;
  return `${Math.round(diff / day)}d ago`;
}

export default function DarussalamCapture() {
  const navigate = useNavigate();
  const { ideas } = useRecentIdeas(5);
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceError, setVoiceError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef(0);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setRecordingSeconds(Math.round((Date.now() - recordingStartRef.current) / 1000)), 500);
    return () => clearInterval(interval);
  }, [isRecording]);

  async function handleSaveNote() {
    if (!text.trim()) return;
    await captureNote({ title: text });
    setText('');
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') {
    const file = e.target.files?.[0];
    if (!file) return;
    await captureMedia({ type, file, mimeType: file.type });
    e.target.value = '';
  }

  async function handleVoiceToggle() {
    setVoiceError('');

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!isVoiceRecordingSupported()) {
      setVoiceError('Voice recording is not supported in this browser.');
      return;
    }
    if (!window.isSecureContext) {
      setVoiceError('Voice recording needs a secure (https) connection.');
      return;
    }

    const mimeType = pickSupportedAudioMimeType();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onerror = () => setVoiceError('Recording failed. Please try again.');
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (audioChunksRef.current.length === 0) {
          setVoiceError('No audio was captured — try holding the mic closer and speaking right after tapping.');
          return;
        }
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
        const durationSeconds = Math.round((Date.now() - recordingStartRef.current) / 1000);
        await captureMedia({ type: 'voice', file: blob, mimeType: blob.type, durationSeconds });
      };
      recordingStartRef.current = Date.now();
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingSeconds(0);
      setIsRecording(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setVoiceError('Microphone permission denied. Allow mic access in your browser settings and try again.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setVoiceError('No microphone found on this device.');
      } else {
        setVoiceError('Could not start recording. Please try again.');
      }
    }
  }

  async function handleLink() {
    const url = window.prompt('Paste a link (Instagram, Pinterest, YouTube, website)');
    if (!url) return;
    await captureLink({ url });
  }

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader
        showBack
        actions={
          <>
            <button className="flex items-center gap-1 text-xs font-medium text-darussalam-green bg-card-bg px-3 py-1.5 rounded-full">
              <TipsIcon size={13} /> Tips
            </button>
            <button onClick={() => navigate('/darussalam/settings')} className="w-8 h-8 rounded-full bg-card-bg flex items-center justify-center text-darussalam-green">
              <Settings size={15} />
            </button>
          </>
        }
      />

      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">Quick Capture</h1>
        <p className="text-sm text-text-secondary mt-1">Capture your ideas in seconds, never lose a thought. ♡</p>
      </div>

      <div className="px-5 mt-5">
        <div className="bg-card-bg rounded-card shadow-card p-6 flex flex-col items-center">
          <button
            onClick={handleVoiceToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isRecording ? 'bg-red-500' : 'bg-darussalam-tile'}`}
          >
            <Mic size={26} className={isRecording ? 'text-white' : 'text-darussalam-green'} />
          </button>
          <p className="text-sm font-medium text-text-primary text-center">
            {isRecording ? `Recording ${recordingSeconds}s… tap to stop` : 'Tap to speak'}<br />or write your idea
          </p>
          {voiceError && <p className="text-xs text-red-600 text-center mt-2">{voiceError}</p>}
          <input
            id="darussalam-note-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
            placeholder='Example: "Skylight above the staircase"'
            className="w-full mt-4 bg-darussalam-tile rounded-full px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          {text.trim() && (
            <button onClick={handleSaveNote} className="mt-3 text-sm font-medium text-white bg-darussalam-green px-5 py-2 rounded-full">
              Save
            </button>
          )}
        </div>
      </div>

      <div className="px-5 mt-4 grid grid-cols-5 gap-2.5">
        <button onClick={() => photoInputRef.current?.click()} className="bg-card-bg rounded-2xl py-4 flex flex-col items-center gap-1.5">
          <Camera size={18} className="text-darussalam-green" /><span className="text-xs text-text-primary">Photo</span>
        </button>
        <button onClick={() => videoInputRef.current?.click()} className="bg-card-bg rounded-2xl py-4 flex flex-col items-center gap-1.5">
          <Video size={18} className="text-darussalam-green" /><span className="text-xs text-text-primary">Video</span>
        </button>
        <button onClick={() => document.getElementById('darussalam-note-input')?.focus()} className="bg-card-bg rounded-2xl py-4 flex flex-col items-center gap-1.5">
          <Pencil size={18} className="text-darussalam-green" /><span className="text-xs text-text-primary">Note</span>
        </button>
        <button onClick={handleLink} className="bg-card-bg rounded-2xl py-4 flex flex-col items-center gap-1.5">
          <Link2 size={18} className="text-darussalam-green" /><span className="text-xs text-text-primary">Link</span>
        </button>
        <button onClick={handleVoiceToggle} className="bg-card-bg rounded-2xl py-4 flex flex-col items-center gap-1.5">
          <AudioWaveform size={18} className="text-darussalam-green" /><span className="text-xs text-text-primary">Voice</span>
        </button>
      </div>
      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelected(e, 'photo')} />
      <input ref={videoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => handleFileSelected(e, 'video')} />

      <div className="px-5 mt-5">
        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
              <Clock size={14} className="text-text-secondary" /> Recently Captured
            </div>
            <span className="text-xs text-darussalam-green font-medium">View All</span>
          </div>
          <div className="divide-y divide-card-border">
            {ideas.map((idea) => (
              <IdeaListRow
                key={idea.id}
                ideaId={idea.id}
                title={idea.title}
                onOpen={() => navigate(`/darussalam/idea/${idea.id}`)}
                subtitle={idea.description ? <p className="text-xs text-text-muted line-clamp-1">{idea.description}</p> : undefined}
                trailing={
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-text-muted whitespace-nowrap">{timeAgo(idea.createdAt)}</span>
                    {idea.tag && <span className="text-[10px] bg-darussalam-tile text-text-secondary px-2 py-0.5 rounded-full">{idea.tag}</span>}
                  </div>
                }
              />
            ))}
            {ideas.length === 0 && <p className="text-sm text-text-muted py-4 text-center">Nothing captured yet.</p>}
          </div>
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="bg-accent-green-bg rounded-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-darussalam-green/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-darussalam-green" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">What to capture?</h3>
            <p className="text-xs text-text-secondary mt-0.5">Ideas, materials, colors, layouts, anything that inspires your dream home.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
