"use client";

import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  DollarSign,
  Briefcase,
  Shield,
  ArrowRight,
  Receipt,
  User,
  Building,
  FileCheck,
  Lock,
  Info,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import api from "../api";
import EsewaForm from "./esewa/esewaForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const PaymentInfo = ({ project }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
  const navigate = useNavigate();
  localStorage.setItem("projectId", project._id);

  // Handle Stripe checkout
  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    try {
      // Create payment intent on your backend
      const response = await api.post("/stripe/create-payment-intent", {
        projectId: project._id,
        amount: project.job.budget,
        currency: "usd",
        clientEmail: project.client.email,
        freelancerEmail: project.freelancer.email,
      });

      const { clientSecret } = response.data;

      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to load Stripe.");
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: {
              token: "tok_visa", // For testing purposes
            },
          },
        }
      );
      console.log(paymentIntent);
      if (error) {
        setPaymentError(error.message);
        setPaymentSuccess(false);
      } else if (paymentIntent.status === "succeeded") {
        // Step 4: Update payment status on the backend
        await api.put("/stripe/update-payment-status", {
          projectId: project._id,
          paymentIntentId: paymentIntent.id,
          paymentMethod: paymentIntent.payment_method,
        });

        setPaymentSuccess(true);
        setPaymentError(null);
        setIsPaymentModalOpen(false);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setPaymentError("An unexpected error occurred. Please try again.");
      setPaymentSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Esewa payment
  const handleEsewaPayment = () => {
    setIsProcessing(true);
    setSelectedPaymentMethod("esewa"); // Ensure tab is on Esewa
    setIsPaymentModalOpen(true); // Open the modal
    setIsProcessing(false);
  };

  // Handle payment based on selected method
  const handlePayment = () => {
    if (selectedPaymentMethod === "stripe") {
      handleStripeCheckout();
    } else if (selectedPaymentMethod === "esewa") {
      handleEsewaPayment();
    }
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert("Receipt download functionality would be implemented here");
  };

  const handleClose = () => {
    setIsReceiptModalOpen(false);
    navigate(`/projects/${project._id}`);
  };

  // Format dates
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Calculate service fee (10% of budget)
  const serviceFee = project.job.budget * 0.1;
  const totalAmount = project.job.budget;
  const freelancerTotalAmount = project.job.budget - serviceFee;

  // Count completed milestones
  const completedMilestones = project.milestones.filter(
    (m) => m.status === "completed"
  ).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Payment Summary Card */}
          <Card className="w-full md:w-2/3 shadow-lg border-muted/30">
            <CardHeader className="bg-muted/10 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Payment Summary
                  </CardTitle>
                  <CardDescription>
                    Project completed on {formatDate(project.updatedAt)}
                  </CardDescription>
                </div>
                {project.paymentStatus === "completed" ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 uppercase text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 text-sm"
                  >
                    Payment {project.paymentStatus}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 uppercase text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 text-sm"
                  >
                    Payment {project.paymentStatus}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Project Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Project Details</h3>
                </div>

                <div className="bg-muted/10 p-4 rounded-lg">
                  <h4 className="font-medium text-lg">{project.job.title}</h4>
                  <p className="text-muted-foreground mt-2">
                    {project.job.description}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <Badge variant="secondary">{project.job.jobCategory}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {project.job.jobType}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Milestones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Milestones</h3>
                  </div>
                  <Badge variant="outline">
                    {completedMilestones}/{project.milestones.length} Completed
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="milestones">
                    <AccordionTrigger className="text-sm font-medium">
                      View All Milestones
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 mt-2">
                        {project.milestones.map((milestone, index) => (
                          <div
                            key={milestone._id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/10"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">
                                  {milestone.title}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={`capitalize ${
                                    milestone.status === "completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  }`}
                                >
                                  {milestone.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Payment Details</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Project Budget
                    </span>
                    <span className="font-medium">
                      Rs. {project.job.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        Service Fee (10%)
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-xs">
                              A 10% service fee is applied to all payments to
                              maintain the platform.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-medium">
                      Rs. {serviceFee.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      Total Amount Freelancer will receive
                    </span>
                    <span className="font-bold text-lg">
                      Rs. {freelancerTotalAmount.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-lg">
                      Rs. {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-4 pt-2 pb-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Cancel Payment</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cancelling this payment may affect your relationship with
                      the freelancer and could result in project delays.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Cancel Payment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                className="gap-2"
                size="lg"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Parties Information */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Freelancer Card */}
            <Card className="shadow-md border-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Freelancer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage
                      src={project.freelancer.profilePic}
                      alt={project.freelancer.name}
                    />
                    <AvatarFallback>
                      {project.freelancer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{project.freelancer.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.freelancer.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Card */}
            <Card className="shadow-md border-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage
                      src={project.client.profilePic}
                      alt={project.client.name}
                    />
                    <AvatarFallback>
                      {project.client.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{project.client.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.client.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Security */}
            <Card className="shadow-md border-muted/30 bg-muted/5">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    All transactions are secure and encrypted. Your payment
                    information is never stored on our servers.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Lock className="h-3 w-3" />
                    <span>SSL Encrypted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Complete Payment</DialogTitle>
            <DialogDescription>
              Choose your preferred payment method to complete the transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Tabs
              defaultValue="stripe"
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="stripe" className="flex items-center gap-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                    alt="Stripe"
                    className="h-4"
                  />
                  <span className="hidden sm:inline">Stripe</span>
                </TabsTrigger>
                <TabsTrigger value="esewa" className="flex items-center gap-2">
                  <img
                    src="https://esewa.com.np/common/images/esewa_logo.png"
                    alt="Esewa"
                    className="h-4"
                  />
                  <span className="hidden sm:inline">Esewa</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stripe" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-md">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                        alt="Stripe"
                        className="h-6"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">Stripe Secure Payment</h3>
                      <p className="text-xs text-muted-foreground">
                        Fast, secure payment processing
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label
                        htmlFor="cardNumber"
                        className="text-sm font-medium"
                      >
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          id="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="expiry" className="text-sm font-medium">
                          Expiry Date
                        </label>
                        <input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="cvc" className="text-sm font-medium">
                          CVC
                        </label>
                        <input
                          id="cvc"
                          type="text"
                          placeholder="123"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name on Card
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-muted-foreground">
                    Your payment information is secure and encrypted
                  </span>
                </div>
              </TabsContent>

              <TabsContent value="esewa" className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg border border-green-100 dark:border-green-900/50">
                  <EsewaForm
                    budget={project.job.budget}
                    projectId={project._id}
                  />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-muted-foreground">
                    Secured by Esewas trusted payment gateway
                  </span>
                </div>
              </TabsContent>
            </Tabs>

            {paymentError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>{paymentError}</p>
                </div>
              </div>
            )}

            <div className="mt-6 bg-muted/10 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold">
                    Rs. {totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src="https://www.svgrepo.com/show/328127/visa.svg"
                    alt="Visa"
                    className="h-6"
                  />
                  <img
                    src="https://www.mastercard.com/content/dam/public/brandcenter/en/logo-black.png"
                    alt="Mastercard"
                    className="h-6"
                  />
                  <img
                    src="https://esewa.com.np/common/images/esewa_logo.png"
                    alt="Esewa"
                    className="h-5"
                  />
                </div>
              </div>
            </div>
          </div>

          {selectedPaymentMethod !== "esewa" && (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <span>Processing...</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="h-4 w-4" />
                    </motion.div>
                  </>
                ) : (
                  <>
                    <span>Complete Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Payment Successful
            </DialogTitle>
            <DialogDescription>
              Your payment has been processed successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/10 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-medium">
                  TXN{Math.floor(Math.random() * 1000000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {format(new Date(), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">
                  {selectedPaymentMethod === "stripe"
                    ? "Credit Card (Stripe)"
                    : selectedPaymentMethod === "esewa"
                    ? "Esewa"
                    : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                >
                  {paymentSuccess}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownloadReceipt}
              >
                <Receipt className="h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

PaymentInfo.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    job: PropTypes.shape({
      jobId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      budget: PropTypes.number.isRequired,
      jobCategory: PropTypes.string.isRequired,
      jobType: PropTypes.string.isRequired,
    }).isRequired,
    freelancer: PropTypes.shape({
      userId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      profilePic: PropTypes.string.isRequired,
    }).isRequired,
    client: PropTypes.shape({
      userId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      profilePic: PropTypes.string.isRequired,
    }).isRequired,
    milestones: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
      })
    ).isRequired,
    progress: PropTypes.number.isRequired,
    paymentStatus: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default PaymentInfo;
