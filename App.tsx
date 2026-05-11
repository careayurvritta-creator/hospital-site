import React, { useEffect, ReactNode, Component, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import SEOHead from './components/SEOHead';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import CookieConsent from './components/CookieConsent';
import MobileCTABar from './components/MobileCTABar';
import { captureError } from './analytics/errorTracker';

// Static imports - no lazy loading
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
import AnalyticsDashboard from './components/AnalyticsDashboard';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#009688]/20 border-t-[#009688] rounded-full animate-spin"></div>
      <p className="text-[#1A3C34]/70 font-medium">Loading...</p>
    </div>
  </div>
);

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: undefined
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    captureError(error, {
      severity: 'high',
      source: 'ErrorBoundary',
      componentStack: errorInfo?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-[#E8E4D9]">
            <h2 className="font-serif text-2xl font-bold text-[#0F3D3E] mb-4">Something went wrong</h2>
            <p className="text-[#1A3C34]/70 mb-6">We apologize for the inconvenience. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#009688] text-white px-6 py-3 rounded-full font-bold hover:bg-[#00796B] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <AnalyticsProvider>
        <Layout>
          <ScrollToTop />
          <SEOHead />
          <ErrorBoundary>
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
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
        <CookieConsent />
        <MobileCTABar showBooking={false} />
      </AnalyticsProvider>
    </Router>
  );
};

export default App;