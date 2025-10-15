import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService, UserProfile } from '@/lib/firestore';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, AlertCircle, Lock, Unlock, Ban, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const AdminUsers: React.FC = () => {
  const { currentUser } = useAuth();
  const { canManageUsers } = useAdmin();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUsers();
    loadCurrentUserProfile();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserProfile = async () => {
    if (currentUser) {
      try {
        const profile = await userService.getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading current user profile:', error);
      }
    }
  };

  const updateUserRole = async (uid: string, newRole: 'user' | 'admin' | 'superadmin') => {
    try {
      setUpdating(uid);
      await userService.updateUserRole(uid, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === uid ? { ...user, role: newRole } : user
      ));
      
      // Update current user profile if it's the same user
      if (userProfile && userProfile.uid === uid) {
        setUserProfile({ ...userProfile, role: newRole });
      }
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const toggleFreezeSubmissions = async (uid: string, currentState: boolean) => {
    try {
      await userService.toggleFreezeSubmissions(uid, !currentState);
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === uid ? { ...user, freezeSubmissions: !currentState } : user
      ));
      
      toast.success(`Submissions ${!currentState ? 'frozen' : 'unfrozen'} for user`);
    } catch (error) {
      console.error('Error toggling freeze submissions:', error);
      toast.error('Failed to update submission status');
    }
  };

  const toggleAccountDisabled = async (uid: string, currentState: boolean) => {
    try {
      await userService.toggleAccountDisabled(uid, !currentState);
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === uid ? { ...user, accountDisabled: !currentState } : user
      ));
      
      toast.success(`Account ${!currentState ? 'disabled' : 'enabled'} for user`);
    } catch (error) {
      console.error('Error toggling account disabled:', error);
      toast.error('Failed to update account status');
    }
  };

  // Check if user can manage other users
  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to manage users. Contact a super admin for access.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage user roles and permissions for the math club.
          </p>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Only the "Role" field can be changed. Other fields (email, display name, etc.) are read-only and managed by Firebase Auth.
            </AlertDescription>
          </Alert>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Email Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.emailVerified).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Regular Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => !u.role || u.role === 'user').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Puzzles Solved</TableHead>
                    <TableHead>Freeze Submissions</TableHead>
                    <TableHead>Disable Account</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid} className={user.accountDisabled ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {user.role === 'admin' || user.role === 'superadmin' ? (
                            <Shield className="h-4 w-4 text-blue-600" />
                          ) : (
                            <User className="h-4 w-4 text-gray-400" />
                          )}
                          <div>
                            <div>{user.displayName}</div>
                            {user.accountDisabled && (
                              <Badge variant="destructive" className="mt-1">
                                <Ban className="h-3 w-3 mr-1" />
                                Disabled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {user.firebaseCreatedAt?.toDate?.()?.toLocaleDateString() || 
                         user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">{user.correctSubmissions || 0}</span>
                          <span className="text-gray-500">/ {user.totalSubmissions || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.freezeSubmissions || false}
                            onCheckedChange={() => toggleFreezeSubmissions(user.uid, user.freezeSubmissions || false)}
                            disabled={user.uid === currentUser?.uid}
                          />
                          {user.freezeSubmissions ? (
                            <Lock className="h-4 w-4 text-red-600" />
                          ) : (
                            <Unlock className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.accountDisabled || false}
                            onCheckedChange={() => toggleAccountDisabled(user.uid, user.accountDisabled || false)}
                            disabled={user.uid === currentUser?.uid || user.role === 'admin' || user.role === 'superadmin'}
                          />
                          {user.accountDisabled ? (
                            <Ban className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminUsers;