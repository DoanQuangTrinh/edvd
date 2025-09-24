'use client';
import { useState, useRef, useEffect, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';

import { Clip, Track, TextPosition } from "./lib/types";
import { generateId } from "./lib/utils";
import { useHistory } from "./lib/useHistory";

import { Timeline } from "./timeline/Timeline";
import { UploadPanel, ExportPanel } from "./panels/ControlPanels";
import { TextOverlayPanel, EffectsPanel } from "./panels/EditPanels"; 
import { ActionsPanel } from "./panels/ActionsPanel";
import { ProcessingOverlay, ExportModal } from "./ui/Modals";

const TRANSITION_DURATION = 1; // seconds
const DEFAULT_IMAGE_DURATION = 5; // seconds

const hasEffects = (clip: Clip) => {
    if (!clip.effects) return false;
    const { brightness, contrast, saturation } = clip.effects;
    return brightness !== 0 || contrast !== 1 || saturation !== 1;
};

export default function VideoEditor() {
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("Processing...");

  const [tracksState, { set: setTracks, undo, redo, canUndo, canRedo }] = useHistory<Track[]>([{ id: generateId(), type: 'video', clips: [], isLocked: false, isHidden: false }]);
  const tracks = tracksState.present;
  
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [zoom, setZoom] = useState(20);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const [textOverlay, setTextOverlay] = useState("Hello World");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textSize, setTextSize] = useState(48);
  const [textPosition, setTextPosition] = useState<TextPosition>('center');

  const selectedClip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId) || null;
  const totalTimelineDuration = Math.max(30, ...tracks.flatMap(t => t.clips.map(c => c.start + c.duration)));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  const updatePreview = useCallback(async (clip: Clip | null) => {
      if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
      }

      if (!clip || !previewVideoRef.current) {
          return;
      }

      if (clip.type === 'audio') {
          return; // No visual preview for audio
      }
      
      if (clip.type === 'image') {
          const url = URL.createObjectURL(clip.file);
          setPreviewUrl(url);
          return;
      }

      // For video, generate a precise, trimmed preview
      setProcessingMessage("Generating Preview...");
      setIsProcessing(true);
      try {
          const ffmpeg = ffmpegRef.current;
          const inputFileName = `input_${clip.file.name}`;
          await ffmpeg.writeFile(inputFileName, await fetchFile(clip.file));

          const command = [
              '-ss', clip.trimStart.toString(),
              '-i', inputFileName,
              '-t', clip.duration.toString(),
              '-c', 'copy', // Use stream copy for speed, as we are not re-encoding
              'output.mp4'
          ];
          
          await ffmpeg.exec(command);
          const data = await ffmpeg.readFile("output.mp4");
          const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
          
          setPreviewUrl(url);
          previewVideoRef.current.load(); // Load the new source

      } catch (error) {
          console.error("Error generating preview:", error);
          alert("Could not generate video preview. The clip might be corrupted.");
      } finally {
          setIsProcessing(false);
      }
  }, [previewUrl]);

  const handleSplitClip = useCallback(() => {
    if (!selectedClip || selectedClip.type === 'audio' || selectedClip.type === 'image') {
        alert("Only video clips can be split.");
        return;
    }
    const splitTime = playhead - selectedClip.start;
    if (splitTime <= 0.1 || splitTime >= selectedClip.duration - 0.1) {
      alert("Playhead must be within the clip to split, not at the very edge.");
      return;
    }

    let trackIndex = -1;
    const clipIndex = tracks.reduce((acc, track, i) => {
        const index = track.clips.findIndex(c => c.id === selectedClip.id);
        if (index !== -1) { trackIndex = i; return index; }
        return acc;
    }, -1);

    if (trackIndex === -1 || clipIndex === -1) return;

    const newTracks = tracks.map((track, tIndex) => {
        if (tIndex !== trackIndex) return track;

        const originalClip = track.clips[clipIndex];
        const clip1: Clip = { ...originalClip, id: generateId(), trimEnd: originalClip.trimStart + splitTime, duration: splitTime };
        const clip2: Clip = { ...originalClip, id: generateId(), start: clip1.start + clip1.duration, trimStart: originalClip.trimStart + splitTime, duration: originalClip.duration - splitTime };

        const newClips = [...track.clips];
        newClips.splice(clipIndex, 1, clip1, clip2);

        for (let i = clipIndex + 2; i < newClips.length; i++) {
            newClips[i].start = newClips[i-1].start + newClips[i-1].duration;
        }
        return { ...track, clips: newClips };
    });
    
    setTracks(newTracks);
}, [selectedClip, playhead, tracks, setTracks]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
        const isModKey = event.metaKey || event.ctrlKey;
        if (isModKey && event.key === 'z') { event.preventDefault(); if (event.shiftKey) { if(canRedo) redo(); } else { if(canUndo) undo(); } } 
        else if (isModKey && event.key === 'y') { event.preventDefault(); if(canRedo) redo(); } 
        else if (event.key.toLowerCase() === 's') { event.preventDefault(); handleSplitClip(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, handleSplitClip]);

  useEffect(() => {
      const videoElement = previewVideoRef.current;
      if (!videoElement || !selectedClip || selectedClip.type === 'audio') {
          if(videoElement) videoElement.style.filter = 'none';
          return;
      }
      const effects = selectedClip.effects || { brightness: 0, contrast: 1, saturation: 1 };
      const brightnessValue = 1 + effects.brightness;
      videoElement.style.filter = `brightness(${brightnessValue}) contrast(${effects.contrast}) saturate(${effects.saturation})`;
  }, [selectedClip, selectedClip?.effects]);

  const getMediaDuration = (file: File, type: 'video' | 'audio'): Promise<number> => {
      return new Promise(resolve => {
          const mediaElement = document.createElement(type);
          mediaElement.preload = 'metadata';
          mediaElement.onloadedmetadata = () => { URL.revokeObjectURL(mediaElement.src); resolve(mediaElement.duration); };
          mediaElement.onerror = () => { resolve(0); };
          mediaElement.src = URL.createObjectURL(file);
      });
  };

  const generateThumbnail = (file: File, type: 'video' | 'image'): Promise<string> => {
    return new Promise((resolve) => {
        if (type === 'image') {
             const reader = new FileReader();
             reader.onload = e => resolve(e.target?.result as string || '');
             reader.onerror = () => resolve('');
             reader.readAsDataURL(file);
             return;
        }
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.currentTime = 0.5;
        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg')); }
            else { resolve(''); }
            URL.revokeObjectURL(video.src);
        };
        video.onerror = () => { resolve(''); URL.revokeObjectURL(video.src); };
    });
  };
  
  useEffect(() => {
    const loadFFmpeg = async () => {
        setProcessingMessage("Initializing Editor...");
        setIsProcessing(true);
        const ffmpeg = ffmpegRef.current;
        const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";
        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            });
            const fontURL = 'https://cdn.jsdelivr.net/npm/@fontsource/roboto/files/roboto-latin-400-normal.ttf';
            await ffmpeg.writeFile('Roboto.ttf', await fetchFile(fontURL));
            setLoaded(true);
        } catch (error) {
            console.error("FFmpeg loading error:", error);
            setProcessingMessage("Failed to load editor components. Please refresh.");
            return;
        }
        setIsProcessing(false);
    };
    loadFFmpeg();
  }, []);

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return;
    const updatePlayhead = () => { if (!video.seeking) { setPlayhead(video.currentTime); } };
    const handleSeek = () => setPlayhead(video.currentTime);
    video.addEventListener('timeupdate', updatePlayhead);
    video.addEventListener('seeking', handleSeek);
    video.addEventListener('seeked', handleSeek);
    return () => {
      video.removeEventListener('timeupdate', updatePlayhead);
      video.removeEventListener('seeking', handleSeek);
      video.removeEventListener('seeked', handleSeek);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const updateClip = (clipId: string, newClipData: Partial<Clip>) => {
      const newTracks = tracks.map(t => ({ ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, ...newClipData } : c) }));
      setTracks(newTracks);
  };

  const handleAddTrack = (type: 'video' | 'audio') => {
    const newTrack: Track = { id: generateId(), type, clips: [], isLocked: false, isHidden: false };
    setTracks([...tracks, newTrack]);
  };

  const handleDeleteTrack = (trackId: string) => {
    if (tracks.length <= 1) { alert("Cannot delete the last track."); return; }
    const newTracks = tracks.filter(t => t.id !== trackId);
    setTracks(newTracks);
  };

  const handleToggleTrackLock = (trackId: string) => {
      setTracks(tracks.map(t => t.id === trackId ? { ...t, isLocked: !t.isLocked } : t));
  };

  const handleToggleTrackVisibility = (trackId: string) => {
      setTracks(tracks.map(t => t.id === trackId ? { ...t, isHidden: !t.isHidden } : t));
  };

  const handleEffectChange = (effect: 'brightness' | 'contrast' | 'saturation', value: number) => {
    if (!selectedClip) return;
    const currentEffects = selectedClip.effects || { brightness: 0, contrast: 1, saturation: 1 };
    updateClip(selectedClip.id, { effects: { ...currentEffects, [effect]: value } });
  };

  const handleSetTransition = (clipId: string, type: 'fade' | 'fadeblack' | null) => {
    updateClip(clipId, { transitionIn: type ? { type, duration: TRANSITION_DURATION } : undefined });
  };
  
  const handleClipTrim = (clipId: string, newTrimStart: number, newTrimEnd: number) => {
        let affectedClip: Clip | null = null;

        const newTracks = tracks.map(track => {
            const clipIndex = track.clips.findIndex(c => c.id === clipId);
            if (clipIndex === -1) return track;

            const newClips = [...track.clips];
            const clipToUpdate = { ...newClips[clipIndex], trimStart: newTrimStart, trimEnd: newTrimEnd, duration: newTrimEnd - newTrimStart };
            newClips[clipIndex] = clipToUpdate;
            affectedClip = clipToUpdate;

            for (let i = clipIndex + 1; i < newClips.length; i++) {
                newClips[i].start = newClips[i-1].start + newClips[i-1].duration;
            }
            
            return { ...track, clips: newClips };
        });

        setTracks(newTracks);

        if (affectedClip && affectedClip.id === selectedClipId) {
            updatePreview(affectedClip);
        }
    }

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !loaded) return;
    setProcessingMessage("Analyzing Media...");
    setIsProcessing(true);
    let updatedTracks = [...tracks];
    
    for (const file of Array.from(files)) {
        let clipType: 'video' | 'audio' | 'image' | null = null;
        if (file.type.startsWith('video')) clipType = 'video';
        else if (file.type.startsWith('audio')) clipType = 'audio';
        else if (file.type.startsWith('image')) clipType = 'image';
        else { console.warn(`Skipping unsupported file type: ${file.name}`); continue; }

        let sourceDuration = 0, thumbnail = '';
        
        if (clipType === 'video') {
            sourceDuration = await getMediaDuration(file, 'video');
            thumbnail = await generateThumbnail(file, 'video');
        } else if (clipType === 'audio') {
            sourceDuration = await getMediaDuration(file, 'audio');
        } else if (clipType === 'image') {
            sourceDuration = DEFAULT_IMAGE_DURATION;
            thumbnail = await generateThumbnail(file, 'image');
        }

        if (sourceDuration === 0 && clipType !== 'image') { console.warn(`Could not determine duration for: ${file.name}`); continue; }

        const targetTrackType = (clipType === 'video' || clipType === 'image') ? 'video' : 'audio';
        let targetTrackIndex = updatedTracks.findIndex(t => t.type === targetTrackType && !t.isLocked);

        if (targetTrackIndex === -1) {
            const newTrack: Track = { id: generateId(), type: targetTrackType, clips: [], isLocked: false, isHidden: false };
            updatedTracks = [...updatedTracks, newTrack];
            targetTrackIndex = updatedTracks.length - 1;
        }

        let targetTrack = { ...updatedTracks[targetTrackIndex] };
        const lastClipInTrack = targetTrack.clips[targetTrack.clips.length - 1];
        const start = lastClipInTrack ? lastClipInTrack.start + lastClipInTrack.duration : 0;

        const newClip: Clip = { 
            id: generateId(), file, thumbnail, type: clipType, start, 
            sourceDuration, trimStart: 0, trimEnd: sourceDuration, duration: sourceDuration,
            effects: { brightness: 0, contrast: 1, saturation: 1 }
        };
        
        targetTrack.clips = [...targetTrack.clips, newClip];
        updatedTracks[targetTrackIndex] = targetTrack;

        if (!selectedClipId) setSelectedClipId(newClip.id);
    }
    setTracks(updatedTracks);
    setIsProcessing(false);
  };

  const handleClipClick = (clip: Clip) => {
      setSelectedClipId(clip.id);
      updatePreview(clip);
  };

  const handleRulerClick = (time: number) => {
      setPlayhead(time);
      if (previewVideoRef.current) previewVideoRef.current.currentTime = time;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let sourceClip: Clip | undefined;
    let sourceTrackIndex = -1;

    tracks.forEach((track, index) => {
        const clip = track.clips.find(c => c.id === active.id);
        if (clip) { sourceClip = clip; sourceTrackIndex = index; }
    });

    if (!sourceClip) return;

    const destTrackIndex = tracks.findIndex(t => t.id === over.id || t.clips.some(c => c.id === over.id));
    if (destTrackIndex === -1) return;

    const destTrack = tracks[destTrackIndex];
    const sourceType = (sourceClip.type === 'video' || sourceClip.type === 'image') ? 'video' : 'audio';
    if (destTrack.type !== sourceType) {
        alert(`Cannot move a ${sourceClip.type} clip to an ${destTrack.type} track.`);
        return;
    }

    const newTracks = [...tracks].map(t => ({...t, clips: [...t.clips]}));
    
    const sourceClips = newTracks[sourceTrackIndex].clips;
    const clipIndex = sourceClips.findIndex(c => c.id === active.id);
    const [movedClip] = sourceClips.splice(clipIndex, 1);

    const destClips = newTracks[destTrackIndex].clips;
    const overIsTrack = newTracks[destTrackIndex].id === over.id;
    const destClipIndex = overIsTrack ? destClips.length : destClips.findIndex(c => c.id === over.id);
    destClips.splice(destClipIndex, 0, movedClip);

    const affectedTrackIds = new Set([sourceTrackIndex, destTrackIndex]);
    affectedTrackIds.forEach(tIndex => {
        let currentTime = 0;
        newTracks[tIndex].clips.forEach(clip => {
            clip.start = currentTime;
            currentTime += clip.duration;
        });
    });

    setTracks(newTracks);
  }

  const addTextOverlayAction = async () => {
    if (!selectedClip || selectedClip.type !== 'video') { alert("Please select a video clip to add text."); return; }
    setProcessingMessage("Adding Text Overlay...");
    setIsProcessing(true);
    
    try {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile("input.mp4", await fetchFile(selectedClip.file));

        let position_y = "(h-text_h)/2";
        if (textPosition === 'top') position_y = "10";
        if (textPosition === 'bottom') position_y = "h-text_h-10";
        
        const command = [
            '-ss', selectedClip.trimStart.toString(),
            '-i', 'input.mp4',
            '-t', selectedClip.duration.toString(),
            '-vf', `drawtext=fontfile=Roboto.ttf:text='${textOverlay.replace(/'/g, `\\'`)}':fontcolor=${textColor}:fontsize=${textSize}:x=(w-text_w)/2:y=${position_y}`,
            '-c:a', 'copy',
            'output.mp4'
        ];
        
        await ffmpeg.exec(command);
        const data = await ffmpeg.readFile("output.mp4");
        
        const newFile = new File([data], `text_${selectedClip.file.name}`, { type: "video/mp4" });
        const newThumbnail = await generateThumbnail(newFile, 'video');
        const newSourceDuration = await getMediaDuration(newFile, 'video');

        const updatedClip: Clip = {
            ...selectedClip,
            file: newFile,
            thumbnail: newThumbnail,
            sourceDuration: newSourceDuration,
            trimStart: 0,
            trimEnd: newSourceDuration,
            duration: newSourceDuration
        };

        updateClip(selectedClip.id, updatedClip);
        updatePreview(updatedClip);

    } catch (error) {
        console.error("Error adding text overlay:", error);
        alert("Failed to add text overlay.");
    } finally {
        setIsProcessing(false);
    }
  };

  const exportTrack = async (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) { alert("Track not found!"); return; }
    if (track.type !== 'video') { alert("Only video tracks can be exported for now."); return; }
    if (track.clips.length === 0) { alert("Track is empty!"); return; }
    
    setProcessingMessage("Exporting... This may take a while.");
    await exportWithConcat(track);
  };

  const exportWithConcat = async (track: Track) => {
    setIsProcessing(true);
    const ffmpeg = ffmpegRef.current;
    const fileList: string[] = [];

    for (let i = 0; i < track.clips.length; i++) {
        const clip = track.clips[i];
        const inputFileName = `input_${i}_${clip.file.name}`;
        const outputFileName = `clip_${i}.mp4`;

        await ffmpeg.writeFile(inputFileName, await fetchFile(clip.file));
        
        const command = [];
        if (clip.type === 'image') {
             command.push('-loop', '1', '-i', inputFileName, '-t', clip.duration.toString(), '-pix_fmt', 'yuv420p');
        } else {
             command.push('-ss', clip.trimStart.toString(), '-i', inputFileName, '-t', clip.duration.toString());
        }
        
        const vf = [];
        if (hasEffects(clip)) {
            const { brightness, contrast, saturation } = clip.effects!;
            vf.push(`eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`);
        }
        if (vf.length > 0) {
            command.push('-vf', vf.join(','));
        }

        command.push('-preset', 'ultrafast', outputFileName);
        await ffmpeg.exec(command);
        fileList.push(`file '${outputFileName}'`);
    }
    
    await ffmpeg.writeFile('filelist.txt', fileList.join('\n'));
    const concatCommand = ['-f', 'concat', '-safe', '0', '-i', 'filelist.txt', '-c', 'copy', 'output.mp4'];
    await ffmpeg.exec(concatCommand);

    const data = await ffmpeg.readFile("output.mp4");
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    setExportedUrl(url);
    setShowExportModal(true);
    setIsProcessing(false);
  }

  return (
    <>
      <ProcessingOverlay isProcessing={isProcessing} message={processingMessage} />
      <ExportModal 
        show={showExportModal}
        url={exportedUrl} 
        onClose={() => { setShowExportModal(false); if(exportedUrl) URL.revokeObjectURL(exportedUrl); setExportedUrl(null); }} 
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 sm:p-6 lg:p-8 relative font-sans">
            <header className="w-full max-w-7xl mx-auto mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-200">Pro Video Editor</h1>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-2/3 flex flex-col bg-gray-800 rounded-lg shadow-lg p-4 gap-4">
                    <div className="w-full bg-black rounded-md flex items-center justify-center aspect-video">
                        {previewUrl ? 
                           (selectedClip?.type === 'image' ? 
                               <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" /> :
                               <video ref={previewVideoRef} src={previewUrl} controls className="w-full h-full object-contain" key={previewUrl}></video>
                           )
                           : <div className="text-gray-400">Upload or select a video/image to preview</div>
                        }
                    </div>
                    <Timeline 
                        tracks={tracks}
                        selectedClipId={selectedClipId}
                        playhead={playhead}
                        zoom={zoom}
                        totalTimelineDuration={totalTimelineDuration}
                        onRulerClick={handleRulerClick}
                        onClipClick={handleClipClick}
                        onSetTransition={handleSetTransition}
                        onClipTrim={handleClipTrim}
                        onDeleteTrack={handleDeleteTrack}
                        onToggleTrackLock={handleToggleTrackLock}
                        onToggleTrackVisibility={handleToggleTrackVisibility}
                    />
                </div>

                <div className="lg:w-1/3 flex flex-col gap-6">
                    <UploadPanel onMediaUpload={handleMediaUpload} loaded={loaded} isProcessing={isProcessing} />
                    <ActionsPanel 
                        selectedClip={selectedClip}
                        playhead={playhead}
                        onSplit={handleSplitClip}
                        isProcessing={isProcessing}
                        onUndo={undo}
                        onRedo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onAddTrack={handleAddTrack}
                    />
                    <ExportPanel onExport={exportTrack} tracks={tracks} loaded={loaded} isProcessing={isProcessing} />
                    <TextOverlayPanel
                        selectedClip={selectedClip}
                        textOverlay={textOverlay}
                        onTextOverlayChange={setTextOverlay}
                        textColor={textColor}
                        onTextColorChange={setTextColor}
                        textSize={textSize}
                        onTextSizeChange={setTextSize}
                        textPosition={textPosition}
                        onTextPositionChange={setTextPosition}
                        onAddText={addTextOverlayAction}
                        loaded={loaded}
                        isProcessing={isProcessing}
                    />
                    <EffectsPanel 
                        selectedClip={selectedClip} 
                        onEffectChange={handleEffectChange}
                        isProcessing={isProcessing}
                        loaded={loaded}
                    />
                </div>
            </main>
        </div>
      </DndContext>
    </>
  );
}
