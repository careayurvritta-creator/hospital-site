import React from 'react';
import { HashRouter } from 'react-router-dom';

// Ultra minimal - no Layout, no pages - just to test if React itself works
const App: React.FC = () => {
  return (
    <HashRouter>
      <div style={{ 
        minHeight: '100vh', 
        background: '#F5F0E8', 
        padding: 40,
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#009688' }}>Ayurvritta Hospital</h1>
        <p>If you see this, React is working!</p>
        <p>HashRouter: {window.location.hash}</p>
      </div>
    </HashRouter>
  );
};

export default App;