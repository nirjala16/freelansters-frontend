"use client"

import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import userApi from "../api"
import { toast } from "sonner"

// UI Components
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Icons
import { ArrowUpDown, Calendar, ChevronDown, CreditCard, DollarSign, Download, Filter, Search, SlidersHorizontal, Wallet, X, RefreshCw, CircleDollarSign, Banknote, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

const AllTransactions = () => {
  const [userId, setUserId] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    currency: "",
    dateRange: "",
    minAmount: "",
    maxAmount: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  
  const navigate = useNavigate()

  // Fetch user ID from localStorage
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("session"))
    if (session && session.user && session.user._id) {
      setUserId(session.user._id)
    } else {
      toast.error("User session not found.")
      setLoading(false)
      navigate("/login")
    }
  }, [navigate])

  // Fetch transactions when userId is available
  useEffect(() => {
    if (!userId) return

    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const response = await userApi.get("/transactions", {
          params: { userId },
        })
        
        // Remove duplicate transactions based on transaction_uuid
        const uniqueTransactions = removeDuplicateTransactions(response.data.transactions)
        setTransactions(uniqueTransactions)
        setFilteredTransactions(uniqueTransactions)
        setLoading(false)
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch transactions")
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  // Remove duplicate transactions based on transaction_uuid
  const removeDuplicateTransactions = (transactions) => {
    const uniqueIds = new Set()
    return transactions.filter(transaction => {
      if (uniqueIds.has(transaction.transaction_uuid)) {
        return false
      }
      uniqueIds.add(transaction.transaction_uuid)
      return true
    })
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!transactions.length) return { total: 0, totalAmount: 0, currencies: {}, completed: 0, pending: 0 }

    const currencies = {}
    let totalAmount = 0
    let completed = 0
    let pending = 0

    transactions.forEach(transaction => {
      // Count by currency
      if (!currencies[transaction.currency]) {
        currencies[transaction.currency] = {
          count: 0,
          amount: 0
        }
      }
      currencies[transaction.currency].count += 1
      currencies[transaction.currency].amount += transaction.amount

      // Count by status
      if (transaction.paymentStatus === "completed") {
        completed += 1
      } else {
        pending += 1
      }

      // For USD, add to total amount (simplified approach)
      if (transaction.currency === "usd") {
        totalAmount += transaction.amount
      } else if (transaction.currency === "npr") {
        // Convert NPR to USD (simplified conversion)
        totalAmount += transaction.amount / 130
      }
    })

    return {
      total: transactions.length,
      totalAmount: Math.round(totalAmount),
      currencies,
      completed,
      pending
    }
  }, [transactions])

  // Handle search and filtering
  useEffect(() => {
    let result = [...transactions]

    // Apply search
    if (searchTerm) {
      result = result.filter(
        transaction =>
          transaction.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.transaction_uuid.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply tab filtering
    if (activeTab === "completed") {
      result = result.filter(transaction => transaction.paymentStatus === "completed")
    } else if (activeTab === "pending") {
      result = result.filter(transaction => transaction.paymentStatus !== "completed")
    }

    // Apply additional filters
    if (filters.status) {
      result = result.filter(transaction => transaction.paymentStatus === filters.status)
    }

    if (filters.paymentMethod) {
      result = result.filter(transaction => transaction.paymentMethod === filters.paymentMethod)
    }

    if (filters.currency) {
      result = result.filter(transaction => transaction.currency === filters.currency)
    }

    if (filters.minAmount) {
      result = result.filter(transaction => transaction.amount >= Number(filters.minAmount))
    }

    if (filters.maxAmount) {
      result = result.filter(transaction => transaction.amount <= Number(filters.maxAmount))
    }

    if (filters.dateRange) {
      const today = new Date()
      let startDate

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(today.setHours(0, 0, 0, 0))
          break
        case "week":
          startDate = new Date(today.setDate(today.getDate() - 7))
          break
        case "month":
          startDate = new Date(today.setMonth(today.getMonth() - 1))
          break
        case "year":
          startDate = new Date(today.setFullYear(today.getFullYear() - 1))
          break
        default:
          startDate = null
      }

      if (startDate) {
        result = result.filter(transaction => new Date(transaction.createdAt) >= startDate)
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === "amount") {
        return sortConfig.direction === "asc" 
          ? a.amount - b.amount 
          : b.amount - a.amount
      } else if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc" 
          ? new Date(a.createdAt) - new Date(b.createdAt) 
          : new Date(b.createdAt) - new Date(a.createdAt)
      }
      return 0
    })

    setFilteredTransactions(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [transactions, searchTerm, sortConfig, filters, activeTab])

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "",
      paymentMethod: "",
      currency: "",
      dateRange: "",
      minAmount: "",
      maxAmount: "",
    })
    setSearchTerm("")
    setActiveTab("all")
  }

  // Handle refresh
  const handleRefresh = async () => {
    if (!userId) return
    
    setRefreshing(true)
    try {
      const response = await userApi.get("/transactions", {
        params: { userId },
      })
      const uniqueTransactions = removeDuplicateTransactions(response.data.transactions)
      setTransactions(uniqueTransactions)
      setFilteredTransactions(uniqueTransactions)
      toast.success("Transactions refreshed successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to refresh transactions")
    } finally {
      setRefreshing(false)
    }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  // Navigate to transaction details
  const handleTransactionDetails = (transactionId) => {
    navigate(`/transactions/${transactionId}`)
  }

  // Format currency
  const formatCurrency = (amount, currency) => {
    const currencySymbol = currency === "usd" ? "$" : "NPR"
    return `${currencySymbol} ${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy • h:mm a")
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "esewa":
        return <Wallet className="h-4 w-4 text-green-500" />
      case "pm_1r3tvqcspbwvnpmucggjstg4":
      case "pm_1r6qlkcspbwvnpmu5cw5oshx":
      case "pm_1r6qn2cspbwvnpmu83tocmqf":
      case "pm_1rrfb5cspbwvnpmuvslfizug":
        return <CreditCard className="h-4 w-4 text-blue-500" />
      default:
        return <Banknote className="h-4 w-4 text-gray-500" />
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

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Loading Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">${stats.totalAmount.toLocaleString()}</div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.completed}</div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% of total transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {transactions.some(t => t.paymentMethod === "esewa") && (
                  <div className="p-1.5 bg-green-500/10 rounded-full">
                    <Wallet className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {transactions.some(t => t.paymentMethod?.includes("pm_")) && (
                  <div className="p-1.5 bg-blue-500/10 rounded-full">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                  </div>
                )}
              </div>
              <div className="p-2 bg-purple-500/10 rounded-full">
                <CircleDollarSign className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {Object.keys(stats.currencies).map(currency => (
                <Badge key={currency} variant="outline" className="text-xs capitalize">
                  {currency}: {stats.currencies[currency].count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Print Transactions</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <h3 className="font-medium">Filters</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Payment Method</label>
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="esewa">eSewa</SelectItem>
                    <SelectItem value="pm_">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Currency</label>
                <Select value={filters.currency} onValueChange={(value) => setFilters({ ...filters, currency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Currencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currencies</SelectItem>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="npr">NPR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Min Amount</label>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Max Amount</label>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No transactions found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {transactions.length > 0
                  ? "Try adjusting your filters or search term"
                  : "You haven't made any transactions yet"}
              </p>
              {transactions.length > 0 && (
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50 rounded-md">
                <div className="w-1/2">Transaction Details</div>
                <div className="w-1/4 text-center">Date</div>
                <div className="w-1/4 text-right">
                  <button
                    onClick={() => requestSort("amount")}
                    className="flex items-center justify-end gap-1 w-full"
                  >
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {currentItems.map((transaction) => (
                <div
                  key={transaction._id}
                  className="border rounded-lg overflow-hidden hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleTransactionDetails(transaction._id)}
                >
                  <div className="md:flex items-center p-4">
                    {/* Mobile View */}
                    <div className="md:hidden space-y-3 mb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={transaction.freelancer.profilePic || "/placeholder.svg"} alt={transaction.freelancer.name} />
                            <AvatarFallback>{transaction.freelancer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-sm line-clamp-1">{transaction.job.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {transaction.freelancer.name} → {transaction.client.name}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(transaction.paymentStatus)}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="font-semibold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:flex md:w-1/2 items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={transaction.freelancer.profilePic || "/placeholder.svg"} alt={transaction.freelancer.name} />
                        <AvatarFallback>{transaction.freelancer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium line-clamp-1">{transaction.job.title}</h4>
                          {getStatusBadge(transaction.paymentStatus)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>{transaction.freelancer.name}</span>
                          <ArrowUpRight className="h-3 w-3" />
                          <span>{transaction.client.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block md:w-1/4 text-center text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </div>
                    <div className="hidden md:flex md:w-1/4 justify-end items-center gap-2">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span className="font-semibold">{formatCurrency(transaction.amount, transaction.currency)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pages around current page
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={currentPage === pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AllTransactions
