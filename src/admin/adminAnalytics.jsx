import { useEffect, useState } from "react";
import {
  BarChart,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import userApi from "../api";
import FreelanstersLogo from "../assets/Freelansters.svg";

import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar";

export default function DetailedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [timeframeAnalytics, setTimeframeAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeTab, setActiveTab] = useState("current");

  // Fetch current month analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = JSON.parse(localStorage.getItem("adminSession"))?.token;

        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await userApi.get("/admins/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Analytics data:", response.data.data);
        setAnalytics(response.data.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(
          error.response?.data?.message || "Failed to fetch analytics data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Fetch analytics by timeframe
  const handleFetchAnalyticsByTimeframe = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both 'From' and 'To' dates.");
      return;
    }

    // Format dates to YYYY-MM-DD for the backend
    const formattedFromDate = format(fromDate, "yyyy-MM-dd");
    const formattedToDate = format(toDate, "yyyy-MM-dd");

    console.log("Fetching analytics for:", {
      fromDate: formattedFromDate,
      toDate: formattedToDate,
    });

    try {
      const response = await userApi.get("/admins/analytics-by-timeframe", {
        params: { from: formattedFromDate, to: formattedToDate },
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("adminSession")).token
          }`,
        },
      });

      console.log("Analytics data:", response.data.data);
      setTimeframeAnalytics(response.data.data);
    } catch (error) {
      console.error("Error fetching analytics by timeframe:", error);
      alert("Failed to fetch analytics data for the specified timeframe.");
    }
  };

  // Calculate statistics
  const calculateTimeframeStats = (data) => {
    if (!data) return {};

    const userCount = data.usersByTimeframe?.length || 0;
    const jobCount = data.jobsByTimeframe?.length || 0;
    const transactionCount = data.transactionsByTimeframe?.length || 0;
    const totalRevenue = data.totalRevenueByTimeframe || 0;

    // Calculate user roles distribution
    const roleDistribution = data.usersByTimeframe?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Calculate job status distribution
    const jobStatusDistribution = data.jobsByTimeframe?.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    return {
      userCount,
      jobCount,
      transactionCount,
      totalRevenue,
      roleDistribution,
      jobStatusDistribution,
    };
  };
  // Calculate statistics
  const calculateCurrentStats = (data) => {
    if (!data) return {};

    const userCount = data.usersJoinedThisMonth?.length || 0;
    const jobCount = data.jobsPostedThisMonth?.length || 0;
    const transactionCount = data.transactionsMadeThisMonth?.length || 0;
    const totalRevenue = data.totalRevenueThisMonth || 0;

    // Calculate user roles distribution
    const roleDistribution = data.usersJoinedThisMonth?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Calculate job status distribution
    const jobStatusDistribution = data.jobsPostedThisMonth?.reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      userCount,
      jobCount,
      transactionCount,
      totalRevenue,
      roleDistribution,
      jobStatusDistribution,
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse mb-4">
          <img
            src={FreelanstersLogo}
            alt="Freelansters Logo"
            className="h-16 w-16"
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-red-500 mx-auto mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No analytics data available
  if (!analytics && !timeframeAnalytics) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Analytics Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            There is no analytics data available at this time. Please check back
            later or contact support if this issue persists.
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics for current month and timeframe
  const currentStats = calculateCurrentStats(analytics);
  const timeframeStats = calculateTimeframeStats(timeframeAnalytics);

  // Get stats based on active tab
  const stats = activeTab === "current" ? currentStats : timeframeStats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Admin Analytics Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive overview of platform metrics and performance
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <Badge
              variant="outline"
              className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
            >
              <CalendarDays className="w-3.5 h-3.5 mr-1" />
              Last updated: {new Date().toLocaleString()}
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.userCount}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Object.entries(stats.roleDistribution || {}).map(
                  ([role, count]) => (
                    <span key={role} className="mr-2">
                      {role.charAt(0).toUpperCase() + role.slice(1)}: {count}
                    </span>
                  )
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Jobs
              </CardTitle>
              <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.jobCount}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Object.entries(stats.jobStatusDistribution || {}).map(
                  ([status, count]) => (
                    <span key={status} className="mr-2">
                      {status.charAt(0).toUpperCase() + status.slice(1)}:{" "}
                      {count}
                    </span>
                  )
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Transactions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.transactionCount}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Completed financial transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.transactionCount > 0
                  ? `Avg. $${(
                      stats.totalRevenue / stats.transactionCount
                    ).toFixed(2)} per transaction`
                  : "No transactions yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Timeframe Selector */}
        <Card className="mb-6 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Select Timeframe</CardTitle>
            <CardDescription>
              View analytics for the current month or select a custom timeframe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* From Date Picker */}
              <div className="grid w-full sm:w-auto items-center gap-1.5">
                <label
                  htmlFor="from-date"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  From Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-40 justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fromDate ? (
                        format(fromDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DatePickerCalendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date Picker */}
              <div className="grid w-full sm:w-auto items-center gap-1.5">
                <label
                  htmlFor="to-date"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  To Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-40 justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {toDate ? (
                        format(toDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DatePickerCalendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Fetch Analytics Button */}
              <Button
                onClick={handleFetchAnalyticsByTimeframe}
                className="bg-purple-600 hover:bg-purple-700 text-white self-end px-4 py-2 rounded-md"
              >
                Fetch Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          defaultValue="current"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="current">Current Month</TabsTrigger>
            <TabsTrigger value="timeframe" disabled={!timeframeAnalytics}>
              Custom Timeframe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {/* Users Joined This Month */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="border-b">
                <CardTitle>Users Joined This Month</CardTitle>
                <CardDescription>
                  New users who registered on the platform during the current
                  month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {analytics?.usersJoinedThisMonth?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Date Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.usersJoinedThisMonth.map((user) => (
                          <TableRow
                            key={user._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar>
                                  <AvatarImage
                                    src={
                                      user.profilePic ||
                                      "/placeholder.svg?height=40&width=40"
                                    }
                                    alt={user.name}
                                  />
                                  <AvatarFallback className="bg-purple-100 text-purple-700">
                                    {user.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  user.role === "client"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : user.role === "freelancer"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                }`}
                              >
                                {user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(user.dateJoined), "yyyy-MM-dd")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex justify-center items-center p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No users joined this month.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t px-6 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total users joined this month:{" "}
                  {analytics?.usersJoinedThisMonth?.length || 0}
                </p>
              </CardFooter>
            </Card>

            {/* Jobs Posted This Month */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="border-b">
                <CardTitle>Jobs Posted This Month</CardTitle>
                <CardDescription>
                  New job listings created during the current month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {analytics?.jobsPostedThisMonth?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.jobsPostedThisMonth.map((job) => (
                          <TableRow
                            key={job._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <TableCell>{job.title}</TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {job.description}
                            </TableCell>
                            <TableCell>${job.budget}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  job.status === "open"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : job.status === "completed"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {job.status.charAt(0).toUpperCase() +
                                  job.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar>
                                  <AvatarImage
                                    src={
                                      job.createdBy.profilePic ||
                                      "/placeholder.svg?height=40&width=40"
                                    }
                                    alt={job.createdBy.name}
                                  />
                                  <AvatarFallback className="bg-purple-100 text-purple-700">
                                    {job.createdBy.name
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {job.createdBy.name}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex justify-center items-center p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No jobs posted this month.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t px-6 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total jobs posted this month:{" "}
                  {analytics?.jobsPostedThisMonth?.length || 0}
                </p>
              </CardFooter>
            </Card>

            {/* Projects Completed This Month */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="border-b">
                <CardTitle>Projects Completed This Month</CardTitle>
                <CardDescription>
                  Projects successfully completed during the current month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {analytics?.projectsCompletedThisMonth?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Title</TableHead>
                          <TableHead>Freelancer</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.projectsCompletedThisMonth.map((project) => (
                          <TableRow
                            key={project._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <TableCell>{project.job.title}</TableCell>
                            <TableCell>{project.freelancer.name}</TableCell>
                            <TableCell>{project.client.name}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Completed
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex justify-center items-center p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No projects completed this month.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t px-6 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total projects completed this month:{" "}
                  {analytics?.projectsCompletedThisMonth?.length || 0}
                </p>
              </CardFooter>
            </Card>

            {/* Transactions Made This Month */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="border-b">
                <CardTitle>Transactions Made This Month</CardTitle>
                <CardDescription>
                  Financial transactions processed during the current month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {analytics?.transactionsMadeThisMonth?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Job Title</TableHead>
                          <TableHead>Freelancer</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.transactionsMadeThisMonth.map(
                          (transaction) => (
                            <TableRow
                              key={transaction._id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <TableCell>{transaction.job.title}</TableCell>
                              <TableCell>
                                {transaction.freelancer.name}
                              </TableCell>
                              <TableCell>{transaction.client.name}</TableCell>
                              <TableCell>${transaction.amount}</TableCell>
                              <TableCell>
                                {format(
                                  new Date(transaction.createdAt),
                                  "yyyy-MM-dd"
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex justify-center items-center p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No transactions made this month.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t px-6 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total transactions made this month:{" "}
                  {analytics?.transactionsMadeThisMonth?.length || 0}
                </p>
              </CardFooter>
            </Card>

            {/* Total Revenue This Month */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="border-b">
                <CardTitle>Total Revenue This Month</CardTitle>
                <CardDescription>
                  Total revenue generated from transactions during the current
                  month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex justify-center items-center">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${analytics?.totalRevenueThisMonth || 0}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeframe" className="space-y-6">
            {timeframeAnalytics ? (
              <>
                {/* Users Joined */}
                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle>
                      Users Joined {format(new Date(fromDate), "yyyy-MM-dd")} to {format(new Date(toDate), "yyyy-MM-dd")}
                    </CardTitle>
                    <CardDescription>
                      Users who registered during the selected timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {timeframeAnalytics?.usersByTimeframe?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[250px]">Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Date Joined</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {timeframeAnalytics.usersByTimeframe.map((user) => (
                              <TableRow
                                key={user._id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          user.profilePic ||
                                          "/placeholder.svg?height=40&width=40"
                                        }
                                        alt={user.name}
                                      />
                                      <AvatarFallback className="bg-purple-100 text-purple-700">
                                        {user.name?.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">
                                      {user.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${
                                      user.role === "client"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : user.role === "freelancer"
                                        ? "bg-blue-100 text-blue-800 border-blue-200"
                                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    }`}
                                  >
                                    {user.role.charAt(0).toUpperCase() +
                                      user.role.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {format(
                                    new Date(user.dateJoined),
                                    "yyyy-MM-dd"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center p-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No users joined during this timeframe.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t px-6 py-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total users joined:
                      {timeframeAnalytics?.usersByTimeframe?.length || 0}
                    </p>
                  </CardFooter>
                </Card>

                {/* Jobs Posted */}
                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle>
                      Jobs Posted {format(new Date(fromDate), "yyyy-MM-dd")} to {format(new Date(toDate), "yyyy-MM-dd")}
                    </CardTitle>
                    <CardDescription>
                      Job listings created during the selected timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {timeframeAnalytics?.jobsByTimeframe?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[250px]">Title</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Budget</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created By</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {timeframeAnalytics.jobsByTimeframe.map((job) => (
                              <TableRow
                                key={job._id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <TableCell className="font-medium">
                                  {job.title}
                                </TableCell>
                                <TableCell>{job.jobCategory}</TableCell>
                                <TableCell>
                                  ${job.budget.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${
                                      job.status === "open"
                                        ? "bg-blue-100 text-blue-800 border-blue-200"
                                        : job.status === "completed"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-gray-100 text-gray-800 border-gray-200"
                                    }`}
                                  >
                                    {job.status.charAt(0).toUpperCase() +
                                      job.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          job.createdBy.profilePic ||
                                          "/placeholder.svg?height=40&width=40"
                                        }
                                        alt={job.createdBy.name}
                                      />
                                      <AvatarFallback className="bg-purple-100 text-purple-700">
                                        {job.createdBy.name
                                          ?.charAt(0)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{job.createdBy.name}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center p-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No jobs posted during this timeframe.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t px-6 py-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total jobs posted:{" "}
                      {timeframeAnalytics?.jobsByTimeframe?.length || 0}
                    </p>
                  </CardFooter>
                </Card>

                {/* Projects completed by timeframe */}
                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle>
                      Projects Completed from {format(new Date(fromDate), "yyyy-MM-dd")} to {format(new Date(toDate), "yyyy-MM-dd")}
                    </CardTitle>
                    <CardDescription>
                      Projects completed during the selected timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {timeframeAnalytics?.jobsByTimeframe?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[250px]">Title</TableHead>
                              <TableHead>Freelancer</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date Completed</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {timeframeAnalytics.projectsCompletedByTimeframe.map(
                              (project) => (
                                <TableRow
                                  key={project._id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <TableCell className="font-medium">
                                    {project.job.title}
                                  </TableCell>
                                  <TableCell>
                                    {project.freelancer.name}
                                  </TableCell>
                                  <TableCell>{project.client.name}</TableCell>
                                  <TableCell>{project.status}</TableCell>
                                  <TableCell>{project.updatedAt}</TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center p-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No projects completed during this timeframe.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t px-6 py-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total jobs posted:{" "}
                      {timeframeAnalytics?.jobsByTimeframe?.length || 0}
                    </p>
                  </CardFooter>
                </Card>

                {/* Transactions Made */}
                <Card className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle>
                      Transactions Made {format(new Date(fromDate), "yyyy-MM-dd")} to {format(new Date(toDate), "yyyy-MM-dd")}
                    </CardTitle>
                    <CardDescription>
                      Financial transactions processed during the selected
                      timeframe
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {timeframeAnalytics?.transactionsByTimeframe?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[250px]">
                                Job Title
                              </TableHead>
                              <TableHead>Freelancer</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {timeframeAnalytics.transactionsByTimeframe.map(
                              (transaction) => (
                                <TableRow
                                  key={transaction._id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <TableCell className="font-medium">
                                    {transaction.job.title}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.freelancer.name}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.client.name}
                                  </TableCell>
                                  <TableCell className="font-medium text-green-600 dark:text-green-400">
                                    ${transaction.amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    {format(
                                      new Date(transaction.createdAt),
                                      "yyyy-MM-dd"
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center p-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No transactions made during this timeframe.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t px-6 py-3 flex justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total transactions:{" "}
                      {timeframeAnalytics?.transactionsByTimeframe?.length || 0}
                    </p>
                    <p className="text-sm font-medium">
                      Total Revenue:{" "}
                      <span className="text-green-600 dark:text-green-400">
                        $
                        {timeframeAnalytics?.totalRevenueByTimeframe?.toLocaleString() ||
                          0}
                      </span>
                    </p>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className="flex justify-center items-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  Please select a timeframe and click Fetch Analytics to view
                  data.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
