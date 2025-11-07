import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <PageHeader
        title="Our Team"
        subtitle="Take a look! Our vibrant young matheamaticians all have something to share."
        backgroundImage="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=600&fit=crop"
      />
      <div className="py-16">
        <div className="container mx-auto px-4">
          <TeamSection />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
