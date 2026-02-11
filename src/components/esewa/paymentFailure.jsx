import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function EsewaFailure() {
  const [errorData, setErrorData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = localStorage.getItem("projectId");
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const encodedData = params.get("data");

      if (encodedData) {
        const decodedData = JSON.parse(atob(encodedData));
        setErrorData(decodedData);
      }
    } catch (error) {
      console.error("Error parsing error data:", error);
      // If we can't parse the data, we'll just show a generic error
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Failure Header */}
        <div className="bg-gradient-to-r from-red-400 to-rose-500 p-6 text-white">
          <div className="flex justify-between items-center">
            {/* eSewa Logo Placeholder */}
            <div className="h-12 w-24 flex items-center justify-center ">
              <img
                src="https://esewa.com.np/common/images/esewa_logo.png"
                alt="esewa logo"
              />
            </div>
            <div className="bg-white/30 rounded-full p-2">
              <XCircle className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-4">Payment Failed</h1>
          <p className="opacity-90">Your transaction could not be completed</p>
        </div>

        {/* Error Details */}
        <div className="p-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-100 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">
                  Transaction Unsuccessful
                </h3>
                <p className="text-red-700 mt-1 text-sm">
                  {errorData?.message ||
                    "We couldn't process your payment. This could be due to insufficient funds, network issues, or the transaction was cancelled."}
                </p>
              </div>
            </div>
          </div>

          {errorData && (
            <div className="space-y-3 mb-6">
              {errorData.code && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Error Code</span>
                  <span className="text-gray-800 font-medium">
                    {errorData.code}
                  </span>
                </div>
              )}

              {errorData.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="text-gray-800 font-medium">
                    {errorData.transaction_id}
                  </span>
                </div>
              )}

              {errorData.date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="text-gray-800 font-medium">
                    {errorData.date}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate(`/payment/${projectId}`)}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Return to Home</span>
            </button>
          </div>

          {/* Support Information */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Need help?{" "}
              <a
                href="#"
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
