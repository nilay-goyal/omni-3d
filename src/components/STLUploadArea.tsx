
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <Card className={`transition-all duration-300 ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <CardContent 
        className="p-8 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your STL File</h3>
            <p className="text-gray-600 mb-4">Drag and drop your STL file here, or click to browse</p>
            <Button variant="outline" className="mb-2">
              <FileText className="mr-2 h-4 w-4" />
              Choose STL File
            </Button>
            <p className="text-sm text-gray-500">Supports both ASCII and Binary STL formats</p>
          </div>
        </div>
        <input
          id="file-input"
          type="file"
          accept=".stl"
          className="hidden"
          onChange={handleFileInput}
        />
      </CardContent>
    </Card>
  );
};

export default STLUploadArea;
