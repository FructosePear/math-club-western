import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService, potwService, POTWSubmission } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState<POTWSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    correctSubmissions: 0,
    averageScore: 0
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        // Get user submissions
        const userSubmissions = await userService.getUserSubmissions(currentUser.uid);
        setSubmissions(userSubmissions);

        // Calculate stats from submissions using grade field
        const totalSubmissions = userSubmissions.length;
        const gradedSubmissions = userSubmissions.filter(s => s.grade);
        const averageGrade = gradedSubmissions.length > 0 
          ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length 
          : 0;
        
        setStats({
          totalSubmissions,
          correctSubmissions: gradedSubmissions.length, // Count graded submissions
          averageScore: averageGrade * 20 // Convert 1-5 scale to percentage (1=20%, 5=100%)
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <p className="text-center text-gray-600">Please log in to view your dashboard.</p>
              <Link 
                to="/login" 
                className="block mt-4 text-center text-blue-600 hover:underline"
              >
                Go to Login
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser.displayName || currentUser.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Track your Problem of the Week progress and activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Correct Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.correctSubmissions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submission History */}
        <Card>
          <CardHeader>
            <CardTitle>Your POTW Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't submitted any answers yet.</p>
                <Link 
                  to="/problem-of-the-week" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Problem of the Week
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Puzzle</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{submission.puzzleName || 'Unknown Puzzle'}</div>
                          <div className="text-xs text-gray-500">ID: {submission.puzzleId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {submission.answer}
                      </TableCell>
                      <TableCell>
                        {submission.grade ? (
                          <Badge variant="default" className="bg-green-500 text-white font-semibold px-2 py-1">
                            {submission.grade}/5
                          </Badge>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Pending</span>
                            <Badge variant="secondary">⏳</Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;
