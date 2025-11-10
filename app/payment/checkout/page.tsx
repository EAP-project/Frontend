"use client";

import { useState } from "react";
import { createCheckoutSession, redirectToCheckout } from "../../../services/payment";

export default function CheckoutPage() {
  const [amount, setAmount] = useState<number>(5000); // default $50.00 in cents
  const [name, setName] = useState("Garage Service Fee");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPay() {
    setError(null);
    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/payment/success`;
      const cancelUrl = `${window.location.origin}/payment/cancel`;
      const sessionId = await createCheckoutSession({
        amount,
        currency: "usd",
        name,
        customerEmail: email || undefined,
        successUrl,
        cancelUrl,
      });
      await redirectToCheckout(sessionId);
    } catch (e: any) {
      setError(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Pay for Service</h1>
      <label style={{ display: 'block', marginTop: 12 }}>
        Description
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>
      <label style={{ display: 'block', marginTop: 12 }}>
        Amount (cents)
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value || '0', 10))}
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>
      <label style={{ display: 'block', marginTop: 12 }}>
        Customer email (optional)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>

      <button onClick={onPay} disabled={loading} style={{ marginTop: 16, padding: '10px 16px' }}>
        {loading ? 'Creating session...' : 'Pay with Stripe'}
      </button>

      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
      <p style={{ marginTop: 8, color: '#666' }}>
        Note: You must be logged in for the payment to be associated with your account.
      </p>
    </div>
  );
}
