import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Briefcase, Star } from "lucide-react";
import userApi from "../../api";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function ProfileStats({ userData }) {
  const user = JSON.parse(localStorage.getItem("session"));
  const userId = user.user._id;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch jobs data
    if (userData.role === "client") {
      const fetchJobs = async () => {
        try {
          const response = await userApi.get(`/jobs/creator/${userId}`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          if (response.data.success) {
            setJobs(response.data.jobs);
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
    }
    if (userData.role === "freelancer") {
      const fetchJobs = async () => {
        try {
          const response = await userApi.get("/jobs/appliedJobs", {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          console.log(response.data);
          if (response.data.success) {
            setJobs(response.data.jobs);
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
    }
  }, [userId, user.token, userData.role]); // Add userId and user.token as dependencies
  // Fetch jobs data

  // Calculate average rating
  const averageRating =
    userData.ratingsAndReviews.length > 0
      ? (
          userData.ratingsAndReviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / userData.ratingsAndReviews.length
        ).toFixed(1)
      : "N/A";

  const stats = [
    {
      title: "Active Projects",
      value: userData.activeProjects.length || 0,
      description: "Currently ongoing projects",
      icon: Activity,
      color: "text-green-500",
    },
    userData.role === "client"
      ? {
          title: "Posted Jobs",
          value: jobs.length || 0,
          description: "Total jobs posted",
          icon: Briefcase,
          color: "text-blue-500",
        }
      : {
          title: "Applied Jobs",
          value: jobs.length || 0,
          description: "Applied Jobs",
          icon: Activity,
          color: "text-green-500",
        },
    {
      title: "Rating",
      value: averageRating,
      description: "Average user rating",
      icon: Star,
      color: "text-yellow-500",
    },
  ];
  console.log(stats);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {stat.title}
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

ProfileStats.propTypes = {
  userData: PropTypes.shape({
    role: PropTypes.string.isRequired,
    activeProjects: PropTypes.arrayOf(PropTypes.object).isRequired,
    appliedJobs: PropTypes.arrayOf(PropTypes.object).isRequired,
    ratingsAndReviews: PropTypes.arrayOf(
      PropTypes.shape({
        rating: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};
