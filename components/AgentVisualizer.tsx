import React from 'react';
import { AgentStatus } from '../types';
import { AGENT_MESSAGES } from '../constants';
import { Mic, Brain, PenTool, Sparkles, Loader2 } from 'lucide-react';

interface AgentVisualizerProps {
  status: AgentStatus;
}

export const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ status }) => {
  if (status === AgentStatus.IDLE || status === AgentStatus.COMPLETED) return null;

  const getIcon = () => {
    switch (status) {
      case AgentStatus.LISTENING: return <Mic className="animate-pulse" />;
      case AgentStatus.TRANSCRIBING: return <Loader2 className="animate-spin" />;
      case AgentStatus.ANALYZING: return <Brain className="animate-bounce" />;
      case AgentStatus.WEAVING: return <PenTool className="animate-pulse" />;
      case AgentStatus.ILLUSTRATING: return <Sparkles className="animate-spin" />;
      default: return <Loader2 className="animate-spin" />;
    }
  };

  const getGradient = () => {
    switch (status) {
      case AgentStatus.LISTENING: return "from-rose-400 to-rose-500";
      case AgentStatus.TRANSCRIBING: return "from-orange-400 to-amber-500";
      case AgentStatus.ANALYZING: return "from-indigo-400 to-violet-500";
      case AgentStatus.WEAVING: return "from-teal-400 to-emerald-500";
      case AgentStatus.ILLUSTRATING: return "from-pink-400 to-fuchsia-500";
      default: return "from-slate-400 to-slate-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-500">
      <div className="flex flex-col items-center">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getGradient()} flex items-center justify-center text-white shadow-xl shadow-slate-200 mb-6 transition-all duration-500 scale-100`}>
          {React.cloneElement(getIcon() as React.ReactElement, { size: 32 })}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
           Working on it
        </h3>
        <p className="text-slate-500 font-medium animate-pulse">
          {AGENT_MESSAGES[status]}
        </p>
      </div>
    </div>
  );
};