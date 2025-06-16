
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Check, Loader2, Eye } from "lucide-react";

interface UploadedFile {
  id: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  created_at: string;
  file_path: string;
}

interface FilesListProps {
  uploadedFiles: UploadedFile[];
  uploadingFiles: string[];
  onPreview: (file: UploadedFile) => void;
}

const FilesList = ({ uploadedFiles, uploadingFiles, onPreview }: FilesListProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (uploadedFiles.length === 0 && uploadingFiles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Files</CardTitle>
        <CardDescription>
          Manage your uploaded STL files and request quotes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Show uploading files */}
          {uploadingFiles.map((fileId) => (
            <div key={fileId} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-gray-900">Uploading...</p>
                  <p className="text-sm text-gray-500">Please wait</p>
                </div>
              </div>
            </div>
          ))}

          {/* Show uploaded files */}
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.file_size)} • Uploaded {formatDate(file.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.upload_status === 'completed' && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPreview(file)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  Get Quote
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilesList;
