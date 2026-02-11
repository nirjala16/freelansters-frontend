"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import userApi from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  DollarSign,
  Calendar,
  MapPin,
  Briefcase,
  X,
  Filter,
  ArrowUp,
} from "lucide-react";

const BrowseJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const [jobCategory, setJobCategory] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fetchJobs = useCallback(async (filters = {}) => {
    setLoading(true);

    const queryParams = new URLSearchParams();

    // Add filters to query parameters
    if (filters.title) queryParams.append("title", filters.title);
    if (filters.skills) queryParams.append("skills", filters.skills);
    if (filters.budgetMin) queryParams.append("budgetMin", filters.budgetMin);
    if (filters.budgetMax) queryParams.append("budgetMax", filters.budgetMax);
    if (filters.remoteAvailable !== undefined)
      queryParams.append("remoteAvailable", filters.remoteAvailable);
    if (filters.jobCategory)
      queryParams.append("jobCategory", filters.jobCategory);
    if (filters.jobType) queryParams.append("jobType", filters.jobType);
    if (filters.experienceLevel)
      queryParams.append("experienceLevel", filters.experienceLevel);
    if (filters.status) queryParams.append("status", filters.status);

    try {
      const response = await userApi.get(`jobs/?${queryParams.toString()}`);
      const data = response.data;

      if (data.success) {
        // Filter out completed jobs
        const filteredJobs = data.jobs.filter(
          (job) => job.status !== "completed"
        );
        setJobs(filteredJobs);
      } else {
        toast.error("Failed to fetch jobs");
      }
    } catch (error) {
      toast.error("An error occurred while fetching jobs: " + error.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check scroll position to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchJobs({});
  }, [fetchJobs]);

  const handleApplyFilters = () => {
    fetchJobs({
      title,
      skills,
      budgetMin,
      budgetMax,
      remoteAvailable,
      jobCategory,
      jobType,
      experienceLevel,
      status,
    });
  };

  const handleClearFilters = () => {
    setTitle("");
    setSkills("");
    setBudgetMin("");
    setBudgetMax("");
    setRemoteAvailable(false);
    setJobCategory("");
    setJobType("");
    setExperienceLevel("");
    setStatus("");
    fetchJobs({});
  };

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-background mt-16 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-center font-extrabold text-gray-800 dark:text-white">
          <Briefcase className="h-12 w-12 sm:h-16 sm:w-16" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl bg-clip-text">
            Browse Desired Jobs
          </h1>
        </div>

        <div className="flex justify-start py-4">
          <Button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            variant="outline"
            className="rounded-xl w-full px-8 py-2 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <Filter /> {isFiltersOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        {isFiltersOpen && (
          <div>
            {/* Filters Section */}
            <Card className="bg-background border shadow-lg rounded-3xl mb-12">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center justify-center">
                  <Input
                    placeholder="Search by job title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/50 dark:bg-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-400 border-2"
                    icon={<Search className="text-gray-400" />}
                  />
                  <Input
                    placeholder="Enter skills (comma separated)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-white/50 dark:bg-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-400 border-2"
                    icon={<Search className="text-gray-400" />}
                  />
                  <Input
                    placeholder="Min Budget"
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full bg-white/50 dark:bg-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-400 border-2"
                    icon={<DollarSign className="text-gray-400" />}
                  />
                  <Input
                    placeholder="Max Budget"
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full bg-white/50 dark:bg-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-400 border-2"
                    icon={<DollarSign className="text-gray-400" />}
                  />
                  <Select value={jobCategory} onValueChange={setJobCategory}>
                    <SelectTrigger className="w-full bg-white/50 dark:bg-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-400 border-2">
                      <SelectValue placeholder="Job Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Development">
                        Web Development
                      </SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="w-full bg-white/50 dark:bg-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-400 border-2">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={experienceLevel}
                    onValueChange={setExperienceLevel}
                  >
                    <SelectTrigger className="w-full bg-white/50 dark:bg-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-400 border-2">
                      <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry</SelectItem>
                      <SelectItem value="mid-level">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full bg-white/50 dark:bg-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-400 border-2">
                      <SelectValue placeholder="Job Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center p-2 space-x-2 border-2 rounded-xl focus:ring-2 focus:ring-purple-400">
                    <Checkbox
                      id="remoteAvailable"
                      checked={remoteAvailable}
                      onCheckedChange={setRemoteAvailable}
                    />
                    <label
                      htmlFor="remoteAvailable"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remote Available
                    </label>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleApplyFilters}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 py-2 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="rounded-xl px-8 py-2 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Job count info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {jobs.length} jobs
          </p>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, index) => (
              <Card
                key={index}
                className="bg-background border shadow-lg rounded-3xl overflow-hidden"
              >
                <CardHeader className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <motion.div
                    key={job._id}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Card
                      className="bg-background border h-full rounded-xl cursor-pointer hover:shadow-lg transition-shadow duration-300"
                      onClick={() => handleJobClick(job._id)}
                    >
                      <CardHeader className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl line-clamp-2 font-semibold text-gray-800 dark:text-white">
                            {job.title}
                          </CardTitle>
                          <Badge
                            className={`text-xs text-nowrap capitalize ${
                              job.status === "open"
                                ? "bg-green-100 text-green-800"
                                : job.status === "in-progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                          {job.jobCategory} • {job.jobType}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {job.budgetType === "hourly"
                              ? `$${job.hourlyRate}/hr`
                              : `$${job.budget}`}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(job.deadline).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4 mr-2" />
                            {job.jobLocation}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {job.experienceLevel}
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Skills Required:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skillsRequired
                              .slice(0, 3)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {job.skillsRequired.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skillsRequired.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center text-xl text-gray-600 dark:text-gray-300">
                  No jobs found
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Back to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full p-3 bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-300 z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default BrowseJobs;
