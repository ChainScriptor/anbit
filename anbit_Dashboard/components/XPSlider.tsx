
import React from 'react';

interface XPSliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

const XPSlider: React.FC<XPSliderProps> = ({ value, onChange, max = 500 }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold text-white/50 tracking-widest uppercase">XP Reward Potency</label>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black italic font-display text-anbit-yellow leading-none">{value}</span>
          <span className="text-xs font-bold text-anbit-yellow/60">XP</span>
        </div>
      </div>
      
      <div className="relative h-12 flex items-center group">
        {/* Track */}
        <div className="absolute inset-0 h-3 my-auto bg-white/5 rounded-full border border-white/10 overflow-hidden">
          <div 
            className="h-full bg-anbit-yellow transition-all duration-300"
            style={{ 
              width: `${percentage}%`,
              boxShadow: `0 0 ${Math.min(value / 5, 40)}px #FEF08A` 
            }}
          />
        </div>
        
        {/* Input */}
        <input 
          type="range" 
          min="0" 
          max={max} 
          step="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Visual Thumb Overlay */}
        <div 
          className="absolute h-8 w-8 bg-anbit-yellow rounded-lg pointer-events-none transition-all duration-75 flex items-center justify-center shadow-glow-yellow border-4 border-anbit-dark"
          style={{ left: `calc(${percentage}% - 16px)` }}
        >
          <div className="w-1 h-4 bg-anbit-dark/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default XPSlider;
