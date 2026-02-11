"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import userApi from "../../api";
import {
  ArrowDownToLine,
  BanknoteIcon,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Filter,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PropTypes from "prop-types";

const FreelancerWallet = () => {
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [userRevenue, setUserRevenue] = useState(0);
  const [userWithdraw, setUserWithdraw] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch userId and revenue from localStorage after component mounts
    const session = JSON.parse(localStorage.getItem("session"));
    if (
      session &&
      session.user &&
      session.user._id &&
      session.user.role === "freelancer"
    ) {
      setUserId(session.user._id);
      setUserRevenue(session.user.revenue);
      setUserWithdraw(session.user.withdrawn);
      console.log("User ID:", session.user);
    } else {
      toast.error("User session not found or not authorized");
      setLoading(false);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      try {
        const response = await userApi.get("/transactions", {
          params: { userId },
        });
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch transactions"
        );
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  // Calculate total earnings
  const totalEarnings = transactions.reduce((total, transaction) => {
    if (transaction.paymentStatus === "completed") {
      return total + transaction.amount;
    }
    return total;
  }, 0);

  // Calculate pending earnings
  const pendingEarnings = transactions.reduce((total, transaction) => {
    if (transaction.paymentStatus !== "completed") {
      return total + transaction.amount;
    }
    return total;
  }, 0);

  // Calculate available for withdrawal (after platform fee)
  const platformFeePercentage = 0.1;
  const availableForWithdrawal =
    totalEarnings * (1 - platformFeePercentage) - userRevenue;

  // Get current month earnings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthEarnings = transactions.reduce((total, transaction) => {
    const transactionDate = new Date(transaction.createdAt);
    if (
      transaction.paymentStatus === "completed" &&
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    ) {
      return total + transaction.amount;
    }
    return total;
  }, 0);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleTransactionDetails = (transactionId) => {
    navigate(`/transactions/${transactionId}`);
  };

  // Updated withdrawal logic: call backend and update userRevenue
  const handleWithdrawalRequest = async () => {
    if (
      withdrawalAmount <= 0 ||
      withdrawalAmount > availableForWithdrawal ||
      isWithdrawing
    ) {
      toast.error("Invalid withdrawal amount.");
      return;
    }
    setIsWithdrawing(true);
    try {
      const session = JSON.parse(localStorage.getItem("session"));
      const token = session?.token;
      const response = await userApi.post(
        "/users/withdraw",
        { amount: withdrawalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Withdrawal successful!");
        setUserRevenue((prev) => prev + withdrawalAmount);
        setWithdrawalDialogOpen(false);
        setWithdrawalAmount(0);
      } else {
        toast.error(response.data.message || "Withdrawal failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
    }
    setIsWithdrawing(false);
  };

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-background rounded-lg">
        <h2 className="text-3xl font-semibold mb-6 text-primary">{error}</h2>
        <p className="text-center text-xl text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-background rounded-lg">
        <h2 className="text-3xl font-semibold mb-6 text-primary">
          Freelancer Wallet
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-6">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-background">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h1 className="text-3xl font-bold">Freelancer Wallet</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Dialog
            open={withdrawalDialogOpen}
            onOpenChange={setWithdrawalDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <ArrowDownToLine className="h-4 w-4" /> Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to withdraw. Available balance: $
                  {availableForWithdrawal.toFixed(2)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    max={availableForWithdrawal}
                    value={withdrawalAmount}
                    onChange={(e) =>
                      setWithdrawalAmount(Number(e.target.value))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="method" className="text-right">
                    Method
                  </Label>
                  <Input
                    id="method"
                    value="Bank Transfer"
                    disabled
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setWithdrawalDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdrawalRequest}
                  disabled={
                    isWithdrawing ||
                    withdrawalAmount <= 0 ||
                    withdrawalAmount > availableForWithdrawal
                  }
                >
                  {isWithdrawing ? "Processing..." : "Withdraw"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-background shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <p className="text-green-500">Available</p>
              for Withdrawal
            </CardTitle>
            <CardDescription>After platform fees (10%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${availableForWithdrawal.toFixed(2)}
            </div>
            <Progress
              value={
                totalEarnings > 0
                  ? ((availableForWithdrawal + userRevenue) / totalEarnings) *
                    100
                  : 0
              }
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-background shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 ease-in-out border border-sky-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              You have
              <p className="text-red-500">Withdrawn</p>
            </CardTitle>
            <CardDescription>After platform fees (10%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${userWithdraw}
            </div>
            <Progress
              value={
                totalEarnings > 0
                  ? ((availableForWithdrawal + userRevenue) / totalEarnings) *
                    100
                  : 0
              }
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-background shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BanknoteIcon className="h-5 w-5 text-emerald-500" />
              Total Earnings
            </CardTitle>
            <CardDescription>Lifetime earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              ${totalEarnings.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              This month:{" "}
              <span className="font-medium">
                ${currentMonthEarnings.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Earnings
            </CardTitle>
            <CardDescription>Payments in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              ${pendingEarnings.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              From{" "}
              <span className="font-medium">
                {
                  transactions.filter((t) => t.paymentStatus !== "completed")
                    .length
                }
              </span>{" "}
              projects
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        <TabsContent value="all" className="mt-0">
          <TransactionList
            transactions={transactions}
            handleTransactionDetails={handleTransactionDetails}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          <TransactionList
            transactions={transactions.filter(
              (t) => t.paymentStatus === "completed"
            )}
            handleTransactionDetails={handleTransactionDetails}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <TransactionList
            transactions={transactions.filter(
              (t) => t.paymentStatus !== "completed"
            )}
            handleTransactionDetails={handleTransactionDetails}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TransactionList = ({
  transactions,
  handleTransactionDetails,
  formatDate,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card
          key={transaction._id}
          className="overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-primary truncate">
                    {transaction.job.title}
                  </h3>
                  <Badge
                    variant={
                      transaction.paymentStatus === "completed"
                        ? "success"
                        : "outline"
                    }
                    className={
                      transaction.paymentStatus === "completed"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : ""
                    }
                  >
                    {transaction.paymentStatus === "completed" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Paid
                      </span>
                    ) : (
                      "Pending"
                    )}
                  </Badge>
                </div>
                <div className="text-xl font-bold">
                  ${transaction.amount.toFixed(2)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(transaction.createdAt)}
                </div>
                <Separator
                  orientation="vertical"
                  className="hidden sm:block h-4"
                />
                <div>Client: {transaction.client.name}</div>
                <Separator
                  orientation="vertical"
                  className="hidden sm:block h-4"
                />
                <div>ID: {transaction.transaction_uuid.substring(0, 8)}</div>
              </div>
            </div>

            <div className="flex items-center p-4 md:border-l bg-muted/10">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => handleTransactionDetails(transaction._id)}
              >
                <ExternalLink className="h-4 w-4 mr-1" /> Details
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" /> Download Invoice
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View Project</DropdownMenuItem>
                  <DropdownMenuItem>Contact Client</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Prop validation for TransactionList
TransactionList.propTypes = {
  handleTransactionDetails: PropTypes.func.isRequired,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired,
      paymentStatus: PropTypes.oneOf(["completed", "pending"]).isRequired,
      job: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }).isRequired,
      client: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
      transaction_uuid: PropTypes.string.isRequired,
    })
  ).isRequired,
  formatDate: PropTypes.func.isRequired,
};

export default FreelancerWallet;
