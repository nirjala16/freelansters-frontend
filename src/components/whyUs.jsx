import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Globe, Award } from "lucide-react";

export function WhyUs() {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      title: "Secure Platform",
      description: "We ensure secure transactions and data protection for all users.",
    },
    {
      icon: <Users className="h-6 w-6 text-green-500" />,
      title: "Top Companies",
      description: "Work with leading companies from around the world.",
    },
    {
      icon: <Globe className="h-6 w-6 text-purple-500" />,
      title: "Global Opportunities",
      description: "Access job opportunities from international markets.",
    },
    {
      icon: <Award className="h-6 w-6 text-yellow-500" />,
      title: "Top Talent",
      description: "Hire or work with the best talent in the industry.",
    },
  ];

  return (
    <section className="container px-4 py-16 md:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 lg:order-1">
          <div className="relative h-[500px] w-full overflow-hidden rounded-2xl shadow-lg">
            <img
              src="https://picsum.photos/800?random=6"
              alt="Professional working"
              className="object-cover"
            />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-4xl font-bold text-gray-900">Why Choose Us</h2>
          <p className="mt-4 text-gray-600">
            Discover why thousands of professionals and companies trust our platform.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="border border-gray-200 shadow-sm hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-gray-100 p-3">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}