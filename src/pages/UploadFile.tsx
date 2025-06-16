
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import UploadArea from "@/components/upload/UploadArea";
import FilesList from "@/components/upload/FilesList";
import PreviewSection from "@/components/upload/PreviewSection";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  id: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  created_at: string;
  file_path: string;
}

const UploadFile = () => {
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading } = useAuth();

  const loadUploadedFiles = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading files:', error);
        return;
      }

      setUploadedFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to buyer signin');
        navigate('/buyer-signin');
        return;
      }
      
      if (profile && profile.user_type !== 'buyer') {
        console.log('User is not a buyer, redirecting to seller dashboard');
        navigate('/seller-dashboard');
        return;
      }

      if (user && profile) {
        loadUploadedFiles();
      }
    }
  }, [user, profile, loading, navigate]);

  const handleFilesUpload = async (files: File[]) => {
    const stlFiles = files.filter(file => file.name.toLowerCase().endsWith('.stl'));
    
    if (stlFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only STL files.",
        variant: "destructive",
      });
    }

    for (const file of stlFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!user || !profile) return;
    
    const fileId = crypto.randomUUID();
    setUploadingFiles(prev => [...prev, fileId]);

    try {
      const userName = profile.full_name || user.email || 'unknown';
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `uploads/${user.id}/${timestamp}-${sanitizedFileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('stl-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Save file record to database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          user_id: user.id,
          user_name: userName,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          upload_status: 'completed'
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });

      await loadUploadedFiles();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handlePreview = async (file: UploadedFile) => {
    try {
      const { data } = await supabase.storage
        .from('stl-files')
        .createSignedUrl(file.file_path, 3600);
      
      if (data?.signedUrl) {
        setPreviewFile({ ...file, file_path: data.signedUrl });
      }
    } catch (error) {
      console.error('Error getting file URL:', error);
      toast({
        title: "Preview failed",
        description: "Could not load file for preview.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/buyer-dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center">
              <span className="text-gray-700">Welcome, {profile.full_name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload STL Files</h1>
          <p className="mt-2 text-gray-600">Upload your 3D model files to get started with printing quotes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-8">
            <UploadArea onFilesUpload={handleFilesUpload} />
            <FilesList 
              uploadedFiles={uploadedFiles}
              uploadingFiles={uploadingFiles}
              onPreview={handlePreview}
            />
          </div>

          {/* Preview Section */}
          <PreviewSection 
            previewFile={previewFile}
            onClosePreview={() => setPreviewFile(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
