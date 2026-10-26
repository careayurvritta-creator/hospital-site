import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SEOHead from './components/SEOHead';
import Home from './pages/Home';

// Route-level code splitting: only the home page loads eagerly; every other
// page (and its heavy dependencies) is fetched on demand.
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Programs = lazy(() => import('./pages/Programs'));
const Tools = lazy(() => import('./pages/Tools'));
const Booking = lazy(() => import('./pages/Booking'));
const Insurance = lazy(() => import('./pages/Insurance'));
const Blog = lazy(() => import('./pages/Blog'));
const SkinCare = lazy(() => import('./pages/SkinCare'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading page">
    <div className="w-10 h-10 border-4 border-ayur-subtle border-t-ayur-green rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <SEOHead />
      <Layout>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/ayurveda-skin-care" element={<SkinCare />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};

export default App;
