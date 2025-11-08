import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Brain, Trophy } from "lucide-react";

interface QuizStartProps {
  onStart: () => void;
}

const QuizStart = ({ onStart }: QuizStartProps) => {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="mb-2 text-3xl">
            Let's see if you're ready!
          </CardTitle>
          <CardDescription className="text-lg">
            Are you in MIDDLE SCHOOL and would like to participate in the CHSMC?
            Although we encourage middle schoolers to attend, problems require
            an understanding of Grade 10 content. We recommend trying this short
            practice quiz with past CHSMC questions to see if you're ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-800">
              Quiz Instructions:
            </h4>
            <ul className="space-y-1 text-left text-blue-700">
              <li>• There are ten questions of random difficulty</li>
              <li>• Each question has 5 multiple choice options</li>
              <li>
                • Click the solution button to reveal the correct answer,
                explanation, and difficulty rating
              </li>
            </ul>
          </div>

          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-white hover:from-blue-700 hover:to-purple-700"
          >
            Start Practice Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizStart;
