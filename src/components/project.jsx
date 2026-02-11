import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { FileText, Loader, Check, Search } from "lucide-react";
import userApi from "../api";

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("session"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await userApi.get("/projects/allProjects", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setProjects(response.data.projects);
        setFiltered(response.data.projects);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user.token]);

  useEffect(() => {
    let updated = [...projects];

    if (filter !== "all") {
      updated = updated.filter(p => p.status === filter);
    }

    if (searchQuery.trim()) {
      updated = updated.filter(p =>
        p.job.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "budget-asc") {
      updated.sort((a, b) => a.job.budget - b.job.budget);
    } else if (sortBy === "budget-desc") {
      updated.sort((a, b) => b.job.budget - a.job.budget);
    } else if (sortBy === "newest") {
      updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFiltered(updated);
  }, [filter, searchQuery, sortBy, projects]);

  const handleViewDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const statusBadge = (status) => {
    const text = status.charAt(0).toUpperCase() + status.slice(1);
    if (status === "completed") return <Badge variant="success">{text}</Badge>;
    if (status === "in-progress") return <Badge variant="outline">{text}</Badge>;
    return <Badge variant="destructive">{text}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground text-lg">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 space-y-10">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl shadow-md">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{projects.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-md">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">Pending Projects</CardTitle>
            <Loader className="w-4 h-4 text-muted-foreground animate-spin" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {projects.filter((p) => p.status === "in-progress").length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-md">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <Check className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {projects.filter((p) => p.status === "completed").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">All Projects</h2>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full md:w-60"
            />
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in-progress">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="budget-asc">Budget: Low to High</SelectItem>
              <SelectItem value="budget-desc">Budget: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground">No projects match the current filters.</p>
        ) : (
          filtered.map((project) => (
            <Card key={project._id} className="shadow-md rounded-xl h-full flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary">
                    {project.job.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {project.job.jobCategory} • {project.job.jobType}
                  </p>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    <strong>Description:</strong> {project.job.description}
                  </p>
                  <p className="text-sm">
                    <strong>Budget:</strong> ${project.job.budget}
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-primary">Freelancer</h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={project.freelancer.profilePic} />
                        <AvatarFallback>{project.freelancer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{project.freelancer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.freelancer.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />
                </CardContent>
              </div>

              <CardContent>
                <div className="flex justify-between items-center mt-2">
                  {statusBadge(project.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(project._id)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
