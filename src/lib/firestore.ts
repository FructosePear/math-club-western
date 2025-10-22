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
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "./firebase";

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
  grade?: number; // 1-5 point scale for admin grading
  gradedAt?: Timestamp;
  gradedBy?: string; // Admin UID who graded it
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
  role?: "user" | "admin" | "superadmin";
  // Firebase Auth fields (read-only)
  emailVerified?: boolean;
  firebaseCreatedAt?: Timestamp;
  // Admin controls
  freezeSubmissions?: boolean;
  accountDisabled?: boolean;
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
  status: "backlog" | "active" | "archived";
  activatedAt?: Timestamp;
  archivedAt?: Timestamp;
  expiresAt?: Timestamp; // New field for expiration date
}

// POTW Submissions
export const potwService = {
  // Submit POTW answer
  async submitAnswer(
    submission: Omit<POTWSubmission, "id" | "createdAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "potw_submissions"), {
        ...submission,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error submitting POTW answer:", error);
      throw error;
    }
  },

  // Get user's submission for a specific puzzle
  async getUserSubmission(
    puzzleId: string,
    userId: string
  ): Promise<POTWSubmission | null> {
    try {
      const q = query(
        collection(db, "potw_submissions"),
        where("puzzleId", "==", puzzleId),
        where("userId", "==", userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as POTWSubmission;
    } catch (error) {
      console.error("Error getting user submission:", error);
      throw error;
    }
  },

  // Get all submissions for a puzzle (for leaderboard)
  async getPuzzleSubmissions(puzzleId: string): Promise<POTWSubmission[]> {
    try {
      const q = query(
        collection(db, "potw_submissions"),
        where("puzzleId", "==", puzzleId)
      );

      const querySnapshot = await getDocs(q);
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as POTWSubmission[];

      // Sort in JavaScript instead of Firestore
      submissions.sort((a, b) => {
        const aTime = a.createdAt?.toDate()?.getTime() || 0;
        const bTime = b.createdAt?.toDate()?.getTime() || 0;
        return bTime - aTime; // Descending order (newest first)
      });

      return submissions;
    } catch (error) {
      console.error("Error getting puzzle submissions:", error);
      throw error;
    }
  },

  // Get latest submission date for a user
  async getUserLatestSubmissionDate(userId: string): Promise<Date | null> {
    try {
      const q = query(
        collection(db, "potw_submissions"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      // Sort in JavaScript to find the latest submission
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as POTWSubmission[];

      // Sort by createdAt descending and get the latest
      submissions.sort((a, b) => {
        const aTime = a.createdAt?.toDate()?.getTime() || 0;
        const bTime = b.createdAt?.toDate()?.getTime() || 0;
        return bTime - aTime;
      });

      const latestSubmission = submissions[0];
      return latestSubmission.createdAt?.toDate() || null;
    } catch (error) {
      console.error("Error getting user latest submission date:", error);
      return null;
    }
  },

  // Get all submissions for a specific puzzle (for admin grading)
  async getPuzzleSubmissionsForGrading(
    puzzleId: string
  ): Promise<POTWSubmission[]> {
    try {
      // Query without orderBy to avoid index requirement
      const q = query(
        collection(db, "potw_submissions"),
        where("puzzleId", "==", puzzleId)
      );

      const querySnapshot = await getDocs(q);
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as POTWSubmission[];

      // Sort in JavaScript instead of Firestore
      submissions.sort((a, b) => {
        const aTime = a.createdAt?.toDate()?.getTime() || 0;
        const bTime = b.createdAt?.toDate()?.getTime() || 0;
        return bTime - aTime; // Descending order (newest first)
      });

      return submissions;
    } catch (error) {
      console.error("Error getting puzzle submissions for grading:", error);
      throw error;
    }
  },

  // Update submission grade (admin only)
  async updateSubmissionGrade(
    submissionId: string,
    grade: number,
    gradedBy: string
  ): Promise<void> {
    try {
      const submissionRef = doc(db, "potw_submissions", submissionId);
      await updateDoc(submissionRef, {
        grade: grade,
        gradedAt: serverTimestamp(),
        gradedBy: gradedBy,
      });
    } catch (error) {
      console.error("Error updating submission grade:", error);
      throw error;
    }
  },

  // Real-time leaderboard for a puzzle
  subscribeToPuzzleSubmissions(
    puzzleId: string,
    callback: (submissions: POTWSubmission[]) => void
  ) {
    const q = query(
      collection(db, "potw_submissions"),
      where("puzzleId", "==", puzzleId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as POTWSubmission[];

      // Sort in JavaScript instead of Firestore
      submissions.sort((a, b) => {
        const aTime = a.createdAt?.toDate()?.getTime() || 0;
        const bTime = b.createdAt?.toDate()?.getTime() || 0;
        return bTime - aTime; // Descending order (newest first)
      });

      // Apply limit in JavaScript
      const limitedSubmissions = submissions.slice(0, 50);
      callback(limitedSubmissions);
    });
  },

  // Real-time subscription to user's submissions
  subscribeToUserSubmissions(
    userId: string,
    callback: (submissions: POTWSubmission[]) => void
  ) {
    const q = query(
      collection(db, "potw_submissions"),
      where("userId", "==", userId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as POTWSubmission[];

      // Sort by creation time (newest first)
      submissions.sort((a, b) => {
        const aTime = a.createdAt?.toDate()?.getTime() || 0;
        const bTime = b.createdAt?.toDate()?.getTime() || 0;
        return bTime - aTime;
      });

      callback(submissions);
    });
  },

  // Real-time subscription to all submissions (admin only)
  subscribeToAllSubmissions(callback: (submissions: POTWSubmission[]) => void) {
    const q = query(collection(db, "potw_submissions"));

    return onSnapshot(q, (querySnapshot) => {
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as POTWSubmission[];

      // Sort by creation time (newest first)
      submissions.sort((a, b) => {
        const aTime = a.createdAt?.toDate()?.getTime() || 0;
        const bTime = b.createdAt?.toDate()?.getTime() || 0;
        return bTime - aTime;
      });

      callback(submissions);
    });
  },
};

// User Profiles
export const userService = {
  // Create or update user profile
  async createOrUpdateUser(user: Omit<UserProfile, "id">): Promise<string> {
    try {
      const userRef = doc(db, "users", user.uid);
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
      console.error("Error creating/updating user:", error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  },

  // Get user's submission history
  async getUserSubmissions(userId: string): Promise<POTWSubmission[]> {
    try {
      const q = query(
        collection(db, "potw_submissions"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as POTWSubmission[];

      // Sort in JavaScript instead of Firestore
      submissions.sort((a, b) => {
        const aTime = a.createdAt?.toDate()?.getTime() || 0;
        const bTime = b.createdAt?.toDate()?.getTime() || 0;
        return bTime - aTime; // Descending order (newest first)
      });

      return submissions;
    } catch (error) {
      console.error("Error getting user submissions:", error);
      throw error;
    }
  },

  // Update user stats
  async updateUserStats(uid: string): Promise<void> {
    try {
      const submissions = await this.getUserSubmissions(uid);
      const totalSubmissions = submissions.length;
      const gradedSubmissions = submissions.filter((s) => s.grade);
      const averageGrade =
        gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) /
            gradedSubmissions.length
          : 0;

      await updateDoc(doc(db, "users", uid), {
        totalSubmissions,
        correctSubmissions: gradedSubmissions.length, // Count graded submissions
        averageScore: Math.round(averageGrade * 20 * 100) / 100, // Convert 1-5 scale to percentage
      });
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserProfile[];
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  },

  // Real-time subscription to all users (admin only)
  subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
    const q = query(collection(db, "users"));

    return onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserProfile[];

      // Sort by creation time (newest first)
      users.sort((a, b) => {
        const aTime = a.firebaseCreatedAt?.toDate()?.getTime() || 0;
        const bTime = b.firebaseCreatedAt?.toDate()?.getTime() || 0;
        return bTime - aTime;
      });

      callback(users);
    });
  },

  // Update user role (admin only)
  async updateUserRole(
    uid: string,
    role: "user" | "admin" | "superadmin"
  ): Promise<void> {
    try {
      await updateDoc(doc(db, "users", uid), {
        role: role,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  },

  // Toggle freeze submissions (admin only)
  async toggleFreezeSubmissions(uid: string, freeze: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, "users", uid), {
        freezeSubmissions: freeze,
      });
    } catch (error) {
      console.error("Error toggling freeze submissions:", error);
      throw error;
    }
  },

  // Toggle account disabled (admin only)
  async toggleAccountDisabled(uid: string, disabled: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, "users", uid), {
        accountDisabled: disabled,
      });
    } catch (error) {
      console.error("Error toggling account disabled:", error);
      throw error;
    }
  },
};

// Puzzles Management
export const puzzleService = {
  // Get all puzzles
  async getPuzzles(): Promise<Puzzle[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "puzzles"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Puzzle[];
    } catch (error) {
      console.error("Error getting puzzles:", error);
      // Fallback to static puzzles if Firestore fails
      return [];
    }
  },

  // Get puzzles by status
  async getPuzzlesByStatus(
    status: "backlog" | "active" | "archived"
  ): Promise<Puzzle[]> {
    try {
      const q = query(collection(db, "puzzles"), where("status", "==", status));
      const querySnapshot = await getDocs(q);
      const puzzles = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Puzzle[];

      // Sort in JavaScript to avoid index issues
      puzzles.sort((a, b) => {
        if (status === "archived") {
          // For archived, sort by archivedAt (most recent first)
          const aTime = a.archivedAt?.toDate()?.getTime() || 0;
          const bTime = b.archivedAt?.toDate()?.getTime() || 0;
          return bTime - aTime;
        } else {
          // For backlog and active, sort by createdAt (most recent first)
          const aTime = a.createdAt?.toDate()?.getTime() || 0;
          const bTime = b.createdAt?.toDate()?.getTime() || 0;
          return bTime - aTime;
        }
      });

      return puzzles;
    } catch (error) {
      console.error(`Error getting ${status} puzzles:`, error);
      return [];
    }
  },

  // Get active puzzles only (for backward compatibility)
  async getActivePuzzles(): Promise<Puzzle[]> {
    return this.getPuzzlesByStatus("active");
  },

  // Get current active puzzle (only one should be active)
  async getCurrentActivePuzzle(): Promise<Puzzle | null> {
    try {
      const q = query(
        collection(db, "puzzles"),
        where("status", "==", "active")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      // Return the first active puzzle (you should only have one active anyway)
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Puzzle;
    } catch (error) {
      console.error("Error getting current active puzzle:", error);
      return null;
    }
  },

  // Get specific puzzle
  async getPuzzle(puzzleId: string): Promise<Puzzle | null> {
    try {
      const puzzleDoc = await getDoc(doc(db, "puzzles", puzzleId));
      if (puzzleDoc.exists()) {
        return { id: puzzleDoc.id, ...puzzleDoc.data() } as Puzzle;
      }
      return null;
    } catch (error) {
      console.error("Error getting puzzle:", error);
      return null;
    }
  },

  // Create new puzzle (admin only) - defaults to backlog status
  async createPuzzle(
    puzzle: Omit<Puzzle, "id" | "createdAt" | "createdBy" | "status">,
    createdBy: string
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "puzzles"), {
        ...puzzle,
        status: "backlog",
        createdAt: serverTimestamp(),
        createdBy: createdBy,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating puzzle:", error);
      throw error;
    }
  },

  // Update puzzle (admin only)
  async updatePuzzle(
    puzzleId: string,
    updates: Partial<Puzzle>
  ): Promise<void> {
    try {
      const puzzleRef = doc(db, "puzzles", puzzleId);

      // Handle undefined values by using deleteField
      const firestoreUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) {
          firestoreUpdates[key] = deleteField();
        } else {
          firestoreUpdates[key] = value;
        }
      });

      await updateDoc(puzzleRef, firestoreUpdates);
    } catch (error) {
      console.error("Error updating puzzle:", error);
      throw error;
    }
  },

  // Set puzzle as active and archive all others
  async setPuzzleActive(puzzleId: string): Promise<void> {
    try {
      // First, archive all currently active puzzles
      const activePuzzlesQuery = query(
        collection(db, "puzzles"),
        where("status", "==", "active")
      );
      const activePuzzlesSnapshot = await getDocs(activePuzzlesQuery);

      const archivePromises = activePuzzlesSnapshot.docs.map((doc) =>
        updateDoc(doc.ref, {
          status: "archived",
          archivedAt: serverTimestamp(),
        })
      );
      await Promise.all(archivePromises);

      // Then, activate the selected puzzle
      const puzzleRef = doc(db, "puzzles", puzzleId);
      await updateDoc(puzzleRef, {
        status: "active",
        activatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error setting puzzle active:", error);
      throw error;
    }
  },

  // Get archived puzzles for users (public access)
  async getArchivedPuzzles(): Promise<Puzzle[]> {
    return this.getPuzzlesByStatus("archived");
  },

  // Real-time subscription to active puzzle
  subscribeToActivePuzzle(callback: (puzzle: Puzzle | null) => void) {
    const q = query(collection(db, "puzzles"), where("status", "==", "active"));

    return onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null);
        return;
      }

      const doc = querySnapshot.docs[0];
      const puzzle = {
        id: doc.id,
        ...doc.data(),
      } as Puzzle;

      callback(puzzle);
    });
  },

  // Real-time subscription to puzzles by status
  subscribeToPuzzlesByStatus(
    status: "backlog" | "active" | "archived",
    callback: (puzzles: Puzzle[]) => void
  ) {
    const q = query(collection(db, "puzzles"), where("status", "==", status));

    return onSnapshot(q, (querySnapshot) => {
      const puzzles = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Puzzle[];

      callback(puzzles);
    });
  },

  // Real-time subscription to all puzzles (for admin)
  subscribeToAllPuzzles(callback: (puzzles: Puzzle[]) => void) {
    const q = query(collection(db, "puzzles"));

    return onSnapshot(q, (querySnapshot) => {
      const puzzles = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Puzzle[];

      callback(puzzles);
    });
  },

  // Delete puzzle (admin only) - cannot delete active puzzles
  async deletePuzzle(puzzleId: string): Promise<void> {
    try {
      // First check if puzzle is active
      const puzzle = await this.getPuzzle(puzzleId);
      if (puzzle?.status === "active") {
        throw new Error(
          "Cannot delete active puzzle. Please deactivate it first."
        );
      }

      await deleteDoc(doc(db, "puzzles", puzzleId));
    } catch (error) {
      console.error("Error deleting puzzle:", error);
      throw error;
    }
  },
};
