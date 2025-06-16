
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";
import STLViewer from "@/components/STLViewer";

interface UploadedFile {
  id: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  created_at: string;
  file_path: string;
}

interface PreviewSectionProps {
  previewFile: UploadedFile | null;
  onClosePreview: () => void;
}

const PreviewSection = ({ previewFile, onClosePreview }: PreviewSectionProps) => {
  if (previewFile) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>STL Preview</CardTitle>
              <CardDescription>{previewFile.file_name}</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClosePreview}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <STLViewer fileUrl={previewFile.file_path} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>STL Preview</CardTitle>
        <CardDescription>Click "Preview" on any uploaded file to view it here</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No file selected for preview</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviewSection;
