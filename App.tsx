import React, { Suspense, useEffect, ReactNode, Component } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import SEOHead from './components/SEOHead';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import CookieConsent from './components/CookieConsent';
import MobileCTABar from './components/MobileCTABar';
import { eventTracker } from './analytics';

// Lazy Load Pages for Performance Optimization
const Home = React.lazy(() => import('./pages/Home'));
const Services = React.lazy(() => import('./pages/Services'));
const ServiceDetail = React.lazy(() => import('./pages/ServiceDetail'));
const Programs = React.lazy(() => import('./pages/Programs'));
const About = React.lazy(() => import('./pages/About'));
const Tools = React.lazy(() => import('./pages/Tools'));
const Booking = React.lazy(() => import('./pages/Booking'));
const Insurance = React.lazy(() => import('./pages/Insurance'));
const Blog = React.lazy(() => import('./pages/Blog'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard'));

// Dependency-free Loading Fallback to ensure it renders immediately
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
    <div className="flex flex-col items-center">
      <svg className="animate-spin h-10 w-10 text-[#0F3D3E] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="font-serif text-[#0F3D3E] font-bold text-lg animate-pulse">Ayurvritta...</p>
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

// Robust Error Boundary with Analytics Integration
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: undefined
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Page Load Error:", error, errorInfo);
    // Track error to analytics
    try {
      eventTracker.trackError(error, {
        componentStack: errorInfo?.componentStack,
        source: 'ErrorBoundary',
      });
    } catch (e) {
      console.error('Failed to track error:', e);
    }
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
              className="bg-[#009688] text-white px-6 py-3 rounded-full font-bold hover:bg-[#00796B] transition-colors min-h-[48px]"
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
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AnalyticsProvider>
        <Layout>
          <ScrollToTop />
          <SEOHead />
          <ErrorBoundary>
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
                <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
        {/* Cookie Consent Banner */}
        <CookieConsent />
        {/* Mobile CTA Bar - Call/WhatsApp priority */}
        <MobileCTABar showBooking={false} />
      </AnalyticsProvider>
    </HashRouter>
  );
};

export default App;