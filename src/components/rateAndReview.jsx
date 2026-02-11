import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "../api";

const RateAndReview = ({ userId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/users/${userId}/rate-review`,
        { rating, review },
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("session")).token
            }`,
          },
        }
      );
      console.log("Review submitted:", response.data);
      toast.success("Review submitted successfully!");
      setRating(0);
      setReview("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Rate and Review</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
        <Input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Review</label>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review here..."
          className="w-full"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
};
RateAndReview.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default RateAndReview;