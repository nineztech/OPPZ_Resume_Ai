import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar, 
  FileText,
  Download,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { tokenUtils } from '@/lib/utils';

interface Resume {
  id: number;
  title: string;
  templateId: string;
  selectedColor: string;
  resumeData: any;
  isActive: boolean;
  lastEdited: string;
  createdAt: string;
  updatedAt: string;
}

const MyResumesPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user's resumes
  const fetchResumes = async () => {
    try {
      setLoading(true);
      const token = tokenUtils.getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      // First check if the backend is reachable
      try {
        const healthCheck = await fetch('http://localhost:5006/', { method: 'GET' });
        if (!healthCheck.ok) {
          throw new Error(`Backend health check failed: ${healthCheck.status} ${healthCheck.statusText}`);
        }
      } catch (healthErr) {
        throw new Error(`Cannot connect to backend server. Please ensure the server is running on port 5006. Error: ${healthErr instanceof Error ? healthErr.message : 'Unknown error'}`);
      }

      const response = await fetch('http://localhost:5006/api/resume', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          tokenUtils.clearToken();
          navigate('/login');
          return;
        }
        
        // Get more detailed error information
        let errorMessage = 'Failed to fetch resumes';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResumes(data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resumes');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load your resumes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete resume
  const deleteResume = async (resumeId: number) => {
    try {
      const token = tokenUtils.getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5006/api/resume/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete resume';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Remove the deleted resume from the state
      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      
      toast({
        title: 'Success',
        description: 'Resume deleted successfully.',
      });
    } catch (err) {
      console.error('Error deleting resume:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete resume. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Duplicate resume
  const duplicateResume = async (resume: Resume) => {
    try {
      const token = tokenUtils.getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      const duplicatedResumeData = {
        title: `${resume.title} (Copy)`,
        templateId: resume.templateId,
        selectedColor: resume.selectedColor,
        resumeData: resume.resumeData
      };

      const response = await fetch('http://localhost:5006/api/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedResumeData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to duplicate resume';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const newResume = await response.json();
      
      // Add the new resume to the state
      setResumes(prev => [newResume.resume, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Resume duplicated successfully.',
      });
    } catch (err) {
      console.error('Error duplicating resume:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to duplicate resume. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Edit resume
  const editResume = (resume: Resume) => {
    navigate('/resume/builder', {
      state: {
        templateId: resume.templateId,
        selectedColor: resume.selectedColor,
        extractedData: resume.resumeData,
        mode: 'edit',
        resumeId: resume.id,
        resumeTitle: resume.title
      }
    });
  };

  // Create new resume
  const createNewResume = () => {
    navigate('/resume/templates');
  };

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:5006/', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Backend Status',
          description: `Backend is running: ${data.message}`,
        });
      } else {
        toast({
          title: 'Backend Status',
          description: `Backend responded with: ${response.status} ${response.statusText}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Backend Status',
        description: 'Cannot connect to backend server. Please ensure it is running on port 5006.',
        variant: 'destructive',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get template display name
  const getTemplateDisplayName = (templateId: string) => {
    const templateNames: { [key: string]: string } = {
      'modern-professional': 'Modern Professional',
      'clean-minimal': 'Clean Minimal',
      'creative-designer': 'Creative Designer',
      'executive-classic': 'Executive Classic',
      'business-professional': 'Business Professional'
    };
    return templateNames[templateId] || templateId;
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Resumes</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-4">
              <Button onClick={fetchResumes} className="mr-4">Try Again</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Current token:', tokenUtils.getToken());
                  console.log('Token exists:', !!tokenUtils.getToken());
                }}
              >
                Debug Token
              </Button>
            </div>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-sm text-gray-700">
                <strong>Debug Info:</strong><br/>
                • Backend URL: http://localhost:5006<br/>
                • Token exists: {tokenUtils.getToken() ? 'Yes' : 'No'}<br/>
                • Error: {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-600 mt-2">
              Manage and edit your resume collection
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={checkBackendStatus}
              className="flex items-center gap-2"
            >
              Check Backend
            </Button>
            <Button onClick={createNewResume} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Resume
            </Button>
          </div>
        </div>

        {/* Resumes Grid */}
        {resumes.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first resume to get started with your job applications
            </p>
            <Button onClick={createNewResume} size="lg" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Resume
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold truncate">
                          {resume.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {getTemplateDisplayName(resume.templateId)}
                          </Badge>
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: resume.selectedColor }}
                            title={`Color: ${resume.selectedColor}`}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Last edited info */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last edited: {formatDate(resume.lastEdited)}
                      </div>

                      {/* Basic info from resume data */}
                      {resume.resumeData?.basicDetails?.fullName && (
                        <div className="text-sm text-gray-600">
                          <strong>Name:</strong> {resume.resumeData.basicDetails.fullName}
                        </div>
                      )}
                      
                      {resume.resumeData?.basicDetails?.title && (
                        <div className="text-sm text-gray-600">
                          <strong>Title:</strong> {resume.resumeData.basicDetails.title}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => editResume(resume)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateResume(resume)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Dialog open={deleteDialogOpen === resume.id} onOpenChange={(open) => setDeleteDialogOpen(open ? resume.id : null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Resume</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{resume.title}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  deleteResume(resume.id);
                                  setDeleteDialogOpen(null);
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResumesPage;
