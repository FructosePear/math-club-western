import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Footer from "@/components/Footer";

const Contact = () => {
  const contactInfo = [
    {
      title: "Email",
      value: "[no email yet]",
      icon: Mail,
      description: "Send us an email for general inquiries",
    },
    {
      title: "Phone",
      value: "[no phone yet]",
      icon: Phone,
      description: "Call us during office hours",
    },
    {
      title: "Location",
      value: "Calgary, Alberta",
      icon: MapPin,
      description: "N/A",
    },
    {
      title: "Office Hours",
      value: "[no hours yet]",
      icon: Clock,
      description: "Availability",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-6 text-5xl font-bold text-gray-800">
              Contact Us
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Get in touch with the Calgary High School Math Club. We'd love to
              hear from you!
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {contactInfo.map((info) => {
              const IconComponent = info.icon;
              return (
                <Card
                  key={info.title}
                  className="transition-shadow duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{info.title}</CardTitle>
                        <CardDescription className="text-lg font-semibold text-blue-600">
                          {info.value}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{info.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
