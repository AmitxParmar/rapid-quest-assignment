import { LoaderCircle } from "lucide-react";
import React from "react";

const MessageLoader = () => {
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 p-0.5 bg-background border rounded-full">
      <LoaderCircle className="text-label animate-spin p-0.5" />
    </div>
  );
};

export default MessageLoader;
