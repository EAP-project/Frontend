"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/Button"
import { API_BASE } from "@/lib/api"

const API_BASE_URL = API_BASE

interface QuoteRequest {
  id: number
  status: string
  appointmentDateTime: string
  customerNotes: string
  quotePrice?: number
  quoteDetails?: string
}

export default function QuoteRequestsPage() {
  const router = useRouter()
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchQuoteRequests()
  }, [])

  const fetchQuoteRequests = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments?status=QUOTE_REQUESTED`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setQuoteRequests(data)
      }
    } catch (err) {
      console.error("Error fetching quote requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      QUOTE_REQUESTED: "bg-purple-100 text-purple-700",
      AWAITING_CUSTOMER_APPROVAL: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quote Requests</h1>
          <p className="text-gray-600 mt-1">View quotes for your modification requests</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading quote requests...</div>
        ) : quoteRequests.length > 0 ? (
          <div className="space-y-4">
            {quoteRequests.map((quote) => (
              <div
                key={quote.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedQuote(quote)
                  setShowDetailModal(true)
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Quote Request #{quote.id}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested: {new Date(quote.appointmentDateTime).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>

                {quote.quotePrice && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Quoted Price:</p>
                    <p className="text-2xl font-bold text-purple-600">${quote.quotePrice.toFixed(2)}</p>
                  </div>
                )}

                {quote.customerNotes && (
                  <p className="text-gray-600 text-sm mb-3">
                    <strong>Your request:</strong> {quote.customerNotes}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No quote requests yet</p>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => router.push("/dashboard/modification-request")}
            >
              Request a Quote
            </Button>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <h2 className="text-2xl font-bold">Quote Request #{selectedQuote.id}</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuote.status)}`}
                  >
                    {selectedQuote.status}
                  </span>
                </div>

                {selectedQuote.quotePrice && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Quoted Price</p>
                    <p className="text-3xl font-bold text-purple-600">${selectedQuote.quotePrice.toFixed(2)}</p>
                  </div>
                )}

                {selectedQuote.quoteDetails && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Quote Details</p>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                      {selectedQuote.quoteDetails}
                    </p>
                  </div>
                )}

                {selectedQuote.customerNotes && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Your Request</p>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{selectedQuote.customerNotes}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-6 border-t border-gray-200 flex gap-3">
                {selectedQuote.status === "AWAITING_CUSTOMER_APPROVAL" && (
                  <>
                    <Button onClick={() => setShowDetailModal(false)} variant="outline" className="flex-1">
                      Decline
                    </Button>
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">Accept Quote</Button>
                  </>
                )}
                {selectedQuote.status !== "AWAITING_CUSTOMER_APPROVAL" && (
                  <Button
                    onClick={() => setShowDetailModal(false)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
