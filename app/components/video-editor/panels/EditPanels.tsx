'use client';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Clip, TextPosition } from '../lib/types';

// NOTE: TrimPanel has been removed as trimming is now handled directly on the timeline.

export const TextOverlayPanel = ({ selectedClip, textOverlay, onTextOverlayChange, textColor, onTextColorChange, textSize, onTextSizeChange, textPosition, onTextPositionChange, onAddText, loaded, isProcessing }: {
    selectedClip: Clip | null;
    textOverlay: string;
    onTextOverlayChange: (text: string) => void;
    textColor: string;
    onTextColorChange: (color: string) => void;
    textSize: number;
    onTextSizeChange: (size: number) => void;
    textPosition: TextPosition;
    onTextPositionChange: (position: TextPosition) => void;
    onAddText: () => void;
    loaded: boolean;
    isProcessing: boolean;
}) => {
    if (!selectedClip) return null;
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Text Overlay</h2>
            <div className="space-y-4">
                <input type="text" value={textOverlay} onChange={(e) => onTextOverlayChange(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600" placeholder="Text to display" />
                <div className="flex items-center gap-4">
                    <label htmlFor="textColor" className="text-sm">Color:</label>
                    <input type="color" id="textColor" value={textColor} onChange={(e) => onTextColorChange(e.target.value)} className="w-10 h-10 p-0 border-none bg-transparent rounded cursor-pointer"/>
                    <label htmlFor="textSize" className="flex-grow text-sm">Size: {textSize}px</label>
                    <div className="w-2/3"><Slider min={10} max={200} value={textSize} onChange={(v) => onTextSizeChange(v as number)} trackStyle={[{ backgroundColor: '#4f46e5' }]} handleStyle={[{ borderColor: '#4f46e5' }]} railStyle={{ backgroundColor: '#374151' }}/></div>
                </div>
                <div className="flex justify-between gap-2">
                    {(['top', 'center', 'bottom'] as const).map(p => (
                        <button key={p} onClick={() => onTextPositionChange(p)} className={`flex-1 py-2 px-2 rounded text-sm font-semibold capitalize transition-colors ${textPosition === p ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{p}</button>
                    ))}
                </div>
                <button onClick={onAddText} disabled={!loaded || isProcessing} className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 transition-colors duration-200 shadow-md">Add Text to Clip</button>
            </div>
        </div>
    );
};


const EffectSlider = ({ label, value, min, max, step, onChange, defaultValue }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    defaultValue: number;
}) => (
    <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium">{label}</label>
            <span className="text-xs bg-gray-600 px-2 py-1 rounded">{value.toFixed(2)}</span>
        </div>
        <Slider
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(v) => onChange(v as number)}
            trackStyle={[{ backgroundColor: '#4f46e5' }]}
            handleStyle={[{ borderColor: '#4f46e5' }]}
            railStyle={{ backgroundColor: '#374151' }}
        />
         <button onClick={() => onChange(defaultValue)} className="text-xs text-gray-400 hover:text-white self-end">Reset</button>
    </div>
);

export const EffectsPanel = ({
    selectedClip,
    onEffectChange,
    isProcessing,
    loaded
}: {
    selectedClip: Clip | null;
    onEffectChange: (effect: 'brightness' | 'contrast' | 'saturation', value: number) => void;
    isProcessing: boolean;
    loaded: boolean;
}) => {
    if (!selectedClip) {
        return null;
    }

    const effects = selectedClip.effects || { brightness: 0, contrast: 1, saturation: 1 };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-4">Effects</h2>
            <div className="flex flex-col gap-6">
                <EffectSlider
                    label="Brightness"
                    value={effects.brightness}
                    min={-1}
                    max={1}
                    step={0.05}
                    defaultValue={0}
                    onChange={(val) => onEffectChange('brightness', val)}
                />
                <EffectSlider
                    label="Contrast"
                    value={effects.contrast}
                    min={0}
                    max={2}
                    step={0.05}
                    defaultValue={1}
                    onChange={(val) => onEffectChange('contrast', val)}
                />
                <EffectSlider
                    label="Saturation"
                    value={effects.saturation}
                    min={0}
                    max={2}
                    step={0.05}
                    defaultValue={1}
                    onChange={(val) => onEffectChange('saturation', val)}
                />
            </div>
        </div>
    );
};
