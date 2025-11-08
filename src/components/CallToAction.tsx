import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-6 text-4xl font-bold">
          Ready to Begin Your Mathematical Journey?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl">
          Join our community of passionate mathematics students and unlock your
          potential.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/quiz">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Take Quiz
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-blue-600 hover:bg-gray-100 hover:text-blue-600"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
