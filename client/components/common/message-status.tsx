import { Check, CheckCheck } from "lucide-react";
import React from "react";

function MessageStatus({
  messageStatus,
}: {
  messageStatus: "sent" | "delivered" | "read" | "failed";
}) {
  return (
    <>
      {messageStatus === "sent" && <Check className="p-0.5" />}
      {messageStatus === "delivered" && <CheckCheck className="p-0.5" />}
      {messageStatus === "read" && (
        <CheckCheck className="p-0.5 text-icon-ack" />
      )}
    </>
  );
}

export default MessageStatus;
