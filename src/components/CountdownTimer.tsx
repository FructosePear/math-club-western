import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: Date;
  onExpired?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiresAt, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = expiresAt.getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft(null);
        setIsExpired(true);
        if (onExpired) {
          onExpired();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpired]);

  if (isExpired) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">This puzzle has expired!</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Submissions are no longer accepted for this puzzle.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!timeLeft) {
    return null;
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;

  return (
    <Card className={`border-blue-200 ${isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className={`h-5 w-5 ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`} />
          <span className={`font-semibold ${isUrgent ? 'text-orange-800' : 'text-blue-800'}`}>
            Time Remaining
          </span>
        </div>
        
        <div className="flex justify-center gap-2">
          <div className="bg-white rounded px-2 py-1">
            <div className={`text-lg font-bold ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
              {timeLeft.days}d
            </div>
          </div>
          <div className="bg-white rounded px-2 py-1">
            <div className={`text-lg font-bold ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
              {timeLeft.hours.toString().padStart(2, '0')}h
            </div>
          </div>
          <div className="bg-white rounded px-2 py-1">
            <div className={`text-lg font-bold ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
              {timeLeft.minutes.toString().padStart(2, '0')}m
            </div>
          </div>
          <div className="bg-white rounded px-2 py-1">
            <div className={`text-lg font-bold ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
              {timeLeft.seconds.toString().padStart(2, '0')}s
            </div>
          </div>
        </div>

        {isUrgent && (
          <p className="text-orange-700 text-sm mt-2 font-medium text-center">
            ⚠️ Hurry! Less than 2 hours remaining!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;
