import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Programs from './pages/Programs';
import Tools from './pages/Tools';
import Booking from './pages/Booking';
import Insurance from './pages/Insurance';
import Blog from './pages/Blog';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import DietCharts from './pages/DietCharts';
// import DietChartViewer from './components/DietChartViewer'; // Temp - fixing icon issue

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/diet-charts" element={<DietCharts />} />
          {/* <Route path="/diet-charts/:slug" element={<DietChartViewer />} /> */} {/* Temp disabled */}
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;