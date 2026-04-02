import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { DashboardProvider } from './contexts/DashboardContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardSelector } from './pages/dashboards/DashboardSelector';

// Pages
import Landing from './pages/Landing';
const JobDetail = lazy(() => import('./pages/JobDetail').then(m => ({ default: m.JobDetail })));
const PublicProfile = lazy(() => import('./pages/PublicProfile').then(m => ({ default: m.PublicProfile })));
const JobBoard = lazy(() => import('./pages/JobBoard').then(m => ({ default: m.JobBoard })));
import { PostJob } from './pages/PostJob';
import { JobSuccess } from './pages/JobSuccess';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RegisterPro } from './pages/RegisterPro';
import { RegisterClient } from './pages/RegisterClient';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Profile } from './pages/Profile';
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const Credits = lazy(() => import('./pages/Credits').then(m => ({ default: m.Credits })));
const NotificationsPage = lazy(() => import('./pages/Notifications').then(m => ({ default: m.NotificationsPage })));
const MessagingPage = lazy(() => import('./pages/Messaging').then(m => ({ default: m.MessagingPage })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const SalesTerms = lazy(() => import('./pages/SalesTerms').then(m => ({ default: m.SalesTerms })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const LegalNotice = lazy(() => import('./pages/LegalNotice').then(m => ({ default: m.LegalNotice })));
import { NotFound } from './pages/NotFound';
import { PRIORITY_CITIES, SEO_SERVICES } from './constants/seoData';
import { SEO_GLOSSARY } from './constants/seoGlossary';
const CitySEOPage = lazy(() => import('./pages/seo/CitySEOPage').then(m => ({ default: m.CitySEOPage })));
const CityServiceSEOPage = lazy(() => import('./pages/seo/CityServiceSEOPage').then(m => ({ default: m.CityServiceSEOPage })));
const GlossaryHub = lazy(() => import('./pages/seo/GlossaryHub').then(m => ({ default: m.GlossaryHub })));
const GlossaryArticle = lazy(() => import('./pages/seo/GlossaryArticle').then(m => ({ default: m.GlossaryArticle })));
const TrustWidget = lazy(() => import('./pages/dashboards/TrustWidget').then(m => ({ default: m.TrustWidget })));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Détecte le premier login Google et affiche la modale de sélection du rôle.
 * Un user Google sans full_name et avec role 'pro' (défaut trigger) est considéré nouveau.
 */
function GoogleRoleGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      const isGoogleUser = user.app_metadata?.provider === 'google';
      const isNewUser = !profile.full_name;
      if (isGoogleUser && isNewUser) {
        setShowModal(true);
      }
    }
  }, [user, profile, loading]);

  return (
    <>
      {children}
      {showModal && user && (
        <RoleSelectionModal
          userId={user.id}
          onComplete={() => setShowModal(false)}
        />
      )}
    </>
  );
}

/** Scroll to top on every route change (smooth) */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
        <AuthProvider>
          <DashboardProvider>
            <Router>
              <ScrollToTop />
              <GoogleRoleGuard>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Chargement...</div>}>
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/jobs" element={<JobBoard />} />
                        <Route path="/jobs/:slug" element={<JobDetail />} />
                        <Route path="/pros/:id" element={<PublicProfile />} />
                        
                        {/* SEO Hub & Spoke Routes Generated Statically */}
                        {PRIORITY_CITIES.map(city => (
                            <Route key={`hub-${city.slug}`} path={`/cordiste-${city.slug}`} element={<CitySEOPage citySlug={city.slug} />} />
                        ))}
                        {PRIORITY_CITIES.map(city => 
                            SEO_SERVICES.map(service => (
                                <Route key={`service-${city.slug}-${service.slug}`} path={`/cordiste-${city.slug}/${service.slug}`} element={<CityServiceSEOPage citySlug={city.slug} serviceSlug={service.slug} />} />
                            ))
                        )}

                        {/* SEO National Glossary Routes */}
                        <Route path="/lexique" element={<GlossaryHub />} />
                        {SEO_GLOSSARY.map(term => (
                            <Route key={`glossary-${term.slug}`} path={`/lexique/${term.slug}`} element={<GlossaryArticle slugProp={term.slug} />} />
                        ))}

                        <Route path="/post-job" element={<PostJob />} />
                        <Route path="/job-success" element={<JobSuccess />} />
                        <Route path="/connexion" element={<Login />} />
                        <Route path="/inscription" element={<Register />} />
                        <Route path="/inscription-cordiste" element={<RegisterPro />} />
                        <Route path="/inscription-client" element={<RegisterClient />} />
                        {/* Redirections automatiques pour garder les anciens liens actifs */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/cgu" element={<Terms />} />
                        <Route path="/cgv" element={<SalesTerms />} />
                        <Route path="/confidentialite" element={<Privacy />} />
                        <Route path="/mentions-legales" element={<LegalNotice />} />

                        {/* Protected Routes */}
                        <Route
                          path="/credits"
                          element={
                            <ProtectedRoute>
                              <Credits />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/pro/widget"
                          element={
                            <ProtectedRoute>
                              <TrustWidget />
                            </ProtectedRoute>
                          }
                        />

                        {/* Dashboard Routes (Unified via Selector) */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <DashboardSelector />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/client"
                          element={
                            <ProtectedRoute>
                              <DashboardSelector />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/dashboard/pro"
                          element={
                            <ProtectedRoute>
                              <DashboardSelector />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin Routes */}
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute requireAdmin>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Notifications & Messaging */}
                        <Route
                          path="/notifications"
                          element={
                            <ProtectedRoute>
                              <NotificationsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/messages"
                          element={
                            <ProtectedRoute>
                              <MessagingPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              </GoogleRoleGuard>
            </Router>
          </DashboardProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
