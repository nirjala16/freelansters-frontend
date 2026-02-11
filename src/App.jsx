import { Routes, Route, useLocation, Link, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import HomePage from "./app/homePage";
import LoginPage from "./app/loginPage";
import { Footer } from "./components/footer";
import SignUpPage from "./app/signUpPage";
import Profile from "./components/profile/profile";
import Dashboard from "./app/dashboard";
import BrowseJobs from "./app/browseJobs";
import JobDetail from "./app/jobDetails";
import BrowseFreelancers from "./app/browseFreelancers";
import BrowseClients from "./app/browseClients";
import { Button } from "@/components/ui/button";
import PostJobForm from "./components/clients/postJob";
import AboutPage from "./app/about";
import UserProfileView from "./app/userProfileView";
import ThemeProvider from "./components/theme-provider"; // Correct import (no curly braces)
import ProjectDetail from "./components/projectDetail";
import AdminLoginPage from "./admin/login";
import AdminPanel from "./admin/adminPanel";
import ManageUsers from "./admin/manageUsers";
import ManageJobs from "./admin/manageJobs";
import AdminNavbar from "./admin/adminNavbar";
import PaymentSuccess from "./components/esewa/paymentSuccess";
import ProjectChatContainer from "./components/chat/projectChatContainer";
import PaymentPage from "./app/paymentPage";
import AllTransactions from "./components/allTransactions";
import TransactionDetails from "./components/transactionDetails";
import FreelancerWallet from "./components/freelancers/wallet";
import AnalyticsDashboard from "./admin/adminAnalytics";
import NotificationPage from "./app/notification";
import { io } from "socket.io-client";
import { useEffect, useMemo, useState } from "react";
import EsewaSuccess from "./components/esewa/paymentSuccess";
import EsewaFailure from "./components/esewa/paymentFailure";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const userSession = JSON.parse(localStorage.getItem("session") || "null");
  const adminSession = JSON.parse(
    localStorage.getItem("adminSession") || "null"
  );
  const showNavbar =
    !isAdminRoute && !["/login", "/register"].includes(location.pathname);
  const showFooter =
    !isAdminRoute && !["/login", "/register"].includes(location.pathname);

  const [notifications, setNotifications] = useState([]);
  const session = JSON.parse(localStorage.getItem("session") || "null");
  const user = session ? session : null;

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_API_URL, {
        auth: { token: user?.token },
      }),
    [user?.token]
  );

  useEffect(() => {
    // Listen for new notifications
    socket.on("new-notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("new-notification");
    };
  }, [socket]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {/* Show appropriate navbar based on user type */}
      {isAdminRoute ? (
        <AdminNavbar />
      ) : (
        showNavbar && <Navbar notifications={notifications} />
      )}
      <Routes>
        <Route
          path="*"
          element={
            <div className="flex flex-col gap-4 justify-center items-center h-screen">
              <h1 className="text-5xl text-center font-bold text-red-700">
                404 | Page not found
              </h1>
              <Link to="/">
                <Button>Head Home</Button>
              </Link>
            </div>
          }
        />
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route
          path="/profile"
          element={userSession ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={userSession ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/browse-jobs" element={<BrowseJobs />} />
        <Route path="/freelancers" element={<BrowseFreelancers />} />
        <Route path="/clients" element={<BrowseClients />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/postjob" element={<PostJobForm />} />
        <Route path="/userProfile/:userId" element={<UserProfileView />} />
        <Route
          path="/projects/:projectId"
          element={userSession ? <ProjectDetail /> : <Navigate to="/login" />}
        />
        <Route
          path="/project/chat/:projectId"
          element={
            userSession ? <ProjectChatContainer /> : <Navigate to="/login" />
          }
        />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/adminpanel"
          element={
            adminSession ? <AdminPanel /> : <Navigate to="/admin/login" />
          }
        />
        <Route
          path="/admin/manage-users"
          element={
            adminSession ? <ManageUsers /> : <Navigate to="/admin/login" />
          }
        />
        <Route
          path="/admin/manage-jobs"
          element={
            adminSession ? <ManageJobs /> : <Navigate to="/admin/login" />
          }
        />
        <Route
          path="/admin/analytics"
          element={
            adminSession ? (
              <AnalyticsDashboard />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/esewa/success"
          element={
            <EsewaSuccess />
          }
        />
        <Route
          path="/esewa/failure"
          element={
            <EsewaFailure />
          }
        />
        <Route path="/payment/:projectId" element={<PaymentPage />} />
        <Route path="/paymentsuccess" element={<PaymentSuccess />} />
        <Route path="/paymentfailure" element={<PaymentSuccess />} />
        <Route path="/transactions" element={<AllTransactions />} />
        <Route
          path="/transactions/:transactionId"
          element={<TransactionDetails />}
        />
        <Route path="/wallet" element={<FreelancerWallet />} />
      </Routes>
      {showFooter && <Footer />}
    </ThemeProvider>
  );
}

export default App;
