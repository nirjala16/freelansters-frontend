import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import userApi from "../api";
import { useEffect, useState } from "react";
// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Icons
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Code,
  DollarSign,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  ThumbsUp,
  Users,
} from "lucide-react";

// Chat Component
// import ChatContainer from "../components/chat/chatContainer"

const UserProfileView = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [showContactOptions, setShowContactOptions] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await userApi.get(`/users/${userId}`);
        const data = response.data;

        if (data.success) {
          setUser(data.user);

          // If user is a client, fetch their posted jobs
          if (data.user.role === "client") {
            try {
              const jobsResponse = await userApi.get(`/jobs/creator/${userId}`);
              if (jobsResponse.data.success) {
                setPostedJobs(jobsResponse.data.jobs);
              }
            } catch (error) {
              console.error("Error fetching posted jobs:", error);
            }
          }

          // Fetch reviewer info for each review
          if (
            data.user.ratingsAndReviews &&
            data.user.ratingsAndReviews.length > 0
          ) {
            const reviewerPromises = data.user.ratingsAndReviews.map((review) =>
              userApi.get(`/users/${review.reviewer}`).then((res) => ({
                reviewerId: review.reviewer,
                reviewerData: res.data.user,
              }))
            );

            const reviewerResults = await Promise.all(reviewerPromises);
            const reviewersMap = reviewerResults.reduce(
              (acc, { reviewerId, reviewerData }) => {
                acc[reviewerId] = reviewerData;
                return acc;
              },
              {}
            );

            setReviewers(reviewersMap);
          }
        } else {
          setError("Failed to fetch user data");
        }
      } catch (error) {
        setError("An error occurred while fetching user data: " + error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <UserProfileSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Profile
            </h3>
            <p>{error || "User not found"}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const {
    name,
    email,
    phoneNumber,
    profilePic,
    role,
    bio,
    skills = [],
    portfolio = [],
    dateJoined,
    location,
    appliedJobs = [],
    ratingsAndReviews = [],
    activeProjects = [],
  } = user;

  const isFreelancer = role === "freelancer";
  const jobsToDisplay = isFreelancer
    ? []
    : postedJobs.length > 0
    ? postedJobs
    : user.postedJobs || [];

  // Calculate average rating
  const averageRating =
    ratingsAndReviews.length > 0
      ? (
          ratingsAndReviews.reduce((sum, review) => sum + review.rating, 0) /
          ratingsAndReviews.length
        ).toFixed(1)
      : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Header with background */}
      <div className="relative h-48 md:h-64 overflow-hidden z-0">
        {/* Blurred profile picture background */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl brightness-50 scale-110"
          style={{
            backgroundImage: `url(${
              profilePic ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${name || "User"}`
            })`,
          }}
        ></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 text-white relative z-10">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardHeader className="pb-0 pt-6 px-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                      <AvatarImage
                        src={
                          profilePic ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
                        }
                        alt={name}
                      />
                      <AvatarFallback className="text-2xl font-bold">
                        {name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="mt-4 space-y-1.5">
                      <CardTitle className="text-2xl font-bold">
                        {name}
                      </CardTitle>

                      <div className="flex items-center justify-center gap-2">
                        <Badge className="capitalize bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                          {role}
                        </Badge>

                        {location && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <MapPin className="h-3 w-3" />
                            {location}
                          </Badge>
                        )}
                      </div>

                      {ratingsAndReviews.length > 0 && (
                        <div className="flex items-center justify-center mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(averageRating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : i < averageRating
                                    ? "text-yellow-400 fill-yellow-400 opacity-50"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium">
                              {averageRating} ({ratingsAndReviews.length})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{email}</span>
                      </div>

                      {phoneNumber && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {phoneNumber}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Joined {format(new Date(dateJoined), "MMMM yyyy")}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-2">
                      {isFreelancer ? (
                        <>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <Briefcase className="h-5 w-5 text-purple-500 mb-1" />
                              <span className="text-lg font-semibold">
                                {appliedJobs?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Jobs Applied
                              </span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <GraduationCap className="h-5 w-5 text-purple-500 mb-1" />
                              <span className="text-lg font-semibold">
                                {skills?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Skills
                              </span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <Award className="h-5 w-5 text-purple-500 mb-1" />
                              <span className="text-lg font-semibold">
                                {activeProjects?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Active Projects
                              </span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <Star className="h-5 w-5 text-purple-500 mb-1" />
                              <span className="text-lg font-semibold">
                                {ratingsAndReviews?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Reviews
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <Briefcase className="h-5 w-5 text-purple-500 mb-1" />
                              <span className="text-lg font-semibold">
                                {jobsToDisplay?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Jobs Posted
                              </span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <Users className="h-5 w-5 text-purple-500 mb-1" />
                              <span className="text-lg font-semibold">
                                {activeProjects?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Active Projects
                              </span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <CheckCircle className="h-5 w-5 text-purple-500 mb-1" />
                              <span className="text-lg font-semibold">
                                {jobsToDisplay.filter(
                                  (job) => job.status === "completed"
                                )?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Completed
                              </span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex flex-col items-center">
                              <ThumbsUp className="h-5 w-5 text-purple-500 mb-1" />
                              <span className="text-lg font-semibold">
                                {ratingsAndReviews?.length || 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Reviews
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <Separator />

                    {/* Bio */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">About</h3>
                      <p className="text-sm text-muted-foreground">
                        {bio || `No bio available for this ${role}.`}
                      </p>
                    </div>

                    {/* Skills for freelancers */}
                    {isFreelancer && skills && skills.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-medium mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="px-6 py-4 bg-muted/30">
                  <div className="w-full space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      onClick={() => setShowContactOptions(!showContactOptions)}
                    >
                      {isFreelancer ? "Hire Freelancer" : "Contact Client"}
                    </Button>

                    <AnimatePresence>
                      {showContactOptions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2 pt-2"
                        >
                          <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Send Message
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <Phone className="h-4 w-4" />
                            Request Call
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Tabs
                value={activeTab}
                defaultValue="overview"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <Card className="shadow-lg border-0 mb-8">
                  <CardHeader className="px-6 py-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      {isFreelancer ? (
                        <>
                          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                          <TabsTrigger value="projects">Projects</TabsTrigger>
                          <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        </>
                      ) : (
                        <>
                          <TabsTrigger value="jobs">Posted Jobs</TabsTrigger>
                          <TabsTrigger value="projects">Projects</TabsTrigger>
                          <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        </>
                      )}
                    </TabsList>
                  </CardHeader>
                </Card>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-0">
                  <Card className="shadow-lg border-0">
                    <CardHeader className="px-6 py-5">
                      <CardTitle className="text-xl">
                        {isFreelancer
                          ? "Freelancer Overview"
                          : "Client Overview"}
                      </CardTitle>
                      <CardDescription>
                        {isFreelancer
                          ? "Professional profile and work history"
                          : "Client information and job history"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6">
                      <div className="space-y-8">
                        {/* Summary Section */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">Summary</h3>
                          <p className="text-muted-foreground">
                            {bio ||
                              `No detailed information available for this ${role}.`}
                          </p>
                        </div>

                        {/* Active Projects */}
                        {activeProjects && activeProjects.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium mb-4">
                              Active Projects
                            </h3>
                            <div className="grid gap-4">
                              {activeProjects.slice(0, 3).map((project) => (
                                <Card
                                  key={project._id}
                                  className="overflow-hidden"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                      <div className="space-y-1">
                                        <h4 className="font-semibold">
                                          {project.job.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {project.status}
                                          </Badge>
                                          <span>•</span>
                                          <span>{project.job.jobCategory}</span>
                                          <span>•</span>
                                          <span>
                                            {formatCurrency(project.job.budget)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {isFreelancer ? (
                                          <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage
                                                src={
                                                  project.client.profilePic ||
                                                  "/placeholder.svg"
                                                }
                                                alt={project.client.name}
                                              />
                                              <AvatarFallback>
                                                {project.client.name[0]}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="text-sm">
                                              <p className="font-medium">
                                                {project.client.name}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                Client
                                              </p>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage
                                                src={
                                                  project.freelancer
                                                    .profilePic ||
                                                  "/placeholder.svg"
                                                }
                                                alt={project.freelancer.name}
                                              />
                                              <AvatarFallback>
                                                {project.freelancer.name[0]}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="text-sm">
                                              <p className="font-medium">
                                                {project.freelancer.name}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                Freelancer
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                        <Button variant="outline" size="sm">
                                          View Details
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}

                              {activeProjects.length > 3 && (
                                <Button variant="outline" className="mt-2">
                                  View All Projects
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recent Reviews */}
                        {ratingsAndReviews && ratingsAndReviews.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium mb-4">
                              Recent Reviews
                            </h3>
                            <div className="grid gap-4">
                              {ratingsAndReviews.slice(0, 2).map((review) => {
                                const reviewer = reviewers[review.reviewer];
                                return (
                                  <Card
                                    key={review._id}
                                    className="overflow-hidden"
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start gap-4">
                                        <Avatar className="h-10 w-10">
                                          <AvatarImage
                                            src={
                                              reviewer?.profilePic ||
                                              `https://api.dicebear.com/7.x/initials/svg?seed=${
                                                reviewer?.name ||
                                                "/placeholder.svg"
                                              }`
                                            }
                                            alt={reviewer?.name || "Reviewer"}
                                          />
                                          <AvatarFallback>
                                            {reviewer?.name
                                              ?.charAt(0)
                                              .toUpperCase() || "R"}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="font-medium">
                                                {reviewer?.name || "Anonymous"}
                                              </p>
                                              <div className="flex items-center gap-1 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={`h-3.5 w-3.5 ${
                                                      i < review.rating
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-gray-300 dark:text-gray-600"
                                                    }`}
                                                  />
                                                ))}
                                                <span className="ml-1 text-xs text-muted-foreground">
                                                  {format(
                                                    new Date(review.date),
                                                    "MMM d, yyyy"
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <p className="text-sm mt-2">
                                            {review.review}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}

                              {ratingsAndReviews.length > 2 && (
                                <Button
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => setActiveTab("reviews")}
                                >
                                  View All Reviews
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* For Freelancers - Skills */}
                        {isFreelancer && skills && skills.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium mb-4">
                              Skills & Expertise
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {skills.map((skill, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>{skill}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* For Clients - Recent Jobs */}
                        {!isFreelancer &&
                          jobsToDisplay &&
                          jobsToDisplay.length > 0 && (
                            <div>
                              <h3 className="text-lg font-medium mb-4">
                                Recent Job Postings
                              </h3>
                              <div className="grid gap-4">
                                {jobsToDisplay.slice(0, 3).map((job) => (
                                  <Card
                                    key={job._id}
                                    className="overflow-hidden"
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                          <h4 className="font-semibold">
                                            {job.title}
                                          </h4>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Badge
                                              className={getStatusColor(
                                                job.status
                                              )}
                                            >
                                              {job.status}
                                            </Badge>
                                            <span>•</span>
                                            <span>{job.jobCategory}</span>
                                            <span>•</span>
                                            <span>
                                              {formatCurrency(job.budget)}
                                            </span>
                                          </div>
                                        </div>
                                        <Link to={`/job/${job._id}`}>
                                          <Button variant="outline" size="sm">
                                            View Job
                                          </Button>
                                        </Link>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}

                                {jobsToDisplay.length > 3 && (
                                  <Button
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => setActiveTab("jobs")}
                                  >
                                    View All Jobs
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Portfolio Tab (Freelancers) */}
                {isFreelancer && (
                  <TabsContent value="portfolio" className="mt-0">
                    <Card className="shadow-lg border-0">
                      <CardHeader className="px-6 py-5">
                        <CardTitle className="text-xl">Portfolio</CardTitle>
                        <CardDescription>
                          Showcase of previous work and projects
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        {portfolio && portfolio.length > 0 ? (
                          <div className="grid sm:grid-cols-2 gap-6">
                            {portfolio.map((item) => (
                              <motion.div
                                key={item._id}
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                                  <CardContent className="p-0">
                                    <div className="h-40 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                                      <Code className="h-12 w-12 text-purple-500 opacity-50" />
                                    </div>
                                    <div className="p-4">
                                      <h3 className="font-semibold text-lg mb-2">
                                        {item.title}
                                      </h3>
                                      <p className="text-sm text-muted-foreground mb-4">
                                        {item.description}
                                      </p>
                                      <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        View Project
                                      </a>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                            <h3 className="text-lg font-medium mb-2">
                              No Portfolio Items
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              This freelancer hasn not added any portfolio items
                              yet.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Jobs Tab (Clients) */}
                {!isFreelancer && (
                  <TabsContent value="jobs" className="mt-0">
                    <Card className="shadow-lg border-0">
                      <CardHeader className="px-6 py-5">
                        <CardTitle className="text-xl">Posted Jobs</CardTitle>
                        <CardDescription>
                          Jobs posted by this client
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        {jobsToDisplay && jobsToDisplay.length > 0 ? (
                          <div className="grid gap-4">
                            {jobsToDisplay.map((job) => (
                              <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                  <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <h3 className="font-semibold text-lg">
                                            {job.title}
                                          </h3>
                                          <Badge
                                            className={getStatusColor(
                                              job.status
                                            )}
                                          >
                                            {job.status}
                                          </Badge>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                          {job.description}
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-sm mb-4">
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                            <DollarSign className="h-4 w-4" />
                                            <span>
                                              {formatCurrency(job.budget)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                            <Briefcase className="h-4 w-4" />
                                            <span>{job.jobType}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{job.jobLocation}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                              {new Date(
                                                job.deadline
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                          {job.skillsRequired &&
                                            job.skillsRequired
                                              .slice(0, 5)
                                              .map((skill, index) => (
                                                <Badge
                                                  key={index}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {skill}
                                                </Badge>
                                              ))}
                                          {job.skillsRequired &&
                                            job.skillsRequired.length > 5 && (
                                              <Badge
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                +{job.skillsRequired.length - 5}{" "}
                                                more
                                              </Badge>
                                            )}
                                        </div>
                                      </div>

                                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                                        <div className="text-center md:text-right">
                                          <div className="text-sm font-medium">
                                            {job.proposalsReceived?.length || 0}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            Proposals
                                          </div>
                                        </div>

                                        <Link to={`/job/${job._id}`}>
                                          <Button variant="outline" size="sm">
                                            View Details
                                          </Button>
                                        </Link>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                            <h3 className="text-lg font-medium mb-2">
                              No Jobs Posted
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              This client hasn not posted any jobs yet.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Projects Tab */}
                <TabsContent value="projects" className="mt-0">
                  <Card className="shadow-lg border-0">
                    <CardHeader className="px-6 py-5">
                      <CardTitle className="text-xl">Active Projects</CardTitle>
                      <CardDescription>
                        {isFreelancer
                          ? "Current projects this freelancer is working on"
                          : "Current projects this client has in progress"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      {activeProjects && activeProjects.length > 0 ? (
                        <div className="grid gap-6">
                          {activeProjects.map((project) => (
                            <Card key={project._id} className="overflow-hidden">
                              <CardContent className="p-5">
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                      <h3 className="font-semibold text-lg">
                                        {project.job.title}
                                      </h3>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                          {project.status}
                                        </Badge>
                                        <span>•</span>
                                        <span>{project.job.jobCategory}</span>
                                        <span>•</span>
                                        <span>{project.job.jobType}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <div className="text-lg font-semibold">
                                          {formatCurrency(project.job.budget)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {project.paymentStatus}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span>Progress</span>
                                      <span>{project.progress || 0}%</span>
                                    </div>
                                    <Progress
                                      value={project.progress || 0}
                                      className="h-2"
                                    />
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                                    <div className="flex items-center gap-3">
                                      {isFreelancer ? (
                                        <>
                                          <Avatar className="h-10 w-10">
                                            <AvatarImage
                                              src={
                                                project.client.profilePic ||
                                                "/placeholder.svg"
                                              }
                                              alt={project.client.name}
                                            />
                                            <AvatarFallback>
                                              {project.client.name[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium">
                                              {project.client.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Client
                                            </p>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <Avatar className="h-10 w-10">
                                            <AvatarImage
                                              src={
                                                project.freelancer.profilePic ||
                                                "/placeholder.svg"
                                              }
                                              alt={project.freelancer.name}
                                            />
                                            <AvatarFallback>
                                              {project.freelancer.name[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium">
                                              {project.freelancer.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Freelancer
                                            </p>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-none"
                                      >
                                        Message
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="flex-1 sm:flex-none"
                                      >
                                        View Project
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">
                            No Active Projects
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            {isFreelancer
                              ? "This freelancer doesn't have any active projects at the moment."
                              : "This client doesn't have any active projects at the moment."}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-0">
                  <Card className="shadow-lg border-0">
                    <CardHeader className="px-6 py-5">
                      <CardTitle className="text-xl">
                        Reviews & Ratings
                      </CardTitle>
                      <CardDescription>
                        Feedback from previous{" "}
                        {isFreelancer ? "clients" : "freelancers"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      {ratingsAndReviews && ratingsAndReviews.length > 0 ? (
                        <div className="space-y-6">
                          <div className="flex flex-col md:flex-row gap-6 items-center p-6 bg-muted/30 rounded-lg">
                            <div className="text-center md:text-left md:border-r md:pr-6 md:border-border">
                              <div className="text-4xl font-bold text-purple-600">
                                {averageRating}
                              </div>
                              <div className="flex items-center justify-center md:justify-start mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-5 w-5 ${
                                      i < Math.floor(averageRating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : i < averageRating
                                        ? "text-yellow-400 fill-yellow-400 opacity-50"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Based on {ratingsAndReviews.length} reviews
                              </div>
                            </div>

                            <div className="flex-1 w-full">
                              <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                  const count = ratingsAndReviews.filter(
                                    (r) => r.rating === rating
                                  ).length;
                                  const percentage =
                                    (count / ratingsAndReviews.length) * 100;

                                  return (
                                    <div
                                      key={rating}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="flex items-center gap-1 w-12">
                                        <span>{rating}</span>
                                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      <div className="w-12 text-right text-sm text-muted-foreground">
                                        {count}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {ratingsAndReviews.map((review) => {
                              const reviewer = reviewers[review.reviewer];
                              return (
                                <Card
                                  key={review._id}
                                  className="overflow-hidden"
                                >
                                  <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage
                                          src={
                                            reviewer?.profilePic ||
                                            `https://api.dicebear.com/7.x/initials/svg?seed=${
                                              reviewer?.name ||
                                              "/placeholder.svg"
                                            }`
                                          }
                                          alt={reviewer?.name || "Reviewer"}
                                        />
                                        <AvatarFallback>
                                          {reviewer?.name
                                            ?.charAt(0)
                                            .toUpperCase() || "R"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                          <div>
                                            <p className="font-medium">
                                              {reviewer?.name || "Anonymous"}
                                            </p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              {[...Array(5)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`h-4 w-4 ${
                                                    i < review.rating
                                                      ? "text-yellow-400 fill-yellow-400"
                                                      : "text-gray-300 dark:text-gray-600"
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {format(
                                              new Date(review.date),
                                              "MMMM d, yyyy"
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-sm mt-3">
                                          {review.review}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                          <h3 className="text-lg font-medium mb-2">
                            No Reviews Yet
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            This {isFreelancer ? "freelancer" : "client"} hasn
                            not received any reviews yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      {/* <ChatContainer /> */}
    </div>
  );
};

const UserProfileSkeleton = () => (
  <div className="bg-background min-h-screen pb-16">
    {/* Header with background */}
    <div className="relative h-48 md:h-64 overflow-hidden z-0">
      <div className="absolute inset-0 bg-gray-400 dark:bg-gray-700"></div>
    </div>

    <div className="container mx-auto px-4 -mt-24 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="pb-0 pt-6 px-6">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="mt-4 space-y-2 w-full">
                  <Skeleton className="h-6 w-40 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="text-center">
                    <Skeleton className="h-10 w-10 rounded-full mx-auto mb-1" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto mt-1" />
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-10 w-10 rounded-full mx-auto mb-1" />
                    <Skeleton className="h-4 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto mt-1" />
                  </div>
                </div>

                <Separator />

                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-1" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-6 py-4 bg-muted/30">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader className="px-6 py-4">
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="px-6 py-5">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-8">
                <div>
                  <Skeleton className="h-5 w-32 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-1" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>

                <div>
                  <Skeleton className="h-5 w-40 mb-4" />
                  <div className="grid gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>

                <div>
                  <Skeleton className="h-5 w-36 mb-4" />
                  <div className="grid gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

export default UserProfileView;
