import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Copy, ArrowLeft, Download } from "lucide-react";
import userApi from "../../api";
import { toast } from "sonner";

export default function EsewaSuccess() {
  const [transactionData, setTransactionData] = useState(null);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("session"));
  console.log("User session:", user);
  // Parse Esewa response from URL
useEffect(() => {
  const fetchPaymentStatus = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const encodedData = params.get("data");

      if (encodedData) {
        const decodedData = JSON.parse(atob(encodedData));
        setTransactionData(decodedData);

        const payload = {
          rid: decodedData.transaction_uuid,
          projectId: localStorage.getItem("projectId"),
        };

        console.log("Sending to backend:", payload);

        const res = await userApi.post("/esewa/verify", payload, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        toast.info(res.data.message);
        console.log("Backend response:", res.data);
        setTransactionData(res.data.transaction);
      }
    } catch (error) {
      console.error("Error verifying payment:", error.response?.data || error.message);
      navigate("/esewa/failure");
    }
  };

  fetchPaymentStatus();
}, [location, navigate]);

  const copyTransactionId = () => {
    if (transactionData?.transaction_uuid) {
      navigator.clipboard.writeText(transactionData.transaction_uuid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadReceipt = () => {
    if (!transactionData) return;

    const receiptContent = `
      eSewa Payment Receipt
      ---------------------
      Transaction Code: ${transactionData.transaction_code}
      Status: ${transactionData.status}
      Amount: NPR ${transactionData.total_amount}
      Transaction ID: ${transactionData.transaction_uuid}
      Product Code: ${transactionData.product_code}
      Date: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `esewa-receipt-${transactionData.transaction_uuid}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!transactionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <img
              src="https://esewa.com.np/common/images/esewa_logo.png"
              alt="esewa logo"
            />
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 dark:border-green-400"></div>
          </div>
          <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
            Processing your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-700 dark:to-emerald-900 p-6 text-white">
          <div className="flex justify-between items-center">
            {/* eSewa Logo Placeholder */}
            <div className="h-12 w-24 flex items-center justify-center ">
              <img
                src="https://esewa.com.np/common/images/esewa_logo.png"
                alt="esewa logo"
              />
            </div>
            <div className="bg-white/30 dark:bg-white/10 rounded-full p-2">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-4">Payment Successful!</h1>
          <p className="opacity-90">Your transaction has been completed</p>
        </div>

        {/* Transaction Details */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-200">Amount Paid</span>
                <span className="text-xl font-bold text-gray-800 dark:text-green-300">
                  NPR {transactionData.total_amount || transactionData.amount}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Transaction ID</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800 dark:text-gray-100 font-medium">
                    {transactionData.transaction_uuid.substring(0, 8)}...
                  </span>
                  <button
                    onClick={copyTransactionId}
                    className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Status</span>
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {transactionData.paymentStatus}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Transaction Code</span>
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {transactionData.paymentIntentId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Date & Time</span>
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={downloadReceipt}
              className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Download Receipt</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}