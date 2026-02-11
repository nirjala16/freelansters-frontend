import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  CalendarDays,
  DollarSign,
  Briefcase,
  Tag,
  CheckCircle2,
  Clock,
  Mail,
  Plus,
  Trash2,
  ArrowUpRight,
  AlertCircle,
  Circle,
  Timer,
  ArrowRight,
  StopCircle,
} from "lucide-react";
import userApi from "../api";
import RateAndReview from "./rateAndReview";

const statusColors = {
  completed: "bg-green-500",
  "in-progress": "bg-blue-500",
  pending: "bg-yellow-500",
  closed: "bg-gray-500",
};

const statusIcons = {
  completed: CheckCircle2,
  "in-progress": Clock,
  pending: Timer,
  closed: Circle,
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
  });

  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("session")), []);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to view project details");
      navigate("/login");
      return;
    }

    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const response = await userApi.get(`/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (response.data.success) {
          setProject(response.data.project);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        setError("Error fetching project details", err);
        toast.error("Failed to load project details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, user?.token, navigate]); // Only include stable dependencies

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim() || !newMilestone.description.trim()) {
      toast.error("Please fill in all milestone details");
      return;
    }

    setLoadingAction(true);
    try {
      const response = await userApi.post(
        `/milestones/${projectId}/milestones`,
        newMilestone,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (response.data.success) {
        setProject(response.data.project);
        setNewMilestone({ title: "", description: "" });
        toast.success("Milestone added successfully");
      }
    } catch (err) {
      toast.error("Failed to add milestone", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateMilestone = async (milestoneId, status) => {
    setLoadingAction(true);
    try {
      const response = await userApi.put(
        `/milestones/${projectId}/milestones/${milestoneId}`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (response.data.success) {
        setProject(response.data.project);
        toast.success("Milestone updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update milestone", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    setLoadingAction(true);
    try {
      const response = await userApi.delete(
        `/milestones/${projectId}/milestones/${milestoneId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (response.data.success) {
        setProject(response.data.project);
        toast.success("Milestone deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete milestone", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setLoadingAction(true);
    try {
      const response = await userApi.put(
        `/projects/${projectId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (response.data.success) {
        setProject(response.data.project);
        toast.success("Project status updated successfully");
      }
    } catch (err) {
      toast.error(
        err.response.data.message || "Failed to update project status",
        err
      );
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleProfileClick = (profileId) => {
    navigate(`/userProfile/${profileId}`);
  };
  const handleChatClick = (projectId) => {
    navigate(`/project/chat/${projectId}`);
  };
  const handleRequestPayment = async () => {
    const projectId = project._id;
    if (!projectId) {
      toast.error("Project ID not found");
      return;
    }
    if (project.paymentRequest === true) {
      toast.error("Payment already requested for this project");
      return;
    }
    setLoadingAction(true);
    try {
      const response = await userApi.put(
        `/projects/requestPayment`,
        { paymentRequest: true, projectId: projectId },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (response.data.success) {
        project.paymentRequest = true;
        toast.success("Project status updated successfully");
      }
    } catch (err) {
      toast.error(
        err.response.data.message || "Failed to update project status",
        err
      );
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const isFreelancer = project.freelancer.userId === user.user._id;
  const isClient = project.client.userId === user.user._id;
  const StatusIcon = statusIcons[project.status] || Circle;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6"
      >
        {/* Project Header */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              {project.paymentStatus == "completed" && (
                <>
                  <CardHeader className="space-y-4">
                    <CardTitle className="text-2xl font-bold">
                      Payment Completed
                    </CardTitle>
                    <CardDescription>
                      This project payment has been completed by the client{" "}
                      {project.client.name} to freelancer{" "}
                      {project.freelancer.name}.
                    </CardDescription>
                  </CardHeader>
                </>
              )}
              {project.paymentStatus == "pending" && (
                <>
                  <CardHeader className="space-y-4">
                    <CardTitle className="text-2xl font-bold">
                      Payment Pending
                    </CardTitle>
                    <CardDescription>
                      This project payment is pending.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-2">
                    {isClient &&
                      project.status === "completed" &&
                      project.paymentStatus !== "completed" && (
                        <Link to={`/payment/${project._id}`}>
                          <Button className="w-full h-12">
                            <span className="flex items-center justify-center space-x-2">
                              <span>Proceed to Payment</span>
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </Button>
                        </Link>
                      )}
                  </CardFooter>
                </>
              )}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                {project.paymentRequest === true && (
                  <>
                    <CardTitle className="text-2xl font-bold">
                      Payment Requested
                    </CardTitle>
                    <CardDescription>
                      The client {project.freelancer.name} has requested payment
                      for this project.
                    </CardDescription>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                {project.paymentStatus == "completed"
                  ? "Payment Completed"
                  : "Payment Pending"}
                <CardTitle className="text-2xl font-bold">
                  {project.job.title}
                </CardTitle>
                <CardDescription>
                  Created {formatDistanceToNow(new Date(project.createdAt))} ago
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`px-2 py-1 capitalize flex items-center gap-1.5 ${
                    statusColors[project.status]
                  }`}
                >
                  <StatusIcon className="h-4 w-4" />
                  {project.status}
                </Badge>
                {isClient && (
                  <Select
                    defaultValue={project.status}
                    onValueChange={handleUpdateStatus}
                    disabled={loadingAction}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-help">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Budget: ${project.job.budget.toLocaleString()}
                    </span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent>
                  <p className="text-sm">
                    Project budget allocated by the client
                  </p>
                </HoverCardContent>
              </HoverCard>

              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {project.job.jobCategory}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium capitalize">
                  {project.job.jobType}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {format(new Date(project.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Project Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.job.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress and Team */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Milestones</p>
                  <p className="font-medium">{project.milestones.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium">
                    {
                      project.milestones.filter((m) => m.status === "completed")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isFreelancer ? "Client Information" : "Assigned Freelancer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 cursor-pointer p-4 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() =>
                  handleProfileClick(
                    isFreelancer
                      ? project.client.userId
                      : project.freelancer.userId
                  )
                }
              >
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage
                    src={
                      isFreelancer
                        ? project.client.profilePic
                        : project.freelancer.profilePic
                    }
                    alt={
                      isFreelancer
                        ? project.client.name
                        : project.freelancer.name
                    }
                  />
                  <AvatarFallback className="bg-primary/5 text-primary">
                    {(isFreelancer
                      ? project.client.name
                      : project.freelancer.name)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isFreelancer
                      ? project.client.name
                      : project.freelancer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isFreelancer
                      ? project.client.email
                      : project.freelancer.email}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => handleChatClick(project._id)}
              >
                <Mail className="h-4 w-4" />
                Send Message
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Project Milestones</CardTitle>
              {isClient && (
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    document.getElementById("add-milestone").focus()
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {project.milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full ${
                        statusColors[milestone.status]
                      } flex items-center justify-center text-white font-medium`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium">
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`capitalize ${
                            milestone.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : milestone.status === "in-progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {milestone.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={milestone.status}
                          onValueChange={(value) =>
                            handleUpdateMilestone(milestone._id, value)
                          }
                          disabled={
                            loadingAction || (!isClient && !isFreelancer)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        {isClient && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-2"
                                disabled={loadingAction}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Milestone
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this
                                  milestone? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteMilestone(milestone._id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {project.milestones.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No milestones added yet
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {isClient && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4 border-t pt-6"
              >
                <h4 className="text-sm font-medium">Add New Milestone</h4>
                <div className="space-y-4">
                  <Input
                    id="add-milestone"
                    placeholder="Milestone Title"
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        title: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    placeholder="Milestone Description"
                    value={newMilestone.description}
                    onChange={(e) =>
                      setNewMilestone({
                        ...newMilestone,
                        description: e.target.value,
                      })
                    }
                  />
                  <Button
                    onClick={handleAddMilestone}
                    disabled={loadingAction}
                    className="w-full sm:w-auto"
                  >
                    {loadingAction ? (
                      "Adding..."
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Milestone
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
        {isFreelancer && project.status === "completed" && (
          <Button
            className="w-full h-12 text-sm font-medium rounded-md"
            onClick={() => handleRequestPayment(true)}
          >
            <span className="flex items-center justify-center space-x-2">
              {project?.paymentStatus === true ? (
                <>
                  <span>Payment Completed</span>
                  <StopCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Request Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </span>
          </Button>
        )}
        {isFreelancer && <RateAndReview userId={project.client.userId} />}
        {isClient && <RateAndReview userId={project.freelancer.userId} />}
      </motion.div>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
          <Separator />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4 mb-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
