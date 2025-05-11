'use client'

import { useState, useRef } from 'react'

export default function TestVideoPage() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoLoaded = () => {
    console.log("Video loaded successfully on test page");
    setVideoLoaded(true);
  };

  const handleVideoError = (e: any) => {
    console.error('Video failed to load on test page', e);
    setVideoError(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Video Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl mb-2">Video from API route:</h2>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            controls
            width="100%"
            height="auto"
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
            className="border border-gray-300 rounded"
          >
            <source src="/api/video" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="mt-2">
            Status: {videoLoaded ? '✅ Loaded' : videoError ? '❌ Error' : '⏳ Loading...'}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl mb-2">Video from direct path:</h2>
          <video
            autoPlay
            loop
            muted
            controls
            width="100%"
            height="auto"
            className="border border-gray-300 rounded"
          >
            <source src="/lastbot-combined-generation.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl mb-2">Video from videos folder:</h2>
        <video
          autoPlay
          loop
          muted
          controls
          width="100%"
          height="auto"
          className="border border-gray-300 rounded"
        >
          <source src="/videos/lastbot-combined-generation.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
} 