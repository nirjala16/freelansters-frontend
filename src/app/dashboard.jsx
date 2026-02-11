import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FreelancerDashboard from "../components/freelancers/freelancerDashboard";
import ClientDashboard from "../components/clients/clientDashboard";
import AppliedJobs from "../components/freelancers/appliedJobs";
import FreelancerApplications from "../components/clients/viewProposals";
import ProjectsList from "../components/project";
import AllTransactions from "../components/allTransactions";

export default function Dashboard() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    setUserRole(session.user?.role || null);
  }, []);

  if (!userRole) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <h1 className="text-xl font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-background pb-6">
      {/* Header */}
      <header className="bg-background border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between md:justify-center">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
      </header>

      {/* Tabs Navigation */}
      <Tabs defaultValue="dashboard" className="container mx-auto mt-6">
        <div className="flex justify-center items-center">
          <TabsList className="flex justify-center gap-4 md:gap-8">
            <TabsTrigger value="dashboard">
              {userRole === "freelancer" ? "My Projects" : "My Jobs"}
            </TabsTrigger>
            <TabsTrigger value="Project">Project</TabsTrigger>
            {userRole === "client" && (
              <>
                <TabsTrigger value="freelancer-proposals">
                  View freelancers proposals
                </TabsTrigger>
              </>
            )}
            {userRole === "freelancer" && (
              <>
                <TabsTrigger value="proposals">Proposals</TabsTrigger>
              </>
            )}
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Content */}
        <TabsContent value="dashboard">
          <div className="mt-6">
            {userRole === "freelancer" ? (
              <FreelancerDashboard />
            ) : (
              <ClientDashboard />
            )}
          </div>
        </TabsContent>

        {/* Dashboard Content */}
        <TabsContent value="Project">
          <div className="mt-6">
            <ProjectsList />
          </div>
        </TabsContent>

        {/* Dashboard Content */}
        <TabsContent value="transactions">
          <div className="mt-6">
            <AllTransactions />
          </div>
        </TabsContent>

        {/* View freelancers proposals Tab */}
        <TabsContent value="freelancer-proposals">
          <FreelancerApplications />
        </TabsContent>

        {/* Proposals Tab (Freelancer Only) */}
        {userRole === "freelancer" && (
          <TabsContent value="proposals">
            <AppliedJobs />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
