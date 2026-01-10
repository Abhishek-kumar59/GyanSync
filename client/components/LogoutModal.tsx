
import React from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ onConfirm, onCancel, darkMode }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
      <div className={`relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 transition-colors ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
        <button 
          onClick={onCancel}
          className={`absolute top-6 right-6 p-2 rounded-xl transition-colors ${darkMode ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-3xl text-rose-500 mb-6 transition-colors ${darkMode ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
            <LogOut size={32} />
          </div>
          <h3 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Ready to Leave?</h3>
          <p className={`font-medium mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Make sure to save your work before logging out. We'll be here when you're ready to focus again.
          </p>
          
          <div className="flex w-full gap-3">
            <button 
              onClick={onCancel}
              className={`flex-1 font-bold py-4 rounded-2xl transition-all ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
