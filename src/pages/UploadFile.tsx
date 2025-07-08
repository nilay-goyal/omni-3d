
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSTLFile } from '@/contexts/STLFileContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import STLUploadArea from '@/components/STLUploadArea';
import STLViewer from '@/components/STLViewer';

const UploadFile = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { setSTLFile } = useSTLFile();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);

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
  }, [user, profile, loading, navigate]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    await uploadToStorage(file);
  };

  const uploadToStorage = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('stl-files')
        .upload(fileName, file);

      if (error) throw error;

      const filePath = data.path;
      setUploadedFilePath(filePath);
      
      // Store in context for use across the app
      setSTLFile({
        file,
        uploadedPath: filePath,
        fileName: file.name
      });

      toast({
        title: "Success",
        description: "STL file uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload STL file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFindPrinters = () => {
    navigate('/printer-map');
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
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/buyer-dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <span className="text-gray-700 font-medium">Welcome, {profile.full_name}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            STL File Viewer
          </h1>
          <p className="text-xl text-gray-600 mb-6">Upload and preview your 3D STL files</p>
          
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">Don't know what to print?</p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline" size="lg">
                <a href="https://www.thingiverse.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  Thingiverse
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://www.printables.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  Printables
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <STLUploadArea onFileSelect={handleFileSelect} />
            {uploading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading file...</p>
              </div>
            )}
            {uploadedFilePath && !uploading && (
              <div className="mt-6 text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-medium">✓ File uploaded successfully!</p>
                  <p className="text-green-600 text-sm mt-1">Ready to request quotes from local printers</p>
                </div>
                <Button onClick={handleFindPrinters} size="lg" className="w-full">
                  <MapPin className="h-5 w-5 mr-2" />
                  Find Local Printers
                </Button>
              </div>
            )}
          </div>
          <div>
            <STLViewer file={selectedFile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
