import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import PasswordModal from "./PasswordModal";
import { Lock, Unlock, LogOut, Trash } from "lucide-react";
import loginAdmin from "../utils/adminAuth";
import "./notepad.css";
import ConfirmModal from "./ConfirmModal";
import toast, { Toaster } from "react-hot-toast";
export default function Notepad() {
  const location = useLocation();
  const noteKey =
    location.pathname === "/"
      ? "note-home"
      : `note-${location.pathname.slice(1)}`;

  const [text, setText] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const textareaRef = useRef(null);

  // 🔐 Load admin login session (without enabling edit by default)
  useEffect(() => {
    const adminUsername = sessionStorage.getItem("adminUsername");
    if (adminUsername) setIsLoggedIn(true); // logged in but edit mode OFF
  }, []);

  // 🔥 Firestore real-time listener
  useEffect(() => {
    const docRef = doc(db, "notes", noteKey);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data.text === "string") setText(data.text);
      } else {
        setText("");
      }
    });
    return () => unsubscribe();
  }, [noteKey]);

  // ✏️ Debounced save
  useEffect(() => {
    if (!canEdit) return;
    const timeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        await setDoc(doc(db, "notes", noteKey), { text });
      } catch (err) {
        console.error("Error saving note:", err);
      } finally {
        setIsSaving(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [text, canEdit, noteKey]);

  // 🎯 Focus textarea when entering edit mode
  useEffect(() => {
    if (canEdit && textareaRef.current) {
      const timer = setTimeout(() => textareaRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [canEdit]);

  // 🔑 Handle login modal submit
  const handlePasswordSubmit = async ({ username, password }) => {
    const success = await loginAdmin(username, password);
    if (success) {
      setIsLoggedIn(true);
      setCanEdit(true);
      sessionStorage.setItem("adminUsername", username);
    }
    setShowModal(false);
    setShowDeleteModal(false);
  };

  const handleDeleteNotes = async () => {
    setShowConfirmDelete(true); // Show confirm modal first
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);

    const notesRef = collection(db, "notes");
    const allNotes = await getDocs(notesRef);
    await Promise.all(allNotes.docs.map((d) => deleteDoc(d.ref)));

    setText("");
    setCanEdit(false);
    toast.success("All notes deleted!");
  };

  const cancelDelete = () => setShowConfirmDelete(false);

  // 🚪 Toggle edit mode
  const handleToggleEditMode = () => {
    if (canEdit) {
      setCanEdit(false); // exit edit mode visually
    } else if (isLoggedIn) {
      setCanEdit(true); // already logged in
    } else {
      setShowModal(true); // show login modal
    }
  };

  // 🔒 Log out
  const handleLogout = () => {
    sessionStorage.removeItem("adminUsername");
    setIsLoggedIn(false);
    setCanEdit(false);
  };

  return (
    <div className="notepad-container">
      <Toaster position="bottom-center" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="notepad"
      >
        <div className="notepad-header">
          <h2
            className="notepad-title"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {location.pathname.replace(/^\//, "") || "Untitled Note"}
            {isSaving && canEdit && (
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #007aff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            )}
          </h2>

          <div className="buttons">
            {isLoggedIn ? (
              <>
                <button
                  className="btn btn-delete-all"
                  onClick={handleDeleteNotes}
                >
                  <Trash size={15} />
                  Delete Notes
                </button>
                <button
                  onClick={handleToggleEditMode}
                  className="btn btn-primary"
                >
                  {canEdit ? (
                    <>
                      <Unlock size={16} /> Exit Edit Mode
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Edit Mode
                    </>
                  )}
                </button>

                <button onClick={handleLogout} className="btn btn-dark">
                  <LogOut size={16} /> Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                <Lock size={16} /> Admin Login
              </button>
            )}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          readOnly={!canEdit}
          onChange={(e) => setText(e.target.value)}
          className={`notepad-textarea ${canEdit ? "editable" : "readonly"}`}
          placeholder={canEdit ? "Start typing..." : "No text to display"}
        />

        {!canEdit && (
          <p className="readonly-hint">
            Read-only mode — only admins can edit.
          </p>
        )}

        <AnimatePresence>
          {showModal && (
            <PasswordModal
              key="editModal"
              onSubmit={handlePasswordSubmit}
              onClose={() => setShowModal(false)}
              requireUsername={true}
            />
          )}
          {showConfirmDelete && (
            <ConfirmModal
              title="Delete all notes"
              message="Are you sure you want to delete all notes? This cannot be undone."
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="notepad-footer">
        &copy; {new Date().getFullYear()} Eris Ismajli. All rights reserved.
      </footer>
    </div>
  );
}
