import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
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
  lastLogin: Timestamp;
  totalSubmissions?: number;
  correctSubmissions?: number;
  averageScore?: number;
}

export interface Puzzle {
  id: string;
  title: string;
  date: string;
  image?: string;
  prompt: string;
  difficulty: number;
  correctAnswer?: string;
  solution?: string;
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
      await updateDoc(userRef, {
        ...user,
        lastLogin: serverTimestamp(),
      });
      return user.uid;
    } catch (error) {
      // If document doesn't exist, create it
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          ...user,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
        return user.uid;
      } catch (createError) {
        console.error('Error creating/updating user:', createError);
        throw createError;
      }
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
  }
};

// Puzzles (you can move your static puzzles to Firestore later)
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
  }
};
