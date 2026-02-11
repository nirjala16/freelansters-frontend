import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "../api"; // Replace with your actual API instance

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(localStorage.getItem("adminSession"));
  const navigate = useNavigate();

  // Fetch jobs from the API
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admins/managejobs", {
        headers: {
          Authorization: `Bearer ${admin?.token}`,
        },
      });
      setJobs(response.data.jobs);
      console.log("Jobs fetched successfully:", response);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  }, [admin?.token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle job deletion
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/admins/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${admin?.token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Job deleted successfully.");
      fetchJobs();
    } catch (error) {
      toast.error("Failed to delete job.", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Manage Jobs
            </CardTitle>
            <div className="mt-4 flex justify-between items-center">
              <Input
                type="text"
                placeholder="Search jobs by title or category..."
                className="w-full max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-600">Loading jobs...</p>
            ) : (
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-800 text-left">
                    <th className="border p-3 font-semibold">Title</th>
                    <th className="border p-3 font-semibold">Category</th>
                    <th className="border p-3 font-semibold">Budget</th>
                    <th className="border p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs
                    .filter(
                      (job) =>
                        job.title
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        job.jobCategory
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((job) => (
                      <tr
                        key={job._id}
                        className="border cursor-pointer hover:bg-muted"
                      >
                        <td
                          className="border p-3 text-ellipsis normal-case capitalize-first"
                          onClick={() => navigate(`/job/${job._id}`)}
                        >
                          {job.title}
                        </td>
                        <td className="border p-3">{job.jobCategory}</td>
                        <td className="border p-3">${job.budget}</td>
                        <td className="border p-3 flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click navigation
                              handleDelete(job._id);
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageJobs;
