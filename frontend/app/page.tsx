'use client';

import { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import GraphVisualization from './components/GraphVisualization';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleUploadSuccess = () => {
    // Trigger refresh of document list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewGraph = (patientId: string) => {
    setSelectedPatientId(patientId);
    // Smooth scroll to graph section
    setTimeout(() => {
      document.getElementById('graph-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
            <h1 className="text-4xl font-bold text-white">
              🏥 OpenClaims
            </h1>
          </div>
          <p className="text-xl text-gray-600 mt-4">
            Medical Document Processing & Knowledge Graph Visualization
          </p>
        </header>

        {/* Upload Section */}
        <div className="mb-8">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Document List Section */}
        <div className="mb-8">
          <DocumentList
            refreshTrigger={refreshTrigger}
            onViewGraph={handleViewGraph}
          />
        </div>

        {/* Graph Visualization Section */}
        <div id="graph-section" className="mb-8">
          <GraphVisualization patientId={selectedPatientId} />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8 border-t border-gray-200">
          <p>OpenClaims Dashboard • Powered by AI & Neo4J</p>
        </footer>
      </div>
    </div>
  );
}
