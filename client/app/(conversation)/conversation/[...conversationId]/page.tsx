import Chat from "@/components/chat";

const Conversation = async ({
  params,
}: {
  params: Promise<{ conversationId: string[] }>;
}) => {
  // conversationId is an array: [conversationId, activeChatUserId]
  const { conversationId } = await params;

  const currentConversationId = conversationId?.[0] || "";
  const activeChatUserId = conversationId?.[1] || "";

  return (
    <Chat
      conversationId={currentConversationId}
      activeChatUserId={activeChatUserId}
    />
  );
};

export default Conversation;
