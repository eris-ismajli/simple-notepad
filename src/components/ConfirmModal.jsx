// ConfirmModal.jsx
import React from "react";
import { motion } from "framer-motion";

const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialog = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <motion.div
      variants={backdrop}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <motion.div
        variants={dialog}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18 }}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "2rem",
          width: 350,
          textAlign: "center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        }}
      >
        <h2>{title}</h2>
        <p style={{ marginBottom: "1.5rem" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button onClick={onConfirm} className="btn-confirm-delete">
            Confirm
          </button>
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
