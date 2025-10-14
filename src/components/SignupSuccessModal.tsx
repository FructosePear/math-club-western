import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SignupSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const SignupSuccessModal: React.FC<SignupSuccessModalProps> = ({
  isOpen,
  onClose,
  userEmail
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-green-600">
            Account Created Successfully! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Welcome to Students United by Mathematics!
            </h3>
            <p className="text-gray-600">
              We've created your account and sent a verification email to:
            </p>
            <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
              {userEmail}
            </p>
          </div>

          {/* Email Verification Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">
                    Verify Your Email Address
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Check your email inbox for a verification message</li>
                    <li>• Also check your spam/junk folder</li>
                    <li>• Click the verification link in the email</li>
                    <li>• Then you can log in to access all features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Link to="/login" onClick={onClose}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Login Page
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-gray-500">
            <p>
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupSuccessModal;
