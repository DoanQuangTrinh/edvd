'use client';

import { useState } from 'react';
import { Clip } from '../lib/types';

const transitionOptions = [
  { id: 'fade', name: 'Crossfade' },
  { id: 'fadeblack', name: 'Fade to Black' },
  // Future options can be added here
  // { id: 'wipeleft', name: 'Wipe Left' }, 
];

export const TransitionMenu = ({ onSelect, onRemove, onClose }: { 
    onSelect: (type: 'fade' | 'fadeblack') => void, 
    onRemove: () => void,
    onClose: () => void 
}) => (
    <div className="absolute z-20 -top-2 left-1/2 -translate-x-1/2 mt-12 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1">
        <p className="text-xs text-gray-400 px-3 pt-1 pb-2">Transition</p>
        {transitionOptions.map(opt => (
            <button 
                key={opt.id} 
                onClick={() => onSelect(opt.id as 'fade' | 'fadeblack')} 
                className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-indigo-600"
            >
                {opt.name}
            </button>
        ))}
        <div className="h-px bg-gray-700 my-1"></div>
        <button 
            onClick={onRemove} 
            className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500 hover:text-white"
        >
            Remove Transition
        </button>
    </div>
);

export const TransitionButton = ({ clip, nextClip, zoom, onSetTransition }: {
    clip: Clip;
    nextClip: Clip | undefined;
    zoom: number;
    onSetTransition: (clipId: string, type: 'fade' | 'fadeblack' | null) => void;
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!nextClip) return null; // No transition at the end of a track

    const handleSelectTransition = (type: 'fade' | 'fadeblack') => {
        onSetTransition(nextClip.id, type); // Apply transition to the *next* clip
        setIsMenuOpen(false);
    };

    const handleRemoveTransition = () => {
        onSetTransition(nextClip.id, null); // Remove transition from the next clip
        setIsMenuOpen(false);
    };
    
    const transitionType = nextClip.transitionIn?.type;
    const buttonClasses = `
        absolute z-10 top-1/2 -translate-y-1/2 -translate-x-1/2 
        h-8 w-8 flex items-center justify-center rounded-md border-2 
        transition-all duration-200 cursor-pointer
        ${transitionType ? 'bg-indigo-500 border-indigo-400' : 'bg-gray-700 border-gray-600 hover:bg-indigo-600'}
    `;

    return (
        <div style={{ left: `${(clip.start + clip.duration) * zoom}px`}} className="relative h-full">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={buttonClasses}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </button>
            {isMenuOpen && 
                <TransitionMenu 
                    onSelect={handleSelectTransition} 
                    onRemove={handleRemoveTransition}
                    onClose={() => setIsMenuOpen(false)} 
                />
            }
        </div>
    );
};
