// emails/PackageDeliveredEmail.tsx
export default function PackageDeliveredEmail({
  customerName,
  tracking,
  deliveredAt,
  location,
  brandName,
  supportEmail,
}: any) {
  return (
    <div>
      <h2>Your package has been delivered ✅</h2>

      <p>Hello {customerName || "Customer"},</p>

      <p>Your package has been delivered successfully.</p>

      <p><b>Tracking:</b> {tracking}</p>
      <p><b>Delivered at:</b> {deliveredAt}</p>
      <p><b>Location:</b> {location || "Destination"}</p>

      <p>Thank you for using our service.</p>

      <br />

      <p>{brandName}</p>
      <p>{supportEmail}</p>
    </div>
  );
}