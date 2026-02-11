import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Briefcase, FileText } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus className="h-8 w-8 text-blue-500" />,
      title: "Create an Account",
      description: "Sign up to access thousands of job opportunities.",
      color: "bg-blue-100",
    },
    {
      icon: <Briefcase className="h-8 w-8 text-emerald-500" />,
      title: "Apply for Jobs",
      description: "Find and apply for jobs that match your skills.",
      color: "bg-emerald-100",
    },
    {
      icon: <FileText className="h-8 w-8 text-violet-500" />,
      title: "Build Your Portfolio",
      description: "Showcase your skills and experience to stand out.",
      color: "bg-violet-100",
    },
  ];

  return (
    <section className="container px-4 py-16 md:px-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
        <p className="mt-4 text-gray-600">Follow these simple steps to get started.</p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className={`mb-4 rounded-full p-3 ${step.color}`}>{step.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}