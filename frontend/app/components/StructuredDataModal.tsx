'use client';

import { useEffect } from 'react';

interface Document {
  id: string;
  patient_id: string;
  file_name: string;
  structured_data: any;
}

interface StructuredDataModalProps {
  document: Document;
  onClose: () => void;
}

export default function StructuredDataModal({ document, onClose }: StructuredDataModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const data = document.structured_data;

  const renderSection = (title: string, content: any) => {
    if (!content) return null;

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gradient-to-r from-blue-500 to-purple-500 flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg text-sm">
            {title}
          </span>
        </h3>
        <div className="space-y-3">
          {typeof content === 'object' && !Array.isArray(content) ? (
            Object.entries(content).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <dt className="text-sm font-bold text-gray-700 capitalize">
                  {key.replace(/_/g, ' ')}:
                </dt>
                <dd className="text-sm text-gray-900 col-span-2 font-medium">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </dd>
              </div>
            ))
          ) : Array.isArray(content) ? (
            <div className="space-y-4">
              {content.map((item, idx) => (
                <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-l-4 border-blue-500">
                  <div className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      #{idx + 1}
                    </span>
                    <span>{title.slice(0, -1)} {idx + 1}</span>
                  </div>
                  {typeof item === 'object' ? (
                    <div className="space-y-2">
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key} className="flex gap-3 bg-white p-2 rounded-lg">
                          <span className="text-sm font-bold text-gray-600 capitalize min-w-[120px]">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-sm text-gray-900 font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 font-medium">{String(item)}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg font-medium">{String(content)}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">🏥</span>
                  <span>Structured Medical Data</span>
                </h2>
                <p className="text-sm text-blue-100 mt-2 font-medium">
                  {document.file_name} • Patient ID: {document.patient_id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Patient Demographics */}
            {data.patient_demographics && renderSection('Patient Demographics', data.patient_demographics)}

            {/* Encounters */}
            {data.encounters && renderSection('Encounters', data.encounters)}

            {/* Claims */}
            {data.claims && renderSection('Claims', data.claims)}

            {/* Diagnoses/Conditions */}
            {data.diagnoses && renderSection('Diagnoses', data.diagnoses)}
            {data.conditions && renderSection('Conditions', data.conditions)}

            {/* Procedures */}
            {data.procedures && renderSection('Procedures', data.procedures)}

            {/* Medications */}
            {data.medications && renderSection('Medications', data.medications)}

            {/* Lab Results */}
            {data.lab_results && renderSection('Lab Results', data.lab_results)}

            {/* Hospitals/Providers */}
            {data.hospitals && renderSection('Hospitals', data.hospitals)}
            {data.providers && renderSection('Providers', data.providers)}

            {/* Raw JSON Fallback */}
            {!data.patient_demographics && !data.encounters && !data.claims && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📄</span>
                  <span>Raw Data</span>
                </h3>
                <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-auto text-xs font-mono shadow-inner">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t-2 border-gray-100 bg-gray-50">
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                alert('✅ Copied to clipboard!');
              }}
              className="px-6 py-3 text-sm font-bold text-blue-700 bg-white border-2 border-blue-300 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all transform hover:scale-105 active:scale-95"
            >
              📋 Copy JSON
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
