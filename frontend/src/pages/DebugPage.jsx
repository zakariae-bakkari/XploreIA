import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { authApi, aiToolApi, userApi, playlistApi } from '../api';
import { useAuth } from '../contexts/AuthContext';

const DebugPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testEndpoint = async (name, apiCall) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const data = await apiCall();
      setResults(prev => ({ ...prev, [name]: data }));
    } catch (err) {
      setResults(prev => ({ ...prev, [name]: { status: 'error', message: err.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const endpoints = [
    { name: 'Auth Status', call: () => authApi.checkStatus() },
    { name: 'All AI Tools', call: () => aiToolApi.getAll() },
    { name: 'All Users (Admin)', call: () => userApi.getAll() },
    { name: 'Comprehensive Profile Data', call: () => userApi.getProfile(user?.email || '') },
    { name: 'My Playlists', call: () => playlistApi.getAllByUser(user?.email || '') },
  ];

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 0' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 className="h1-xl">API Debugger</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>Test live backend responses and verify data structures.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {endpoints.map((ep) => (
            <div key={ep.name} className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h3 className="h3-md" style={{ margin: 0 }}>{ep.name}</h3>
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 20px', fontSize: '12px' }}
                  onClick={() => testEndpoint(ep.name, ep.call)}
                  disabled={loading[ep.name]}
                >
                  {loading[ep.name] ? 'Testing...' : 'Run Test'}
                </button>
              </div>

              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '16px', 
                borderRadius: '8px', 
                maxHeight: '300px', 
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {results[ep.name] ? (
                  <pre style={{ color: results[ep.name]?.status === 'error' ? 'var(--error)' : '#a5d6ff' }}>
                    {JSON.stringify(results[ep.name], null, 2)}
                  </pre>
                ) : (
                  <span style={{ color: 'var(--outline)' }}>No data yet. Click "Run Test" to fetch.</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <section className="glass-panel" style={{ marginTop: '40px', padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="h3-md" style={{ marginBottom: '16px' }}>Current Auth Context</h3>
          <pre style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '16px', 
            borderRadius: '8px', 
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'var(--secondary)'
          }}>
            {JSON.stringify({ user }, null, 2)}
          </pre>
        </section>
      </div>
    </MainLayout>
  );
};

export default DebugPage;
