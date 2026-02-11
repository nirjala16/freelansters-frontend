import ProjectChat from "./projectChat";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import userApi from "../../api";
import { Loader2 } from "lucide-react";

const ProjectChatContainer = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const user = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to view project details");
      navigate("/login");
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        const response = await userApi.get(`/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const project = await response.data.project;
        setProjectData(project);
      } catch (err) {
        toast.error("Failed to load project details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, user?.token, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Failed to load project data.
          </h2>
          <p className="text-muted-foreground mt-2">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="project-chat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto p-4 bg-background"
      >
        <ProjectChat
          user={user}
          projectId={projectId}
          projectData={projectData}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectChatContainer;