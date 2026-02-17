import React, { useActionState } from "react";
import { X, Loader } from "lucide-react";
import { useAuth } from "./LoginContext";
import { authClient } from "../lib/auth-client";

export default function Login({ isOpen, onClose, onSwitchToSignup }) {
  const { handleLogin } = useAuth();

  async function handleLoginAction(prevState, formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message || "Login failed" };
      }
      handleLogin();
      onClose();
      return { success: true, error: null };
    } catch (err) {
      console.error("Login Error:", err);
      return { success: false, error: "Connection error" };
    }
  }

  const [state, formAction, isPending] = useActionState(handleLoginAction, {
    success: false,
    error: null,
  });

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="backdrop" onClick={onClose} />
      <div className="modal">
        <button className="close-modal-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="box-header">
          <h2>Welcome to FINLEARN</h2>
          <p>Please enter your details to log in.</p>
        </div>
        {state?.error && <p>{state.error}</p>}
        <form action={formAction} className="form">
          <div className="input-field">
            <label htmlFor="email">Email Address</label>
            <input
              name="email"
              id="email"
              type="email"
              className="input"
              placeholder="example@mail.com"
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="options">
            <span className="forgot-pass" onClick={onSwitchToSignup}>
              Sign up?
            </span>
          </div>
          <button type="submit" className="create-btn" disabled={isPending}>
            {isPending ? (
              <span className="btn-content">
                <Loader className="spinner" size={18} />
                Wait...
              </span>
            ) : (
              "Log in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
