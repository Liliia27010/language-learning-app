import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import { authClient } from "../lib/auth-client";

export default function Signup({ isOpen, onClose, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [teacherCode, setTeacherCode] = useState("");

  if (!isOpen) return null;

  const handleSignup = async (e) => {
    e.preventDefault();

    let digits = 0;
    let letters = 0;

    for (let char of password) {
      if (char >= "0" && char <= "9") digits++;
      else if (char.toLowerCase() !== char.toUpperCase()) letters++;
    }

    if (password.length > 12) {
      alert("Password shouldn't exceed 12 characters");
      return;
    }

    if (digits < 2 || letters < 6) {
      alert("Password must have at least 2 numbers and 6 letters!");
      return;
    }

    if (userType === "teacher" && teacherCode !== "FINLEARN") {
      alert("Invalid Teacher Code!");
      return;
    }

    const userData = {
      name: name,
      email: email,
      password: password,
      userType: userType,
    };

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: email,
        password: password,
        name: name,
        data: {
          userType: userType,
        },
      });

      if (error) {
        alert(error.message || "Signup failed");
        return;
      }
      alert("Registration successful!");
      onSwitchToLogin();
    } catch (err) {
      console.error("Signup error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="backdrop" onClick={onClose} />
      <div className="modal">
        <button className="close-modal-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="box-header">
          <h2>Welcome to FINLEARN</h2>
          <p>Please enter your details to signup.</p>
        </div>

        <div className="user-type-container">
          <button
            type="button"
            className={`type-btn ${userType === "student" ? "active" : ""}`}
            onClick={() => setUserType("student")}
          >
            Student
          </button>

          <button
            type="button"
            className={`type-btn ${userType === "teacher" ? "active" : ""}`}
            onClick={() => setUserType("teacher")}
          >
            Teacher
          </button>
        </div>

        <form className="form" onSubmit={handleSignup}>
          {userType === "teacher" && (
            <div className="input-field teacher-code-section">
              <label>Teacher Access Code</label>
              <input
                type="text"
                className="input"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                placeholder="Enter FINLEARN code"
                required
              />
            </div>
          )}

          <div className="input-field">
            <label>Full Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Antonio Poual"
              required
            />
          </div>

          <div className="input-field">
            <label>Email Address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className="input-field">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              maxLength={12}
              required
            />
            <p style={{ fontSize: "11px", color: "#666" }}>
              Requires 2 digits and 6 letters (Max 12)
            </p>
          </div>

          <div className="options">
            <span className="forgot-pass" onClick={onSwitchToLogin}>
              Already have an account? Log in
            </span>
          </div>

          <button type="submit" className="create-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="spinner" size={20} />
                Wait...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
