import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authClient } from "../auth/client";
import { useAuth } from "../auth/AuthContext";
import { Brand } from "../components/UI";

export default function ResetPassword() {
  const auth = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await auth?.updatePassword(password);
      setUpdated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-info auth-card">
      <Brand />
      <div className="eyebrow">ACCOUNT ACCESS</div>
      <h1>
        Choose a new password<span>.</span>
      </h1>
      {!authClient ? (
        <p>Email and password sign-in is not configured for this workspace.</p>
      ) : auth?.loading ? (
        <p>Checking your reset link…</p>
      ) : updated ? (
        <>
          <p role="status">Your password has been updated.</p>
          <Link className="primary" to="/dashboard">
            Continue to workspace
          </Link>
        </>
      ) : !auth?.user ? (
        <>
          <p>This reset link is invalid or has expired. Request a new one.</p>
          <Link className="primary" to="/forgot-password">
            Request another reset link
          </Link>
        </>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="new-password">New password</label>
          <input
            autoComplete="new-password"
            id="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            autoComplete="new-password"
            id="confirm-password"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          <button className="primary full" disabled={busy} type="submit">
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
