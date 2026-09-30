"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsLoading(true);
    setError("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setError(
        error.message || "Unable to sign in."
      );
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-brand">
          <span>DC</span>
          <span>CLOTHINGS</span>
        </div>

        <div className="admin-login-header">
          <p className="admin-eyebrow">
            DC CLOTHINGS / ADMINISTRATION
          </p>

          <h1>
            Sign In
          </h1>

          <p>
            Access your store administration dashboard.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="admin-login-form"
        >
          <div className="admin-form-field">
            <label htmlFor="admin-email">
              Email Address
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="admin-password">
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="admin-error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

      </div>
    </main>
  );
}