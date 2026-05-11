import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Programs from './pages/Programs';
import Booking from './pages/Booking';
import Insurance from './pages/Insurance';
import Blog from './pages/Blog';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

// Lazy load Tools page to avoid loading issues
const Tools = React.lazy(() => import('./pages/Tools'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#009688]/20 border-t-[#009688] rounded-full animate-spin"></div>
      <p className="text-[#1A3C34]/70 font-medium">Loading Tools...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
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
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};

export default App;