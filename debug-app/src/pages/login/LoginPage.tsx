import { useState, type FormEvent } from "react";
import { useMutationLogin } from "@/api";
import { useAuth } from "@/context";

export default function LoginPage() {
  const auth = useAuth();
  const mutation = useMutationLogin();
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isDisabled = mutation.isPending || auth.isLoggingOut || auth.logoutFailed;
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDisabled) return;
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") ?? "");
    form.reset();
    setIsVisible(false);
    setHasError(false);
    try { auth.login(await mutation.mutateAsync(password)); }
    catch { setHasError(true); }
    finally { mutation.reset(); }
  };
  return <main className="login-shell">
    <section className="login-form" aria-labelledby="login-title">
      <h1 id="login-title">Device diagnostics</h1>
      <p className="muted">Login to view authorized device events.</p>
      {auth.logoutFailed && <div className="notice warning" role="alert">This view is cleared, but logout could not be confirmed. <button disabled={auth.isLoggingOut} onClick={() => void auth.logout()}>Retry logout</button></div>}
      <form onSubmit={(event) => void handleSubmit(event)}>
        <label htmlFor="password">Password</label>
        <div className="password-field">
          <input id="password" name="password" type={isVisible ? "text" : "password"} autoComplete="current-password" required maxLength={512} disabled={isDisabled} aria-invalid={hasError} aria-describedby={hasError ? "login-error" : undefined} />
          <button type="button" aria-pressed={isVisible} aria-controls="password" onClick={() => setIsVisible((value) => !value)}>{isVisible ? "Hide" : "Show"}</button>
        </div>
        {hasError && <p id="login-error" role="alert" className="error">Login failed. Check your password or try again later.</p>}
        <button className="primary login-submit" type="submit" disabled={isDisabled}>{mutation.isPending ? "Logging in…" : auth.isLoggingOut ? "Logging out…" : "Login"}</button>
      </form>
    </section>
  </main>;
}
