import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://i.ibb.co/rGkKgVJZ/IMG-3361.jpg')",
        }}
      />

      {/* Gradient Overlay */}

      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-700/85 to-blue-800/90 opacity-0" />

      {/* Fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white" />

      <div
        className={`container relative mx-auto px-4 text-center text-white transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h1 className="mb-6 text-5xl font-bold">
          Mathematics doesn't have to be silent.
        </h1>
        <p className="mx-auto mb-12 max-w-3xl text-xl">
          That's why our cross-Calgary high school Math Clubs coalition is
          dedicated to giving mathematics - as well as its students - a voice.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/problem-of-the-week">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-blue-600 hover:bg-gray-100 hover:text-blue-600"
            >
              Weekly POTW
            </Button>
          </Link>
          <Link to="/about">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Who are we?
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
