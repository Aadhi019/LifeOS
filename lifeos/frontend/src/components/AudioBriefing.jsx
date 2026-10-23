import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

export default function AudioBriefing({ agentState, selectedFlight, selectedHotel }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  if (!agentState?.agent_outputs || !supported) return null;

  const outputs = agentState.agent_outputs;
  const city = outputs.travel?.city || 'your destination';
  const date = outputs.travel?.dates || 'your scheduled date';
  const weather = outputs.travel?.weather_summary || 'moderate conditions';
  const total = outputs.finance?.total || outputs.optimized_budget?.optimized_total || 'planned budget';
  const airline = selectedFlight?.airline || 'your selected airline';
  const hotelName = selectedHotel?.name || 'your accommodations';

  const speechScript = `Good day. This is your LifeOS Executive Travel Briefing for ${city} on ${date}. 
Weather conditions forecast ${weather}. 
Flight logistics are arranged with ${airline}, with lodging booked at ${hotelName}. 
Your total projected expenditure is ${total} rupees. 
All calendar commitments and logistical briefings are staged. Have a productive and pleasant journey.`;

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(speechScript);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  };

  const handlePause = () => {
    if (!synthRef.current) return;
    synthRef.current.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="card-vintage p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-(--color-terracotta)/20">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPlaying ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30' : 'bg-neutral-800 text-neutral-300'}`}>
          {isPlaying ? <Volume2 className="w-5 h-5 animate-bounce" /> : <Volume2 className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-retro-mono font-bold uppercase tracking-wider text-(--color-terracotta)">
              EXECUTIVE AUDIO BRIEFING
            </span>
            <span className="text-[10px] font-retro-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              VOICE SYNTHESIS
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-body">
            Listen to your hands-free itinerary briefing
          </p>
        </div>
      </div>

      {/* Audio Visualizer Waveform Animation */}
      {isPlaying && (
        <div className="flex items-center gap-1 h-6 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:-0.4s]" />
          <span className="w-1 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
          <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
          <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce" />
          <span className="text-[10px] font-retro-mono font-bold text-red-600 pl-1">SPEAKING...</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {!isPlaying ? (
          <button
            type="button"
            onClick={handlePlay}
            className="btn-vintage flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-retro-mono uppercase tracking-wider cursor-pointer text-neutral-700 hover:text-(--color-terracotta)"
            title="Play Audio Briefing"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPaused ? "RESUME" : "PLAY BRIEF"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="btn-vintage flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-retro-mono uppercase tracking-wider cursor-pointer text-amber-600"
            title="Pause Briefing"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>PAUSE</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            className="btn-vintage p-2 rounded-xl text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer"
            title="Stop & Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
