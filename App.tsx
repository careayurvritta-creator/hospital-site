import React, { useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Test with just Layout first
import Layout from './components/Layout';

// Debug loading indicator
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
      <p style={{ color: '#1A3C34' }}>Loading...</p>
    </div>
  </div>
);

// Placeholder pages
const Placeholder = () => <div style={{ padding: 40, background: '#F5F0E8', minHeight: '100vh' }}><h1>Page</h1></div>;

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <DebugLoader />
      </Layout>
    </Router>
  );
};

export default App;