
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Eye } from 'lucide-react';
import STLViewer from '@/components/STLViewer';
import type { FileData } from '@/hooks/useFileUpload';

interface STLPreviewPanelProps {
  file: FileData | null;
  onClose: () => void;
}

const STLPreviewPanel = ({ file, onClose }: STLPreviewPanelProps) => {
  if (!file) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>3D Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed">
            <div className="text-center">
              <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Select a file to preview</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>3D Preview</CardTitle>
            <p className="text-sm text-gray-600">{file.file_name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <STLViewer fileUrl={file.file_path} />
      </CardContent>
    </Card>
  );
};

export default STLPreviewPanel;
