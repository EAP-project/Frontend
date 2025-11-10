export default function CancelPage() {
  return (
    <div>
      <h1>Payment cancelled</h1>
      <p>You can try again whenever you are ready.</p>
      <p style={{ marginTop: 16 }}><a href="/payment/checkout">Back to payment</a></p>
    </div>
  );
}
