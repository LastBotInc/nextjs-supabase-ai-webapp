'use client'

import { useState } from 'react'

export default function DirectVideoPage() {
  const [videoSrc, setVideoSrc] = useState('/videos/lastbot-combined-generation.mp4')

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
      <div style={{ padding: '20px', display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setVideoSrc('/videos/lastbot-combined-generation.mp4')}
          style={{ padding: '8px 16px', backgroundColor: videoSrc === '/videos/lastbot-combined-generation.mp4' ? 'blue' : 'gray', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Videos Folder
        </button>
        <button 
          onClick={() => setVideoSrc('/lastbot-combined-generation.mp4')}
          style={{ padding: '8px 16px', backgroundColor: videoSrc === '/lastbot-combined-generation.mp4' ? 'blue' : 'gray', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Root Public
        </button>
        <button 
          onClick={() => setVideoSrc('/api/video')}
          style={{ padding: '8px 16px', backgroundColor: videoSrc === '/api/video' ? 'blue' : 'gray', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          API Route
        </button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
        <video
          controls
          autoPlay
          style={{ maxWidth: '90%', maxHeight: '90%', border: '1px solid white' }}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div style={{ position: 'fixed', bottom: '10px', left: '10px', color: 'white' }}>
        Current source: {videoSrc}
      </div>
    </div>
  )
} 