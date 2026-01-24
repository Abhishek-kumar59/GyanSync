import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon, Maximize2, Minimize2 } from 'lucide-react';
import { authService } from '../services/authService';

interface FilePreviewModalProps {
  folderId: string;
  fileId: string;
  fileName: string;
  fileType: string;
  onClose: () => void;
  darkMode: boolean;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  folderId,
  fileId,
  fileName,
  fileType,
  onClose,
  darkMode
}) => {
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 600 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        const data = await authService.getFilePreview(folderId, fileId);
        setFileData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load file');
        console.error('Error loading file:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [folderId, fileId]);

  const handleDownload = () => {
    authService.downloadFile(folderId, fileId, fileName);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isFullscreen) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isFullscreen) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: windowSize.width,
        height: windowSize.height
      });
    }
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (isResizing && !isFullscreen) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      setWindowSize({
        width: Math.max(400, resizeStart.width + deltaX),
        height: Math.max(300, resizeStart.height + deltaY)
      });
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mousemove', handleResizeMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseup', handleResizeEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any);
        window.removeEventListener('mousemove', handleResizeMove as any);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isDragging, isResizing, position, dragOffset, windowSize, resizeStart]);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Loading file...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{error}</p>
            <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Click Download to save the file locally</p>
          </div>
        </div>
      );
    }

    if (!fileData) return null;

    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    const isText = fileType.startsWith('text/') || fileType === 'application/json';

    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full overflow-auto bg-slate-950">
          <img src={fileData.data} alt={fileName} className="max-h-full max-w-full object-contain" />
        </div>
      );
    }

    if (isPDF) {
      return (
        <iframe
          src={fileData.data}
          className="w-full h-full border-0"
          title="PDF Preview"
        />
      );
    }

    if (isText) {
      try {
        const binaryString = atob(fileData.data.split(',')[1]);
        const text = new TextDecoder().decode(new Uint8Array(binaryString.split('').map(c => c.charCodeAt(0))));
        return (
          <div className={`h-full overflow-auto p-4 ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <pre className="font-mono text-sm whitespace-pre-wrap break-words">{text}</pre>
          </div>
        );
      } catch (err) {
        return (
          <div className="flex items-center justify-center h-full">
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Unable to preview this file type</p>
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileText size={48} className={`mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Preview not available for this file type</p>
        <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Click Download to save the file locally</p>
      </div>
    );
  };

  const modalStyle = isFullscreen ? {
    position: 'fixed' as const,
    inset: 0,
    width: '100%',
    height: '100%'
  } : {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${windowSize.width}px`,
    height: `${windowSize.height}px`
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        style={modalStyle}
        className={`relative rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-auto'} ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}
      >
        {/* Header - Draggable */}
        <div
          data-drag-handle
          className={`flex items-center justify-between p-4 border-b shrink-0 cursor-grab active:cursor-grabbing ${darkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText size={20} className={darkMode ? 'text-indigo-400 shrink-0' : 'text-indigo-600 shrink-0'} />
            <h3 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{fileName}</h3>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
              title="Download file"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {renderPreview()}
        </div>

        {/* Resize Handle */}
        {!isFullscreen && (
          <div
            onMouseDown={handleResizeStart}
            className={`absolute bottom-0 right-0 w-6 h-6 cursor-se-resize ${darkMode ? 'bg-slate-700 hover:bg-indigo-600' : 'bg-slate-100 hover:bg-indigo-400'} transition-colors`}
            style={{
              clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)'
            }}
            title="Drag to resize"
          />
        )}
      </div>
    </div>
  );
};
