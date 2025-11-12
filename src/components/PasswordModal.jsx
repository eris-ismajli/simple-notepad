import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./notepad.css";

export default function PasswordModal({ onSubmit, onClose, requireUsername }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [exiting, setExiting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requireUsername && username.trim() === "") {
      toast.error("Username is required");
      return;
    }
    if (password.trim() === "") {
      toast.error("Password is required");
      return;
    }
    onSubmit(requireUsername ? { username, password } : password);
    setUsername("");
    setPassword("");
  };

  const startExit = () => setExiting(true);

  const handleAnimationEnd = (e) => {
    if (exiting && e.animationName === "scaleOut") {
      onClose && onClose();
    }
  };

  return (
    <>
      {/* <Toaster position="top-center" reverseOrder={false} /> */}
      <div
        className={exiting ? "modal-exit" : "modal-appear"}
        onAnimationEnd={handleAnimationEnd}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: "20px",
          padding: "2rem",
          width: "380px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          textAlign: "center",
          backdropFilter: "blur(8px)",
          willChange: "transform, opacity, filter",
          zIndex: 1000,
        }}
      >
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: "600",
            color: "#111",
            marginBottom: "1.5rem",
          }}
        >
          {requireUsername ? "Admin Login" : "Enter Password to edit"}
        </h3>

        <form onSubmit={handleSubmit}>
          {requireUsername && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
              style={{
                width: "100%",
                padding: "0.8rem 1rem",
                fontSize: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
                marginBottom: "1rem",
              }}
            />
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: "100%",
              padding: "0.8rem 1rem",
              fontSize: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.15)",
              outline: "none",
              marginBottom: "1.5rem",
            }}
          />

          <div
            style={{ display: "flex", justifyContent: "center", gap: "0.8rem" }}
          >
            <button type="submit" className="btn-login">
              Log in
            </button>

            <button type="button" onClick={startExit} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
