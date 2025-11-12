import React, { useState } from "react";
import "./notepad.css";

export default function PasswordModal({
  setLoginFeedback,
  loginFeedback,
  onSubmit, // should return boolean success
  onClose,
  requireUsername,
}) {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });
  const [exiting, setExiting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = userData;

    if (requireUsername && username.trim() === "") {
      setLoginFeedback("Username is required");
      return;
    }
    if (password.trim() === "") {
      setLoginFeedback("Password is required");
      return;
    }

    // call login function and wait for success boolean
    const success = await onSubmit(requireUsername ? { username, password } : password);

    if (success) {
      // only reset form and close if login succeeded
      setUserData({ username: "", password: "" });
      startExit();
    }
    // else: keep modal open and show feedback
  };

  const startExit = () => setExiting(true);

  const handleAnimationEnd = (e) => {
    if (exiting && e.animationName === "scaleOut") {
      onClose && onClose();
    }
  };

  const handleChange = (e) => {
    setLoginFeedback("");

    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
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
            value={userData.username}
            onChange={handleChange}
            name="username"
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
          value={userData.password}
          onChange={handleChange}
          name="password"
          placeholder="Password"
          style={{
            width: "100%",
            padding: "0.8rem 1rem",
            fontSize: "1rem",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.15)",
            outline: "none",
            marginBottom: ".3rem",
          }}
        />

        <p className="login-feedback">{loginFeedback}</p>

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
  );
}
