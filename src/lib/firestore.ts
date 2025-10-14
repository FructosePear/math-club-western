import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface POTWSubmission {
  id?: string;
  puzzleId: string;
  puzzleName: string;
  userId: string;
  userName: string;
  userEmail: string;
  answer: string;
  createdAt: Timestamp;
  score?: number;
  isCorrect?: boolean;
}

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  totalSubmissions?: number;
  correctSubmissions?: number;
  averageScore?: number;
  role?: 'user' | 'admin' | 'superadmin';
  // Firebase Auth fields (read-only)
  emailVerified?: boolean;
  firebaseCreatedAt?: Timestamp;
}

export interface Puzzle {
  id?: string;
  title: string;
  date: string;
  image?: string;
  prompt: string;
  difficulty: number;
  correctAnswer?: string;
  solution?: string;
  createdAt: Timestamp;
  createdBy: string;
  isActive: boolean;
  expiresAt?: Timestamp; // New field for expiration date
}

// POTW Submissions
export const potwService = {
  // Submit POTW answer
  async submitAnswer(submission: Omit<POTWSubmission, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'potw_submissions'), {
        ...submission,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting POTW answer:', error);
      throw error;
    }
  },

  // Get user's submission for a specific puzzle
  async getUserSubmission(puzzleId: string, userId: string): Promise<POTWSubmission | null> {
    try {
      const q = query(
        collection(db, 'potw_submissions'),
        where('puzzleId', '==', puzzleId),
        where('userId', '==', userId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as POTWSubmission;
    } catch (error) {
      console.error('Error getting user submission:', error);
      throw error;
    }
  },

  // Get all submissions for a puzzle (for leaderboard)
  async getPuzzleSubmissions(puzzleId: string): Promise<POTWSubmission[]> {
    try {
      const q = query(
        collection(db, 'potw_submissions'),
        where('puzzleId', '==', puzzleId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as POTWSubmission[];
    } catch (error) {
      console.error('Error getting puzzle submissions:', error);
      throw error;
    }
  },

  // Real-time leaderboard for a puzzle
  subscribeToPuzzleSubmissions(
    puzzleId: string, 
    callback: (submissions: POTWSubmission[]) => void
  ) {
    const q = query(
      collection(db, 'potw_submissions'),
      where('puzzleId', '==', puzzleId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (querySnapshot) => {
      const submissions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as POTWSubmission[];
      callback(submissions);
    });
  }
};

// User Profiles
export const userService = {
  // Create or update user profile
  async createOrUpdateUser(user: Omit<UserProfile, 'id'>): Promise<string> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, {
          ...user,
          lastLogin: serverTimestamp(),
        });
      } else {
        // Create new user
        await setDoc(userRef, {
          ...user,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      }
      return user.uid;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Get user's submission history
  async getUserSubmissions(userId: string): Promise<POTWSubmission[]> {
    try {
      const q = query(
        collection(db, 'potw_submissions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as POTWSubmission[];
    } catch (error) {
      console.error('Error getting user submissions:', error);
      throw error;
    }
  },

  // Update user stats
  async updateUserStats(uid: string): Promise<void> {
    try {
      const submissions = await this.getUserSubmissions(uid);
      const totalSubmissions = submissions.length;
      const correctSubmissions = submissions.filter(s => s.isCorrect).length;
      const averageScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions;

      await updateDoc(doc(db, 'users', uid), {
        totalSubmissions,
        correctSubmissions,
        averageScore: Math.round(averageScore * 100) / 100,
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Update user role (admin only)
  async updateUserRole(uid: string, role: 'user' | 'admin' | 'superadmin'): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: role,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
};

// Puzzles Management
export const puzzleService = {
  // Get all puzzles
  async getPuzzles(): Promise<Puzzle[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'puzzles'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Puzzle[];
    } catch (error) {
      console.error('Error getting puzzles:', error);
      // Fallback to static puzzles if Firestore fails
      return [];
    }
  },

  // Get active puzzles only
  async getActivePuzzles(): Promise<Puzzle[]> {
    try {
      const q = query(
        collection(db, 'puzzles'),
        where('isActive', '==', true),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Puzzle[];
    } catch (error) {
      console.error('Error getting active puzzles:', error);
      return [];
    }
  },

  // Get current active puzzle (only one should be active)
  async getCurrentActivePuzzle(): Promise<Puzzle | null> {
    try {
      // Simple query - just get active puzzles (no sorting, no index needed)
      const q = query(
        collection(db, 'puzzles'),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      // Return the first active puzzle (you should only have one active anyway)
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Puzzle;
    } catch (error) {
      console.error('Error getting current active puzzle:', error);
      return null;
    }
  },

  // Get specific puzzle
  async getPuzzle(puzzleId: string): Promise<Puzzle | null> {
    try {
      const puzzleDoc = await getDoc(doc(db, 'puzzles', puzzleId));
      if (puzzleDoc.exists()) {
        return { id: puzzleDoc.id, ...puzzleDoc.data() } as Puzzle;
      }
      return null;
    } catch (error) {
      console.error('Error getting puzzle:', error);
      return null;
    }
  },

  // Create new puzzle (admin only)
  async createPuzzle(puzzle: Omit<Puzzle, 'id' | 'createdAt' | 'createdBy'>, createdBy: string): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'puzzles'), {
        ...puzzle,
        createdAt: serverTimestamp(),
        createdBy: createdBy,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating puzzle:', error);
      throw error;
    }
  },

  // Update puzzle (admin only)
  async updatePuzzle(puzzleId: string, updates: Partial<Puzzle>): Promise<void> {
    try {
      const puzzleRef = doc(db, 'puzzles', puzzleId);
      await updateDoc(puzzleRef, updates);
    } catch (error) {
      console.error('Error updating puzzle:', error);
      throw error;
    }
  },

  // Set puzzle as active and deactivate all others
  async setPuzzleActive(puzzleId: string): Promise<void> {
    try {
      // First, deactivate all puzzles
      const allPuzzlesQuery = query(collection(db, 'puzzles'));
      const allPuzzlesSnapshot = await getDocs(allPuzzlesQuery);
      
      const deactivatePromises = allPuzzlesSnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isActive: false })
      );
      await Promise.all(deactivatePromises);
      
      // Then, activate the selected puzzle
      const puzzleRef = doc(db, 'puzzles', puzzleId);
      await updateDoc(puzzleRef, { isActive: true });
    } catch (error) {
      console.error('Error setting puzzle active:', error);
      throw error;
    }
  },

  // Delete puzzle (admin only)
  async deletePuzzle(puzzleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'puzzles', puzzleId));
    } catch (error) {
      console.error('Error deleting puzzle:', error);
      throw error;
    }
  }
};
