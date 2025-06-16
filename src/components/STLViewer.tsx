
import React, { useEffect, useRef } from 'react';
import { RotateCcw, Square, Palette } from 'lucide-react';
import { useSTLViewer } from '@/hooks/useSTLViewer';

interface STLViewerProps {
  file: File | null;
}

const STLViewer: React.FC<STLViewerProps> = ({ file }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    initScene, 
    loadFile, 
    resetCamera, 
    toggleWireframe, 
    changeColor, 
    fileInfo, 
    wireframeMode 
  } = useSTLViewer();

  useEffect(() => {
    if (containerRef.current) {
      initScene(containerRef.current);
    }
  }, [initScene]);

  useEffect(() => {
    if (file) {
      console.log('Loading file in STLViewer:', file.name);
      loadFile(file);
    }
  }, [file, loadFile]);

  return (
    <div className="space-y-6">
      {/* Viewer Container */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
        <div 
          ref={containerRef}
          className="w-full bg-gray-900 rounded-t-2xl overflow-hidden"
          style={{ height: '600px' }}
        />
        
        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-white font-semibold">Controls:</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={resetCamera}
                className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-full
                         hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              >
                🔄 Reset View
              </button>
              <button 
                onClick={toggleWireframe}
                className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-full
                         hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              >
                🔲 {wireframeMode ? 'Solid' : 'Wireframe'}
              </button>
              <button 
                onClick={changeColor}
                className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-full
                         hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              >
                🎨 Change Color
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-white/80">
            <strong>Mouse:</strong> Left = Rotate, Wheel = Zoom
          </div>
        </div>
      </div>

      {/* File Information */}
      {fileInfo && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h4 className="text-white font-semibold text-lg mb-4">File Information:</h4>
          <div className="space-y-2 text-white/90">
            <p><strong>File:</strong> {fileInfo.name}</p>
            <p><strong>Size:</strong> {fileInfo.size}</p>
            <p><strong>Vertices:</strong> {fileInfo.vertices.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default STLViewer;
