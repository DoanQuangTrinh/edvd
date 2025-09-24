export type Clip = {
    id: string;
    file: File;
    thumbnail: string;
    type: 'video' | 'audio' | 'image';
    
    // Timings
    start: number; // Position on the main timeline
    duration: number; // Duration on the main timeline (trimEnd - trimStart)
    sourceDuration: number; // The original, full duration of the source file
    trimStart: number; // In-point of the clip from the source file, in seconds
    trimEnd: number; // Out-point of the clip from the source file, in seconds

    // Effects & Transitions
    transitionIn?: { type: 'fade' | 'fadeblack'; duration: number };
    effects?: {
        brightness: number; // Range: -1 to 1 (default 0)
        contrast: number;   // Range: 0 to 2 (default 1)
        saturation: number; // Range: 0 to 2 (default 1)
    };
};

export type Track = {
    id: string;
    type: 'video' | 'audio';
    clips: Clip[];
    isLocked?: boolean;
    isHidden?: boolean;
};

export type TextPosition = 'top' | 'center' | 'bottom';
