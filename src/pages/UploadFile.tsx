
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, Check, X, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UploadedFile {
  id: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  created_at: string;
}

const UploadFile = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading } = useAuth();

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

      // Load uploaded files when user is authenticated
      if (user && profile) {
        loadUploadedFiles();
      }
    }
  }, [user, profile, loading, navigate]);

  const loadUploadedFiles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_name', profile?.full_name || user.email)
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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
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
    setUploadingFiles(prev => new Set(prev).add(fileId));

    try {
      const userName = profile.full_name || user.email;
      const filePath = `${userName}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('stl-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file record to database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          user_name: userName,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          upload_status: 'completed'
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });

      // Reload files list
      await loadUploadedFiles();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload STL Files</h1>
          <p className="mt-2 text-gray-600">Upload your 3D model files to get started with printing quotes.</p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Drag and drop your STL files here, or click to select files from your computer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drop your STL files here
                </p>
                <p className="text-gray-600">or</p>
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".stl"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Only STL files are supported
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files List */}
        {(uploadedFiles.length > 0 || uploadingFiles.size > 0) && (
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
                {Array.from(uploadingFiles).map((fileId) => (
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
                      <Button variant="outline" size="sm">
                        Get Quote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadFile;
