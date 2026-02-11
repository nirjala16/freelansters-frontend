"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { format } from "date-fns"
import userApi from "../../api"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  MessageSquare,
  RefreshCcw,
  Trash2,
  User,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function AppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  })
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem("session"))

  useEffect(() => {
    fetchAppliedJobs()
  }, [])

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true)
      const response = await userApi.get("jobs/appliedJobs", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      if (response.data.success) {
        setAppliedJobs(response.data.jobs)
        setFilteredJobs(response.data.jobs) // Initialize filtered jobs
      } else {
        toast.error("Failed to fetch applied jobs.")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching applied jobs")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProposal = async (proposalId, jobTitle) => {
    try {
      const response = await userApi.delete(`jobs/proposals/${proposalId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      if (response.data.success) {
        toast.success(`Proposal for "${jobTitle}" deleted successfully!`)
        setFilteredJobs((prevJobs) =>
          prevJobs.filter((job) => job.proposalsReceived.every((proposal) => proposal._id !== proposalId)),
        )
        setAppliedJobs((prevJobs) =>
          prevJobs.filter((job) => job.proposalsReceived.every((proposal) => proposal._id !== proposalId)),
        )
      } else {
        toast.error("Failed to delete proposal.")
      }
    } catch (error) {
      toast.error("Error deleting proposal: " + error.message)
    }
  }

  const applyFilters = () => {
    let filtered = [...appliedJobs]

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((job) => job.proposalsReceived.some((proposal) => proposal.status === filters.status))
    }

    // Filter by proposed date range
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((job) =>
        job.proposalsReceived.some((proposal) => {
          const proposalDate = new Date(proposal.createdAt)
          const startDate = filters.startDate ? new Date(filters.startDate) : null
          const endDate = filters.endDate ? new Date(filters.endDate) : null

          return (!startDate || proposalDate >= startDate) && (!endDate || proposalDate <= endDate)
        }),
      )
    }

    setFilteredJobs(filtered)
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
    })
    setFilteredJobs(appliedJobs)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/10 text-green-600 border-green-600/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-600/20"
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-600/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-600/20"
    }
  }

  const getCardBorderColor = (proposals) => {
    if (proposals.some((proposal) => proposal.status === "accepted")) {
      return "border-l-green-500"
    } else if (proposals.some((proposal) => proposal.status === "pending")) {
      return "border-l-yellow-500"
    } else {
      return "border-l-red-500"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="border-l-4 border-l-gray-300 shadow-md">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">My Applied Jobs</h1>
            <p className="text-muted-foreground">Track and manage your job applications</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {isFiltersOpen ? "Hide Filters" : "Show Filters"}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={fetchAppliedJobs} className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh job applications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Filters Section */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card shadow-md mb-6 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Applications
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsFiltersOpen(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Narrow down your job applications by status or date</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="statusFilter">
                      Application Status
                    </label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                      <SelectTrigger id="statusFilter" className="w-full">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="startDate">
                      Start Date
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="endDate">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={applyFilters} className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm text-green-700 dark:text-green-400">Accepted</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                {
                  appliedJobs.filter((job) => job.proposalsReceived.some((proposal) => proposal.status === "accepted"))
                    .length
                }
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <User className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                {
                  appliedJobs.filter((job) => job.proposalsReceived.some((proposal) => proposal.status === "pending"))
                    .length
                }
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm text-red-700 dark:text-red-400">Rejected</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                {
                  appliedJobs.filter((job) => job.proposalsReceived.some((proposal) => proposal.status === "rejected"))
                    .length
                }
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No applications found</h3>
            <p className="text-muted-foreground max-w-md">
              {appliedJobs.length > 0
                ? "No jobs match your current filters. Try adjusting your search criteria."
                : "You haven't applied to any jobs yet. Start browsing available opportunities."}
            </p>
            <div className="mt-6 flex gap-3">
              {appliedJobs.length > 0 && (
                <Button variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
              <Button onClick={() => (window.location.href = "/browse-jobs")}>Browse Jobs</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`border-l-4 ${getCardBorderColor(job.proposalsReceived)} shadow-md hover:shadow-lg transition-shadow duration-300`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold line-clamp-1">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Briefcase className="h-3 w-3" />
                          {job.jobCategory}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(job.proposalsReceived[0]?.status)} capitalize`}>
                        {job.proposalsReceived[0]?.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">${job.budget}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.jobType === "remote" ? "Remote" : job.jobLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(job.proposalsReceived[0]?.createdAt), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{job.experienceLevel}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skillsRequired?.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.skillsRequired.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="proposal" className="border-none">
                        <AccordionTrigger className="py-2 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Proposal Details
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 text-sm">
                            {job.proposalsReceived.map((proposal) => (
                              <div key={proposal._id} className="space-y-2">
                                <div className="grid grid-cols-2 gap-y-2">
                                  <div>
                                    <span className="text-muted-foreground">Amount:</span>{" "}
                                    <span className="font-medium">${proposal.proposedAmount}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Timeline:</span>{" "}
                                    <span className="font-medium">{proposal.proposedTimeline}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Message:</span>
                                  <p className="mt-1 text-foreground">{proposal.proposalMessage}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>

                  {/* Hide Delete Proposal Button if Accepted */}
                  {job.proposalsReceived.every((proposal) => proposal.status !== "accepted") && (
                    <CardFooter className="pt-0">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDeleteProposal(job.proposalsReceived[0]?._id, job.title)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Proposal
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
