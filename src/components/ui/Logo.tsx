import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 font-sans ${className}`}>
      <div className="text-primary text-3xl font-bold tracking-tight flex items-baseline">
        <span>umkm</span>
        <span className="flex items-center">
          <div className="flex gap-0.5 ml-0.5 mt-1">
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>
          <span className="text-primary ml-0.5">'</span>
          <span className="ml-0.5">s</span>
        </span>
      </div>
    </div>
  );
}
