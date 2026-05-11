import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SEOHead from './components/SEOHead';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Insurance from './pages/Insurance';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <SEOHead />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/insurance" element={<Insurance />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;