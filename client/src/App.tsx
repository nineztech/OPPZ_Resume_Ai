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
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import FeaturesPage from './pages/FeaturesPage';
import ATSScorePage from './pages/ATSScorePage';
import ATSResultsPage from './pages/ATSResultsPage';
import ResumeCreator from './pages/ResumeCreator';

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
              path="/resume/builder" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeBuilderPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />  
             <Route 
              path="/resume/new" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeCreator/>
                  </Layout>
                </ProtectedRoute>
              } 
            />  
          </Routes>
          
          {/* <Route path="/resume/new" element={<ResumeCreator/>} /> */}

          <Toaster />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
