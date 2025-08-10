import Chat from "@/components/chat";
import Conversations from "@/components/conversations";

export default function Home() {
  return (
    <div className="grid grid-cols-[1fr_2.4fr] h-screen w-screen max-h-screen max-w-full overflow-hidden">
      <Conversations />
      {true ? (
        /* make cols-2 when message search */
        <div className={false ? "grid grid-cols-2" : ""}>
          <Chat />
        </div>
      ) : null}
    </div>
  );
}
