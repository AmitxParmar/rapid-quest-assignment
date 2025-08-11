import Chat from "@/components/chat";

const Conversation = async ({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) => {
  const { conversationId } = await params;

  return (
    /* make cols-2 when message search */

    <Chat conversationId={conversationId} />
  );
};

export default Conversation;
