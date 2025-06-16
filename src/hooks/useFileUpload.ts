
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  created_at: string;
  file_path: string;
}

export const useFileUpload = (userId: string, userName: string) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const { toast } = useToast();

  const loadFiles = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Load files error:', error);
    }
  };

  const uploadFile = async (file: File) => {
    const fileId = crypto.randomUUID();
    setUploading(prev => [...prev, fileId]);

    try {
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `uploads/${userId}/${timestamp}-${cleanName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stl-files')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          user_id: userId,
          user_name: userName,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          upload_status: 'completed'
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`,
      });

      await loadFiles();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || 'Upload failed',
        variant: "destructive",
      });
    } finally {
      setUploading(prev => prev.filter(id => id !== fileId));
    }
  };

  const previewFile = async (file: FileData) => {
    try {
      const { data } = await supabase.storage
        .from('stl-files')
        .createSignedUrl(file.file_path, 3600);
      
      if (data?.signedUrl) {
        setSelectedFile({ ...file, file_path: data.signedUrl });
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview failed",
        description: "Could not load file preview",
        variant: "destructive",
      });
    }
  };

  return {
    files,
    uploading,
    selectedFile,
    loadFiles,
    uploadFile,
    previewFile,
    clearPreview: () => setSelectedFile(null)
  };
};
