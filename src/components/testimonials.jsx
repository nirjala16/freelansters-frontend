import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      content: "This platform helped me find my dream job in just a few weeks!",
      avatar: "https://picsum.photos/800?random=1",
      rating: 5,
    },
    {
      name: "Michael Kim",
      role: "Software Engineer",
      content: "The job search process was seamless, and I landed a great role.",
      avatar: "https://picsum.photos/800?random=2",
      rating: 5,
    },
    {
      name: "Emily Taylor",
      role: "UI Designer",
      content: "Highly recommend this platform for freelancers and job seekers.",
      avatar: "https://picsum.photos/800?random=3",
      rating: 5,
    },
  ];

  return (
    <section className="container px-4 py-16 md:px-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900">What Our Users Say</h2>
        <p className="mt-4 text-gray-600">Hear from professionals who have used our platform.</p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-gray-600">{testimonial.content}</p>
              <div className="mt-6 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}