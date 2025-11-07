import { useEffect, useState } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

const PageHeader = ({
  title,
  subtitle,
  backgroundImage = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=600&fit=crop",
}: PageHeaderProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden py-28">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />

      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90 ${
          backgroundImage ? "opacity-50" : "opacity-100"
        }`}
      />

      {/* Fade to next section - matching background color */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-50" />

      <div
        className={`container relative mx-auto px-4 text-center text-white transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h1 className="mb-6 text-5xl font-display">{title}</h1>
        {subtitle && <p className="mx-auto max-w-3xl text-xl">{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;
