// components/esewa/EsewaForm.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EsewaForm = ({ budget, projectId }) => {
  const [formData, setFormData] = useState({
    amount: budget,
    tax_amount: "0",
    total_amount: budget,
    transaction_uuid: uuidv4(),
    product_service_charge: "0",
    product_delivery_charge: "0",
    product_code: "EPAYTEST",
    success_url: `${window.location.origin}/esewa/success`,
    failure_url: `${window.location.origin}/esewa/failure`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: "",
    secret: "8gBm/:&EnhH.1/q", // UAT Key
  });
  localStorage.setItem("projectId", projectId);
  // Generate Signature
  const generateSignature = (
    total_amount,
    transaction_uuid,
    product_code,
    secret
  ) => {
    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = CryptoJS.HmacSHA256(hashString, secret);
    return CryptoJS.enc.Base64.stringify(hash);
  };

  // Update signature whenever any field changes
  useEffect(() => {
    const { total_amount, transaction_uuid, product_code, secret } = formData;
    const hashedSignature = generateSignature(
      total_amount,
      transaction_uuid,
      product_code,
      secret
    );
    setFormData((prev) => ({
      ...prev,
      signature: hashedSignature,
    }));
  }, [
    formData.total_amount,
    formData.transaction_uuid,
    formData.product_code,
    formData.secret,
  ]);

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      amount: value,
      total_amount: value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img
              src="https://developer.esewa.com.np/assets/img/esewa_logo.png"
              alt="Esewa Logo"
              className="h-6"
            />
            <span>Complete Payment</span>
          </CardTitle>
          <CardDescription>
            Enter your payment details below to proceed with eSewa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
            method="POST"
            className="space-y-4"
          >
            {/* Amount Field */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NPR)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min={budget}
                step="0.01"
                value={formData.amount}
                onChange={handleAmountChange}
                required
              />
            </div>

            {/* Hidden Fields */}
            <input
              type="hidden"
              name="tax_amount"
              value={formData.tax_amount}
            />
            <input
              type="hidden"
              name="total_amount"
              value={formData.total_amount}
            />
            <input
              type="hidden"
              name="transaction_uuid"
              value={formData.transaction_uuid}
            />
            <input
              type="hidden"
              name="product_code"
              value={formData.product_code}
            />
            <input
              type="hidden"
              name="product_service_charge"
              value={formData.product_service_charge}
            />
            <input
              type="hidden"
              name="product_delivery_charge"
              value={formData.product_delivery_charge}
            />
            <input
              type="hidden"
              name="success_url"
              value={formData.success_url}
            />
            <input
              type="hidden"
              name="failure_url"
              value={formData.failure_url}
            />
            <input
              type="hidden"
              name="signed_field_names"
              value={formData.signed_field_names}
            />
            <input type="hidden" name="signature" value={formData.signature} />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
            >
              Proceed to eSewa
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          You will be redirected to eSewas secure payment page to complete your
          transaction.
        </CardFooter>
      </Card>
    </motion.div>
  );
};

EsewaForm.propTypes = {
  budget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  projectId: PropTypes.string.isRequired,
};

export default EsewaForm;
