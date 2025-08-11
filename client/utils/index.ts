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
