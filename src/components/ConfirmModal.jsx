import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./notepad.css";

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            width: "350px",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          }}
        >
          <h2>{title}</h2>
          <p style={{ marginBottom: "1.5rem" }}>{message}</p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
          >
            <button onClick={onConfirm} className="btn-confirm-delete">
              Confirm
            </button>
            <button
              onClick={onCancel}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
