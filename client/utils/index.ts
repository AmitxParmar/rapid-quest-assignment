// Helper to map messageStatus to allowed values for MessageStatus component
export function mapMessageStatus(
  status: "sent" | "delivered" | "seen"
): "sent" | "delivered" | "read" {
  if (status === "seen") return "read";
  return status;
}
