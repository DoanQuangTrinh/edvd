"use client";

import { Track } from "../lib/types";

export const UploadPanel = ({ onMediaUpload, loaded, isProcessing }: {
    onMediaUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    loaded: boolean;
    isProcessing: boolean;
}) => (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <label htmlFor="media-upload" className={`cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded w-full inline-block ${!loaded || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Upload Media
        </label>
        <input 
            id="media-upload" 
            type="file" 
            accept="video/*,audio/*,image/*" 
            onChange={onMediaUpload} 
            className="hidden" 
            multiple 
            disabled={!loaded || isProcessing}
        />
        <p className="text-xs text-gray-400 mt-2">Upload videos, audio, or images.</p>
    </div>
);

export const ExportPanel = ({ tracks, onExport, loaded, isProcessing }: {
    tracks: Track[];
    onExport: (trackId: string) => void;
    loaded: boolean;
    isProcessing: boolean;
}) => (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Export</h2>
        <div className="flex flex-col gap-2">
        {tracks.filter(t => t.type === 'video').map((track, index) => (
            <button 
                key={track.id} 
                onClick={() => onExport(track.id)} 
                disabled={!loaded || isProcessing || track.clips.length === 0} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 shadow-md"
            >
                Export Video Track {index + 1}
            </button>
        ))}
        {tracks.filter(t => t.type === 'video' && t.clips.length === 0).length > 0 && 
             <p className="text-xs text-gray-400 text-center">Add clips to a video track to enable export.</p>
        }
        </div>
    </div>
);
