export default function PackageShippedEmail({
  customerName,
  tracking,
  location,
  shippedAt,
  trackUrl,
  brandName,
  supportEmail,
}: any) {
  return (
    <div>
      <h2>Your package is on the way 🚀</h2>

      <p>Hello {customerName || "Customer"},</p>

      <p>Your package has been shipped and is now on the way to you.</p>

      <p><b>Tracking:</b> {tracking}</p>
      <p><b>Last Location:</b> {location || "In transit"}</p>
      <p><b>Shipped at:</b> {shippedAt}</p>

      <p>
        You can track your shipment here:
        <br />
        <a href={trackUrl}>{trackUrl}</a>
      </p>

      <p>
        We will notify you again once your package is delivered.
      </p>

      <br />

      <p>{brandName}</p>
      <p>{supportEmail}</p>
    </div>
  );
}