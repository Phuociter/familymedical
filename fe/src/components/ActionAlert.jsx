import React, { useEffect } from 'react';

const ActionAlert = ({
  isOpen,
  onClose,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 
         ALERT CONTAINER - "THE BLUE PEARL STYLE"
      */}
      <div
        className="relative w-full max-w-[340px] bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-12px_rgba(26,115,232,0.3),inset_0_0_30px_rgba(255,255,255,0.8)] animate-spring-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 
           --- STYLIZED ELEMENT: THE FLOATING ORB (X BUTTON) --- 
        */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={onClose}
            className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-[#1a73e8] to-blue-600 text-white shadow-lg shadow-blue-500/40 transition-all duration-300 hover:scale-110 hover:shadow-blue-500/60 hover:-translate-y-1 active:scale-95"
          >
             {/* Hover Glow Effect */}
             <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
             
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="px-8 pt-12 pb-8 flex flex-col items-center text-center">
          
          {/* Custom Content */}
          <div className="text-slate-600 font-medium text-lg leading-relaxed tracking-wide mb-8">
            {children}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="relative w-full py-3.5 overflow-hidden group bg-[#1a73e8] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-md shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95"
          >
            <span className="relative z-10">Đóng lại</span>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionAlert;