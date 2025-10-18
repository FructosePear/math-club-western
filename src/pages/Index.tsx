import Header from "@/components/Header";
import Hero from "@/components/Hero";
import RecentEvents from "@/components/RecentEvents";
import ProgramsSection from "@/components/ProgramsSection";
import Features from "@/components/Features";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <div className="relative">
        <Header />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50">
          <Hero />
        </div>

        {/* Gradient Divider */}
        <div className="h-24 bg-gradient-to-b from-white to-white" />

        {/* Recent Events Section */}
        <div className="bg-white">
          <RecentEvents />
        </div>

        {/* Gradient Divider */}
        <div className="h-24 bg-gradient-to-b from-white to-gray-50" />

        {/* Programs Section (NOT CURRENTLY USED) */}
        <div className="bg-gray-50">{/* <ProgramsSection /> */}</div>

        {/* Gradient Divider (NOT CURRENTLY USED) */}
        {/* <div className="h-24 bg-gradient-to-b from-gray-50 to-blue-50" /> */}

        {/* Features Section (NOT USED) */}
        <div className="bg-blue-50">{/* <Features /> */}</div>

        {/* Gradient Divider */}
        <div className="to-purple-150 h-12 bg-gradient-to-b from-blue-50" />

        {/* Call to Action */}
        <CallToAction />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;
