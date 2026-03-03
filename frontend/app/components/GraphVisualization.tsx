'use client';

import { useState, useEffect } from 'react';

interface Node {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

interface Relationship {
  id: string;
  type: string;
  source: string;
  target: string;
  properties: Record<string, any>;
}

interface GraphData {
  nodes: Node[];
  relationships: Relationship[];
}

interface GraphVisualizationProps {
  patientId: string | null;
}

export default function GraphVisualization({ patientId }: GraphVisualizationProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!patientId) {
      setGraphData(null);
      return;
    }

    const fetchGraphData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/patients/${patientId}/graph`);
        if (!response.ok) {
          throw new Error('Failed to fetch graph data');
        }
        const data = await response.json();
        setGraphData(data);
      } catch (err) {
        console.error('Error fetching graph:', err);
        setError(err instanceof Error ? err.message : 'Failed to load graph');
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [patientId]);

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      Patient: '#3B82F6',      // blue
      Encounter: '#10B981',     // green
      Claim: '#F59E0B',        // amber
      Condition: '#EF4444',     // red
      Hospital: '#8B5CF6',      // purple
      Provider: '#EC4899',      // pink
    };
    return colors[type] || '#6B7280'; // gray default
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, string> = {
      Patient: '👤',
      Encounter: '🏥',
      Claim: '💰',
      Condition: '🩺',
      Hospital: '🏛️',
      Provider: '👨‍⚕️',
    };
    return icons[type] || '○';
  };

  if (!patientId) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
        <div className="text-6xl mb-4">🔮</div>
        <p className="text-xl text-gray-500 font-medium">No patient selected</p>
        <p className="text-sm text-gray-400 mt-2">Click "View Graph" on a completed document to visualize patient data</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading graph data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
          <p className="text-sm text-red-800 font-medium flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </p>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-xl text-gray-500 font-medium">No graph data available</p>
        <p className="text-sm text-gray-400 mt-2">This patient has no processed data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🔮</span>
          <span>Patient Knowledge Graph</span>
        </h2>
        <p className="text-sm text-purple-100 mt-1 font-medium">
          Patient ID: {patientId} • {graphData.nodes.length} nodes • {graphData.relationships.length} relationships
        </p>
      </div>

      {/* Graph Content */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Graph Area - Simple List View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 min-h-[600px] border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🕸️</span>
                <span>Node Network</span>
              </h3>
              
              {/* Group by type */}
              {Object.entries(
                graphData.nodes.reduce((acc, node) => {
                  if (!acc[node.type]) acc[node.type] = [];
                  acc[node.type].push(node);
                  return acc;
                }, {} as Record<string, Node[]>)
              ).map(([type, nodes]) => (
                <div key={type} className="mb-6">
                  <div className="flex items-center gap-2 mb-3 bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-lg">
                    <span className="text-2xl">{getNodeIcon(type)}</span>
                    <h4 className="text-md font-bold text-gray-800">{type}s</h4>
                    <span className="text-xs text-purple-600 font-bold bg-white px-2 py-1 rounded-full">
                      {nodes.length}
                    </span>
                  </div>
                  <div className="space-y-2 ml-8">
                    {nodes.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                          selectedNode?.id === node.id
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                        }`}
                        style={{
                          borderLeftColor: getNodeColor(node.type),
                          borderLeftWidth: '6px',
                        }}
                      >
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <span>{getNodeIcon(node.type)}</span>
                          <span>{node.label}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {Object.entries(node.properties).slice(0, 3).map(([key, value]) => (
                            <span key={key} className="bg-gray-100 px-2 py-0.5 rounded">
                              <span className="font-semibold">{key}:</span> {String(value).substring(0, 30)}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Show relationships for this type */}
                  {graphData.relationships
                    .filter(rel => {
                      const sourceNode = graphData.nodes.find(n => n.id === rel.source);
                      return sourceNode?.type === type;
                    })
                    .slice(0, 3)
                    .map(rel => {
                      const targetNode = graphData.nodes.find(n => n.id === rel.target);
                      return (
                        <div key={rel.id} className="ml-12 mt-2 text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-purple-600 font-bold">→ {rel.type}</span>
                          <span className="text-gray-400">→</span>
                          <span className="bg-purple-50 px-2 py-1 rounded text-purple-700 font-medium">
                            {targetNode?.label}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>

          {/* Node Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-purple-200 rounded-xl shadow-lg p-6 sticky top-6">
              {selectedNode ? (
                <>
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-purple-100">
                    <span className="text-4xl">{getNodeIcon(selectedNode.type)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedNode.label}
                      </h3>
                      <p 
                        className="text-sm font-semibold px-2 py-1 rounded-full inline-block mt-1"
                        style={{ backgroundColor: getNodeColor(selectedNode.type) + '20', color: getNodeColor(selectedNode.type) }}
                      >
                        {selectedNode.type}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wide flex items-center gap-2">
                      <span>📋</span>
                      <span>Properties</span>
                    </h4>
                    {Object.entries(selectedNode.properties).map(([key, value]) => (
                      <div key={key} className="border-b border-purple-100 pb-2">
                        <dt className="text-xs font-bold text-gray-500 uppercase bg-purple-50 px-2 py-1 rounded inline-block">
                          {key.replace(/_/g, ' ')}
                        </dt>
                        <dd className="text-sm text-gray-900 mt-1 break-words font-medium">
                          {typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </dd>
                      </div>
                    ))}
                  </div>

                  {/* Connected Relationships */}
                  <div className="mt-6 pt-4 border-t-2 border-purple-100">
                    <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span>🔗</span>
                      <span>Relationships</span>
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {graphData.relationships
                        .filter(rel => rel.source === selectedNode.id || rel.target === selectedNode.id)
                        .map(rel => {
                          const otherNodeId = rel.source === selectedNode.id ? rel.target : rel.source;
                          const otherNode = graphData.nodes.find(n => n.id === otherNodeId);
                          const direction = rel.source === selectedNode.id ? 'outgoing' : 'incoming';
                          
                          return (
                            <div
                              key={rel.id}
                              className="text-xs p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                            >
                              <div className="font-bold text-purple-700 flex items-center gap-1">
                                <span>{direction === 'outgoing' ? '⬆️' : '⬇️'}</span>
                                <span>{rel.type}</span>
                              </div>
                              <div className="text-gray-700 mt-1 font-medium">
                                {direction === 'outgoing' ? 'to' : 'from'}: <span className="text-purple-600">{otherNode?.label}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <div className="text-5xl mb-3">👈</div>
                  <p className="font-medium">Select a node to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-purple-100">
          <h4 className="text-sm font-bold text-purple-700 mb-4 uppercase tracking-wide flex items-center gap-2">
            <span>🎨</span>
            <span>Legend</span>
          </h4>
          <div className="flex flex-wrap gap-4">
            {['Patient', 'Encounter', 'Claim', 'Condition', 'Hospital', 'Provider'].map(type => (
              <div key={type} className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-lg border border-purple-200">
                <span className="text-2xl">{getNodeIcon(type)}</span>
                <div
                  className="w-6 h-6 rounded-full shadow-md"
                  style={{ backgroundColor: getNodeColor(type) }}
                ></div>
                <span className="text-sm font-bold text-gray-700">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
