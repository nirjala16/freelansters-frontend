"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import InvoiceGenerator from "./invoiceGenerator";
import PropTypes from "prop-types";

const InvoicePreviewModal = ({ transaction }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount, currency = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Calculate platform fee (10%)
  const platformFee = transaction.amount * 0.1;
  const netAmount = transaction.amount - platformFee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" /> View Invoice
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Invoice #{transaction._id.substring(0, 8)}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1"
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <InvoiceGenerator transaction={transaction} />
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Preview */}
        <div
          className="p-6 border rounded-lg mt-4 print:border-none print:p-0"
          id="invoice-preview"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Invoice #{transaction._id.substring(0, 8)}
              </p>
            </div>
            <div className="text-right">
              <h2 className="font-semibold">Freelansters Inc.</h2>
              <p className="text-sm text-muted-foreground">10 Freelansters</p>
              <p className="text-sm text-muted-foreground">Kathmandu, Nepal</p>
              <p className="text-sm text-muted-foreground">
                support@freelansters.com
              </p>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                INVOICE TO
              </h3>
              <p className="font-medium">{transaction.client.name}</p>
              <p className="text-sm">{transaction.client.email}</p>
              <h3 className="text-xs font-semibold text-muted-foreground mt-4 mb-2">
                FREELANCER
              </h3>
              <p className="font-medium">{transaction.freelancer.name}</p>
              <p className="text-sm">{transaction.freelancer.email}</p>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                  DATE
                </h3>
                <p>{formatDate(transaction.createdAt)}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                  PAYMENT STATUS
                </h3>
                <p
                  className={
                    transaction.paymentStatus === "completed"
                      ? "text-emerald-600 font-medium"
                      : "text-amber-600 font-medium"
                  }
                >
                  {transaction.paymentStatus.toUpperCase()}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                  JOB TYPE
                </h3>
                <p className="capitalize">{transaction.job.jobType}</p>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
              Job Details
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="p-3 text-sm font-medium">Description</th>
                  <th className="p-3 text-sm font-medium">Category</th>
                  <th className="p-3 text-sm font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <p className="font-medium">{transaction.job.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {transaction.job.description.length > 100
                        ? `${transaction.job.description.substring(0, 100)}...`
                        : transaction.job.description}
                    </p>
                  </td>
                  <td className="p-3">
                    <p>{transaction.job.jobCategory}</p>
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 flex flex-col items-end">
              <div className="flex justify-between w-64 py-2">
                <span className="font-medium">Subtotal:</span>
                <span>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>
              <div className="flex justify-between w-64 py-2 border-b">
                <span className="font-medium">Platform Fee (10%):</span>
                <span>{formatCurrency(platformFee, transaction.currency)}</span>
              </div>
              <div className="flex justify-between w-64 py-2 font-bold">
                <span>Net Amount:</span>
                <span>{formatCurrency(netAmount, transaction.currency)}</span>
              </div>
            </div>
          </div>

          {/* Milestones */}
          {transaction.projectId &&
            transaction.projectId.milestones &&
            transaction.projectId.milestones.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
                  Project Milestones
                </h3>
                <div className="space-y-4">
                  {transaction.projectId.milestones.map((milestone, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {milestone.description}
                      </p>
                      <p
                        className={`text-sm mt-2 ${
                          milestone.status === "completed"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        Status:{" "}
                        {milestone.status.charAt(0).toUpperCase() +
                          milestone.status.slice(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
              Payment Details
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-medium mb-2">Payment Method</p>
                <p className="text-sm">{transaction.paymentMethod}</p>
                <p className="text-sm font-medium mt-4 mb-2">Transaction ID</p>
                <p className="text-sm font-mono">
                  {transaction.transaction_uuid}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium mb-2">Payment Date</p>
                <p className="text-sm">{formatDate(transaction.createdAt)}</p>
                <p className="text-sm font-medium mt-4 mb-2">
                  Payment Intent ID
                </p>
                <p className="text-sm font-mono">
                  {transaction.paymentIntentId}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for using our platform!</p>
            <p className="mt-1">
              For any questions, please contact support@freelansters.com
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
InvoicePreviewModal.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    paymentStatus: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    transaction_uuid: PropTypes.string.isRequired,
    paymentIntentId: PropTypes.string.isRequired,
    client: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    freelancer: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    job: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      jobCategory: PropTypes.string.isRequired,
      jobType: PropTypes.string.isRequired,
    }).isRequired,
    projectId: PropTypes.shape({
      milestones: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
          status: PropTypes.string.isRequired,
        })
      ),
    }),
  }).isRequired,
};
export default InvoicePreviewModal;
