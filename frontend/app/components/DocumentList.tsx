'use client';

import { useState, useEffect } from 'react';

interface Document {
  id: string;
  patient_id: string;
  file_name: string;
  status: string;
  page_count: number | null;
  created_at: string;
  processed_at: string | null;
  error_message: string | null;
  structured_data: any;
}

interface DocumentListProps {
  refreshTrigger: number;
  onViewGraph: (patientId: string) => void;
  onViewData: (document: Document) => void;
}

export default function DocumentList({ refreshTrigger, onViewGraph, onViewData }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents/');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refresh trigger
  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  // Auto-refresh every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-400/50';
      case 'processing':
        return 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white border border-yellow-400/50';
      case 'failed':
        return 'bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/50';
      case 'uploaded':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-400/50';
      default:
        return 'bg-gray-700 text-white border border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⟳';
      case 'failed':
        return '✗';
      case 'uploaded':
        return '↑';
      default:
        return '○';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-2xl shadow-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-300 font-medium">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-purple-500/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <span>Document Processing Status</span>
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-white font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto-refresh (5s)</span>
            </label>
            <button
              onClick={fetchDocuments}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 m-6 bg-red-900/50 border-l-4 border-red-500 rounded-r-xl">
          <p className="text-sm text-red-300 font-medium flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Empty State */}
      {!error && documents.length === 0 && (
        <div className="p-16 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl text-gray-300 font-medium">No documents uploaded yet</p>
          <p className="text-sm text-gray-500 mt-2">Upload a document above to get started</p>
        </div>
      )}

      {/* Document List */}
      {!error && documents.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Pages
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/50 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                        doc.status
                      )}`}
                    >
                      <span className="text-lg">{getStatusIcon(doc.status)}</span>
                      <span>{doc.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{doc.file_name}</div>
                    {doc.error_message && (
                      <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{doc.error_message}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-purple-300 font-mono bg-slate-800 px-2 py-1 rounded border border-purple-500/30">
                      {doc.patient_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300 font-medium">
                      {doc.page_count || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {doc.status.toLowerCase() === 'completed' && doc.structured_data && (
                      <>
                        <button
                          onClick={() => onViewData(doc)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95"
                        >
                          📋 View Data
                        </button>
                        <button
                          onClick={() => onViewGraph(doc.patient_id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95"
                        >
                          🔮 View Graph
                        </button>
                      </>
                    )}
                    {doc.status.toLowerCase() === 'processing' && (
                      <span className="text-gray-400 italic flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
