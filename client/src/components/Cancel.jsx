"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const Cancel = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Start countdown from 3 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate("/buy")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Clean up timer on unmount
    return () => clearInterval(timer)
  }, [navigate]) // Added navigate to dependency array

 return (
    <div className="flex flex-col items-center pt-16 pb-20 px-6 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-10 max-w-xl shadow-md">
        <div className="mb-4">
          <span className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 text-red-500 text-5xl mb-6">
            ❌
          </span>
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Payment Cancelled</h2>
        <p className="text-gray-600 mb-4">Your transaction was not completed. No charges were made to your account.</p>
        <div className="mt-6 mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 3) * 100}%` }}
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Redirecting to Buy page in {countdown} second{countdown !== 1 ? "s" : ""}...
        </p>
        <button
          onClick={() => navigate("/buy")}
          className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Return to Buy Page Now
        </button>
      </div>

    </div>
  )
}


export default Cancel
