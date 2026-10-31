
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AccountMode = "signin" | "signup" | "forgot" | "reset";

export default function AccountPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [mode, setMode] = useState<AccountMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setMessage("Choose a new password for your account.");
        setError("");
      }

      if (event === "SIGNED_IN" && session?.user) {
        setUserEmail(session.user.email ?? "");
      }

      if (event === "SIGNED_OUT") {
        setUserEmail("");
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!mounted) return;

        if (sessionError) {
          setError("We couldn't check your sign-in status. Please refresh.");
        }

        const session = data.session;

        if (session?.user) {
          setUserEmail(session.user.email ?? "");
        }

        const params = new URLSearchParams(window.location.search);

        if (params.get("mode") === "reset") {
          setMode("reset");
          setMessage("Choose a new password for your account.");
        }

        if (params.get("verified") === "1") {
          setMessage("Your email has been verified. You can now sign in.");
          setMode("signin");
        }

        setCheckingSession(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError("We couldn't check your sign-in status. Please refresh.");
        setCheckingSession(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  function changeMode(nextMode: AccountMode) {
    setMode(nextMode);
    setMessage("");
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (mode === "signup" || mode === "reset") {
      if (password.length < 8) {
        setError("Your password must be at least 8 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: authError } =
          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
              emailRedirectTo: `${window.location.origin}/account?verified=1`,
            },
          });

        if (authError) throw authError;

        if (data.session) {
          setUserEmail(data.user?.email ?? normalizedEmail);
          setMessage("Your account has been created successfully.");
        } else {
          setMessage(
            "Account created. Please check your email for the verification link before signing in."
          );
          setMode("signin");
          setPassword("");
          setConfirmPassword("");
        }
      } else if (mode === "signin") {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

        if (authError) throw authError;

        setUserEmail(data.user.email ?? normalizedEmail);
        setMessage("You have signed in successfully.");
        setPassword("");
      } else if (mode === "forgot") {
        const { error: authError } =
          await supabase.auth.resetPasswordForEmail(
            normalizedEmail,
            {
              redirectTo: `${window.location.origin}/account?mode=reset`,
            }
          );

        if (authError) throw authError;

        setMessage(
          "If an account exists for this email, a password reset link will be sent. Please check your inbox and spam folder."
        );
      } else if (mode === "reset") {
        const { error: authError } =
          await supabase.auth.updateUser({ password });

        if (authError) throw authError;

        setPassword("");
        setConfirmPassword("");
        setMode("signin");
        setMessage("Your password has been updated. Please sign in.");
      }
    } catch (err: unknown) {
      const authMessage =
        err instanceof Error ? err.message : "";

      if (/invalid login credentials/i.test(authMessage)) {
        setError("Email or password is incorrect.");
      } else if (/email not confirmed/i.test(authMessage)) {
        setError(
          "Please verify your email using the link we sent before signing in."
        );
      } else if (/already registered|already exists/i.test(authMessage)) {
        setError(
          "An account may already exist with this email. Try signing in instead."
        );
      } else if (/password should be at least/i.test(authMessage)) {
        setError("Please choose a stronger password.");
      } else if (/rate limit|too many requests/i.test(authMessage)) {
        setError("Too many attempts. Please wait a little and try again.");
      } else {
        setError(
          authMessage ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    setError("");

    const { error: signOutError } = await supabase.auth.signOut();

    setLoading(false);

    if (signOutError) {
      setError("We couldn't sign you out. Please try again.");
      return;
    }

    setUserEmail("");
    setMessage("You have signed out.");
    changeMode("signin");
    router.refresh();
  }

  const titles: Record<AccountMode, string> = {
    signin: "Welcome back",
    signup: "Create your account",
    forgot: "Reset your password",
    reset: "Choose a new password",
  };

  if (checkingSession) {
    return (
      <main className="account-page">
        <div className="account-card">
          <p className="account-muted">Loading your account...</p>
        </div>
        <style jsx>{`
          .account-page {
            min-height: 65vh;
            display: grid;
            place-items: center;
            padding: 48px 20px;
            background: #f7f6f3;
          }
          .account-card {
            width: 100%;
            max-width: 460px;
            padding: 36px;
            background: #fff;
            border: 1px solid #e8e5df;
          }
          .account-muted {
            color: #666;
            text-align: center;
          }
        `}</style>
      </main>
    );
  }

  if (userEmail && mode !== "reset") {
    return (
      <main className="account-page">
        <section className="account-card">
          <p className="account-eyebrow">DC CLOTHINGS</p>
          <h1>Your account</h1>
          <p className="account-muted">
            You are signed in as:
          </p>
          <p className="account-email">{userEmail}</p>

          {message && (
            <p className="account-message" role="status">
              {message}
            </p>
          )}

          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="account-button"
            onClick={() => router.push("/")}
          >
            Continue shopping
          </button>

          <button
            className="account-secondary-button"
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? "Signing out..." : "Sign out"}
          </button>
        </section>

        <style jsx>{`
          .account-page {
            min-height: 65vh;
            display: grid;
            place-items: center;
            padding: 48px 20px;
            background: #f7f6f3;
          }
          .account-card {
            width: 100%;
            max-width: 460px;
            padding: 36px;
            background: #fff;
            border: 1px solid #e8e5df;
          }
          .account-eyebrow {
            font-size: 12px;
            letter-spacing: 2px;
            font-weight: 700;
            color: #777;
          }
          h1 {
            font-size: 30px;
            margin: 12px 0 24px;
            color: #171717;
          }
          .account-muted {
            color: #666;
          }
          .account-email {
            font-weight: 600;
            overflow-wrap: anywhere;
          }
          .account-message,
          .account-error {
            padding: 12px;
            font-size: 14px;
            line-height: 1.5;
          }
          .account-message {
            background: #f0f5ed;
            color: #28552c;
          }
          .account-error {
            background: #fff0f0;
            color: #a11;
          }
          .account-button,
          .account-secondary-button {
            width: 100%;
            min-height: 48px;
            margin-top: 12px;
            cursor: pointer;
          }
          .account-button {
            background: #171717;
            color: white;
            border: 1px solid #171717;
          }
          .account-secondary-button {
            background: white;
            color: #171717;
            border: 1px solid #ddd;
          }
          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          @media (max-width: 480px) {
            .account-card {
              padding: 26px 20px;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <p className="account-eyebrow">DC CLOTHINGS</p>
        <h1>{titles[mode]}</h1>
        <p className="account-intro">
          {mode === "signin" &&
            "Sign in to access your customer account."}
          {mode === "signup" &&
            "Create an account to make future shopping easier."}
          {mode === "forgot" &&
            "Enter your email address and we'll send instructions if an account exists."}
          {mode === "reset" &&
            "Choose a strong password for your account."}
        </p>

        {message && (
          <p className="account-message" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="account-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Full name
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your full name"
                required
              />
            </label>
          )}

          {mode !== "reset" && (
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </label>
          )}

          {(mode === "signin" ||
            mode === "signup" ||
            mode === "reset") && (
            <label>
              {mode === "reset" ? "New password" : "Password"}
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signin"
                      ? "current-password"
                      : "new-password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder={
                    mode === "reset"
                      ? "Enter your new password"
                      : "At least 8 characters"
                  }
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          )}

          {(mode === "signup" || mode === "reset") && (
            <label>
              Confirm password
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter your password again"
                minLength={8}
                required
              />
            </label>
          )}

          <button
            className="account-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
                ? "Sign In"
                : mode === "signup"
                  ? "Create Account"
                  : mode === "forgot"
                    ? "Send Reset Link"
                    : "Update Password"}
          </button>
        </form>

        <div className="account-links">
          {mode === "signin" && (
            <>
              <button
                type="button"
                onClick={() => changeMode("forgot")}
              >
                Forgot password?
              </button>
              <p>
                New to DCClothings?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("signup")}
                >
                  Create an account
                </button>
              </p>
            </>
          )}

          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => changeMode("signin")}
              >
                Sign in
              </button>
            </p>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => changeMode("signin")}
            >
              Back to sign in
            </button>
          )}

          {mode === "reset" && (
            <button
              type="button"
              onClick={() => changeMode("signin")}
            >
              Back to sign in
            </button>
          )}
        </div>
      </section>

      <style jsx>{`
        .account-page {
          min-height: 65vh;
          display: grid;
          place-items: center;
          padding: 56px 20px;
          background: #f7f6f3;
        }
        .account-card {
          width: 100%;
          max-width: 460px;
          padding: 40px;
          background: #fff;
          border: 1px solid #e8e5df;
        }
        .account-eyebrow {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #777;
        }
        h1 {
          margin: 0 0 12px;
          font-size: 32px;
          line-height: 1.2;
          font-weight: 500;
          color: #171717;
        }
        .account-intro {
          margin: 0 0 24px;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }
        form {
          display: grid;
          gap: 18px;
        }
        label {
          display: grid;
          gap: 8px;
          color: #292929;
          font-size: 14px;
          font-weight: 500;
        }
        input {
          box-sizing: border-box;
          width: 100%;
          min-height: 48px;
          padding: 12px 14px;
          border: 1px solid #d8d5cf;
          border-radius: 0;
          background: #fff;
          color: #171717;
          font: inherit;
          outline-offset: 2px;
        }
        input:focus {
          border-color: #171717;
          outline: 1px solid #171717;
        }
        .password-wrap {
          display: flex;
          align-items: center;
          position: relative;
        }
        .password-wrap input {
          padding-right: 65px;
        }
        .show-password {
          position: absolute;
          right: 12px;
          border: 0;
          background: transparent;
          color: #555;
          cursor: pointer;
          font-size: 12px;
        }
        .account-button {
          width: 100%;
          min-height: 50px;
          margin-top: 4px;
          border: 1px solid #171717;
          background: #171717;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-weight: 600;
        }
        .account-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .account-links {
          margin-top: 22px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .account-links p {
          line-height: 1.8;
        }
        .account-links button {
          border: 0;
          padding: 0;
          background: transparent;
          color: #171717;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          font: inherit;
        }
        .account-message,
        .account-error {
          margin: 0 0 18px;
          padding: 12px;
          font-size: 13px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }
        .account-message {
          background: #f0f5ed;
          color: #28552c;
        }
        .account-error {
          background: #fff0f0;
          color: #a11;
        }
        @media (max-width: 480px) {
          .account-page {
            padding: 32px 16px;
          }
          .account-card {
            padding: 28px 20px;
          }
          h1 {
            font-size: 28px;
          }
        }
      `}</style>
    </main>
  );
}
