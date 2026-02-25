import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BannerProps {
  size: {
    width: number;
    height: number;
    label: string;
  };
  content: {
    headline: string;
    subheadline: string;
    cta: string;
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  imageUrl: string | null;
  loading?: boolean;
}

export const BannerPreview: React.FC<BannerProps> = ({ size, content, imageUrl, loading }) => {
  const { width, height, label } = size;
  
  // Scale factor to fit in UI
  const maxDisplayWidth = 400;
  const scale = width > maxDisplayWidth ? maxDisplayWidth / width : 1;

  const containerStyle: React.CSSProperties = {
    width: width * scale,
    height: height * scale,
    backgroundColor: content.brandColors.primary,
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.1)',
    transform: `scale(${1})`, // We use CSS scale for better rendering if needed, but here we just adjust dims
    display: 'flex',
    flexDirection: width > height ? 'row' : 'column',
  };

  const isVertical = height > width;
  const isWide = width > height * 2;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1">{label}</span>
          <span className="text-[11px] font-mono text-zinc-500">{width} × {height}px</span>
        </div>
        <div className="h-px flex-1 mx-4 bg-zinc-200 mb-1.5 opacity-50" />
      </div>
      
      <div 
        style={containerStyle}
        className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none"
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Product" 
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/20" />
        )}

        {/* Overlay for better text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />

        <div className="relative z-10 p-5 flex flex-col h-full w-full justify-between">
          <div className={cn(
            "flex flex-col gap-2",
            isWide ? "max-w-[65%]" : "w-full"
          )}>
            <h3 className={cn(
              "font-display font-bold leading-[1.1] tracking-tight text-white drop-shadow-xl",
              width < 200 ? "text-sm" : width < 400 ? "text-xl" : "text-3xl"
            )}>
              {content.headline}
            </h3>
            {height > 120 && (
              <p className={cn(
                "text-white/90 leading-relaxed font-medium",
                width < 200 ? "text-[10px]" : "text-xs"
              )}>
                {content.subheadline}
              </p>
            )}
          </div>

          <div className={cn(
            "flex",
            isWide ? "justify-end items-center" : "justify-start"
          )}>
            <button 
              style={{ 
                backgroundColor: content.brandColors.accent,
                boxShadow: `0 4px 14px 0 ${content.brandColors.accent}40`
              }}
              className={cn(
                "font-bold rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300",
                width < 200 ? "px-3 py-1 text-[10px]" : "px-6 py-2.5 text-sm"
              )}
            >
              {content.cta}
            </button>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-20">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
