'use client';

import dynamic from 'next/dynamic';

// Dynamically import the main VideoEditor component and disable SSR for it
const VideoEditor = dynamic(() => import('@/app/components/video-editor/VideoEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <p>Loading Editor...</p>
    </div>
  ),
});

// This is the Client Component that will render the VideoEditor
export default function ClientVideoEditor() {
  return <VideoEditor />;
}