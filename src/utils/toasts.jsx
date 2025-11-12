// src/utils/toasts.jsx
import React from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Bell } from "lucide-react";

/**
 * Shared motion variants
 */
const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.99 },
};

function ToastCard({ title, message, type }) {
  const icons = {
    success: <CheckCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    error: <XCircle size={18} />,
    info: <Bell size={18} />,
  };

  return (
    <div className={`toast-card toast-${type}`}>
      <div className="toast-icon">{icons[type] ?? icons.info}</div>
      <div className="toast-body">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
}

/**
 * Render wrapper used by toast.custom.
 * react-hot-toast passes a `t` object: t.visible is true while the toast should be shown.
 * We animate between 'hidden' and 'show' depending on t.visible.
 */
function renderCustomToast({ title, message, type }) {
  return (t) => (
    <motion.div
      initial="hidden"
      animate={t.visible ? "show" : "exit"}
      variants={cardVariants}
      transition={{
        type: "spring",
        stiffness: 600,
        damping: 28,
        duration: 0.22,
      }}
      style={{ pointerEvents: "auto" }} // allow clicks
    >
      <ToastCard title={title} message={message} type={type} />
    </motion.div>
  );
}

/* exported helpers */
export function successToast(message, title = "Success") {
  return toast.custom(renderCustomToast({ title, message, type: "success" }), {
    id: `success-${Date.now()}`,
    duration: 3000,
  });
}

export function warnToast(message, title = "Warning") {
  return toast.custom(renderCustomToast({ title, message, type: "warning" }), {
    id: `warn-${Date.now()}`,
    duration: 4200,
  });
}

export function errorToast(message, title = "Error") {
  return toast.custom(renderCustomToast({ title, message, type: "error" }), {
    id: `error-${Date.now()}`,
    duration: 4200,
  });
}
