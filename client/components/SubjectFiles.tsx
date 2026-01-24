
import React, { useState, useRef, useMemo } from 'react';
import { FolderPlus, FileText, MoreVertical, Search, Plus, Folder as FolderIcon, Trash2, FileUp, AlertTriangle, X } from 'lucide-react';
import { Folder, FileAsset } from '../types';
import { FilePreviewModal } from './FilePreviewModal';
import { authService } from '../services/authService';

interface SubjectFilesProps {
  folders: Folder[];
  onAddFolder: (name: string) => void;
  onAddFile: (folderId: string, name: string) => void;
  onUpdateFolder: (folderId: string, folder: Folder) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteFile: (folderId: string, fileId: string) => void;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  // Added darkMode prop for consistency
  darkMode: boolean;
}

const ConfirmationModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel, darkMode }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
    <div className={`relative w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-3xl text-amber-500 mb-6 ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <AlertTriangle size={32} />
        </div>
        <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        <p className={`text-sm font-medium mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>
        <div className="flex w-full gap-3">
          <button onClick={onCancel} className={`flex-1 font-bold py-3 rounded-2xl transition-all ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-rose-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all">Delete</button>
        </div>
      </div>
    </div>
  </div>
);

export const SubjectFiles: React.FC<SubjectFilesProps> = ({ folders, onAddFolder, onAddFile, onUpdateFolder, onDeleteFolder, onDeleteFile, darkMode }) => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<{ folderId: string; fileId: string; fileName: string; fileType: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Deletion States
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'folder' | 'file', folderId: string, fileId?: string, name: string } | null>(null);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName);
      setNewFolderName('');
      setShowAddFolder(false);
    }
  };

  const handleFileUploadTrigger = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeFolder) {
      try {
        setUploading(true);
        const response = await authService.uploadFile(activeFolder, file);
        // Use the response which now contains the updated folder with the new file
        if (response && response.folder) {
          onUpdateFolder(activeFolder, response.folder);
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
        alert('Failed to upload file');
      } finally {
        setUploading(false);
        e.target.value = ''; // Reset input
      }
    }
  };

  const filteredFolders = useMemo(() => {
    return folders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.files.some(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [folders, searchTerm]);

  const displayedFiles = useMemo(() => {
    if (searchTerm) {
      // Global search across all folders when searching
      const allMatching = [];
      for (const f of folders) {
        for (const file of f.files) {
          if (file.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            allMatching.push({ ...file, folderId: f.id, folderName: f.name });
          }
        }
      }
      return allMatching;
    }
    const currentFolder = folders.find(f => f.id === activeFolder);
    return currentFolder?.files.map(file => ({ ...file, folderId: currentFolder.id })) || [];
  }, [folders, activeFolder, searchTerm]);

  const handleDeleteRequest = (type: 'folder' | 'file', folderId: string, fileId?: string, name?: string) => {
    setConfirmDelete({ type, folderId, fileId, name: name || 'this item' });
  };

  const executeDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'folder') {
      onDeleteFolder(confirmDelete.folderId);
      if (activeFolder === confirmDelete.folderId) setActiveFolder(null);
    } else if (confirmDelete.type === 'file' && confirmDelete.fileId) {
      onDeleteFile(confirmDelete.folderId, confirmDelete.fileId);
    }
    setConfirmDelete(null);
  };

  return (
    <div className={`rounded-[2rem] border shadow-sm p-8 h-full relative transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Study Materials</h2>
          <p className="text-sm text-slate-400">Organize your syllabus and notes</p>
          
          <div className="mt-4 relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search folders or files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-100'}`}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-300 hover:text-slate-500'}`}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setShowAddFolder(!showAddFolder)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${darkMode ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
          >
            <FolderPlus size={16} /> New Folder
          </button>
          <button 
            disabled={!activeFolder && !searchTerm}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
            onClick={handleFileUploadTrigger}
          >
            <FileUp size={16} /> Upload
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
      </div>

      {showAddFolder && (
        <form onSubmit={handleCreateFolder} className="mb-6 flex gap-2 animate-in fade-in slide-in-from-top-2">
          <input 
            type="text" 
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Subject Name..."
            className={`flex-1 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-100'}`}
            autoFocus
          />
          <button type="submit" className={`px-4 rounded-xl text-xs font-bold transition-colors ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white'}`}>Create</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Folders List */}
        <div className={`md:col-span-1 space-y-2 border-r pr-4 ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ml-2 mb-2 block ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Folders</span>
          {filteredFolders.map(folder => (
            <button
              key={folder.id}
              onClick={() => { setActiveFolder(folder.id); setSearchTerm(''); }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${
                activeFolder === folder.id && !searchTerm 
                ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') 
                : (darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-500')
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FolderIcon size={18} className={activeFolder === folder.id && !searchTerm ? (darkMode ? 'fill-indigo-400 shrink-0' : 'fill-indigo-600 shrink-0') : 'shrink-0'} />
                <span className="text-sm font-semibold truncate">{folder.name}</span>
              </div>
              <Trash2 
                size={14} 
                className="lg:opacity-0 lg:group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-opacity shrink-0" 
                onClick={(e) => { e.stopPropagation(); handleDeleteRequest('folder', folder.id, undefined, folder.name); }}
              />
            </button>
          ))}
          {filteredFolders.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <FolderIcon size={24} className="mx-auto mb-2 opacity-20" />
              <p className="text-[10px] font-bold">No folders found</p>
            </div>
          )}
        </div>

        {/* Files View */}
        <div className="md:col-span-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest mb-4 block ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Files'}
          </span>
          {!activeFolder && !searchTerm ? (
            <div className={`h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl ${darkMode ? 'border-slate-700 text-slate-600' : 'border-slate-100 text-slate-300'}`}>
              <Search size={32} className="mb-2 opacity-20" />
              <p className="text-xs font-medium">Select a folder to view files</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedFiles.map(file => (
                <div 
                  key={file.id} 
                  onDoubleClick={() => setPreviewFile({ folderId: (file as any).folderId || activeFolder || '', fileId: file.id, fileName: file.name, fileType: (file as any).type || 'application/octet-stream' })}
                  className={`p-4 border rounded-2xl transition-all group cursor-pointer relative ${darkMode ? 'bg-slate-700 border-slate-600 hover:border-indigo-500/50' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-sm'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <FileText size={20} />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest('file', (file as any).folderId, file.id, file.name); }}
                        className={`p-1.5 rounded-lg transition-all lg:opacity-0 lg:group-hover:opacity-100 ${darkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-400/10' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button className={`${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-300 hover:text-slate-600'}`}>
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm font-bold truncate mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{file.name}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{file.size}</span>
                    <span className="truncate ml-2">{searchTerm && (file as any).folderName ? `in ${(file as any).folderName}` : file.date}</span>
                  </div>
                </div>
              ))}
              {!searchTerm && activeFolder && (
                <button 
                  onClick={handleFileUploadTrigger}
                  className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group ${darkMode ? 'border-slate-700 hover:bg-slate-700/50 text-slate-600' : 'border-slate-100 hover:bg-slate-50 text-slate-300'}`}
                >
                  <Plus size={24} className="group-hover:text-indigo-400 transition-colors" />
                  <span className={`text-[10px] font-bold ${darkMode ? 'group-hover:text-indigo-400' : 'group-hover:text-indigo-600'}`}>Add File</span>
                </button>
              )}
              {searchTerm && displayedFiles.length === 0 && (
                <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-500">
                   <p className="text-xs font-medium">No files matching your search</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmationModal 
          title={`Delete ${confirmDelete.type === 'folder' ? 'Folder' : 'File'}`}
          message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
          darkMode={darkMode}
        />
      )}

      {previewFile && (
        <FilePreviewModal
          folderId={previewFile.folderId}
          fileId={previewFile.fileId}
          fileName={previewFile.fileName}
          fileType={previewFile.fileType}
          onClose={() => setPreviewFile(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
