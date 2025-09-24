"use client";

export const ProcessingOverlay = ({ isProcessing, message }: { isProcessing: boolean, message: string}) => {
    if (!isProcessing) return null;
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
          <div className="text-2xl font-bold mb-4">{message}</div>
          <div className="w-24 h-24 border-8 border-dashed rounded-full animate-spin border-indigo-600"></div>
        </div>
    );
}

export const ExportModal = ({ show, url, onClose, onDownload }: { show: boolean, url: string | null, onClose: () => void, onDownload: () => void}) => {
    if (!show || !url) return null;
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Export Complete!</h2>
                <video src={url} controls className="w-full rounded-md"></video>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md">Close</button>
                    <a href={url} download="exported-video.mp4" onClick={onDownload} className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md font-semibold">Download</a>
                </div>
            </div>
        </div>
    );
}
