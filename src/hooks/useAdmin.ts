import { useAuth } from "@/contexts/AuthContext";
import { userService, UserProfile } from "@/lib/firestore";
import { useEffect, useState } from "react";

export const useAdmin = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await userService.getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error loading user profile:", error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [currentUser]);

  const isAdmin =
    userProfile?.role === "admin" || userProfile?.role === "superadmin";
  const isSuperAdmin = userProfile?.role === "superadmin";

  return {
    userProfile,
    loading,
    isAdmin,
    isSuperAdmin,
    canManagePuzzles: isAdmin,
    canManageUsers: isSuperAdmin,
  };
};
