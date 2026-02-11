import { useState, useEffect } from "react";
import { PlusCircle, Edit, Briefcase, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "../../api";
import { Link } from "react-router";
import EditJobForm from "./EditJobForm";

const ClientDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [sortOption, setSortOption] = useState("recent");

  const user = JSON.parse(localStorage.getItem("session"));
  const userId = user.user._id;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get(`/jobs/creator/${userId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.data.success) {
          const sortedJobs = sortJobs(response.data.jobs, sortOption);
          setJobs(sortedJobs);
        } else {
          toast.error("Failed to fetch jobs: " + response.data.message);
        }
      } catch (error) {
        toast.error("Error fetching jobs: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user.token, userId, sortOption]);

  const sortJobs = (jobs, option) => {
    return [...jobs].sort((a, b) => {
      switch (option) {
        case "recent":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "titleAsc":
          return a.title.localeCompare(b.title);
        case "titleDesc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  };

  const handleDeleteJob = async () => {
    try {
      const response = await api.delete(`/jobs/job/${jobToDelete}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.data.success) {
        setJobs(jobs.filter((job) => job._id !== jobToDelete));
        toast.success("Job deleted successfully!");
      } else {
        toast.error("Failed to delete job: " + response.data.message);
      }
    } catch (error) {
      toast.error("Error deleting job: " + error.message);
    }
  };

  const handleJobUpdate = (updatedJob) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job._id === updatedJob._id ? updatedJob : job))
    );
    setEditingJob(null);
    toast.success("Job updated successfully!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-background">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-muted rounded-lg p-4">
        <Card className="bg-background shadow-lg rounded-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Jobs Posted
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{jobs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sort and Post Job */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Jobs Posted</h2>
        <div className="flex gap-4 items-center">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort Options" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="titleAsc">Title A-Z</SelectItem>
                <SelectItem value="titleDesc">Title Z-A</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Link to="/postjob">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 bg-muted rounded-lg p-2">
        {jobs.map((job) => (
          <Card
            key={job._id}
            className="flex flex-col justify-between bg-background shadow-lg rounded-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out"
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold overflow-clip">
                  {job.title}
                </CardTitle>
                <span
                  className={`px-4 py-1 rounded-full text-xs font-semibold text-nowrap ${
                    job.status === "open"
                      ? "bg-green-100 text-green-800"
                      : job.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Posted on: {new Date(job.createdAt).toLocaleDateString("en-US")}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col justify-between flex-grow space-y-3 overflow-y-auto">
              <p className="text-muted-foreground">
                <span className="font-semibold">Budget: </span> ${job.budget}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold">Skills Required: </span>
                {job.skillsRequired.join(", ")}
              </p>
              <p className="text-muted-foreground line-clamp-4">
                <span className="font-semibold">Description: </span>
                {job.description}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold">Deadline: </span>
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString("en-US")
                  : "None"}
              </p>
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  className="w-full text-indigo-600 border-indigo-600 bg-background"
                  onClick={() => setEditingJob(job)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Job
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-600 bg-background"
                      onClick={() => setJobToDelete(job._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Job
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this job? This action is
                        irreversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-700"
                        onClick={handleDeleteJob}
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Job Modal */}
      <AlertDialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Job</AlertDialogTitle>
            <AlertDialogDescription>
              Modify the details of the job below:
            </AlertDialogDescription>
          </AlertDialogHeader>
          {editingJob && (
            <EditJobForm
              job={{ ...editingJob, jobPhoto: editingJob.jobPhoto || "" }}
              onUpdate={handleJobUpdate}
              onCancel={() => setEditingJob(null)}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientDashboard;
