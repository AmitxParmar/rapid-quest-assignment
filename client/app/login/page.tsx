"use client";
import React, { useState } from "react";
import { useLogin } from "@/hooks/useAuth";

const LoginPage = () => {
  const [waId, setWaId] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error, data } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ waId, password });
  };

  return (
    <div style={{ maxWidth: 320, margin: "40px auto" }}>
      <h2>Login</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          type="text"
          placeholder="WA ID"
          value={waId}
          onChange={(e) => setWaId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isPending}>
          {isPending ? "Logging in..." : "Login"}
        </button>
        {error && (
          <div style={{ color: "red", fontSize: 14 }}>
            {(error as any)?.message || "Login failed"}
          </div>
        )}
        {data && data.success && (
          <div style={{ color: "green", fontSize: 14 }}>Login successful!</div>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
