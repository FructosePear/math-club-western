import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, ChevronDown, ChevronUp } from "lucide-react";
import quizData from "@/data/quizQuestions.json";

interface Answer {
  answer: string;
  correct: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
  solution: string;
  difficulty: number;
  image?: string; // Optional image field
}

const QuizGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    // Shuffle questions and answers when component mounts
    const shuffledQuestions = [...quizData].sort(() => Math.random() - 0.5);
    const questionsWithShuffledAnswers = shuffledQuestions.map((q) => ({
      ...q,
      answers: [...q.answers].sort(() => Math.random() - 0.5),
    }));
    setQuestions(questionsWithShuffledAnswers);
    setStartTime(new Date());
  }, []);

  useEffect(() => {
    if (startTime && !quizCompleted) {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, quizCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getElapsedTime = () => {
    if (!startTime) return 0;
    const endTimeToUse = endTime || currentTime;
    return Math.floor((endTimeToUse.getTime() - startTime.getTime()) / 1000);
  };

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (questions[currentQuestion].answers[answerIndex].correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowSolution(false);
    } else {
      setQuizCompleted(true);
      setEndTime(new Date());
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setStartTime(new Date());
    setEndTime(null);
    setShowSolution(false);

    // Reshuffle questions and answers
    const shuffledQuestions = [...quizData].sort(() => Math.random() - 0.5);
    const questionsWithShuffledAnswers = shuffledQuestions.map((q) => ({
      ...q,
      answers: [...q.answers].sort(() => Math.random() - 0.5),
    }));
    setQuestions(questionsWithShuffledAnswers);
  };

  const handleShowSolution = () => {
    setShowSolution(!showSolution);
    // If solution is being shown and no answer has been selected, mark as incorrect and show result
    if (!showSolution && selectedAnswer === null) {
      setShowResult(true);
      setSelectedAnswer(-1); // -1 means no answer selected
    }
  };

  if (questions.length === 0) {
    return <div className="text-center">Loading quiz...</div>;
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const totalTime = getElapsedTime();

    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
          <CardDescription className="text-xl">
            Your final score is: {score} out of {questions.length} ({percentage}
            %)
          </CardDescription>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Timer className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">
              Time: {formatTime(totalTime)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            {percentage >= 90 ? (
              <p className="text-lg text-green-600">
                Wow - impressive! We hope to see you on the podium at our future
                CHSMCs!
              </p>
            ) : percentage >= 40 ? (
              <p className="text-lg text-yellow-600">
                Your skills match up well with past CHSMCs' difficulties. We
                hope to see you there!
              </p>
            ) : (
              <p className="text-lg text-red-600">
                Almost there! Come to the CHSMC to challenge yourself and
                interact with other mathletes and enthusiasts!
              </p>
            )}
          </div>
          <Button onClick={resetQuiz} size="lg">
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const progressValue = ((currentQuestion + 1) / questions.length) * 100;
  const elapsedTime = getElapsedTime();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Score: {score}/{questions.length}
            </span>
          </div>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQ.question}</CardTitle>
          {/* Render image if present */}
          {currentQ.image && (
            <img
              src={currentQ.image}
              alt="Question illustration"
              className="mx-auto my-4 max-h-64 rounded shadow"
            />
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {currentQ.answers.map((answer, index) => (
              <Button
                key={index}
                variant={
                  selectedAnswer === null
                    ? "outline"
                    : answer.correct
                    ? "default"
                    : selectedAnswer === index
                    ? "destructive"
                    : "outline"
                }
                className={`h-auto justify-start p-4 text-left ${
                  selectedAnswer === null ? "hover:bg-blue-50" : ""
                } ${
                  showResult && answer.correct
                    ? "border-green-500 bg-green-100 text-green-700"
                    : ""
                } ${
                  showResult && selectedAnswer === index && !answer.correct
                    ? "border-red-500 bg-red-100 text-red-700"
                    : ""
                }`}
                onClick={() => handleAnswerClick(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="mr-3 font-medium">
                  {String.fromCharCode(65 + index)}.
                </span>
                {answer.answer}
              </Button>
            ))}
          </div>

          {/* Solution Button */}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleShowSolution}
              className="flex items-center gap-2"
            >
              {showSolution ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showSolution ? "Hide Solution" : "Show Solution"}
            </Button>

            {showSolution && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-800">Solution:</h4>
                {/* Show difficulty tag with color based on difficulty */}
                {(() => {
                  const diff = questions[currentQuestion].difficulty;
                  let tagClass = "";
                  let tagText = "";
                  let tooltipText = "";
                  if (diff >= 1 && diff <= 3) {
                    tagClass = "bg-green-200 text-green-800";
                    tagText = "Easy";
                    tooltipText =
                      "This is an entry-level problem that involves simple curricular content.";
                  } else if (diff >= 4 && diff <= 6) {
                    tagClass = "bg-yellow-200 text-yellow-800";
                    tagText = "Medium";
                    tooltipText =
                      "This is a medium-difficulty problem involving some creativity or advanced curricular content.";
                  } else if (diff >= 7 && diff <= 9) {
                    tagClass = "bg-orange-200 text-orange-800";
                    tagText = "Hard";
                    tooltipText =
                      "This is a challenging problem that requires significant creativity and insightfulness to solve.";
                  } else if (diff >= 10) {
                    tagClass = "bg-red-200 text-red-800";
                    tagText = "Very Hard";
                    tooltipText =
                      "This is a test-your-limits problem that is challenging even for those with past experience in math contests.";
                  } else {
                    tagClass = "bg-gray-200 text-gray-800";
                    tagText = "Unknown";
                    tooltipText = "Difficulty information is not available.";
                  }
                  return (
                    <span
                      className={`relative mb-2 inline-block cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${tagClass}`}
                      style={{ transition: "box-shadow 0.2s" }}
                      onMouseEnter={(e) => {
                        // Add shadow on hover
                        (e.target as HTMLElement).style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.18)";
                        const tooltip = document.createElement("div");
                        tooltip.textContent = tooltipText;
                        tooltip.style.position = "fixed";
                        tooltip.style.zIndex = "9999";
                        tooltip.style.background = "#fff";
                        tooltip.style.color = "#222";
                        tooltip.style.border = "1px solid #ccc";
                        tooltip.style.borderRadius = "0.375rem";
                        tooltip.style.padding = "0.5rem 1rem";
                        tooltip.style.fontSize = "0.85rem";
                        tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
                        tooltip.style.pointerEvents = "none";
                        tooltip.id = "difficulty-tooltip";
                        document.body.appendChild(tooltip);
                        const moveTooltip = (ev: MouseEvent) => {
                          tooltip.style.left = `${ev.clientX + 12}px`;
                          tooltip.style.top = `${ev.clientY + 12}px`;
                        };
                        moveTooltip(e as unknown as MouseEvent);
                        window.addEventListener("mousemove", moveTooltip);
                        (e.target as HTMLElement).setAttribute(
                          "data-tooltip-listener",
                          "true"
                        );
                        (e.target as any)._moveTooltip = moveTooltip;
                      }}
                      onMouseLeave={(e) => {
                        // Remove shadow on mouse leave
                        (e.target as HTMLElement).style.boxShadow = "";
                        const tooltip =
                          document.getElementById("difficulty-tooltip");
                        if (tooltip) tooltip.remove();
                        if (
                          (e.target as HTMLElement).getAttribute(
                            "data-tooltip-listener"
                          )
                        ) {
                          window.removeEventListener(
                            "mousemove",
                            (e.target as any)._moveTooltip
                          );
                          (e.target as HTMLElement).removeAttribute(
                            "data-tooltip-listener"
                          );
                        }
                      }}
                    >
                      Difficulty: {diff ?? "N/A"}/10 &mdash; {tagText}
                    </span>
                  );
                })()}
                <p className="mt-2 text-blue-700">
                  {/* Show the correct answer */}
                  The correct answer is:{" "}
                  {
                    questions[currentQuestion].answers.find((a) => a.correct)
                      ?.answer
                  }
                  <br />
                  {/* Show the solution from the JSON */}
                  <em>{questions[currentQuestion].solution}</em>
                </p>
              </div>
            )}

            {showResult && (
              <div className="mt-6 text-center">
                <div className="mb-4">
                  {selectedAnswer !== null &&
                  questions[currentQuestion].answers[selectedAnswer]
                    ?.correct ? (
                    <p className="text-lg font-semibold text-green-600">
                      Correct! Well done!
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-red-600">
                      Incorrect. The correct answer is:{" "}
                      {
                        questions[currentQuestion].answers.find(
                          (a) => a.correct
                        )?.answer
                      }
                    </p>
                  )}
                </div>
                <Button onClick={handleNextQuestion} size="lg">
                  {currentQuestion + 1 < questions.length
                    ? "Next Question"
                    : "Finish Quiz"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizGame;
