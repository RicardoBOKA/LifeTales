import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, StopCircle } from 'lucide-react';
import { Button } from './Button';

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvasRef.current.getContext('2d');
    
    if (!ctx) return;

    const draw = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      const width = canvasRef.current!.width;
      const height = canvasRef.current!.height;
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        // Soft gradient color
        ctx.fillStyle = `rgba(244, 63, 94, ${dataArray[i]/255})`; // Rose color
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' }); // usually audio/webm, but simplified
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startVisualizer(stream);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
      <canvas ref={canvasRef} width={300} height={60} className="w-full h-16 mb-4 rounded-xl bg-slate-50" />
      
      <div className="flex items-center gap-4">
        {isRecording ? (
           <Button 
            variant="secondary" 
            className="!text-rose-500 border-rose-100 bg-rose-50" 
            onClick={stopRecording}
           >
             <Square className="mr-2" size={20} fill="currentColor" />
             Stop ({formatTime(duration)})
           </Button>
        ) : (
          <Button variant="primary" onClick={startRecording} className="!bg-rose-500 !shadow-rose-200">
            <Mic className="mr-2" size={20} />
            Record Memory
          </Button>
        )}
      </div>
    </div>
  );
};