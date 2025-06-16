
import React, { useCallback, useState } from 'react';
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
        bg-white border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
        transition-all duration-300 shadow-sm
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Your STL File
          </h3>
          <p className="text-gray-600 mb-6">
            Drag and drop your STL file here, or click to browse
          </p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg 
                     transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('file-input')?.click();
            }}
          >
            <FileText className="mr-2 h-5 w-5 inline" />
            Choose STL File
          </button>
          <p className="text-sm text-gray-500 mt-4">
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
