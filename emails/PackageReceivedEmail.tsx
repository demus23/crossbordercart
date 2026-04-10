export default function PackageReceivedEmail({
  customerName,
  tracking,
  location,
  receivedAt,
  trackUrl,
  brandName,
  supportEmail,
}: any) {
  return (
    <div>
      <h2>Good news 🎉</h2>

      <p>Hello {customerName || "Customer"},</p>

      <p>Your package has been received at our warehouse.</p>

      <p><b>Tracking:</b> {tracking}</p>
      <p><b>Location:</b> {location || "Warehouse"}</p>
      <p><b>Date:</b> {receivedAt}</p>

      <p>
        We will prepare it for shipment and notify you once it is shipped.
      </p>

      <p>
        Track your package:
        <br />
        <a href={trackUrl}>{trackUrl}</a>
      </p>

      <br />

      <p>{brandName}</p>
      <p>{supportEmail}</p>
    </div>
  );
}