
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, audioLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bars = 30;

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = canvas.width / bars;
      
      for (let i = 0; i < bars; i++) {
        const barWidth = 3;
        const normalizedLevel = isRecording ? (audioLevel / 100) : 0;
        const randomFactor = isRecording ? Math.random() * 0.4 + 0.6 : 0;
        const barHeight = Math.max(4, normalizedLevel * canvas.height * randomFactor * (1 - Math.abs(bars/2 - i)/(bars/2)));
        
        const x = i * spacing + (spacing - barWidth) / 2;
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#ec4899');
        
        ctx.fillStyle = isRecording ? gradient : '#334155';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
      
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isRecording, audioLevel]);

  return (
    <div className="relative w-full h-16 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={64} 
        className="w-full h-full max-w-md"
      />
      {!isRecording && (
        <span className="absolute text-slate-500 text-xs font-medium uppercase tracking-widest pointer-events-none">
          Ready to record
        </span>
      )}
    </div>
  );
};

export default AudioVisualizer;
