import { useState, useEffect, useCallback } from "react";
import { PlusCircle, ExternalLink, Briefcase, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import userApi from "../../api";

const FreelancerDashboard = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [skills, setSkills] = useState([]);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(null);
  const [loading, setLoading] = useState(false); // To manage loading state for adding portfolio

  const user = JSON.parse(localStorage.getItem("session"));
  const userId = user.user._id;

  const fetchData = useCallback(async () => {
    try {
      const response = await userApi.get(`/users/skillandportfolio/${userId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      setPortfolio(response.data.portfolio || []);
      setSkills(response.data.skills || []);
    } catch (error) {
      toast.error("An error occurred while fetching data: " + error.message);
    }
  }, [userId, user.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to handle adding a new project
  const handleAddProject = async () => {
    if (!newPortfolio.title || !newPortfolio.description || !newPortfolio.link) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }

    setLoading(true); // Set loading to true while the request is being processed
    try {
      const response = await userApi.put(
        `/users/portfolio/${userId}`,
        {
          portfolioItem: newPortfolio,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (data.success) {
        setPortfolio(data.portfolio);
        setNewPortfolio({ title: "", description: "", link: "" }); // Reset project form
        toast.success("Your new project has been added to your portfolio.");
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(
        "An error occurred while adding the project: " + error.message
      );
    } finally {
      setLoading(false); // Set loading to false after the request is complete
    }
  };

  // Function to handle adding a new skill
  const handleAddSkill = async () => {
    if (newSkill && !skills.includes(newSkill)) {
      try {
        const response = await userApi.put(
          `/users/skills/${userId}`,
          {
            skills: [newSkill],
          },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;
        if (data.success) {
          setSkills(data.skills);
          setNewSkill("");
          toast.success("Skill added!");
        } else {
          toast.error(data.message || "Something went wrong");
        }
      } catch (error) {
        toast.error(
          "An error occurred while adding the skill: " + error.message
        );
      }
    } else {
      toast.error("Skill is either empty or already exists.");
    }
  };

  // Function to handle removing a skill
  const handleRemoveSkill = async (skill) => {
    try {
      const response = await userApi.delete(`/users/skills/${userId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        data: { skill },
      });

      const data = response.data;
      if (data.success) {
        setSkills(data.skills); // Update the skills in the frontend state
        toast.success("Skill removed.");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(
        "An error occurred while removing the skill: " + error.message
      );
    }
  };

  // Function to handle updating an existing project
  const handleEditPortfolio = (portfolio) => {
    setNewPortfolio(portfolio);
    setIsEditingPortfolio(portfolio._id);
  };

  // Function to handle deleting a project
  const handleDeletePortfolio = async (portfolioId) => {
    try {
      const response = await userApi.delete(
        `/users/portfolio/${userId}/${portfolioId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (data.success) {
        setPortfolio(data.portfolio);
        toast.success("Portfolio deleted.");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(
        "An error occurred while deleting the project: " + error.message
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 bg-background border rounded-xl p-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background ease-in-out">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total portfolio
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Section */}
      <div className="bg-background">
        <div className="flex bg-background justify-between items-center sm:flex-row flex-col">
          <h2 className="text-2xl font-bold">Skills</h2>
          <div className="flex gap-4">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add new skill"
              className="flex w-40"
            />
            <Button onClick={handleAddSkill} className="flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </div>
        </div>

        <div className="flex bg-background flex-row flex-wrap gap-2 mt-4">
          {skills && skills.length > 0 ? (
            skills.map((skill) => (
              <div
                key={skill}
                className="bg-background flex border px-3 py-2 rounded-full text-sm"
              >
                {skill}
                <Badge
                  className="ml-2 bg-background flex cursor-pointer"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <Trash className="h-4 w-4 text-red-600" />
                </Badge>
              </div>
            ))
          ) : (
            <span>No skills added yet</span>
          )}
        </div>
      </div>

      {/* Add New Project Dialog */}
      <div className="space-y-4">
        <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
          <h2 className="text-2xl font-bold">My Portfolio</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditingPortfolio ? "Edit Project" : "Add New Project"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Project Title"
                  value={newPortfolio.title}
                  onChange={(e) =>
                    setNewPortfolio({ ...newPortfolio, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Project Description"
                  value={newPortfolio.description}
                  onChange={(e) =>
                    setNewPortfolio({
                      ...newPortfolio,
                      description: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Project Link"
                  value={newPortfolio.link}
                  onChange={(e) =>
                    setNewPortfolio({ ...newPortfolio, link: e.target.value })
                  }
                />
                <Button onClick={handleAddProject} disabled={loading}>
                  {loading ? "Adding..." : "Add Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Portfolio portfolio List */}
        <div className="grid gap-6 md:grid-cols-2">
          {portfolio &&
            portfolio.map((project) => (
              <Card
                key={project._id}
                className="bg-background shadow-lg rounded-lg hover:shadow-2xl transition duration-100 ease-in-out"
              >
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center"
                  >
                    View Portfolio <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEditPortfolio(project)}
                      className="flex items-center"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeletePortfolio(project._id)}
                      className="flex items-center text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
