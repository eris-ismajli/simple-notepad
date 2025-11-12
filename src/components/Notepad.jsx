import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PasswordModal from "./PasswordModal";
import { Lock, Unlock } from "lucide-react";
import "./notepad.css";
import { encryptNote, decryptNote } from "../utils/cryptoNote";

export default function Notepad() {
  const location = useLocation();
  const noteKey = `note-${location.pathname}`;

  const [text, setText] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passwordInMemory, setPasswordInMemory] = useState(null);
  const [storedEncrypted, setStoredEncrypted] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(noteKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      if (parsed.ciphertext && parsed.iv && parsed.salt) {
        setStoredEncrypted(parsed);
        setText("");
      } else {
        setText(parsed);
      }
    } catch {
      setText(raw);
    }
  }, [noteKey]);

  useEffect(() => {
    if (canEdit && passwordInMemory) {
      encryptNote(passwordInMemory, text)
        .then((encrypted) => {
          localStorage.setItem(noteKey, JSON.stringify(encrypted));
        })
        .catch(console.error);
    } else {
      localStorage.setItem(noteKey, text);
    }
  }, [text, canEdit, passwordInMemory, noteKey]);

  const HARDCODED_PASSWORD = atob("U3VwZXJTZWNyZXQxMjMh");

  const handlePasswordSubmit = async (input) => {
    if (input !== HARDCODED_PASSWORD) {
      setShowModal(false);
      alert("Wrong password");
      return;
    }

    setCanEdit(true);
    setPasswordInMemory(input);
    setShowModal(false);

    if (storedEncrypted) {
      try {
        const plain = await decryptNote(input, storedEncrypted);
        setText(plain);
      } catch (err) {
        alert("Encrypted note corrupted or wrong password");
      }
    }
  };

  const handleDeletePasswordSubmit = (input) => {
    if (input !== HARDCODED_PASSWORD) {
      alert("Incorrect password. Operation cancelled.");
      setShowDeleteModal(false);
      return;
    }

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("note-")) localStorage.removeItem(key);
    });

    setText("");
    setCanEdit(false);
    setPasswordInMemory(null);
    setShowDeleteModal(false);
    alert("All notes deleted!");
  };

  const handleExitEditMode = () => {
    setCanEdit(false);
    setPasswordInMemory(null);
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

        <AnimatePresence>
          {showModal && (
            <PasswordModal
              onSubmit={handlePasswordSubmit}
              onClose={() => setShowModal(false)}
            />
          )}

          <AnimatePresence>
            {showDeleteModal && (
              <PasswordModal
                isDeleting={true}
                onSubmit={handleDeletePasswordSubmit}
                onClose={() => setShowDeleteModal(false)}
              />
            )}
          </AnimatePresence>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
