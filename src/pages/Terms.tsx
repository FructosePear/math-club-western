import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Shield, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/login" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Use
            </h1>
            <p className="text-xl text-gray-600">
              Students United by Mathematics
            </p>
            <p className="text-sm text-gray-500 mt-2">
              For high school students only
            </p>
          </div>

          <div className="space-y-6">
            {/* Simple Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Simple Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Keep your account safe</p>
                      <p className="text-gray-600 text-sm">Use a strong password and verify your email</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Be respectful</p>
                      <p className="text-gray-600 text-sm">Help others learn and don't share inappropriate content</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Your solutions belong to the math club</p>
                      <p className="text-gray-600 text-sm">We can use them for leaderboards, examples, and competitions</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-600 text-sm font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">We protect your privacy</p>
                      <p className="text-gray-600 text-sm">We only collect your name, email, and math answers. No spam, no selling data.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm font-bold">5</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">You must be a current high school student</p>
                      <p className="text-gray-600 text-sm">This platform is specifically for high school students only</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-blue-800 font-medium mb-2">
                    That's it! Simple and fair.
                  </p>
                  <p className="text-blue-700 text-sm">
                    By signing up, you agree to these rules. We're here to help you learn math and connect with other high school students!
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Terms;