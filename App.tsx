import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Image as ImageIcon, MapPin, Smile } from 'lucide-react';
import { AgentStatus, StorySpace, Chapter } from './types';
import { AGENT_MESSAGES, SAMPLE_STORIES } from './constants';
import { processMemoryPipeline, blobToBase64 } from './services/geminiService';
import { Button } from './components/Button';
import { StoryCard } from './components/StoryCard';
import { Recorder } from './components/Recorder';
import { AgentVisualizer } from './components/AgentVisualizer';

// --- Sub-components for Views ---

const Header = ({ title, onBack }: { title: string, onBack?: () => void }) => (
  <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
      )}
      <h1 className={`text-xl font-bold text-slate-800 ${!onBack ? 'text-2xl' : ''}`}>{title}</h1>
    </div>
    {!onBack && (
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-rose-400" />
    )}
  </header>
);

const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-200">
      <Smile size={64} />
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">No stories yet</h2>
    <p className="text-slate-500 mb-8 max-w-xs mx-auto">
      Start a new Story Space to capture your life's precious moments.
    </p>
    <Button onClick={onCreate}>Create Story Space</Button>
  </div>
);

const ChapterItem: React.FC<{ chapter: Chapter }> = ({ chapter }) => (
  <div className="relative pl-8 pb-12 last:pb-0 group">
    {/* Timeline Line */}
    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 group-last:bottom-auto group-last:h-full" />
    
    {/* Timeline Dot */}
    <div className="absolute left-[-4px] top-6 w-2.5 h-2.5 rounded-full bg-indigo-400 ring-4 ring-white" />
    
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-50 transition-all hover:shadow-md">
      {/* Meta Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            {new Date(chapter.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-xs text-indigo-400 font-medium px-2 py-1 rounded-lg bg-indigo-50">
            {chapter.mood}
          </span>
        </div>
      </div>

      {/* Narrative */}
      <p className="text-slate-700 leading-relaxed font-medium text-lg mb-4 font-[Nunito]">
        {chapter.narrative}
      </p>

      {/* Generated Illustration */}
      {chapter.illustration && (
        <div className="rounded-2xl overflow-hidden mb-4 shadow-inner">
          <img src={chapter.illustration} alt="AI Generated visualization" className="w-full h-auto object-cover max-h-64" />
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-2">
        {chapter.tags.map((tag, idx) => (
          <span key={idx} className="text-xs text-slate-400">#{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'detail' | 'create'>('home');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [stories, setStories] = useState<StorySpace[]>(SAMPLE_STORIES);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  
  // Create New Story State
  const [newTitle, setNewTitle] = useState("");
  const [newTheme, setNewTheme] = useState("");

  const activeStory = stories.find(s => s.id === activeStoryId);

  const handleCreateStory = () => {
    if (!newTitle.trim()) return;
    const newStory: StorySpace = {
      id: Date.now().toString(),
      title: newTitle,
      theme: newTheme || "Personal",
      createdAt: Date.now(),
      chapters: []
    };
    setStories([newStory, ...stories]);
    setActiveStoryId(newStory.id);
    setView('detail');
    setNewTitle("");
    setNewTheme("");
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!activeStory) return;

    try {
      // Convert audio for API
      const base64Audio = await blobToBase64(audioBlob);
      
      // Get context from last 3 chapters for continuity
      const context = activeStory.chapters.slice(-3).map(c => c.narrative).join(" ");

      // Run Pipeline
      const result = await processMemoryPipeline(
        { type: 'audio', data: base64Audio, mimeType: 'audio/mp3' }, // Gemini handles common audio formats, pretending mp3/webm
        { storyContext: context, style: 'narrative' },
        (status) => setAgentStatus(status)
      );

      // Create new Chapter
      const newChapter: Chapter = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        rawInput: result.transcription,
        narrative: result.narrative,
        mood: result.mood,
        tags: result.tags,
        illustration: result.illustration,
        mediaType: 'voice'
      };

      // Update Story
      const updatedStories = stories.map(s => {
        if (s.id === activeStoryId) {
          return { ...s, chapters: [newChapter, ...s.chapters] }; // Add to top for timeline
        }
        return s;
      });
      
      setStories(updatedStories);
      setAgentStatus(AgentStatus.COMPLETED);
      
      setTimeout(() => setAgentStatus(AgentStatus.IDLE), 2000);

    } catch (error) {
      console.error(error);
      setAgentStatus(AgentStatus.ERROR);
      setTimeout(() => setAgentStatus(AgentStatus.IDLE), 3000);
    }
  };

  const handleTextEntry = async () => {
      // For simplicity in this demo, we focus on Voice, but text entry would follow a similar pipeline
      // passing type: 'text' to the processMemoryPipeline
      alert("Voice is the primary input for this demo, but text entry uses the exact same pipeline!");
  };

  // --- Views Rendering ---

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="New Story Space" onBack={() => setView('home')} />
        <div className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
            <input 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Summer in Italy"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Theme</label>
            <input 
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              placeholder="e.g. Travel, Project, Daily"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-lg"
            />
          </div>
          <div className="mt-auto">
            <Button fullWidth onClick={handleCreateStory} disabled={!newTitle}>
              Create Space
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && activeStory) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative">
        <AgentVisualizer status={agentStatus} />
        
        <Header title={activeStory.title} onBack={() => setView('home')} />

        {/* Story Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-8 pb-40 no-scrollbar max-w-xl mx-auto w-full">
           {activeStory.chapters.length === 0 ? (
             <div className="text-center py-20 opacity-50">
                <MapPin className="mx-auto mb-4 text-slate-300" size={48} />
                <p className="text-slate-500">The page is blank.<br/>Record a memory to begin.</p>
             </div>
           ) : (
             <div className="space-y-0">
               {activeStory.chapters.map(chapter => (
                 <ChapterItem key={chapter.id} chapter={chapter} />
               ))}
             </div>
           )}
        </div>

        {/* Interaction Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 p-4 pb-8 z-30">
          <div className="max-w-md mx-auto w-full flex flex-col gap-4">
            <Recorder onRecordingComplete={handleRecordingComplete} />
            <div className="flex justify-between px-4">
              <button className="text-slate-400 hover:text-indigo-500 transition-colors" onClick={handleTextEntry}>
                <Plus size={24} />
              </button>
              <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                <ImageIcon size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="My Spaces" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full">
        {stories.length === 0 ? (
          <EmptyState onCreate={() => setView('create')} />
        ) : (
          <div className="grid gap-6">
            {stories.map(story => (
              <StoryCard 
                key={story.id} 
                story={story} 
                onClick={() => {
                  setActiveStoryId(story.id);
                  setView('detail');
                }} 
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-6">
        <button 
          onClick={() => setView('create')}
          className="w-14 h-14 bg-slate-800 text-white rounded-full shadow-xl shadow-slate-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
};

export default App;