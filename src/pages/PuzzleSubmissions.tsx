import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { puzzleService, potwService, POTWSubmission, Puzzle } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Star, Clock, User, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const PuzzleSubmissions: React.FC = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { canManagePuzzles } = useAdmin();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [submissions, setSubmissions] = useState<POTWSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [gradeDialog, setGradeDialog] = useState<{
    isOpen: boolean;
    submission: POTWSubmission | null;
    newGrade: number | null;
  }>({
    isOpen: false,
    submission: null,
    newGrade: null,
  });

  useEffect(() => {
    if (puzzleId) {
      loadPuzzleAndSubmissions();
    }
  }, [puzzleId]);

  const loadPuzzleAndSubmissions = async () => {
    if (!puzzleId) return;
    
    try {
      setLoading(true);
      
      // Load puzzle details
      const puzzleData = await puzzleService.getPuzzle(puzzleId);
      setPuzzle(puzzleData);
      
      // Load submissions
      const submissionsData = await potwService.getPuzzleSubmissionsForGrading(puzzleId);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading puzzle and submissions:', error);
      toast.error('Failed to load puzzle submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (submission: POTWSubmission, grade: number) => {
    setGradeDialog({
      isOpen: true,
      submission: submission,
      newGrade: grade,
    });
  };

  const confirmGradeChange = async () => {
    if (!currentUser || !gradeDialog.submission || !gradeDialog.newGrade) return;
    
    try {
      setUpdating(gradeDialog.submission.id!);
      await potwService.updateSubmissionGrade(gradeDialog.submission.id!, gradeDialog.newGrade, currentUser.uid);
      
      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === gradeDialog.submission!.id 
            ? { ...sub, grade: gradeDialog.newGrade, gradedAt: new Date() as any, gradedBy: currentUser.uid }
            : sub
        )
      );
      
      toast.success(`Grade updated to ${gradeDialog.newGrade}/5`);
    } catch (error) {
      console.error('Error updating grade:', error);
      toast.error('Failed to update grade');
    } finally {
      setUpdating(null);
      setGradeDialog({ isOpen: false, submission: null, newGrade: null });
    }
  };

  const cancelGradeChange = () => {
    setGradeDialog({ isOpen: false, submission: null, newGrade: null });
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return 'text-gray-400';
    if (grade >= 4) return 'text-green-600';
    if (grade >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeStars = (grade?: number) => {
    if (!grade) return '☆☆☆☆☆';
    return '★'.repeat(grade) + '☆'.repeat(5 - grade);
  };

  if (!canManagePuzzles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Alert>
            <AlertDescription>
              You don't have permission to view puzzle submissions. Contact an admin for access.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading submissions...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Alert>
            <AlertDescription>
              Puzzle not found.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/puzzles')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Puzzles
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Puzzle Submissions
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">
            {puzzle.title}
          </h2>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span>{'★'.repeat(puzzle.difficulty)}{'☆'.repeat(5 - puzzle.difficulty)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Created: {puzzle.createdAt ? new Date(puzzle.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {submissions.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Graded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.grade).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {submissions.filter(s => !s.grade).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Cards */}
        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No submissions yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Student Info Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{submission.userName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {submission.userEmail}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Submitted: {submission.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Grade Section */}
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${getGradeColor(submission.grade)}`}>
                              {submission.grade ? `${submission.grade}/5` : 'Not graded'}
                            </div>
                            {submission.grade && (
                              <div className="text-sm text-gray-500">
                                {getGradeStars(submission.grade)}
                              </div>
                            )}
                          </div>
                          
                          {/* Grade Selector */}
                          <div className="flex items-center space-x-2">
                            <Select
                              value={submission.grade?.toString() || ''}
                              onValueChange={(value) => handleGradeChange(submission, parseInt(value))}
                              disabled={updating === submission.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">
                                  <div className="flex items-center space-x-2">
                                    <span>1/5</span>
                                    <span className="text-xs text-gray-500">• Keep practicing!</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="2">
                                  <div className="flex items-center space-x-2">
                                    <span>2/5</span>
                                    <span className="text-xs text-gray-500">• Good effort!</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="3">
                                  <div className="flex items-center space-x-2">
                                    <span>3/5</span>
                                    <span className="text-xs text-gray-500">• Nice work!</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="4">
                                  <div className="flex items-center space-x-2">
                                    <span>4/5</span>
                                    <span className="text-xs text-gray-500">• Excellent work!</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="5">
                                  <div className="flex items-center space-x-2">
                                    <span>5/5</span>
                                    <span className="text-xs text-gray-500">• Outstanding!</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {updating === submission.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Answer Content */}
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-700">Student's Solution</h4>
                          <div className="text-xs text-gray-500">
                            {submission.answer.length} characters
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-white p-3 rounded border overflow-x-auto">
                            {submission.answer}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grade Confirmation Dialog */}
      <AlertDialog open={gradeDialog.isOpen} onOpenChange={setGradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Grade Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to grade <strong>{gradeDialog.submission?.userName}</strong>'s submission as <strong>{gradeDialog.newGrade}/5</strong>?
              <br /><br />
              Current grade: {gradeDialog.submission?.grade ? `${gradeDialog.submission.grade}/5` : 'Not graded'}
              <br />
              New grade: {gradeDialog.newGrade}/5
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelGradeChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmGradeChange}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Grade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default PuzzleSubmissions;
