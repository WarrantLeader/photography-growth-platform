import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authClient } from "../auth/client";
import { useAuth } from "../auth/AuthContext";
import { Brand } from "../components/UI";

export default function ForgotPassword() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await auth?.sendPasswordReset(email);
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not send the reset email.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-info auth-card">
      <Brand />
      <div className="eyebrow">ACCOUNT ACCESS</div>
      <h1>
        Reset password<span>.</span>
      </h1>
      {authClient ? (
        sent ? (
          <p role="status">
            If an account exists for that email, a password reset link has been
            sent.
          </p>
        ) : (
          <>
            <p>Enter your account email and we’ll send you a reset link.</p>
            <form className="auth-form" onSubmit={submit}>
              <label htmlFor="reset-email">Email</label>
              <input
                autoComplete="email"
                id="reset-email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              {error && (
                <div className="notice error" role="alert">
                  {error}
                </div>
              )}
              <button className="primary full" disabled={busy} type="submit">
                {busy ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )
      ) : (
        <p>Email and password sign-in is not configured for this workspace.</p>
      )}
      <Link className="primary" to="/login">
        Back to sign in
      </Link>
    </div>
  );
}
