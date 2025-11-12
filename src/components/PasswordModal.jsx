import React, { useState } from "react";

export default function PasswordModal({ isDeleting, onSubmit, onClose }) {
  const [input, setInput] = useState("");
  const [exiting, setExiting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() !== "") {
      onSubmit(input);
      setInput("");
    }
  };

  const startExit = () => {
    setExiting(true);
  };

  const handleAnimationEnd = (e) => {
    if (exiting && e.animationName === "scaleOut") {
      if (typeof onClose === "function") onClose();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes scaleIn {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.85);
              filter: blur(4px);
            }
            60% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.03);
              filter: blur(0);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes scaleOut {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.9);
              filter: blur(2px);
            }
          }

          .modal-appear {
            animation: scaleIn 0.45s cubic-bezier(0.25, 1, 0.3, 1) forwards;
          }

          .modal-exit {
            animation: scaleOut 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}
      </style>

      <div
        className={exiting ? "modal-exit" : "modal-appear"}
        onAnimationEnd={handleAnimationEnd}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(255, 255, 255)",
          borderRadius: "20px",
          padding: "2rem",
          width: "380px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.4)",
          textAlign: "center",
          backdropFilter: "blur(8px)",
          willChange: "transform, opacity, filter",
        }}
      >
        <h3
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
            fontSize: "1.3rem",
            fontWeight: "600",
            color: "#111",
            marginBottom: "1.5rem",
          }}
        >
          Enter Password to {isDeleting ? "delete" : "edit"}
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Password"
            style={{
              width: "100%",
              padding: "0.8rem 1rem",
              fontSize: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.15)",
              outline: "none",
              marginBottom: "1.5rem",
              background: "rgba(255,255,255,0.7)",
              transition: "border 0.3s ease, box-shadow 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #007aff";
              e.target.style.boxShadow = "0 0 0 2px rgba(0,122,255,0.25)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(0,0,0,0.15)";
              e.target.style.boxShadow = "none";
            }}
          />
        </form>

        <div
          style={{ display: "flex", justifyContent: "center", gap: "0.8rem" }}
        >
          <button
            style={{
              background: "linear-gradient(145deg, #007aff, #0056d8)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "0.6rem 1.2rem",
              fontSize: "0.95rem",
              cursor: "pointer",
              fontWeight: 500,
              letterSpacing: "0.01em",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background =
                "linear-gradient(145deg, #248aff, #0063e0)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background =
                "linear-gradient(145deg, #007aff, #0056d8)")
            }
          >
            Submit
          </button>

          <button
            onClick={startExit}
            style={{
              background: "rgba(0,0,0,0.05)",
              color: "#333",
              border: "none",
              borderRadius: "10px",
              padding: "0.6rem 1.2rem",
              fontSize: "0.95rem",
              cursor: "pointer",
              fontWeight: 500,
              letterSpacing: "0.01em",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(0,0,0,0.1)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "rgba(0,0,0,0.05)")
            }
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
