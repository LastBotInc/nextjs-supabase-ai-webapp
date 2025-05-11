'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface HeroVideoProps {
  fallbackImage: any; // Consider using a more specific type if possible, e.g., StaticImageData
  alt: string;
}

export default function HeroVideo({ fallbackImage, alt }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoSrc = '/lastbot-hero.mp4'; // Direct path to the video in the public folder

  useEffect(() => {
    console.log('[HeroVideo] useEffect triggered');
    const videoElement = videoRef.current;

    if (videoElement) {
      console.log('[HeroVideo] Video element found:', videoElement);

      const handleLoadedData = () => {
        console.log('[HeroVideo] Video loaded data event');
        setVideoLoaded(true);
        videoElement.play().catch(error => {
          console.error('[HeroVideo] Autoplay failed:', error);
          // Attempt to play again on user interaction if needed, or set error state
          setVideoError(true);
        });
      };

      const handleError = (event: Event) => {
        console.error('[HeroVideo] Video error event:', event);
        const error = (event.target as HTMLVideoElement).error;
        console.error('[HeroVideo] MediaError:', error);
        setVideoError(true);
      };

      // Set up event listeners
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('error', handleError);
      
      // Log current src before setting
      console.log('[HeroVideo] Current video src before assignment:', videoElement.src);
      
      // Assign the source directly
      // No need to call videoElement.load() explicitly, as assigning src will trigger it.
      if (videoElement.src !== videoSrc) {
          console.log('[HeroVideo] Assigning new video src:', videoSrc);
          videoElement.src = videoSrc;
      } else {
          console.log('[HeroVideo] Video src already set to:', videoSrc);
          // If src is already set, and it hasn't loaded, it might be an issue with the path or network.
          // Consider re-triggering load if necessary, but usually not needed.
      }

      // Cleanup function
      return () => {
        console.log('[HeroVideo] Cleanup: removing event listeners and pausing video');
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('error', handleError);
        if (videoElement && !videoElement.paused) {
          videoElement.pause();
        }
      };
    } else {
      console.log('[HeroVideo] Video element NOT found in this render.');
    }
  }, [videoSrc]); // videoSrc dependency ensures this runs if the src changes, though it's static here.

  return (
    <div className="relative h-full w-full bg-black overflow-hidden"> {/* Changed: No longer absolute inset-0, added overflow-hidden */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline // Essential for iOS autoplay
        preload="auto" // Hint to the browser to start loading metadata or the full video
        className={`object-cover h-full w-full transition-opacity duration-500 ease-in-out ${videoLoaded && !videoError ? 'opacity-90' : 'opacity-0'}`}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        // poster={fallbackImage.src} // Keep poster commented out for now
      />
      <Image
        src={fallbackImage}
        alt={alt}
        fill
        priority
        quality={80} // Slightly adjusted quality
        sizes="100%" // Adjusted sizes for column context
        className={`object-cover h-full w-full transition-opacity duration-500 ease-in-out ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-70'}`}
        style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
      />
      {/* Removed the full-width gradient overlay that was here */}
    </div>
  );
} 