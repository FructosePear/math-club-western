import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { puzzleService, Puzzle } from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Star, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const POTWArchive: React.FC = () => {
  const [archivedPuzzles, setArchivedPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchivedPuzzles();
  }, []);

  const loadArchivedPuzzles = async () => {
    try {
      setLoading(true);
      const puzzles = await puzzleService.getArchivedPuzzles();
      setArchivedPuzzles(puzzles);
    } catch (error) {
      console.error("Error loading archived puzzles:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStars = (difficulty: number) => {
    return "🌶️".repeat(difficulty);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading archive...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            POTW Archive
          </h1>
          <p className="text-xl text-gray-600">
            Browse through past Problem of the Week puzzles
          </p>
        </div>

        {/* Archive Content */}
        {archivedPuzzles.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Archived Puzzles Yet
                </h3>
                <p className="text-gray-500">
                  Check back later to see past Problem of the Week puzzles.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedPuzzles.map((puzzle) => (
              <Card
                key={puzzle.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {puzzle.title}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      Archived
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Difficulty */}
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        {getStars(puzzle.difficulty)}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(puzzle.createdAt)}</span>
                      </div>
                      {puzzle.archivedAt && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Archived: {formatDate(puzzle.archivedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Problem Preview */}
                    <div className="text-sm text-gray-700 line-clamp-3">
                      {puzzle.prompt}
                    </div>

                    {/* Image Preview */}
                    {puzzle.image && (
                      <div className="mt-3">
                        <img
                          src={puzzle.image}
                          alt={puzzle.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Navigate to puzzle details or show in modal
                          // For now, just show an alert
                          alert(
                            `Viewing puzzle: ${puzzle.title}\n\nThis would show the full puzzle details.`
                          );
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default POTWArchive;
