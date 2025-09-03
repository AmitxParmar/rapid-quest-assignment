"use client";
import React, { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS = [
  { waId: "919937320320", password: "demo123" },
  { waId: "91123456789", password: "demo123" },
];

function LoginPage() {
  const router = useRouter();
  const [waId, setWaId] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error, data } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { waId, password },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  const handleDemoClick = (demo: { waId: string; password: string }) => {
    setWaId(demo.waId);
    setPassword(demo.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-lg p-8 flex flex-col items-center border border-border">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-full p-2 bg-primary">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="16" fill="#25D366" />
              <path
                d="M23.5 17.5c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.5-.2-.7.2-.2.4-.8 1.2-1 1.4-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.2-.4.3-.7.1-.2 0-.5-.1-.7-.1-.2-.7-1.7-1-2.3-.3-.6-.6-.5-.8-.5-.2 0-.5 0-.7 0-.2 0-.7.1-1.1.5-.4.4-1.4 1.3-1.4 3.1 0 1.8 1.4 3.5 1.6 3.7.2.2 2.7 4.1 6.6 5.6.9.3 1.6.5 2.1.6.9.1 1.7.1 2.3.1.7 0 2.3-.7 2.6-1.5.3-.8.3-1.5.2-1.6-.1-.1-.4-.2-.8-.4z"
                fill="#fff"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">
            WhatsApp
          </span>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-primary-foreground">
          Login
        </h2>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4"
          autoComplete="off"
        >
          <input
            type="text"
            placeholder="WA ID"
            value={waId}
            onChange={(e) => setWaId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition-colors"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-2 rounded font-semibold transition-colors ${
              isPending
                ? "bg-primary/60 text-primary-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
          {error && (
            <div className="text-destructive text-sm text-center mt-1">
              {(error as any)?.message || "Login failed"}
            </div>
          )}
          {data && data.success && (
            <div className="text-green-600 dark:text-green-400 text-sm text-center mt-1">
              Login successful!
            </div>
          )}
        </form>
        <div className="w-full mt-6">
          <div className="text-muted-foreground text-xs mb-2 text-center">
            Demo Accounts
          </div>
          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.waId}
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 border border-accent rounded bg-accent hover:bg-accent/80 text-accent-foreground text-sm transition"
                onClick={() => handleDemoClick(demo)}
              >
                <span>
                  <span className="font-medium">waId:</span> {demo.waId}
                </span>
                <span>
                  <span className="font-medium">password:</span> {demo.password}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
