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
        backgroundImage="https://live.staticflickr.com/65535/54907878807_3186698e46_b.jpg"
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
