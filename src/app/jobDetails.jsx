import { Label } from "@/components/ui/label";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DollarSign,
  Users,
  Calendar,
  Globe,
  AlertCircle,
  ChevronLeft,
  MapPin,
  Timer,
  TrendingUpIcon as TrendingUpDown,
  Clock3,
  Ban,
  Briefcase,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import userApi from "../api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

export default function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState({
    proposedAmount: "",
    proposedTimeline: "",
    proposalMessage: "",
  });

  const fetchJobDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userApi.get(`jobs/job/${id}`);
      const data = response?.data ?? {};

      if (data?.success && data?.job) {
        setJob(data.job);

        const clientResponse = await userApi.get(
          `/users/${data.job.createdBy}`
        );
        if (clientResponse?.data?.user) {
          setClient(clientResponse.data.user);
        }
      } else {
        toast.error("Job not found or invalid data");
      }
    } catch (error) {
      toast.error(
        "Failed to fetch job details: " + (error?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  if (loading) {
    return <JobDetailsSkeleton />;
  }

  const {
    title = "Loading...",
    jobLocation = "N/A",
    jobType = "N/A",
    priority = "N/A",
    description = "No description provided",
    skillsRequired = [],
    status = "N/A",
    budget = "N/A",
    budgetType = "N/A",
    experienceLevel = "N/A",
    deadline,
    preferredFreelancerLocation = "N/A",
    additionalDetails = "No additional details provided",
    tags = [],
    minimumBidAmount = "N/A",
    proposalsReceived = [],
    jobPhoto = "",
  } = job ?? {};

  const formattedDeadline =
    deadline && !isNaN(new Date(deadline))
      ? format(new Date(deadline), "PPP")
      : "No deadline set";

  const user = JSON.parse(localStorage.getItem("session"));
  const handleSubmitProposal = async () => {
    if (!user || !user.user || !user.token) {
      toast.error("Please log in to submit a proposal.");
      return;
    }

    if (
      !proposal.proposedAmount ||
      !proposal.proposedTimeline ||
      !proposal.proposalMessage
    ) {
      toast.error(
        "Please fill out all fields before submitting your proposal."
      );
      return;
    }

    try {
      const response = await userApi.post(`/jobs/apply/${id}`, proposal, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setProposal({
          proposedAmount: "",
          proposedTimeline: "",
          proposalMessage: "",
        });
      } else {
        toast.error(response.data.message || "Failed to submit proposal.");
      }
    } catch (error) {
      toast.error("Error submitting proposal: " + error.response.data.message);
    }
  };

  const handleProfileClick = (clientId) => {
    navigate(`/userProfile/${clientId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4 md:p-6"
    >
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <CardTitle className="text-3xl font-bold text-primary leading-tight">
                    {title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-muted/50"
                    >
                      <MapPin className="h-4 w-4" />
                      {jobLocation}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-muted/50"
                    >
                      <Timer className="h-4 w-4" />
                      {jobType}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-muted/50"
                    >
                      <TrendingUpDown className="h-4 w-4" />
                      {priority} Priority
                    </Badge>
                    <Badge
                      className={`flex items-center gap-1 ${
                        status === "open"
                          ? "bg-green-100 text-green-800"
                          : status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <Clock3 className="h-4 w-4" />
                      {status}
                    </Badge>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-muted-foreground"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {job.status === "open"
                          ? "This job is currently open for applications"
                          : "This job is closed"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {jobPhoto && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 relative rounded-xl overflow-hidden"
                >
                  <img
                    src={jobPhoto || "/placeholder.svg"}
                    alt={title}
                    className="w-full h-[300px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsRequired.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Badge variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid gap-6 sm:grid-cols-2"
              >
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Budget</p>
                        <p className="text-sm text-muted-foreground">
                          ${budget} ({budgetType})
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Experience Level</p>
                        <p className="text-sm text-muted-foreground">
                          {experienceLevel}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Deadline</p>
                        <p className="text-sm text-muted-foreground">
                          {formattedDeadline}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Preferred Location</p>
                        <p className="text-sm text-muted-foreground">
                          {preferredFreelancerLocation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <Separator />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-xl font-semibold mb-3">
                  Additional Details
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {additionalDetails}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="group transition-all hover:border-primary shadow-lg hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={() => handleProfileClick(client._id)}
                >
                  <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage
                      src={
                        client.profilePic ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`
                      }
                    />
                    <AvatarFallback>
                      {client.name ? client.name[0] : ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{client.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {client.email}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-20">
                  <Skeleton className="h-12 w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Job Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Minimum Bid
                </span>
                <Badge variant="outline">${minimumBidAmount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Budget Type
                </span>
                <Badge variant="outline">{budgetType}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Proposals</span>
                <Badge variant="outline">{proposalsReceived.length}</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <AnimatePresence mode="wait">
                {status === "open" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      {user.user.role !== "client" ? (
                        <Button className="w-full">Apply Now</Button>
                      ) : (
                        ""
                      )}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Submit Your Proposal
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Please fill out the details below to submit your
                          proposal for this job.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="proposedAmount">
                            Proposed Amount ($)
                          </Label>
                          <Input
                            id="proposedAmount"
                            name="proposedAmount"
                            type="number"
                            value={proposal.proposedAmount}
                            required
                            onChange={(e) =>
                              setProposal((prev) => ({
                                ...prev,
                                proposedAmount: e.target.value,
                              }))
                            }
                            placeholder="Enter your proposed amount"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="proposedTimeline">
                            Proposed Timeline
                          </Label>
                          <Input
                            id="proposedTimeline"
                            name="proposedTimeline"
                            value={proposal.proposedTimeline}
                            required
                            onChange={(e) =>
                              setProposal((prev) => ({
                                ...prev,
                                proposedTimeline: e.target.value,
                              }))
                            }
                            placeholder="e.g., 2 weeks"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="proposalMessage">
                            Proposal Message
                          </Label>
                          <Textarea
                            id="proposalMessage"
                            name="proposalMessage"
                            value={proposal.proposalMessage}
                            required
                            onChange={(e) =>
                              setProposal((prev) => ({
                                ...prev,
                                proposalMessage: e.target.value,
                              }))
                            }
                            placeholder="Write a brief message to the client"
                            className="min-h-[120px]"
                          />
                        </div>
                      </div>
                      <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmitProposal}>
                          Submit Proposal
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button disabled className="w-full">
                    <Ban className="mr-2 h-4 w-4" />
                    Job not available
                  </Button>
                )}
              </AnimatePresence>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function JobDetailsSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-24" />
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Skeleton className="h-8 w-40 mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div>
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-8 w-20" />
                  ))}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
