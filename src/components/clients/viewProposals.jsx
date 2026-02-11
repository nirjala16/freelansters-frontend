import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { format } from "date-fns";
import userApi from "../../api";
import { Ban, Check, Loader, Users } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";

const FreelancerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOption, setSortOption] = useState("latest");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("session"));

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await userApi.get("jobs/freelancer-applications", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const apps = Array.isArray(data.applications) ? data.applications : [];
        setApplications(apps);
        setFilteredApplications(apps);
      } catch {
        toast.error("Failed to fetch freelancer applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user.token]);

  // Sorting and filtering logic
  useEffect(() => {
    let filtered = [...applications];

    if (filterStatus !== "all") {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    switch (sortOption) {
      case "latest":
        filtered.sort((a, b) => new Date(b.proposalDate) - new Date(a.proposalDate));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.proposalDate) - new Date(b.proposalDate));
        break;
      case "highest":
        filtered.sort((a, b) => b.proposedAmount - a.proposedAmount);
        break;
      case "lowest":
        filtered.sort((a, b) => a.proposedAmount - b.proposedAmount);
        break;
    }

    setFilteredApplications(filtered);
  }, [applications, filterStatus, sortOption]);

  const handleProposalAction = async (proposalId, jobId, action) => {
    try {
      const { data } = await userApi.put(
        `/jobs/${jobId}/proposal/${proposalId}`,
        { action },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (data.success) {
        toast.success(`Proposal ${action}ed successfully`);
        setApplications((prev) =>
          prev.map((app) =>
            app.applicationId === proposalId
              ? { ...app, status: action === "accept" ? "accepted" : "rejected" }
              : app
          )
        );
      }
    } catch {
      toast.error(`Failed to ${action} proposal`);
    }
  };

  const statusCounts = {
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    pending: applications.filter((a) => a.status === "pending").length,
  };

  const statusStyles = {
    accepted: "bg-green-500",
    rejected: "bg-red-500",
    pending: "bg-yellow-500",
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total", icon: <Users />, count: applications.length },
          { title: "Accepted", icon: <Check />, count: statusCounts.accepted },
          { title: "Rejected", icon: <Ban />, count: statusCounts.rejected },
          { title: "Pending", icon: <Loader className="animate-spin" />, count: statusCounts.pending },
        ].map(({ title, icon, count }) => (
          <Card key={title}>
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="text-sm">{title} Applications</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
        <div className="flex gap-2">
          <Select onValueChange={(value) => setFilterStatus(value)} defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setSortOption(value)} defaultValue="latest">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Amount</SelectItem>
              <SelectItem value="lowest">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground">Loading applications...</p>
        ) : filteredApplications.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No applications match your filter.</p>
        ) : (
          filteredApplications.map((app) => (
            <Card
              key={app.applicationId}
              className="h-full flex flex-col justify-between border-2 shadow-md"
            >
              <CardHeader>
                <CardTitle>{app.job.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="text-sm space-y-1">
                  <p><strong>Budget:</strong> ${app.job.budget}</p>
                  <p><strong>Posted:</strong> {format(new Date(app.job.createdAt), "PPP")}</p>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={app.freelancer.profilePic || ""} />
                    <AvatarFallback>{app.freelancer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{app.freelancer.name}</p>
                    <p className="text-xs text-muted-foreground">{app.freelancer.email}</p>
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <p><strong>Amount:</strong> ${app.proposedAmount}</p>
                  <p><strong>Timeline:</strong> {app.proposedTimeline}</p>
                  <p><strong>Message:</strong> {app.proposalMessage}</p>
                  <p><strong>Proposed On:</strong> {format(new Date(app.proposalDate), "PPP")}</p>
                </div>

                <Separator />

                {app.status === "pending" ? (
                  <div className="flex gap-2 mt-auto">
                    <Button
                      className="bg-green-500 hover:bg-green-600 w-full"
                      onClick={() => handleProposalAction(app.applicationId, app.job._id, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      className="bg-red-500 hover:bg-red-600 w-full"
                      onClick={() => handleProposalAction(app.applicationId, app.job._id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="text-center mt-auto">
                    <Badge className={`capitalize px-3 py-1 text-white ${statusStyles[app.status]}`}>
                      {app.status}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FreelancerApplications;
