import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Notebook } from "lucide-react";

const adminFeatures = [
  {
    title: "Manage Users",
    description: "View, edit, ban/unban users and manage their accounts.",
    icon: <User className="h-10 w-10 text-blue-600" />,
    link: "/admin/manage-users",
  },
  {
    title: "Manage Jobs",
    description: "Approve, reject, and delete job postings.",
    icon: <Briefcase className="h-10 w-10 text-green-600" />,
    link: "/admin/manage-jobs",
  },
  {
    title: "View Analytics",
    description: "View analytics and reports on platform usage.",
    icon: <Notebook className="h-10 w-10 text-green-600" />,
    link: "/admin/analytics",
  },
];

const AdminPanel = () => {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100">
          Freelansters Admin Dashboard
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mt-2">
          Manage and monitor the Freelansters platform efficiently.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {adminFeatures.map((feature, index) => (
            <Card
              key={index}
              className="shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
            >
              <CardHeader className="flex items-center space-x-4">
                <div>{feature.icon}</div>
                <CardTitle className="text-xl font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  {feature.description}
                </p>
                <Link to={feature.link}>
                  <Button className="mt-4 w-full">Go to {feature.title}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
