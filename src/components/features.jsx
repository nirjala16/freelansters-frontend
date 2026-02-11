import { Button } from "@/components/ui/button";

export function Features() {
  return (
    <section className="container px-4 py-16 md:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Text Section */}
        <div>
          <h2 className="text-4xl font-bold text-gray-900">
            Find a Job That Matches Your Skills
          </h2>
          <p className="mt-4 text-gray-600">
            Explore thousands of job opportunities tailored to your expertise. Whether youre a
            designer, developer, or marketer, Freelansters has something for you.
          </p>
          <Button className="mt-8" size="lg">
            Discover Now
          </Button>
        </div>

        {/* Image Section */}
        <div className="relative">
          <div className="relative h-[400px] w-full overflow-hidden rounded-2xl shadow-lg">
            <img
              src="https://picsum.photos/800?random=1"
              alt="Platform features"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 h-48 w-48 rounded-2xl bg-white shadow-lg p-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Senior Product Designer</h4>
              <p className="text-sm text-gray-600">Full Time • Remote</p>
              <Button size="sm" variant="outline">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
