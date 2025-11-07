import { useState } from "react";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import QuizStart from "@/components/QuizStart";
import QuizGame from "@/components/QuizGame";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Contests = () => {
  const [activeSection, setActiveSection] = useState("upcoming");
  const [quizStarted, setQuizStarted] = useState(false);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "upcoming":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Upcoming Contests
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {/* Placeholder cards */}
              <Card>
                <CardHeader>
                  <CardTitle>CHSMC 2024</CardTitle>
                  <CardDescription>
                    Calgary High School Mathematics Contest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-gray-600">
                    The annual Calgary High School Mathematics Contest featuring
                    challenging problems for high school students.
                  </p>
                  <p className="text-sm font-semibold">Date: March 15, 2024</p>
                  <p className="text-sm">
                    Registration deadline: March 1, 2024
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "past":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Past Contests</h2>
            <p className="text-gray-600">
              Access problems, solutions, and marking guides from previous
              Calgary High School Math Competitions.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MC/NR Problems</TableHead>
                  <TableHead>Math Battles Problems</TableHead>
                  <TableHead>Solutions</TableHead>
                  <TableHead>Release + Photos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Link
                      to="https://drive.google.com/file/d/123qb5QMPzhTpSyWAqwxJmhlYfD6YPRii/view?usp=sharing"
                      className="text-blue-500 hover:underline"
                    >
                      CHSMC 2025 MC/NR
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="https://drive.google.com/file/d/1Tj5AY3309atvHib_ORKrEOWVJhsAD2Ir/view?usp=sharing"
                      className="text-blue-500 hover:underline"
                    >
                      CHSMC 2025 Math Battles
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="https://drive.google.com/file/d/1wgC3hzVTJTuL60yplk1odxJrdBtPlr0M/view?usp=sharing"
                      className="text-blue-500 hover:underline"
                    >
                      CHSMC 2025 Solutions
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/events/review-2025"
                      className="text-blue-500 hover:underline"
                    >
                      CHSMC 2025 Event Review
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        );

      case "practice":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Are You Ready?</h2>
            {!quizStarted ? (
              <QuizStart onStart={handleStartQuiz} />
            ) : (
              <QuizGame />
            )}
          </div>
        );

      case "about":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">About CHSMC</h2>
            <p className="text-gray-600">
              The Calgary High School Mathematics Contest (CHSMC) is an annual
              event designed to challenge and inspire high school students in
              Calgary and beyond. The contest features a variety of problem
              types, including multiple choice, numeric response, and math
              battles. The CHSMC is hosted in a different High School every
              year, helping to establish a cross-Calgary math community.
            </p>
            <h3 className="text-2xl font-bold text-gray-800">Difficulty</h3>
            <p className="text-gray-600">
              All problems on the CHSMC require Grade 9 curricular math to
              solve, but no questions require knowledge beyond standard Math
              10-1 content. Each question is scaled with a difficulty rating
              from 1 to 10, with 1 being very easy for high school students
              (What is the value of 1/2+1/3?) and 10 being very difficult (How
              many factors does 100029996 have?)
              <br />
              <br />
              Multiple Choice questions begin at a difficulty of 1 and go up to
              around 7, while Numeric Response questions begin at a difficulty
              of 3 and go up to around 10. During the Math Battles, participants
              will tackle four very hard problems (7-10) and present their best
              attempt at constructing a solution. But don't be discouraged by
              the high difficulty: the problems are designed so that students
              will not always be able to solve them!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <PageHeader
        title="Contests"
        subtitle="Participate in mathematics competitions, access past contest materials, and practice with our quiz system."
        backgroundImage="https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=1920&h=600&fit=crop"
      />

      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-8 rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  Contest Sections
                </h3>
                <div className="space-y-2">
                  <Button
                    variant={activeSection === "upcoming" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveSection("upcoming");
                      setQuizStarted(false);
                    }}
                  >
                    Upcoming Contests
                  </Button>
                  <Button
                    variant={activeSection === "past" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveSection("past");
                      setQuizStarted(false);
                    }}
                  >
                    Past Contests
                  </Button>
                  <Button
                    variant={activeSection === "practice" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveSection("practice");
                      setQuizStarted(false);
                    }}
                  >
                    Are You Ready?
                  </Button>
                  <Button
                    variant={activeSection === "about" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveSection("about");
                      setQuizStarted(false);
                    }}
                  >
                    About CHSMC
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="rounded-lg bg-white p-8 shadow-md">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contests;
