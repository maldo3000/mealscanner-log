
import React, { useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play } from 'lucide-react';

interface VideoSectionProps {
  videoRef: React.RefObject<HTMLDivElement>;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  return (
    <section ref={videoRef} className="py-12 md:py-16 bg-secondary/30">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="rounded-xl overflow-hidden border border-border bg-card/50">
          <AspectRatio ratio={16 / 9} className="w-full">
            {isPlaying ? (
              <div className="relative w-full h-full">
                <iframe 
                  src="https://www.youtube.com/embed/7_YTq1HtHN0?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&color=white&iv_load_policy=3&disablekb=1&fs=0&playsinline=1" 
                  title="MealScanner Demo Video" 
                  className="w-full h-full absolute inset-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  frameBorder="0" 
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img 
                  src="https://i.ytimg.com/vi/7_YTq1HtHN0/maxresdefault.jpg" 
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={handlePlayVideo} 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  aria-label="Play video"
                >
                  <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-110">
                    <Play className="h-10 w-10 md:h-12 md:w-12 fill-primary-foreground" />
                  </div>
                </button>
              </div>
            )}
          </AspectRatio>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
