import React, { useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Debug version - minimal components to find loading issue
// Create a simple loading indicator
const DebugLoader = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#F5F0E8',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: 40, height: 40, 
        border: '4px solid #00968820', 
        borderTopColor: '#009688',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p style={{ color: '#1A3C34' }}>Loading Ayurvritta...</p>
    </div>
  </div>
);

// Simple placeholder pages
const PlaceholderPage = ({ name }: { name: string }) => (
  <div style={{ padding: 40, minHeight: '100vh', background: '#F5F0E8' }}>
    <h1 style={{ color: '#0F3D3E', fontFamily: 'Philosopher, serif' }}>{name}</h1>
    <p>This is a debug placeholder. If you see this, the basic routing works.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <DebugLoader />
    </Router>
  );
};

export default App;