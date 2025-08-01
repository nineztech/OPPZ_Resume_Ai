import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TemplatesPage from './pages/TemplatesPage';
import UseTemplatePage from './pages/UseTemplatePage';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resume/login" element={<LoginPage />} />
             <Route path="/resume/signup" element={<SignupPage />} />
             <Route path="/resume/templates" element={<TemplatesPage />} />
             <Route path="/resume/templates/use-template" element={<UseTemplatePage />} />
          </Routes>
          <Toaster />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
