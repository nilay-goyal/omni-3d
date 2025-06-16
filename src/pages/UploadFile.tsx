
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import FileUploadZone from '@/components/FileUploadZone';
import STLPreviewPanel from '@/components/STLPreviewPanel';
import { useToast } from '@/hooks/use-toast';

const UploadFile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading } = useAuth();
  
  const {
    files,
    uploading,
    selectedFile,
    loadFiles,
    uploadFile,
    previewFile,
    clearPreview
  } = useFileUpload(user?.id || '', profile?.full_name || user?.email || '');

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/buyer-signin');
      return;
    }
    
    if (profile?.user_type !== 'buyer') {
      navigate('/seller-dashboard');
      return;
    }

    loadFiles();
  }, [user, profile, loading, navigate, loadFiles]);

  const handleFilesUpload = async (newFiles: File[]) => {
    const stlFiles = newFiles.filter(file => file.name.toLowerCase().endsWith('.stl'));
    
    if (stlFiles.length !== newFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only STL files are supported",
        variant: "destructive",
      });
    }

    for (const file of stlFiles) {
      await uploadFile(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/buyer-dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <span className="text-gray-700">Welcome, {profile.full_name}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload STL Files</h1>
          <p className="mt-2 text-gray-600">Upload 3D models and get printing quotes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileUploadZone
            onUpload={handleFilesUpload}
            files={files}
            uploading={uploading}
            onPreview={previewFile}
          />
          <STLPreviewPanel
            file={selectedFile}
            onClose={clearPreview}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
