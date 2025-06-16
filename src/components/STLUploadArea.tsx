
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

interface STLUploadAreaProps {
  onFileSelect: (file: File) => void;
}

const STLUploadArea: React.FC<STLUploadAreaProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const stlFile = files.find(file => file.name.toLowerCase().endsWith('.stl'));
    
    if (stlFile) {
      onFileSelect(stlFile);
    } else {
      console.warn('Please select an STL file');
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      onFileSelect(file);
    } else if (file) {
      console.warn('Please select an STL file');
    }
  }, [onFileSelect]);

  return (
    <div 
      className={`
        bg-white/10 backdrop-blur-sm border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer
        transition-all duration-300 shadow-lg hover:shadow-xl
        ${isDragOver 
          ? 'border-green-400 bg-green-400/20' 
          : 'border-white/30 hover:border-white/60 hover:bg-white/15'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            📁 Upload Your STL File
          </h3>
          <p className="text-white/80 mb-6">
            Drag and drop your STL file here, or click to browse
          </p>
          <button 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                     text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-200
                     transform hover:-translate-y-1 hover:shadow-xl shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('file-input')?.click();
            }}
          >
            <FileText className="mr-2 h-5 w-5 inline" />
            Choose STL File
          </button>
          <p className="text-sm text-white/60 mt-4">
            Supports both ASCII and Binary STL formats
          </p>
        </div>
      </div>
      <input
        id="file-input"
        type="file"
        accept=".stl"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
};

export default STLUploadArea;
