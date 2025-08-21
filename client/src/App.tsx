import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import Layout from '@/components/layout/layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TemplatesPage from './pages/TemplatesPage';
import UseTemplatePage from './pages/UseTemplatePage';
import ResumeProcessingPage from './pages/ResumeProcessingPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import FeaturesPage from './pages/FeaturesPage';
import ATSScorePage from './pages/ATSScorePage';
import ATSResultsPage from './pages/ATSResultsPage';
import ATSTemplatesPage from './pages/ATSTemplatesPage';
import AISuggestionsPage from './pages/AISuggestionsPage';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/resume/login" element={<LoginPage />} />
            <Route path="/resume/signup" element={<SignupPage />} />
            <Route path="/resume/features" element={<Layout><FeaturesPage /></Layout>} />
            <Route 
              path="/resume/ats-score" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ATSScorePage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume/ats-results" 
              element={
                <ProtectedRoute>
                  <ATSResultsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume/ats-templates" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ATSTemplatesPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume/templates" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <TemplatesPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume/templates/use-template" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <UseTemplatePage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume/processing" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeProcessingPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume/ai-suggestions" 
              element={
                <ProtectedRoute>
                  <AISuggestionsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume/builder" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeBuilderPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
