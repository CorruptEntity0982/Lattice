'use client';

import { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import GraphVisualization from './components/GraphVisualization';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [showData, setShowData] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const handleUploadSuccess = () => {
    // Trigger refresh of document list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewGraph = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowGraph(true);
    setShowData(false);
  };

  const handleViewData = (document: any) => {
    setSelectedDocument(document);
    setShowData(true);
    setShowGraph(false);
  };

  const closeGraph = () => {
    setShowGraph(false);
    setSelectedPatientId(null);
  };

  const closeData = () => {
    setShowData(false);
    setSelectedDocument(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🏥 OpenClaims Dashboard
              </h1>
              <p className="text-purple-100 text-lg">
                Medical Document Processing & Knowledge Graph Visualization
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="http://localhost:3000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
              >
                📚 API Docs
              </a>
              <a
                href="http://localhost:7474"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                🔮 Neo4j Browser
              </a>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-purple-500/30">
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Document List Section */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
          <DocumentList
            refreshTrigger={refreshTrigger}
            onViewGraph={handleViewGraph}
            onViewData={handleViewData}
          />
        </div>

        {/* Graph Visualization Section */}
        {showGraph && (
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🔮</span>
                <span>Knowledge Graph</span>
              </h2>
              <button
                onClick={closeGraph}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-all"
              >
                ✕ Close Graph
              </button>
            </div>
            <div className="p-6">
              <GraphVisualization patientId={selectedPatientId} />
            </div>
          </div>
        )}

        {/* Data Visualization Section */}
        {showData && selectedDocument && (
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <span>Structured Data</span>
              </h2>
              <button
                onClick={closeData}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-all"
              >
                ✕ Close Data
              </button>
            </div>
            <div className="p-6 bg-slate-900">
              <pre className="bg-slate-950 text-green-400 p-6 rounded-xl overflow-auto text-sm font-mono border border-green-500/30 shadow-inner max-h-[600px]">
                {JSON.stringify(selectedDocument.structured_data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-purple-300 text-sm py-6">
          <p>OpenClaims Dashboard • Powered by AI & Neo4j</p>
        </footer>
      </div>
    </div>
  );
}
