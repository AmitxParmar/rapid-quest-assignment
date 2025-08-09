import ContactList from "@/components/contact-list";

export default function Home() {
  return (
    <div className="grid grid-cols-[1fr_2.4fr] h-screen w-screen max-h-screen max-w-full overflow-hidden">
      <ContactList />
    </div>
  );
}
