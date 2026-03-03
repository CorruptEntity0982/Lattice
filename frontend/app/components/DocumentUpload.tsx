'use client';

import { useState, useRef } from 'react';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

const DEMO_PATIENT_ID = '2640a0bb-9155-4025-8890-c05880bc19d6'; // Predefined patient ID for demo

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [patientId, setPatientId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const demoFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be under 50MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (isDemoMode: boolean = false) => {
    const uploadPatientId = isDemoMode ? DEMO_PATIENT_ID : patientId;
    
    if (!uploadPatientId.trim()) {
      setError('Please enter a Patient ID');
      return;
    }

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('patient_id', uploadPatientId);
      formData.append('file', selectedFile);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      setSuccess(true);
      setPatientId('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (demoFileInputRef.current) {
        demoFileInputRef.current.value = '';
      }

      onUploadSuccess();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">📤 Upload Document</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regular Upload */}
        <div className="bg-slate-900 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-bold text-purple-300 mb-4">Regular Upload</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-semibold text-gray-300 mb-2">
                Patient ID
              </label>
              <input
                type="text"
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient UUID"
                className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={uploading}
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-semibold text-gray-300 mb-2">
                PDF Document
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-all"
                disabled={uploading}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-green-400 flex items-center gap-2">
                  <span>✓</span>
                  <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </p>
              )}
            </div>

            <button
              onClick={() => handleUpload(false)}
              disabled={uploading || !patientId || !selectedFile}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                '📤 Upload Document'
              )}
            </button>
          </div>
        </div>

        {/* Demo Upload */}
        <div className="bg-slate-900 rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-lg font-bold text-blue-300 mb-4">Demo Upload</h3>
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300 mb-2 font-semibold">Demo Mode</p>
              <p className="text-xs text-gray-400">
                Uses predefined patient ID: <span className="text-blue-400 font-mono">{DEMO_PATIENT_ID}</span>
              </p>
            </div>

            <div>
              <label htmlFor="demoFile" className="block text-sm font-semibold text-gray-300 mb-2">
                PDF Document
              </label>
              <input
                ref={demoFileInputRef}
                type="file"
                id="demoFile"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all"
                disabled={uploading}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-green-400 flex items-center gap-2">
                  <span>✓</span>
                  <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </p>
              )}
            </div>

            <button
              onClick={() => handleUpload(true)}
              disabled={uploading || !selectedFile}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                '🚀 Demo Upload'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-xl">
          <p className="text-sm text-red-300 font-medium flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-900/50 border border-green-500/50 rounded-xl">
          <p className="text-sm text-green-300 font-medium flex items-center gap-2">
            <span>✅</span>
            <span>Document uploaded successfully! Processing has begun.</span>
          </p>
        </div>
      )}
    </div>
  );
}
