import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { puzzleService, potwService, Puzzle } from '@/lib/firestore';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Plus, Edit, Trash2, Eye, FileText, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPuzzles: React.FC = () => {
  const { currentUser } = useAuth();
  const { userProfile, loading: adminLoading, canManagePuzzles } = useAdmin();
  const navigate = useNavigate();
  const [activePuzzles, setActivePuzzles] = useState<Puzzle[]>([]);
  const [backlogPuzzles, setBacklogPuzzles] = useState<Puzzle[]>([]);
  const [archivedPuzzles, setArchivedPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<Puzzle | null>(null);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [gradedCounts, setGradedCounts] = useState<Record<string, number>>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    puzzle: Puzzle | null;
  }>({
    isOpen: false,
    puzzle: null,
  });
  const [activeDialog, setActiveDialog] = useState<{
    isOpen: boolean;
    puzzle: Puzzle | null;
    newStatus: boolean;
  }>({
    isOpen: false,
    puzzle: null,
    newStatus: false,
  });
  
  type PuzzleFormData = {
    title: string;
    prompt: string;
    difficulty: number;
    correctAnswer: string;
    solution: string;
    image: string;
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
    expiresAt: '',
  });
  const [originalFormData, setOriginalFormData] = useState<PuzzleFormData | null>(null);
  const [hasFormChanges, setHasFormChanges] = useState(false);

  // Check if form has changes
  const checkForChanges = () => {
    if (!originalFormData) {
      setHasFormChanges(false);
      return false;
    }
    
    // Normalize empty strings and null values for comparison
    const normalizeValue = (value: string) => value === '' ? null : value;
    
    // Compare each field individually
    const changes = {
      title: formData.title !== originalFormData.title,
      prompt: formData.prompt !== originalFormData.prompt,
      difficulty: formData.difficulty !== originalFormData.difficulty,
      correctAnswer: formData.correctAnswer !== originalFormData.correctAnswer,
      solution: formData.solution !== originalFormData.solution,
      image: formData.image !== originalFormData.image,
      expiresAt: normalizeValue(formData.expiresAt) !== normalizeValue(originalFormData.expiresAt),
    };
    
    const hasAnyChanges = Object.values(changes).some(change => change);
    setHasFormChanges(hasAnyChanges);
    return hasAnyChanges;
  };

  // Check for changes whenever formData changes
  useEffect(() => {
    checkForChanges();
  }, [formData, originalFormData]);

  useEffect(() => {
    loadPuzzles();
  }, []);

  const loadPuzzles = async () => {
    try {
      setLoading(true);
      
      // Load puzzles by status
      const [activeList, backlogList, archivedList] = await Promise.all([
        puzzleService.getPuzzlesByStatus('active'),
        puzzleService.getPuzzlesByStatus('backlog'),
        puzzleService.getPuzzlesByStatus('archived')
      ]);
      
      setActivePuzzles(activeList);
      setBacklogPuzzles(backlogList);
      setArchivedPuzzles(archivedList);
      
      // Load submission counts for all puzzles
      const allPuzzles = [...activeList, ...backlogList, ...archivedList];
      const counts: Record<string, number> = {};
      const gradedCounts: Record<string, number> = {};
      
      for (const puzzle of allPuzzles) {
        try {
          console.log(`Loading submissions for puzzle: ${puzzle.id} - ${puzzle.title}`);
          const submissions = await potwService.getPuzzleSubmissionsForGrading(puzzle.id!);
          console.log(`Found ${submissions.length} submissions for puzzle ${puzzle.id}`);
          counts[puzzle.id!] = submissions.length;
          gradedCounts[puzzle.id!] = submissions.filter(sub => sub.grade).length;
        } catch (error) {
          console.error(`Error loading submissions for puzzle ${puzzle.id}:`, error);
          counts[puzzle.id!] = 0;
          gradedCounts[puzzle.id!] = 0;
        }
      }
      
      console.log('Final submission counts:', counts);
      console.log('Final graded counts:', gradedCounts);
      setSubmissionCounts(counts);
      setGradedCounts(gradedCounts);
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
        
        // Handle expiry date - either set it or explicitly remove it
        if (formData.expiresAt) {
          updates.expiresAt = Timestamp.fromDate(new Date(formData.expiresAt));
        } else {
          // Explicitly set to undefined to remove the field from Firestore
          updates.expiresAt = undefined;
        }
        
        await puzzleService.updatePuzzle(editingPuzzle.id!, updates);
      } else {
        // Create new puzzle (will be in backlog status by default)
        const puzzleData: Omit<Puzzle, 'id' | 'createdAt' | 'createdBy' | 'status'> = {
          title: formData.title,
          date: new Date().toISOString().split('T')[0],
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          correctAnswer: formData.correctAnswer,
          solution: formData.solution,
          image: formData.image,
        };
        
        if (formData.expiresAt) {
          puzzleData.expiresAt = Timestamp.fromDate(new Date(formData.expiresAt));
        }
        
        await puzzleService.createPuzzle(puzzleData, currentUser.uid);
      }

      // Reset form and reload puzzles
      setFormData({
        title: '',
        prompt: '',
        difficulty: 3,
        correctAnswer: '',
        solution: '',
        image: '',
        expiresAt: '',
      });
      setOriginalFormData(null); // Clear original data
      setHasFormChanges(false); // Reset change state
      setEditingPuzzle(null);
      setIsDialogOpen(false);
      loadPuzzles();
    } catch (error) {
      console.error('Error saving puzzle:', error);
    }
  };

  const handleEdit = (puzzle: Puzzle) => {
    setEditingPuzzle(puzzle);
    const newFormData = {
      title: puzzle.title,
      prompt: puzzle.prompt,
      difficulty: puzzle.difficulty,
      correctAnswer: puzzle.correctAnswer || '',
      solution: puzzle.solution || '',
      image: puzzle.image || '',
      expiresAt: puzzle.expiresAt ? new Date(puzzle.expiresAt.seconds * 1000).toISOString().slice(0, 16) : '',
    };
    setFormData(newFormData);
    setOriginalFormData(newFormData); // Store original data for comparison
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (puzzle: Puzzle) => {
    setDeleteDialog({
      isOpen: true,
      puzzle: puzzle,
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.puzzle) return;

    try {
      await puzzleService.deletePuzzle(deleteDialog.puzzle.id!);
      loadPuzzles();
      setDeleteDialog({ isOpen: false, puzzle: null });
    } catch (error) {
      console.error('Error deleting puzzle:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, puzzle: null });
  };

  const handleActivatePuzzle = (puzzle: Puzzle) => {
    setActiveDialog({
      isOpen: true,
      puzzle: puzzle,
      newStatus: true,
    });
  };

  const handleArchivePuzzle = (puzzle: Puzzle) => {
    setActiveDialog({
      isOpen: true,
      puzzle: puzzle,
      newStatus: false, // false means archive
    });
  };

  const confirmActiveChange = async () => {
    if (!activeDialog.puzzle) return;

    try {
      if (activeDialog.newStatus) {
        // Activate the puzzle (will archive any currently active puzzle)
        await puzzleService.setPuzzleActive(activeDialog.puzzle.id!);
      } else {
        // Archive the puzzle
        await puzzleService.updatePuzzle(activeDialog.puzzle.id!, {
          status: 'archived',
          archivedAt: new Date() as any
        });
      }
      loadPuzzles();
      setActiveDialog({ isOpen: false, puzzle: null, newStatus: false });
    } catch (error) {
      console.error('Error updating puzzle status:', error);
    }
  };

  const cancelActiveChange = () => {
    setActiveDialog({ isOpen: false, puzzle: null, newStatus: false });
  };

  const renderPuzzleTable = (puzzles: Puzzle[], title: string, showActivateButton: boolean = false) => {
    if (puzzles.length === 0) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">No puzzles found.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title} ({puzzles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Expiry</TableHead>
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
                    {puzzle.expiresAt ? (
                      <div className="text-sm">
                        <div className="font-medium">
                          {new Date(puzzle.expiresAt.seconds * 1000).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">
                          {new Date(puzzle.expiresAt.seconds * 1000).toLocaleTimeString()}
                        </div>
                        {new Date() > new Date(puzzle.expiresAt.seconds * 1000) && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No expiry</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={puzzle.status === 'active' ? 'default' : 'secondary'}
                      className={puzzle.status === 'active' ? 'bg-green-600' : ''}
                    >
                      {puzzle.status.charAt(0).toUpperCase() + puzzle.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate(`/admin/puzzle-submissions/${puzzle.id}`)}
                        title="View Submissions"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="ml-1">Submissions</span>
                        <Badge variant="secondary" className="ml-2 bg-white text-blue-600">
                          {gradedCounts[puzzle.id!] || 0}/{submissionCounts[puzzle.id!] || 0}
                        </Badge>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(puzzle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {showActivateButton && puzzle.status === 'backlog' && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleActivatePuzzle(puzzle)}
                        >
                          Activate
                        </Button>
                      )}
                      {puzzle.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                          onClick={() => handleArchivePuzzle(puzzle)}
                        >
                          Archive
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(puzzle)}
                        disabled={puzzle.status === 'active'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
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
                  expiresAt: '',
                });
                setOriginalFormData(null); // Clear original data for new puzzle
                setHasFormChanges(false); // Reset change state
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
                  <Label htmlFor="expiresAt">Expiration Date & Time (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="flex-1"
                    />
                    {formData.expiresAt && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormData({ ...formData, expiresAt: '' })}
                        className="px-3"
                        title="Remove expiry date"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty for no expiration. If set, students won't be able to submit after this time.
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


                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={editingPuzzle ? !hasFormChanges : false}
                    title={editingPuzzle && !hasFormChanges ? "No changes made" : ""}
                  >
                    {editingPuzzle ? 'Update Puzzle' : 'Create Puzzle'}
                  </Button>
                </div>
                {editingPuzzle && !hasFormChanges && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Make changes to enable the Update button
                  </p>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading puzzles...</p>
          </div>
        ) : (
          <>
            {/* Current Active Puzzle */}
            {renderPuzzleTable(activePuzzles, "Current Active Puzzle")}
            
            {/* Backlog Puzzles */}
            {renderPuzzleTable(backlogPuzzles, "Backlog Puzzles (Candidates)", true)}
            
            {/* Archived Puzzles */}
            {renderPuzzleTable(archivedPuzzles, "Archived Puzzles")}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ isOpen: open, puzzle: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Puzzle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the puzzle <strong>"{deleteDialog.puzzle?.title}"</strong>?
              <br /><br />
              This action cannot be undone. All submissions for this puzzle will also be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Puzzle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Active Status Confirmation Dialog */}
      <AlertDialog open={activeDialog.isOpen} onOpenChange={(open) => setActiveDialog({ isOpen: open, puzzle: null, newStatus: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              {activeDialog.newStatus ? (
                <>
                  Are you sure you want to activate the puzzle <strong>"{activeDialog.puzzle?.title}"</strong>?
                  <br /><br />
                  <strong>Activating this puzzle will:</strong>
                  <br />• Make it visible to all users on the POTW page
                  <br />• Allow users to submit solutions
                  <br />• Automatically archive any currently active puzzle
                  <br />• Move this puzzle from backlog to active status
                </>
              ) : (
                <>
                  Are you sure you want to archive the puzzle <strong>"{activeDialog.puzzle?.title}"</strong>?
                  <br /><br />
                  <strong>Archiving this puzzle will:</strong>
                  <br />• Hide it from users on the POTW page
                  <br />• Prevent new submissions
                  <br />• Keep existing submissions intact
                  <br />• Move this puzzle to archived status
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelActiveChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmActiveChange}
              className={activeDialog.newStatus ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {activeDialog.newStatus ? 'Activate Puzzle' : 'Archive Puzzle'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default AdminPuzzles;
