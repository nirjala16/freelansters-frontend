import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Palette,  Settings, Terminal, Smartphone, HeadphonesIcon } from 'lucide-react';

export function Categories() {
  const categories = [
    {
      icon: <Palette className="h-6 w-6" />,
      name: "Design",
      count: "2.3k Jobs",
    },
    {
      icon: <HeadphonesIcon className="h-6 w-6" />,
      name: "Customer Service",
      count: "1.8k Jobs",
    },
    {
      icon: <Code className="h-6 w-6" />,
      name: "Development",
      count: "3.2k Jobs",
    },
    {
      icon: <Settings className="h-6 w-6" />,
      name: "Operations",
      count: "1.5k Jobs",
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      name: "Business Development",
      count: "2.1k Jobs",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      name: "Mobile Development",
      count: "1.9k Jobs",
    },
  ];

  return (
    <section className="container px-4 py-16 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Explore by Category</h2>
          <p className="mt-2 text-gray-600">Find the job thats perfect for you.</p>
        </div>
        <Button variant="outline">See All Category</Button>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.name} className="group cursor-pointer transition-all hover:border-primary">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20">
                {category.icon}
              </div>
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
