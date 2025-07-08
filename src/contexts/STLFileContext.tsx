import React, { createContext, useContext, useState, ReactNode } from 'react';

interface STLFileInfo {
  file: File;
  uploadedPath?: string;
  fileName: string;
}

interface STLFileContextType {
  stlFile: STLFileInfo | null;
  setSTLFile: (file: STLFileInfo | null) => void;
  clearSTLFile: () => void;
}

const STLFileContext = createContext<STLFileContextType | undefined>(undefined);

export const useSTLFile = () => {
  const context = useContext(STLFileContext);
  if (context === undefined) {
    throw new Error('useSTLFile must be used within a STLFileProvider');
  }
  return context;
};

interface STLFileProviderProps {
  children: ReactNode;
}

export const STLFileProvider: React.FC<STLFileProviderProps> = ({ children }) => {
  const [stlFile, setSTLFileState] = useState<STLFileInfo | null>(null);

  const setSTLFile = (file: STLFileInfo | null) => {
    setSTLFileState(file);
  };

  const clearSTLFile = () => {
    setSTLFileState(null);
  };

  return (
    <STLFileContext.Provider value={{ stlFile, setSTLFile, clearSTLFile }}>
      {children}
    </STLFileContext.Provider>
  );
};