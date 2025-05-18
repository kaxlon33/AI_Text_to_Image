
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Success() {
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
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-10 max-w-xl shadow-md">
        <div className="mb-6">
          <span className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-500 text-5xl mb-6">
            ✅
          </span>
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Payment Successful!</h2>
        <p className="text-xl text-gray-600 mb-6">
          Thank you for your purchase. Your transaction has been completed successfully.
        </p>
        <div className="mt-6 mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 3) * 100}%` }}
            ></div>
          </div>
        </div>
        <p className="text-lg text-gray-500 mt-2">
          Redirecting to Buy page in {countdown} second{countdown !== 1 ? "s" : ""}...
        </p>
      </div>
    </div>
  )
}

