'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { Clip, Track } from "../lib/types";
import { formatTime } from "../lib/utils";
import { CSS } from '@dnd-kit/utilities';
import { TransitionButton } from "./TransitionControls";

const Ruler = ({ duration, zoom, onRulerClick }: { duration: number, zoom: number, onRulerClick: (time: number) => void }) => {
    const markers = [];
    const interval = 5;
    const numMarkers = Math.ceil(duration / interval);
    for (let i = 0; i <= numMarkers; i++) {
        const time = i * interval;
        if (time > duration) continue;
        markers.push(
            <div key={i} style={{ left: `${time * zoom}px` }} className="absolute h-full w-px bg-gray-600">
                <span className="absolute -top-5 left-1 text-xs text-gray-400">{formatTime(time)}</span>
            </div>
        );
    }
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onRulerClick((e.clientX - rect.left) / zoom);
    };
    return <div className="relative w-full h-5 mt-4 cursor-pointer" onClick={handleClick}>{markers}</div>;
};

const SortableTimelineClip = ({ clip, zoom, isSelected, onClick, onTrim, isTrackLocked }: { 
    clip: Clip, 
    zoom: number, 
    isSelected: boolean, 
    onClick: () => void,
    onTrim: (clipId: string, newTrimStart: number, newTrimEnd: number) => void,
    isTrackLocked?: boolean;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: clip.id, disabled: isTrackLocked });

    const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
    const [localTrimStart, setLocalTrimStart] = useState(clip.trimStart);
    const [localTrimEnd, setLocalTrimEnd] = useState(clip.trimEnd);
    const resizeStartRef = useRef({ trimStart: 0, trimEnd: 0, mouseX: 0 });

    useEffect(() => {
        setLocalTrimStart(clip.trimStart);
        setLocalTrimEnd(clip.trimEnd);
    }, [clip.trimStart, clip.trimEnd]);

    const duration = localTrimEnd - localTrimStart;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 0.25s ease',
        width: `${duration * zoom}px`,
        left: `${clip.start * zoom}px`, 
        opacity: isDragging ? 0.7 : 1,
        zIndex: isResizing || isSelected ? 20 : 10,
        cursor: isTrackLocked ? 'not-allowed' : 'grab',
    };

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, direction: 'left' | 'right') => {
        if (isTrackLocked) return;
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(direction);
        resizeStartRef.current = { trimStart: localTrimStart, trimEnd: localTrimEnd, mouseX: e.clientX };
    }, [localTrimStart, localTrimEnd, isTrackLocked]);

    useEffect(() => {
        if (!isResizing || isTrackLocked) return;
        
        const handleMouseMove = (e: MouseEvent) => {
            const deltaSeconds = (e.clientX - resizeStartRef.current.mouseX) / zoom;
            
            if (isResizing === 'right') {
                let newTrimEnd = resizeStartRef.current.trimEnd + deltaSeconds;
                if (newTrimEnd > clip.sourceDuration) newTrimEnd = clip.sourceDuration;
                if (newTrimEnd < localTrimStart + 0.1) newTrimEnd = localTrimStart + 0.1; // Min duration
                setLocalTrimEnd(newTrimEnd);

            } else { // Resizing left handle
                let newTrimStart = resizeStartRef.current.trimStart + deltaSeconds;
                if (newTrimStart < 0) newTrimStart = 0;
                if (newTrimStart > localTrimEnd - 0.1) newTrimStart = localTrimEnd - 0.1; // Min duration
                setLocalTrimStart(newTrimStart);
            }
        };

        const handleMouseUp = () => {
            onTrim(clip.id, localTrimStart, localTrimEnd);
            setIsResizing(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

    }, [isResizing, zoom, clip.id, clip.sourceDuration, onTrim, localTrimStart, localTrimEnd, isTrackLocked]);
    
    const clipTypeStyles = {
        video: 'bg-gray-600',
        audio: 'bg-sky-800',
        image: 'bg-gray-600'
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners} 
            onClick={onClick} 
            className={`absolute h-20 top-0 rounded-lg overflow-hidden border-2 ${isSelected ? 'border-indigo-500 shadow-lg' : 'border-transparent'} ${!isTrackLocked && 'hover:border-indigo-400'} ${clipTypeStyles[clip.type]}`}>
            
            <div className="absolute inset-0 overflow-hidden">
                {(clip.type === 'video' || clip.type === 'image') && clip.thumbnail && (
                    <img src={clip.thumbnail} alt="thumbnail" className="absolute left-0 top-0 h-full max-w-none pointer-events-none" style={{ width: `${clip.sourceDuration * zoom}px`, left: `-${localTrimStart * zoom}px` }} />
                )}
            </div>

            <div className={`absolute top-1 left-1 p-1 text-white text-xs font-medium truncate w-11/12 bg-black/30 rounded-br-lg ${clip.type === 'audio' ? 'w-auto' : ''}`}>
                {clip.file.name}
            </div>

            {clip.type === 'audio' && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-8 h-8 text-sky-200 opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-15 2A1 1 0 001 5v10a1 1 0 001.196.98l15-2A1 1 0 0019 15V5a1 1 0 00-1-2zm-15 2.236L17 3.97v10.06l-14 1.866V5.236z" /></svg>
                </div>
            )}
             
             {isTrackLocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                     <svg className="h-6 w-6 text-yellow-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 8.586V13a1 1 0 102 0v-2.414a3.001 3.001 0 10-2 0z" clipRule="evenodd" /></svg>
                </div>
            )}

            {isSelected && !isTrackLocked && (
                <>
                    <div 
                        onMouseDown={(e) => handleMouseDown(e, 'left')} 
                        className="absolute left-0 top-0 h-full w-3 bg-indigo-500/60 cursor-ew-resize z-20 hover:bg-indigo-400 transition-colors"
                    />
                    <div 
                        onMouseDown={(e) => handleMouseDown(e, 'right')} 
                        className="absolute right-0 top-0 h-full w-3 bg-indigo-500/60 cursor-ew-resize z-20 hover:bg-indigo-400 transition-colors"
                    />
                </>
            )}
        </div>
    );
};

