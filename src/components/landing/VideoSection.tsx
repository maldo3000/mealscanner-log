
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
              <iframe 
                src="https://www.youtube.com/embed/i1TgxQ-Ql6I?autoplay=1&rel=0&modestbranding=1&showinfo=0" 
                title="MealScanner Demo Video" 
                className="w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                frameBorder="0" 
              />
            ) : (
              <div className="relative w-full h-full">
                <img 
                  src="https://i.ytimg.com/vi/i1TgxQ-Ql6I/maxresdefault.jpg" 
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={handlePlayVideo} 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
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
