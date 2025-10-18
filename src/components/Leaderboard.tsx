import React, { useEffect, useState } from 'react';
import { potwService, POTWSubmission } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Clock } from 'lucide-react';

interface LeaderboardProps {
  puzzleId: string;
}

export default function Leaderboard({ puzzleId }: LeaderboardProps) {
  const [submissions, setSubmissions] = useState<POTWSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = potwService.subscribeToPuzzleSubmissions(
      puzzleId,
      (newSubmissions) => {
        setSubmissions(newSubmissions);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [puzzleId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Live Leaderboard
          <Badge variant="secondary" className="ml-auto">
            <Users className="h-3 w-3 mr-1" />
            {submissions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No submissions yet</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to submit your answer!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 10).map((submission, index) => (
              <div
                key={submission.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0 ? 'bg-yellow-50 border-yellow-200' : 
                  index === 1 ? 'bg-gray-50 border-gray-200' : 
                  index === 2 ? 'bg-orange-50 border-orange-200' : 
                  'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {submission.userName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {submission.userEmail}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {submission.createdAt?.toDate().toLocaleDateString()}
                  </div>
                  {submission.isCorrect && (
                    <Badge variant="default" className="mt-1 bg-green-500">
                      Correct
                    </Badge>
                  )}
                  {submission.grade && (
                    <Badge variant="outline" className="mt-1">
                      {submission.grade}/5
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {submissions.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  And {submissions.length - 10} more submissions...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}