// Helper to map messageStatus to allowed values for MessageStatus component

import { Participant } from "@/types";

// Function to get the participant who is not the active user
export function getOtherParticipant(
  participants: Participant[],
  activeUser: { waId: string } | null | undefined
): Participant | undefined {
  if (!activeUser) return undefined;
  return participants.find((p) => p.waId !== activeUser.waId);
}

/**
 * Formats a WhatsApp number string (e.g. "929967673820") into "+92 99676 73820" format.
 * The first two digits are treated as the country code.
 * @param waId - WhatsApp ID as a string of digits
 * @returns Formatted phone number string
 */
export function formatWaIdToPhone(waId: string | undefined): string | null {
  if (!waId) return null;
  if (!waId || waId.length < 3) return waId;
  const countryCode = waId.slice(0, 2);
  const rest = waId.slice(2);

  // Split the rest into two groups: first 5 digits, then the rest
  const firstGroup = rest.slice(0, 5);
  const secondGroup = rest.slice(5);

  return `+${countryCode} ${firstGroup} ${secondGroup}`;
}
