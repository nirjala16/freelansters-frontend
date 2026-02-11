import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Globe, Briefcase } from "lucide-react";
import { Link } from "react-router";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Freelansters</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connecting talented professionals with exciting opportunities
          worldwide
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg mb-6">
            At Freelansters, weare on a mission to revolutionize the way people
            find work and companies discover talent. We believe that the right
            job can change a persons life, and the right talent can transform a
            business.
          </p>
          <p className="text-lg mb-6">
            Our platform leverages cutting-edge technology to create meaningful
            connections between skilled professionals and innovative companies
            across the globe.
          </p>
          <Button asChild size="lg">
            <Link href="/jobs">Explore Opportunities</Link>
          </Button>
        </div>
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <img
            src="https://github.com/shadcn.png"
            alt="Team collaboration"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Why Choose Freelansters?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <CheckCircle className="h-10 w-10 text-primary" />,
              title: "Quality Opportunities",
              description: "Curated job listings from top companies worldwide",
            },
            {
              icon: <Users className="h-10 w-10 text-primary" />,
              title: "Diverse Talent Pool",
              description:
                "Access to a global network of skilled professionals",
            },
            {
              icon: <Globe className="h-10 w-10 text-primary" />,
              title: "Global Reach",
              description:
                "Connect with opportunities and talent from around the world",
            },
            {
              icon: <Briefcase className="h-10 w-10 text-primary" />,
              title: "Career Growth",
              description:
                "Resources and tools to help you advance your career",
            },
          ].map((feature, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  {feature.title}
                </h3>
                <p className="text-center text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-center mb-8">Our Story</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <img
              src="https://github.com/shadcn.png"
              alt="Freelansters founders"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-lg mb-4">
              Founded in 2023, Freelansters was born from a simple idea: to create
              a platform that truly understands the needs of both job seekers
              and employers in the digital age.
            </p>
            <p className="text-lg mb-4">
              Our founders, experienced professionals from the tech and
              recruitment industries, saw an opportunity to leverage AI and data
              analytics to make job matching more efficient and effective.
            </p>
            <p className="text-lg">
              Today, Freelansters is trusted by thousands of companies and
              professionals worldwide, facilitating connections that drive
              careers and businesses forward.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-semibold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Whether you are looking for your next career move or searching for top
          talent, Freelansters is here to help you succeed.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
