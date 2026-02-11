import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Companies() {
  const companies = [
    {
      logo: "https://picsum.photos/800?random=1",
      name: "Shopify",
      description: "World's best ecommerce platform",
      jobs: "12 Jobs Available",
    },
    {
      logo: "https://picsum.photos/800?random=2",
      name: "Intercom",
      description: "Customer messaging platform",
      jobs: "8 Jobs Available",
    },
    {
      logo: "https://picsum.photos/800?random=3",
      name: "Mailchimp",
      description: "Marketing automation platform",
      jobs: "6 Jobs Available",
    },
    {
      logo: "https://picsum.photos/800?random=4",
      name: "Telegram",
      description: "Messaging and communications",
      jobs: "4 Jobs Available",
    },
    {
      logo: "https://picsum.photos/800?random=5",
      name: "Airbnb",
      description: "Online marketplace for lodging",
      jobs: "10 Jobs Available",
    },
    {
      logo: "https://picsum.photos/800?random=6",
      name: "Meta",
      description: "Social technology company",
      jobs: "15 Jobs Available",
    },
  ];

  return (
    <section className="container px-4 py-16 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Browse by Popular Companies</h2>
          <p className="mt-2 text-gray-600">
            Discover jobs from top companies
          </p>
        </div>
        <Button variant="outline">See All Company</Button>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.name} className="group cursor-pointer transition-all hover:border-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-lg">
                  <img
                    src={company.logo}
                    alt={company.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">{company.jobs}</span>
                <Button variant="ghost" size="sm">
                  View Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
