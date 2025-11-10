"use client";

import { useEffect, useState } from "react";
import { getInvoiceForSession } from "../../../services/payment";

export default function SuccessPage() {
  const [status, setStatus] = useState<string>("loading");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setError("Missing session_id");
      setStatus("error");
      return;
    }

    async function fetchInvoice() {
      try {
        const res = await getInvoiceForSession(sessionId);
        setData(res);
        setStatus("done");
      } catch (e: any) {
        setError(e.message || "Failed to fetch invoice");
        setStatus("error");
      }
    }

    fetchInvoice();
  }, []);

  return (
    <div>
      <h1>Payment successful</h1>
      {status === "loading" && <p>Fetching your invoice...</p>}
      {status === "error" && <p style={{ color: 'red' }}>{error}</p>}
      {status === "done" && (
        data?.status === "available" ? (
          <div>
            <p>Invoice number: {data.number || data.invoiceId}</p>
            {data.pdf && (
              <p><a href={data.pdf} target="_blank" rel="noreferrer">Download PDF</a></p>
            )}
            {data.hostedInvoiceUrl && (
              <p><a href={data.hostedInvoiceUrl} target="_blank" rel="noreferrer">View hosted invoice</a></p>
            )}
          </div>
        ) : (
          <p>{data?.message || "Invoice not ready yet. Refresh in a few seconds."}</p>
        )
      )}
      <p style={{ marginTop: 16 }}><a href="/">Back to home</a></p>
    </div>
  );
}
