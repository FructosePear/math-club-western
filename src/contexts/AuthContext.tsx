import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { userService } from '@/lib/firestore';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, displayName: string) => Promise<{ success: boolean }>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [shouldBlockAuthState, setShouldBlockAuthState] = useState(false);

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setIsSigningUp(true);
      setShouldBlockAuthState(true); // Block auth state changes during signup
      
      // Validate inputs
      if (!email || !password || !displayName) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Create the user account
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(user, { displayName });
      
      // Create user profile immediately (even before email verification)
      await userService.createOrUpdateUser({
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        role: 'user', // Default role
        emailVerified: user.emailVerified,
        firebaseCreatedAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) as any : undefined,
      } as any);
      
      // Send email verification with custom action URL
      // Include the base path to match Vite config
      const basePath = import.meta.env.BASE_URL || '/math-club-western';
      await sendEmailVerification(user, {
        url: `${window.location.origin}${basePath}/login?verified=true`
      });
      
      // Immediately log out the user - they need to verify email first
      await signOut(auth);
      
      // Force clear current user state to prevent any flash
      setCurrentUser(null);
      
      // Wait a bit to ensure logout is processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsSigningUp(false);
      setShouldBlockAuthState(false); // Re-enable auth state changes
    }
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // If email is not verified, log out immediately and throw error
    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before logging in. Check your inbox and spam folder for a verification email.');
    }
    
    return user;
  };

  const logout = async () => {
    await signOut(auth);
    // Redirect to homepage after logout
    const basePath = import.meta.env.BASE_URL || '/math-club-western';
    window.location.href = basePath;
  };

  const resetPassword = async (email: string) => {
    // Include the base path to match Vite config
    const basePath = import.meta.env.BASE_URL || '/math-club-western';
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}${basePath}/login`
    });
  };

  const resendVerification = async () => {
    if (currentUser && !currentUser.emailVerified) {
      // Include the base path to match Vite config
      const basePath = import.meta.env.BASE_URL || '/math-club-western';
      await sendEmailVerification(currentUser, {
        url: `${window.location.origin}${basePath}/login?verified=true`
      });
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Block auth state changes during signup to prevent flash
      if (shouldBlockAuthState) {
        return;
      }
      
      // If user is logged in but email is not verified, log them out immediately
      if (user && !user.emailVerified) {
        await signOut(auth);
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      
      setCurrentUser(user);
      setLoading(false);
      
      // Only update user profile in Firestore if email is verified
      // This prevents creating profiles for unverified users who try to log in
      if (user && user.emailVerified) {
        try {
          // Check if user already exists to preserve their role
          const existingProfile = await userService.getUserProfile(user.uid);
          
          if (existingProfile) {
            // User exists - only update login timestamp, preserve everything else
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              lastLogin: serverTimestamp(),
              emailVerified: user.emailVerified, // Update verification status
            });
          } else {
            // User doesn't exist - create new profile with default role
            await userService.createOrUpdateUser({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
              role: 'user', // Default role for new users
              emailVerified: user.emailVerified,
              firebaseCreatedAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) as any : undefined,
            } as any);
          }
        } catch (error) {
          console.error('Error creating/updating user profile:', error);
        }
      }
    });

    return unsubscribe;
  }, [shouldBlockAuthState]);

  const value: AuthContextType = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    resendVerification,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
