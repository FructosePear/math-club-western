import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import teamMembers from "@/data/teamMembers.json";

const TeamSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-blue-600">
            Who are we!?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Our team extends across multiple high schools in Calgary! See below
            who the organizers behind our fun mathematics events are:
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card
              key={member.name}
              className="transition-shadow duration-300 hover:shadow-lg"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  {member.image &&
                  member.image !== "" &&
                  member.image !== "/placeholder.svg" ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <img
                      src="https://live.staticflickr.com/65535/54710883758_df5e40760b_b.jpg"
                      alt={member.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  )}
                </div>
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <CardDescription className="font-semibold text-blue-600">
                  {member.position}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  {member.description}
                </p>
                {/* Credentials block rendered as a Card */}
                <div className="mt-4 flex justify-center">
                  <Card className="w-full max-w-xs border-blue-200 bg-blue-50">
                    <CardHeader className="px-4 py-2">
                      <CardTitle className="mb-1 text-sm font-semibold text-blue-700">
                        Credentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                      <ul className="list-inside list-disc text-xs text-blue-900">
                        {member.credentials &&
                          member.credentials.map((cred, idx) => (
                            <li key={idx}>{cred}</li>
                          ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
