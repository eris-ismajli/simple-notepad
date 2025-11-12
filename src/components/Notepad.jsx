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
import { Lock, Unlock } from "lucide-react";
import "./notepad.css";

export default function Notepad() {
  const location = useLocation();
  const noteKey =
    location.pathname === "/"
      ? "note-home"
      : `note-${location.pathname.slice(1)}`;

  const [text, setText] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = useRef(null);
  const HARDCODED_PASSWORD = atob("U3VwZXJTZWNyZXQxMjMh");

  // 🔐 Load edit state (UI only)
  useEffect(() => {
    const savedEdit = localStorage.getItem("editModeEnabled");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedEdit === "true" && savedPassword === HARDCODED_PASSWORD) {
      setCanEdit(true);
    }
  }, []);

  // 🔥 Listen to Firestore in real-time
  useEffect(() => {
    const docRef = doc(db, "notes", noteKey);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data.text === "string") {
          setText(data.text);
        }
      } else {
        setText("");
      }
    });

    return () => unsubscribe();
  }, [noteKey]);

  // ✏️ Debounced save to Firestore
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

  // 🎯 Focus textarea on unlock
  useEffect(() => {
    if (canEdit && textareaRef.current) {
      const timer = setTimeout(() => textareaRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [canEdit]);

  // 🔑 Handle password submit
  const handlePasswordSubmit = async (input) => {
    if (input !== HARDCODED_PASSWORD) {
      alert("Wrong password");
      setShowModal(false);
      return;
    }

    setCanEdit(true);
    localStorage.setItem("editModeEnabled", "true");
    localStorage.setItem("savedPassword", input);
    setShowModal(false);
  };

  // 🗑️ Delete all notes from Firestore
  const handleDeletePasswordSubmit = async (input) => {
    if (input !== HARDCODED_PASSWORD) {
      alert("Incorrect password. Operation cancelled.");
      setShowDeleteModal(false);
      return;
    }

    const notesRef = collection(db, "notes");
    const allNotes = await getDocs(notesRef);
    await Promise.all(allNotes.docs.map((d) => deleteDoc(d.ref)));

    setText("");
    setCanEdit(false);
    setShowDeleteModal(false);
    localStorage.removeItem("editModeEnabled");
    localStorage.removeItem("savedPassword");

    alert("All notes deleted!");
  };

  // 🚪 Exit edit mode
  const handleExitEditMode = () => {
    setCanEdit(false);
    localStorage.removeItem("editModeEnabled");
    localStorage.removeItem("savedPassword");
  };

  return (
    <div className="notepad-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="notepad"
      >
        <div className="notepad-header">
          <h2 className="notepad-title">
            {location.pathname.replace(/^\//, "") || "Untitled Note"}
          </h2>

          <div className="buttons">
            <button
              className="btn-delete-all"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete All Notes
            </button>
            {canEdit ? (
              <button onClick={handleExitEditMode} className="btn btn-dark">
                <Unlock size={16} /> Exit Edit Mode
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                <Lock size={16} /> Edit Mode
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
            Read-only mode — click “Edit Mode” to unlock editing.
          </p>
        )}

        {/* {isSaving && canEdit && <p className="saving-indicator">Saving...</p>} */}

        <AnimatePresence>
          {showModal && (
            <PasswordModal
              key="editModal"
              onSubmit={handlePasswordSubmit}
              onClose={() => setShowModal(false)}
            />
          )}
          {showDeleteModal && (
            <PasswordModal
              key="deleteModal"
              isDeleting={true}
              onSubmit={handleDeletePasswordSubmit}
              onClose={() => setShowDeleteModal(false)}
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
