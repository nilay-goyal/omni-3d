
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Grid3x3, Palette } from 'lucide-react';
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🎯 STL Viewer</span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetCamera}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                🔄 Reset View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleWireframe}
              >
                <Grid3x3 className="h-4 w-4 mr-1" />
                🔲 {wireframeMode ? 'Solid' : 'Wireframe'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={changeColor}
              >
                <Palette className="h-4 w-4 mr-1" />
                🎨 Change Color
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={containerRef}
            className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden"
            style={{ minHeight: '600px' }}
          />
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p><strong>Controls:</strong> Left mouse = Rotate, Mouse wheel = Zoom</p>
          </div>
        </CardContent>
      </Card>

      {fileInfo && (
        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>File:</strong> {fileInfo.name}</p>
              <p><strong>Size:</strong> {fileInfo.size}</p>
              <p><strong>Vertices:</strong> {fileInfo.vertices.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default STLViewer;
