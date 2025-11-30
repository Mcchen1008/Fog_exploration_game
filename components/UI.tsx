import React from 'react';
import { BiomeType } from '../types';
import { BookOpen, Compass, Activity, Feather } from 'lucide-react';

interface UIProps {
  currentBiome: BiomeType;
  onGenerateLog: () => void;
  log: string | null;
  loading: boolean;
}

export const UI: React.FC<UIProps> = ({ currentBiome, onGenerateLog, log, loading }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Top Left: Status */}
      <div className="flex gap-4 items-start">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl text-white border border-white/10 shadow-lg">
           <div className="flex items-center gap-2 mb-2">
             <Compass className="w-5 h-5 text-blue-400" />
             <span className="font-bold text-lg tracking-wider">ZONE: {currentBiome.toUpperCase()}</span>
           </div>
           <div className="flex items-center gap-2 text-xs text-gray-400">
             <Activity className="w-4 h-4 text-green-400" />
             <span>VITALS: STABLE</span>
           </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute top-6 right-6 bg-black/40 p-3 rounded-lg text-white text-xs text-right">
        <p>WASD to Move</p>
        <p>SPACE to Jump</p>
        <p>Find Mines to Reset World</p>
      </div>

      {/* Bottom Right: Journal Action */}
      <div className="pointer-events-auto self-end flex flex-col items-end gap-4">
        {isOpen && (
            <div className="bg-[#f5e6d3] w-80 p-6 rounded-lg shadow-2xl border-4 border-[#8b5cf6] text-gray-800 font-serif transform transition-all">
                <h3 className="text-xl font-bold mb-2 border-b border-gray-400 pb-1 text-[#4a3b2a]">Explorer's Journal</h3>
                <div className="min-h-[100px] text-sm leading-relaxed italic">
                    {loading ? (
                        <div className="flex items-center gap-2 animate-pulse text-gray-500">
                            <Feather className="w-4 h-4 animate-bounce" />
                            <span>Drafting entry...</span>
                        </div>
                    ) : (
                        log || "The page is blank. Press the quill to record your findings."
                    )}
                </div>
            </div>
        )}

        <button 
            onClick={() => {
                if (!isOpen) setIsOpen(true);
                onGenerateLog();
            }}
            disabled={loading}
            className="group flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span className="font-bold hidden group-hover:block transition-all">Log Discovery</span>
            {loading ? <Activity className="animate-spin" /> : <BookOpen />}
        </button>
      </div>
    </div>
  );
};
