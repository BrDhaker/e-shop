"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/product/${productId}`)
      const data = await response.json()
      setReviews(data.reviews)
      setAverageRating(data.averageRating)
      setTotalReviews(data.totalReviews)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          product_id: productId,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      })

      if (response.ok) {
        setNewReview({ rating: 5, comment: "" })
        setShowReviewForm(false)
        fetchReviews()
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ))
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          <div className="flex items-center mt-2">
            {renderStars(Math.round(averageRating))}
            <span className="ml-2 text-gray-600">
              {averageRating.toFixed(1)} out of 5 ({totalReviews} reviews)
            </span>
          </div>
        </div>
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 p-4 rounded mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: Number.parseInt(e.target.value) })}
              className="border rounded px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} Star{rating !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Comment</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="Share your experience with this product..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-medium">
                  {review.users.first_name} {review.users.last_name}
                </span>
                <div className="ml-2">{renderStars(review.rating)}</div>
              </div>
              <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductReviews
