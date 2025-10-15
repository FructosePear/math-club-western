import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { puzzleService, Puzzle } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminPuzzles: React.FC = () => {
  const { currentUser } = useAuth();
  const { userProfile, loading: adminLoading, canManagePuzzles } = useAdmin();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<Puzzle | null>(null);
  
  type PuzzleFormData = {
    title: string;
    prompt: string;
    difficulty: number;
    correctAnswer: string;
    solution: string;
    image: string;
    isActive: boolean;
    expiresAt: string;
  };

  // Form state
  const [formData, setFormData] = useState<PuzzleFormData>({
    title: '',
    prompt: '',
    difficulty: 3,
    correctAnswer: '',
    solution: '',
    image: '',
    isActive: true,
    expiresAt: '',
  });

  useEffect(() => {
    loadPuzzles();
  }, []);

  const loadPuzzles = async () => {
    try {
      setLoading(true);
      const puzzleList = await puzzleService.getPuzzles();
      setPuzzles(puzzleList);
    } catch (error) {
      console.error('Error loading puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (editingPuzzle) {
        // Update existing puzzle
        const updates: Partial<Puzzle> = {
          title: formData.title,
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          correctAnswer: formData.correctAnswer,
          solution: formData.solution,
          image: formData.image,
        };
        
        if (formData.expiresAt) {
          updates.expiresAt = Timestamp.fromDate(new Date(formData.expiresAt));
        }
        
        // If activating, use setPuzzleActive to ensure only one is active
        if (formData.isActive && !editingPuzzle.isActive) {
          await puzzleService.updatePuzzle(editingPuzzle.id!, updates);
          await puzzleService.setPuzzleActive(editingPuzzle.id!);
        } else {
          updates.isActive = formData.isActive;
          await puzzleService.updatePuzzle(editingPuzzle.id!, updates);
        }
      } else {
        // Create new puzzle
        const puzzleData: Omit<Puzzle, 'id' | 'createdAt' | 'createdBy'> = {
          title: formData.title,
          date: new Date().toISOString().split('T')[0],
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          correctAnswer: formData.correctAnswer,
          solution: formData.solution,
          image: formData.image,
          isActive: false,
        };
        
        if (formData.expiresAt) {
          puzzleData.expiresAt = Timestamp.fromDate(new Date(formData.expiresAt));
        }
        
        const newPuzzleId = await puzzleService.createPuzzle(puzzleData, currentUser.uid);
        
        // If the puzzle is set to active, use setPuzzleActive to ensure only one is active
        if (formData.isActive) {
          await puzzleService.setPuzzleActive(newPuzzleId);
        }
      }

      // Reset form and reload puzzles
      setFormData({
        title: '',
        prompt: '',
        difficulty: 3,
        correctAnswer: '',
        solution: '',
        image: '',
        isActive: true,
        expiresAt: '',
      });
      setEditingPuzzle(null);
      setIsDialogOpen(false);
      loadPuzzles();
    } catch (error) {
      console.error('Error saving puzzle:', error);
    }
  };

  const handleEdit = (puzzle: Puzzle) => {
    setEditingPuzzle(puzzle);
    setFormData({
      title: puzzle.title,
      prompt: puzzle.prompt,
      difficulty: puzzle.difficulty,
      correctAnswer: puzzle.correctAnswer || '',
      solution: puzzle.solution || '',
      image: puzzle.image || '',
      isActive: puzzle.isActive,
      expiresAt: puzzle.expiresAt ? new Date(puzzle.expiresAt.seconds * 1000).toISOString().slice(0, 16) : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (puzzleId: string) => {
    if (!confirm('Are you sure you want to delete this puzzle?')) return;

    try {
      await puzzleService.deletePuzzle(puzzleId);
      loadPuzzles();
    } catch (error) {
      console.error('Error deleting puzzle:', error);
    }
  };

  const toggleActive = async (puzzle: Puzzle) => {
    try {
      if (!puzzle.isActive) {
        // If activating, use setPuzzleActive to ensure only one is active
        await puzzleService.setPuzzleActive(puzzle.id!);
      } else {
        // If deactivating, just update this puzzle
        await puzzleService.updatePuzzle(puzzle.id!, {
          isActive: false,
        });
      }
      loadPuzzles();
    } catch (error) {
      console.error('Error updating puzzle:', error);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!canManagePuzzles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
                <p className="text-gray-600">You don't have permission to manage puzzles.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Contact an administrator to get access.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Puzzle Management
          </h1>
          <p className="text-gray-600">
            Manage Problem of the Week puzzles for the math club.
          </p>
        </div>

        {/* Add New Puzzle Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPuzzle(null);
                setFormData({
                  title: '',
                  prompt: '',
                  difficulty: 3,
                  correctAnswer: '',
                  solution: '',
                  image: '',
                  isActive: true,
                  expiresAt: '',
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Puzzle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPuzzle ? 'Edit Puzzle' : 'Create New Puzzle'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expiration Date & Time</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    When should this puzzle expire? Students won't be able to submit after this time.
                  </p>
                </div>

                <div>
                  <Label htmlFor="prompt">Problem Statement</Label>
                  <Textarea
                    id="prompt"
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                  <Input
                    id="difficulty"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="correctAnswer">Correct Answer (optional)</Label>
                  <Input
                    id="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="solution">Solution (optional)</Label>
                  <Textarea
                    id="solution"
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active (visible to users)</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPuzzle ? 'Update Puzzle' : 'Create Puzzle'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Puzzles Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Puzzles ({puzzles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading puzzles...</p>
              </div>
            ) : puzzles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No puzzles found. Create your first puzzle!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {puzzles.map((puzzle) => (
                    <TableRow key={puzzle.id}>
                      <TableCell className="font-medium">{puzzle.title}</TableCell>
                      <TableCell>
                        {puzzle.createdAt ? new Date(puzzle.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {'★'.repeat(puzzle.difficulty)}{'☆'.repeat(5 - puzzle.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={puzzle.isActive}
                            onCheckedChange={() => toggleActive(puzzle)}
                          />
                          <span className={puzzle.isActive ? 'text-green-600' : 'text-gray-500'}>
                            {puzzle.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(puzzle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(puzzle.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

export default AdminPuzzles;