export const Timeline = ({ tracks, selectedClipId, playhead, zoom, totalTimelineDuration, onRulerClick, onClipClick, onSetTransition, onClipTrim, onDeleteTrack, onToggleTrackLock, onToggleTrackVisibility }: {
    tracks: Track[];
    selectedClipId: string | null;
    playhead: number;
    zoom: number;
    totalTimelineDuration: number;
    onRulerClick: (time: number) => void;
    onClipClick: (clip: Clip) => void;
    onSetTransition: (clipId: string, type: 'fade' | 'fadeblack' | null) => void;
    onClipTrim: (clipId: string, newTrimStart: number, newTrimEnd: number) => void;
    onDeleteTrack: (trackId: string) => void;
    onToggleTrackLock: (trackId: string) => void;
    onToggleTrackVisibility: (trackId: string) => void;
}) => {
    const allClips = tracks.flatMap(t => t.clips);
    const trackHeight = 96; // h-24
    const trackGap = 8; // mb-2
    let videoTrackCount = 0;
    let audioTrackCount = 0;

    return (
        <div className="bg-gray-900/50 rounded-lg p-2 select-none flex gap-2">
            {/* Track Controls Column */}
            <div className="flex flex-col gap-2 pt-[36px]"> {/* pt to align with ruler + track top */}
                {tracks.map((track) => {
                     if(track.type === 'video') videoTrackCount++;
                     if(track.type === 'audio') audioTrackCount++;
                     const trackTitle = track.type === 'video' ? `Video ${videoTrackCount}` : `Audio ${audioTrackCount}`;
                     return (
                        <div key={track.id} style={{ height: `${trackHeight}px` }} className={`w-32 flex-shrink-0 flex flex-col items-center justify-center bg-gray-800 rounded-lg p-1 gap-1 transition-all duration-300 ${track.isHidden ? 'opacity-50' : 'opacity-100'}`}>
                            <p className="text-sm text-gray-300 font-bold capitalize">{trackTitle}</p>
                            <div className="flex items-center gap-1">
                               <button 
                                    onClick={() => onToggleTrackVisibility(track.id)}
                                    className={`p-2 rounded-md ${track.isHidden ? 'bg-gray-700 text-gray-400' : 'bg-gray-600 text-white'} hover:bg-sky-500 transition-colors duration-200`}
                                    title={track.isHidden ? "Show Track" : "Hide Track"}
                                >
                                    {track.isHidden ? 
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.062 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> : 
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.367zm-4.242-4.242a2 2 0 10-2.828-2.828L9.235 10.647z" clipRule="evenodd" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16z" /></svg>
                                    }
                                </button>
                                <button 
                                    onClick={() => onToggleTrackLock(track.id)}
                                    className={`p-2 rounded-md ${track.isLocked ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-white'} hover:bg-yellow-500 transition-colors duration-200`}
                                    title={track.isLocked ? "Unlock Track" : "Lock Track"}
                                >
                                    {track.isLocked ? 
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 8.586V13a1 1 0 102 0v-2.414a3.001 3.001 0 10-2 0z" clipRule="evenodd" /></svg> : 
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm1 8.586a1.5 1.5 0 10-3 0V13a1.5 1.5 0 003 0v-2.414z" /></svg>
                                    }
                                </button>
                                <button 
                                    onClick={() => onDeleteTrack(track.id)}
                                    className="p-2 rounded-md bg-gray-600 hover:bg-red-500 text-white transition-colors duration-200"
                                    title="Delete Track"
                                >
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Timeline Area */}
            <div className="flex-grow overflow-x-auto">
                 <Ruler duration={totalTimelineDuration} zoom={zoom} onRulerClick={onRulerClick} />
                <div className="relative" style={{ width: `${totalTimelineDuration * zoom}px`, height: `${tracks.length * (trackHeight + trackGap)}px` }}>
                    <div style={{ left: `${playhead * zoom}px` }} className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none" />
                    {tracks.map((track) => (
                        <SortableContext key={track.id} items={track.clips.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                            <div id={track.id} className={`relative bg-gray-700/30 rounded-lg transition-opacity duration-300 ${track.isHidden ? 'opacity-50' : ''}`} style={{height: `${trackHeight}px`, marginBottom: `${trackGap}px`}}>
                                {track.clips.map((clip) => (
                                    <SortableTimelineClip 
                                        key={clip.id} 
                                        clip={clip} 
                                        zoom={zoom} 
                                        isSelected={clip.id === selectedClipId} 
                                        onClick={() => onClipClick(clip)} 
                                        onTrim={onClipTrim}
                                        isTrackLocked={track.isLocked}
                                    />
                                ))}
                                {!track.isLocked && track.clips.map((clip, index) => (
                                    <TransitionButton
                                        key={`trans-${clip.id}`}
                                        clip={clip}
                                        nextClip={track.clips[index + 1]}
                                        zoom={zoom}
                                        onSetTransition={onSetTransition}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    ))}
                </div>
            </div>
        </div>
    );
}
