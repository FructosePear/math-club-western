import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import SignupSuccessModal from "@/components/SignupSuccessModal";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signup, login, resendVerification, currentUser } = useAuth();
  const [showResendButton, setShowResendButton] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const navigate = useNavigate();

  // Check for verification success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setSuccess("✅ Email verified successfully! You can now log in below.");
      setIsLogin(true); // Switch to login mode
      // Clear the URL parameters after showing the message
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
    }
  }, []);

  // Redirect if user is already logged in and email is verified
  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Show loading while redirecting (but only if email is verified)
  if (currentUser && currentUser.emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const user = await login(email, password);
        // Check if email is verified after login
        if (user && !user.emailVerified) {
          setError("Please verify your email before logging in. Check your inbox and spam folder for a verification email.");
          setShowResendButton(true);
          return;
        }
        // Only navigate if email is verified
        if (user && user.emailVerified) {
          navigate("/");
        }
      } else {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }
        if (!agreeToTerms) {
          setError("Please agree to the terms and conditions");
          return;
        }
               const result = await signup(email, password, name);
               if (result.success) {
                 setSignupEmail(email);
                 setShowSuccessModal(true);
                 // Clear the form and any errors
                 setEmail("");
                 setPassword("");
                 setConfirmPassword("");
                 setName("");
                 setAgreeToTerms(false);
                 setError("");
                 setSuccess("");
               }
      }
    } catch (error: any) {
      // Handle different error types
      if (isLogin) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          setIsLogin(false);
          setError(""); // Clear error message when switching to signup
        } else if (error.code === 'auth/too-many-requests') {
          setError("Too many failed attempts. Please try again later or reset your password.");
        } else {
          setError(error.message || "Authentication failed");
        }
      } else {
        setError(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isLogin ? "Sign in" : "Sign up"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? "Enter your email and password to access your account"
                : "Create a new account to get started"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              {!isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    required
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      terms and conditions
                    </Link>
                  </Label>
                </div>
              )}
           {error && (
             <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">
               <div>{error}</div>
               {showResendButton && (
                 <Button
                   variant="outline"
                   size="sm"
                   className="mt-2 text-red-600 border-red-300 hover:bg-red-100"
                   onClick={async () => {
                     try {
                       await resendVerification();
                       setError("Verification email sent! Please check your inbox and spam folder.");
                       setShowResendButton(false);
                     } catch (error) {
                       setError("Failed to send verification email. Please try again.");
                     }
                   }}
                 >
                   Resend Verification Email
                 </Button>
               )}
             </div>
           )}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || (!isLogin && !agreeToTerms)}
              >
                {loading ? "Loading..." : (isLogin ? "Sign in" : "Sign up")}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>

            {isLogin && (
              <div className="mt-2 text-center text-sm">
                <Link 
                  to="/forgot-password" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Signup Success Modal */}
      <SignupSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userEmail={signupEmail}
        onSwitchToLogin={() => setIsLogin(true)}
      />
      
    </div>
  );
};

export default Login;