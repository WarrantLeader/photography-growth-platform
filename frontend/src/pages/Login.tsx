import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import type { Provider } from "@supabase/supabase-js";
import { useAuth } from "../auth/AuthContext";
import { authClient } from "../auth/client";
import { Brand, Icon } from "../components/UI";

function ProviderLogo({ name }: { name: string }) {
  if (name === "Microsoft")
    return (
      <span className="microsoft-logo" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.4 2c.1 1.3-.4 2.5-1.2 3.4-.9.9-2 1.4-3.2 1.3-.1-1.2.4-2.5 1.2-3.3.8-.9 2-1.4 3.2-1.4ZM20.1 17c-.5 1.2-.8 1.7-1.5 2.8-.9 1.2-2.1 2.6-3.5 2.6-1.3 0-1.6-.8-3.4-.8s-2.2.8-3.5.8c-1.3 0-2.5-1.3-3.4-2.6C2.3 16.2 1.8 11.5 3.4 9c1.1-1.8 2.8-2.8 4.4-2.8 1.5 0 2.5.8 3.7.8s2-.8 3.7-.8c1.4 0 2.9.8 4 2.1-3.5 1.9-2.9 6.7.9 8.7Z" />
    </svg>
  );
}

export default function Login() {
  const auth = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [providerBusy, setProviderBusy] = useState<Provider | "">("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const emailDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = emailDialog.current;
    if (!dialog) return;
    if (emailDialogOpen && !dialog.open) dialog.showModal();
    if (!emailDialogOpen && dialog.open) dialog.close();
  }, [emailDialogOpen]);

  if (auth?.loading)
    return (
      <div className="auth-info">
        <p>Checking your session…</p>
      </div>
    );
  if (auth?.user) return <Navigate to="/dashboard" replace />;

  async function signIn(provider: Provider) {
    setError("");
    setProviderBusy(provider);
    try {
      await auth?.signIn(provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
      setProviderBusy("");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await auth?.signInWithPassword(email, password);
      } else {
        const signedIn = await auth?.createAccount(email, password);
        if (!signedIn)
          setMessage("Check your email for a link to confirm your account.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <Brand />
        <div>
          <div className="eyebrow">YOUR WORKSPACE AWAITS</div>
          <h1>
            Behind every
            <br />
            great shoot<span>.</span>
          </h1>
          <p>
            One workspace for your projects, your team
            <br />
            and the business behind your photography.
          </p>
        </div>
        <small>MR T CAPTURES · STUDIO WORKSPACE</small>
      </div>
      <div className="login-side">
        <div className="login-box">
          <Link className="back-link" to="/">
            ← Back
          </Link>
          <div className="eyebrow">WELCOME TO YOUR STUDIO</div>
          <h1>
            {mode === "signin" ? "Sign in" : "Create account"}
            <span>.</span>
          </h1>
          <p>
            {mode === "signin"
              ? "Choose how you’d like to sign in."
              : "Create your account with an email and password."}
          </p>
          <div className="provider-list">
            {(
              [
                ["apple", "Apple"],
                ["azure", "Microsoft"],
              ] as const
            ).map(([provider, name]) => (
              <button
                className={"provider-button provider-" + provider}
                disabled={!!providerBusy || !auth?.providerReady(provider)}
                key={provider}
                onClick={() => signIn(provider)}
                type="button"
              >
                <ProviderLogo name={name} />
                <span>
                  {providerBusy === provider
                    ? "Connecting…"
                    : "Continue with " + name}
                </span>
                {!auth?.providerReady(provider) && <small>Setup needed</small>}
              </button>
            ))}
          </div>
          <div className="demo-divider">
            <span>or</span>
          </div>
          {authClient ? (
            <button
              className="secondary full email-signin-button"
              onClick={() => {
                setError("");
                setMessage("");
                setEmailDialogOpen(true);
              }}
              type="button"
            >
              Use your email
              <Icon name="arrow" size={15} />
            </button>
          ) : (
            <>
              <p className="auth-explanation">
                Sign-in will be available after the workspace owner connects
                authentication.
              </p>
              <button
                className="secondary full"
                onClick={() => auth?.login("Demo workspace")}
              >
                Explore demo
                <Icon name="arrow" size={15} />
              </button>
              <p className="small-note">
                The demo uses example records and cannot send invoices or accept
                payments.
              </p>
            </>
          )}
          {authClient && (
            <dialog
              aria-labelledby="email-dialog-title"
              className="email-signin-dialog"
              onClick={(event) => {
                if (event.target === emailDialog.current)
                  setEmailDialogOpen(false);
              }}
              onClose={() => setEmailDialogOpen(false)}
              ref={emailDialog}
            >
              <div className="email-dialog-content">
                <button
                  aria-label="Close email sign-in"
                  className="email-dialog-close"
                  onClick={() => setEmailDialogOpen(false)}
                  type="button"
                >
                  ×
                </button>
                <div className="eyebrow">
                  {mode === "signin" ? "WELCOME BACK" : "JOIN YOUR STUDIO"}
                </div>
                <h2 id="email-dialog-title">
                  {mode === "signin" ? "Sign in with email" : "Create account"}
                </h2>
                <p>
                  {mode === "signin"
                    ? "Enter your email and password to continue."
                    : "Create your account with an email and password."}
                </p>
                <form className="auth-form" onSubmit={submit}>
                  <label htmlFor="login-email">Email</label>
                  <input
                    autoComplete="email"
                    id="login-email"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                  <label htmlFor="login-password">Password</label>
                  <input
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    id="login-password"
                    minLength={mode === "signup" ? 8 : undefined}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                  {mode === "signup" && (
                    <small className="password-hint">
                      Use at least 8 characters.
                    </small>
                  )}
                  {error && (
                    <div className="notice error" role="alert">
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="notice" role="status">
                      {message}
                    </div>
                  )}
                  <button className="primary full" disabled={busy} type="submit">
                    {busy
                      ? mode === "signin"
                        ? "Signing in…"
                        : "Creating account…"
                      : mode === "signin"
                        ? "Sign in"
                        : "Create account"}
                    <Icon name="arrow" size={15} />
                  </button>
                </form>
                <div className="email-dialog-links">
                  {mode === "signin" && (
                    <Link to="/forgot-password">Forgot your password?</Link>
                  )}
                  <p className="auth-switch">
                    {mode === "signin"
                      ? "New to the workspace?"
                      : "Already have an account?"}{" "}
                    <button
                      onClick={() => {
                        setError("");
                        setMessage("");
                        setMode(mode === "signin" ? "signup" : "signin");
                      }}
                      type="button"
                    >
                      {mode === "signin" ? "Create an account" : "Sign in"}
                    </button>
                  </p>
                </div>
              </div>
            </dialog>
          )}
          <p className="auth-footer">
            Your account is secured by the workspace authentication service.
          </p>
        </div>
      </div>
    </div>
  );
}
