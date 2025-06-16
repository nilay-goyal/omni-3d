
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import STLUploadArea from '@/components/STLUploadArea';
import STLViewer from '@/components/STLViewer';

const UploadFile = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700">
      <nav className="bg-white/10 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/buyer-dashboard" className="flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <span className="text-white/90">Welcome, {profile.full_name}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            🎯 STL File Viewer
          </h1>
          <p className="text-xl text-white/80">Upload and preview your 3D STL files</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <STLUploadArea onFileSelect={handleFileSelect} />
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
