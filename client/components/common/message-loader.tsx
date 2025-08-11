import { LoaderCircle } from "lucide-react";
import React from "react";

const MessageLoader = () => {
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 p-1.5 bg-background border rounded-full z-100">
      <LoaderCircle className="text-label animate-spin p-1" size={30} />
    </div>
  );
};

export default MessageLoader;
