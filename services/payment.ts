import { apiFetch } from "../utils/api";
import { loadStripe } from "@stripe/stripe-js";

export type CreateSessionInput = {
  amount: number;
  currency?: string;
  name?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
};

export async function getPublishableKey(): Promise<string> {
  const res = await apiFetch<{ publishableKey: string }>("/api/payment/public-key");
  return res.publishableKey;
}

export async function createCheckoutSession(input: CreateSessionInput): Promise<string> {
  const res = await apiFetch<{ id: string }>("/api/payment/create-checkout-session", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.id;
}

export async function redirectToCheckout(sessionId: string) {
  const pk = await getPublishableKey();
  const stripe = await loadStripe(pk);
  if (!stripe) throw new Error("Stripe failed to load");
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw error;
}

export async function getInvoiceForSession(sessionId: string) {
  return apiFetch<{
    status: "pending" | "available";
    invoiceId?: string;
    number?: string | null;
    pdf?: string | null;
    hostedInvoiceUrl?: string | null;
    message?: string;
  }>(`/api/payment/invoice/${sessionId}`);
}
