import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { successToast, warnToast, errorToast } from "../utils/toasts";

import {
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import PasswordModal from "./PasswordModal";
import {
  Lock,
  Unlock,
  LogOut,
  Trash,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
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
  const [loginFeedback, setLoginFeedback] = useState("");

  // store last edited timestamp for UI
  const [lastEdited, setLastEdited] = useState(null);

  const textareaRef = useRef(null);
  // store the text value when entering edit mode so we can detect changes on exit
  const originalTextRef = useRef("");

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
        // Firestore Timestamp -> JS Date
        if (data && data.lastEdited) {
          // lastEdited may be a Firestore Timestamp
          const ts = data.lastEdited.toDate
            ? data.lastEdited.toDate()
            : data.lastEdited;
          setLastEdited(ts);
        } else {
          setLastEdited(null);
        }
      } else {
        setText("");
        setLastEdited(null);
      }
    });
    return () => unsubscribe();
  }, [noteKey]);

  // ✏️ Debounced save (autosave while editing). Use merge so we don't overwrite lastEdited.
  useEffect(() => {
    if (!canEdit) return;
    const docRef = doc(db, "notes", noteKey);
    const timeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        // merge: true so autosave doesn't wipe server-set lastEdited
        await setDoc(docRef, { text }, { merge: true });
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
    const success = await loginAdmin(setLoginFeedback, username, password);
    if (success) {
      setIsLoggedIn(true);
      setCanEdit(true);
      sessionStorage.setItem("adminUsername", username);
      // record original text for change detection
      originalTextRef.current = text;
      setShowModal(false);
    }
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
    successToast("All notes deleted!");
  };

  const cancelDelete = () => setShowConfirmDelete(false);

  // 🚪 Toggle edit mode — capture timestamp when exiting edit mode (only if content changed)
  const handleToggleEditMode = async () => {
    const docRef = doc(db, "notes", noteKey);

    if (canEdit) {
      // We're exiting edit mode — check if text changed while editing
      const original = originalTextRef.current ?? "";
      if (text !== original) {
        try {
          setIsSaving(true);
          // update text + lastEdited with server timestamp; merge so we don't remove other fields
          await setDoc(
            docRef,
            { text, lastEdited: serverTimestamp() },
            { merge: true }
          );
        } catch (err) {
          console.error("Error saving final edit:", err);
          toast.error("Failed to save changes");
        } finally {
          setIsSaving(false);
        }
      }
      setCanEdit(false); // exit edit mode visually
    } else if (isLoggedIn) {
      // entering edit mode: remember original text so we can detect changes on exit
      originalTextRef.current = text;
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

  // helper to render nice date/time
  const formatLastEdited = (date) => {
    if (!date) return "Never";
    // Use locale string — adapt if you want a custom formatter
    return date.toLocaleString();
  };

  // --- NEW: live counts ---
  const charCount = text.length;
  const lineCount = text === "" ? 0 : text.split(/\r\n|\r|\n/).length;
  // ------------------------

  return (
    <div className="notepad-container">
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3600,
          className: "custom-toast",
          style: {
            padding: "10px 12px",
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            fontSize: "14px",
          },
        }}
      />
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
                  <p className="button-text">Delete Notes</p>
                </button>
                <button
                  onClick={handleToggleEditMode}
                  className={`btn ${canEdit ? "exit-edit-btn" : "btn-primary"}`}
                >
                  {canEdit ? (
                    <>
                      <Unlock size={16} />
                      <p className="button-text">Exit Edit Mode</p>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />{" "}
                      <p className="button-text">Edit Mode</p>
                    </>
                  )}
                </button>

                <button onClick={handleLogout} className="btn btn-dark">
                  <LogOut size={16} /> <p className="button-text">Log Out</p>
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

        {/* Info area: Last edited + character & line counts */}
        <div className="info-tags">
          <div className="tags-wrapper">
            <div className="tag-container">
              <p className="tag-text">{formatLastEdited(lastEdited)}</p>
              <p className="tag-label date-label">Last edited</p>
            </div>

            <div className="tag-container">
              <p className="tag-text tag-char">{charCount}</p>
              <p className="tag-label char-label">Characters</p>
            </div>

            <div className="tag-container">
              <p className="tag-text tag-lines">{lineCount}</p>
              <p className="tag-label lines-label">Lines</p>
            </div>
          </div>

          <p className="read-only">Read-only mode — only admins can edit.</p>
        </div>

        <AnimatePresence>
          {showModal && (
            <PasswordModal
              key="editModal"
              setLoginFeedback={setLoginFeedback}
              loginFeedback={loginFeedback}
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
