import React from 'react';
import { HashRouter } from 'react-router-dom';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <div style={{ padding: 40, background: '#F5F0E8', minHeight: '100vh' }}>
          <h1 style={{ color: '#009688' }}>Ayurvritta Hospital</h1>
          <p>Layout loaded successfully!</p>
        </div>
      </Layout>
    </HashRouter>
  );
};

export default App;