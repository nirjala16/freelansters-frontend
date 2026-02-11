"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import userApi from "../api"
import { toast } from "sonner"

// UI Components
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Icons
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Landmark,
  Layers,
  Printer,
  Receipt,
  Share2,
  Wallet,
  AlertCircle,
  Briefcase,
  User,
  Building,
  ArrowUpRight,
} from "lucide-react"

const TransactionDetails = () => {
  const { transactionId } = useParams()
  const navigate = useNavigate()
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true)
        const response = await userApi.get(`/transactions/${transactionId}`)
        setTransaction(response.data.transaction)
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch transaction details")
        toast.error("Failed to load transaction details")
      } finally {
        setLoading(false)
      }
    }

    if (transactionId) {
      fetchTransactionDetails()
    }
  }, [transactionId])

  // Format currency
  const formatCurrency = (amount, currency) => {
    const currencySymbol = currency === "usd" ? "$" : "NPR"
    return `${currencySymbol} ${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMMM dd, yyyy • h:mm a")
  }

  // Get payment method details
  const getPaymentMethodDetails = (method) => {
    if (method?.toLowerCase() === "esewa") {
      return {
        name: "eSewa",
        icon: <Wallet className="h-5 w-5 text-green-500" />,
        color: "text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900/20",
      }
    } else if (method?.includes("pm_")) {
      return {
        name: "Credit Card",
        icon: <CreditCard className="h-5 w-5 text-blue-500" />,
        color: "text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
      }
    } else {
      return {
        name: "Other",
        icon: <Landmark className="h-5 w-5 text-gray-500" />,
        color: "text-gray-500",
        bgColor: "bg-gray-100 dark:bg-gray-800",
      }
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="mx-4 h-6" />
          <Skeleton className="h-6 w-64" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full max-w-md" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-12 w-32" />
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Loading Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error || "Transaction not found"}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const paymentMethod = getPaymentMethodDetails(transaction.paymentMethod)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/transactions")}>
            <ArrowLeft className="h-4 w-4" />
            Back to Transactions
          </Button>
          <Separator orientation="vertical" className="mx-4 h-6" />
          <div>
            <h1 className="text-xl font-semibold">Transaction Details</h1>
            <p className="text-sm text-muted-foreground">Transaction ID: {transaction.transaction_uuid}</p>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
              <CardDescription>Payment for job: {transaction.job.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-full ${paymentMethod.bgColor}`}>{paymentMethod.icon}</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className={`font-medium ${paymentMethod.color}`}>{paymentMethod.name}</p>
                    <p className="text-xs text-muted-foreground">{transaction.paymentIntentId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(transaction.amount, transaction.currency)}</p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    {getStatusBadge(transaction.paymentStatus)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    <p className="uppercase">{transaction.currency}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Job Category</p>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <p>{transaction.job.jobCategory}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Job Type</p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="capitalize">{transaction.job.jobType}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">{transaction.job.title}</h3>
                <p className="text-sm text-muted-foreground">{transaction.job.description}</p>
              </div>

              {transaction.projectId?.milestones?.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Milestones
                      </h3>
                      <Badge variant="outline">
                        {transaction.projectId.milestones.length}{" "}
                        {transaction.projectId.milestones.length === 1 ? "milestone" : "milestones"}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {transaction.projectId.milestones.map((milestone) => (
                        <div key={milestone._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{milestone.title}</h4>
                              <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            </div>
                            <Badge
                              className={
                                milestone.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {milestone.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Project Progress</span>
                        <span>{transaction.projectId.progress}%</span>
                      </div>
                      <Progress value={transaction.projectId.progress} className="h-2" />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">
                <Receipt className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Project
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Parties Involved */}
          <Card>
            <CardHeader>
              <CardTitle>Parties Involved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={transaction.freelancer.profilePic || "/placeholder.svg"}
                    alt={transaction.freelancer.name}
                  />
                  <AvatarFallback>{transaction.freelancer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Freelancer</p>
                  </div>
                  <p className="font-medium">{transaction.freelancer.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.freelancer.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={transaction.client.profilePic || "/placeholder.svg"}
                    alt={transaction.client.name}
                  />
                  <AvatarFallback>{transaction.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Client</p>
                  </div>
                  <p className="font-medium">{transaction.client.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.client.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetails
