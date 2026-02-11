import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Code,
  CreditCard,
  Edit3,
  Globe,
  Headphones,
  MessageSquare,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import heroImage from "../assets/hero-image.svg";
import HeroSection from "./heroSection";
import { Link } from "react-router";
export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-background to-background">
      {/* Hero Section */}
      <HeroSection heroImage={heroImage} />

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-lg font-medium text-muted-foreground">
              Trusted by leading companies worldwide
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={`https://picsum.photos/seed/picsum/20${i}/30${i}`}
                  alt={`Company logo ${i}`}
                  className="h-8 md:h-10 w-auto rounded-lg"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge
              className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              variant="secondary"
            >
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How Freelansters Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Our streamlined process connects you with the perfect match for
              your project needs in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Post a Job",
                description:
                  "Describe your project and the skills required for successful completion.",
                icon: Briefcase,
                color: "from-purple-600 to-indigo-600",
              },
              {
                step: "02",
                title: "Get Proposals",
                description:
                  "Receive detailed proposals from qualified freelancers within hours.",
                icon: MessageSquare,
                color: "from-indigo-600 to-blue-600",
              },
              {
                step: "03",
                title: "Hire the Best",
                description:
                  "Review profiles, portfolios and select the perfect match for your project.",
                icon: Users,
                color: "from-blue-600 to-cyan-600",
              },
              {
                step: "04",
                title: "Complete Project",
                description:
                  "Collaborate efficiently and get your project delivered on time.",
                icon: CheckCircle,
                color: "from-cyan-600 to-teal-600",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`}
                />

                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold text-gray-200 dark:text-gray-700">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section
        id="categories"
        className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge
              className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              variant="secondary"
            >
              Explore Categories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Top Freelancing Categories
            </h2>
            <p className="text-lg text-muted-foreground">
              Browse our most popular categories where top talent and clients
              connect for exceptional project outcomes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Web Development",
                description:
                  "Expert developers for websites, web apps, and e-commerce solutions.",
                icon: Code,
                jobs: 1240,
              },
              {
                title: "UI/UX Design",
                description:
                  "Creative designers crafting beautiful, intuitive user experiences.",
                icon: Edit3,
                jobs: 860,
              },
              {
                title: "Digital Marketing",
                description:
                  "Strategic marketers driving growth and engagement for businesses.",
                icon: TrendingUp,
                jobs: 750,
              },
              {
                title: "Content Writing",
                description:
                  "Skilled writers creating compelling content that converts.",
                icon: Edit3,
                jobs: 920,
              },
              {
                title: "Mobile Development",
                description:
                  "App developers building innovative iOS and Android applications.",
                icon: Globe,
                jobs: 680,
              },
              {
                title: "Customer Support",
                description:
                  "Dedicated professionals providing exceptional customer service.",
                icon: Headphones,
                jobs: 540,
              },
            ].map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.jobs} jobs
                  </Badge>
                </div>

                <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {category.description}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 dark:text-purple-400 p-0 hover:bg-transparent"
                >
                  Explore Category
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Freelansters Section */}
      <section id="why-us" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge
              className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              variant="secondary"
            >
              Our Advantage
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose Freelansters?
            </h2>
            <p className="text-lg text-muted-foreground">
              Weve built a platform that prioritizes quality, security, and
              successful outcomes for both clients and freelancers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Professionals",
                description:
                  "Every freelancer undergoes a rigorous verification process to ensure top-tier skills and professionalism.",
                icon: CheckCircle,
              },
              {
                title: "Secure Payments",
                description:
                  "Our escrow system ensures that payments are only released when you're completely satisfied with the work.",
                icon: Shield,
              },
              {
                title: "Dedicated Support",
                description:
                  "Our 24/7 support team is always available to help resolve any issues and ensure smooth project completion.",
                icon: Headphones,
              },
              {
                title: "Quality Matching",
                description:
                  "Our intelligent matching system connects you with the most suitable professionals for your specific needs.",
                icon: Users,
              },
              {
                title: "Transparent Pricing",
                description:
                  "No hidden fees or surprises. Our pricing is clear and upfront so you always know what to expect.",
                icon: CreditCard,
              },
              {
                title: "Global Talent Pool",
                description:
                  "Access to skilled professionals from around the world, bringing diverse perspectives to your projects.",
                icon: Globe,
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge
              className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              variant="secondary"
            >
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear from clients and freelancers who have achieved exceptional
              results through our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Freelansters helped me find the perfect developer for my startup. The quality of talent and the ease of use is unmatched.",
                name: "Sarah Johnson",
                title: "Founder, TechStart",
                image: "/placeholder.svg?height=100&width=100",
              },
              {
                quote:
                  "As a freelancer, I've doubled my client base and increased my income significantly since joining Freelansters.",
                name: "Michael Chen",
                title: "UI/UX Designer",
                image: "/placeholder.svg?height=100&width=100",
              },
              {
                quote:
                  "The verification process ensures that we only work with top professionals. Every project has been delivered on time and exceeded expectations.",
                name: "Emily Rodriguez",
                title: "Marketing Director, GrowthCo",
                image: "/placeholder.svg?height=100&width=100",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 italic">
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-background to-background dark:from-purple-950/20" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl border border-purple-100 dark:border-purple-900/30 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge
                className="mb-6 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                variant="secondary"
              >
                Get Started Today
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Work Experience?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of clients and freelancers who are already
                experiencing the future of work. Sign up today and discover the
                Freelansters difference.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/freelancers">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full"
                  >
                    Hire Top Talent
                  </Button>
                </Link>
                <Link to="/browseJobs">
                  <Button size="lg" variant="outline" className="rounded-full">
                    Start Freelancing
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
