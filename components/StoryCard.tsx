import React from 'react';
import { StorySpace } from '../types';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';

interface StoryCardProps {
  story: StorySpace;
  onClick: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-slate-50"
    >
      <div className="flex gap-4">
        {/* Cover Thumbnail */}
        <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
          {story.coverImage ? (
             <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
               <BookOpen size={24} />
             </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase mb-1">
            {story.theme}
          </span>
          <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
            {story.title}
          </h3>
          <div className="flex items-center text-slate-400 text-xs">
            <Calendar size={12} className="mr-1" />
            {new Date(story.createdAt).toLocaleDateString()}
            <span className="mx-2">•</span>
            {story.chapters.length} Memories
          </div>
        </div>

        {/* Action Icon */}
        <div className="flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
          <ChevronRight size={24} />
        </div>
      </div>
    </div>
  );
};