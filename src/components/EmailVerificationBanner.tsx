import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Mail, CheckCircle } from 'lucide-react';

const EmailVerificationBanner: React.FC = () => {
  const { currentUser, resendVerification } = useAuth();
  const [justVerified, setJustVerified] = React.useState(false);

  // Check if user just verified their email
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setJustVerified(true);
      setTimeout(() => setJustVerified(false), 5000); // Hide after 5 seconds
    }
  }, []);

  // Show success message if just verified
  if (justVerified) {
    return (
      <Card className="border-green-200 bg-green-50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Email Verified Successfully!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                You now have full access to the math club.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      alert('Verification email sent! Please check your inbox and spam folder.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Failed to send verification email. Please try again.');
    }
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Email Verification Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please verify your email address ({currentUser.email}) to access all features.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResendVerification}
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            <Mail className="h-4 w-4 mr-2" />
            Resend Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationBanner;
