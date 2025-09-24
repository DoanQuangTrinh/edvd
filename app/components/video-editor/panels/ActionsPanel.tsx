'use client';

import { Clip } from "../lib/types";

export const ActionsPanel = ({
    selectedClip,
    playhead,
    onSplit,
    isProcessing,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onAddTrack,
}: {
    selectedClip: Clip | null;
    playhead: number;
    onSplit: () => void;
    isProcessing: boolean;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onAddTrack: (type: 'video' | 'audio') => void;
}) => {

    const canSplit = selectedClip && selectedClip.type !== 'audio' && selectedClip.type !== 'image' && playhead > selectedClip.start && playhead < (selectedClip.start + selectedClip.duration);

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Actions</h2>
            <div className="flex flex-col gap-4">
                {/* Undo/Redo Buttons */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onUndo}
                        disabled={!canUndo || isProcessing}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                        title="Undo (Cmd/Ctrl + Z)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                        Undo
                    </button>
                    <button 
                        onClick={onRedo}
                        disabled={!canRedo || isProcessing}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                        title="Redo (Cmd/Ctrl + Y)"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Redo
                    </button>
                </div>
                
                <div className="h-px bg-gray-700 my-2"></div>

                {/* Split Button */}
                <button 
                    onClick={onSplit}
                    disabled={!canSplit || isProcessing}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                    title="Split at Playhead (S)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1zM4.707 3.293a1 1 0 010 1.414L3.414 6l1.293 1.293a1 1 0 11-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 0zM15.293 16.707a1 1 0 010-1.414L16.586 14l-1.293-1.293a1 1 0 111.414-1.414l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Split Video
                </button>

                 <div className="h-px bg-gray-700 my-2"></div>

                {/* Add Track Buttons */}
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onAddTrack('video')}
                        disabled={isProcessing}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        title="Add a new video track"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.062 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Add Video
                    </button>
                    <button 
                        onClick={() => onAddTrack('audio')}
                        disabled={isProcessing}
                        className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        title="Add a new audio track"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M18 3a1 1 0 00-1.196-.98l-15 2A1 1 0 001 5v10a1 1 0 001.196.98l15-2A1 1 0 0019 15V5a1 1 0 00-1-2zm-15 2.236L17 3.97v10.06l-14 1.866V5.236z" />
                        </svg>
                        Add Audio
                    </button>
                </div>
            </div>
        </div>
    );
};
