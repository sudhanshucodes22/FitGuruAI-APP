import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="absolute top-[64px] inset-x-gutter z-[999] flex justify-center pointer-events-none">
      <div className={`px-sm py-xs rounded-lg border backdrop-blur-md shadow-lg text-xs font-label-caps tracking-wider transition-all duration-300 flex items-center gap-xs ${
        isError 
          ? 'bg-error/15 border-error/30 text-error shadow-error/10' 
          : 'bg-primary/10 border-primary/20 text-primary shadow-primary/10'
      }`}>
        <span className="material-symbols-outlined text-sm">
          {isError ? 'report' : 'check_circle'}
        </span>
        {toast.text}
      </div>
    </div>
  );
}
