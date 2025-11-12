import React, { useEffect, useState, useRef } from "react";
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

  const textareaRef = useRef(null);

  useEffect(() => {
    const savedEdit = localStorage.getItem("editModeEnabled");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedEdit === "true" && savedPassword === HARDCODED_PASSWORD) {
      setCanEdit(true);
      setPasswordInMemory(savedPassword);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(noteKey);

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      if (parsed.ciphertext && parsed.iv && parsed.salt) {
        setStoredEncrypted(parsed);

        // Only decrypt if user has edit access
        const savedEdit = localStorage.getItem("editModeEnabled");
        const savedPassword = localStorage.getItem("savedPassword");

        if (savedEdit === "true" && savedPassword === HARDCODED_PASSWORD) {
          decryptNote(savedPassword, parsed)
            .then((plain) => setText(plain))
            .catch(() => setText(""));
        }
      } else {
        setText(parsed);
      }
    } catch {
      setText(raw);
    }
  }, [noteKey]);

  function useDebouncedEffect(callback, deps, delay) {
    useEffect(() => {
      const handler = setTimeout(() => callback(), delay);
      return () => clearTimeout(handler);
    }, [...(deps || []), delay]);
  }

  useDebouncedEffect(
    () => {
      if (canEdit && passwordInMemory) {
        encryptNote(passwordInMemory, text)
          .then((encrypted) => {
            requestIdleCallback(() => {
              localStorage.setItem(noteKey, JSON.stringify(encrypted));
            });
          })
          .catch(console.error);
      } else {
        requestIdleCallback(() => {
          localStorage.setItem(noteKey, text);
        });
      }
    },
    [text, canEdit, passwordInMemory, noteKey],
    500
  );

  useEffect(() => {
    if (canEdit && textareaRef.current) {
      const timer = setTimeout(() => textareaRef.current.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [canEdit]);

  useEffect(() => {
    return () => {
      if (text.trim()) {
        try {
          if (canEdit && passwordInMemory) {
            const encrypted = encryptNote(passwordInMemory, text);
            localStorage.setItem(noteKey, JSON.stringify(encrypted));
          } else {
            localStorage.setItem(noteKey, text);
          }
        } catch (err) {
          console.error("Failed to save before route change:", err);
        }
      }
    };
  }, [noteKey, text, canEdit, passwordInMemory]);

  const HARDCODED_PASSWORD = atob("U3VwZXJTZWNyZXQxMjMh");

  const handlePasswordSubmit = async (input) => {
    if (input !== HARDCODED_PASSWORD) {
      setShowModal(false);
      alert("Wrong password");
      return;
    }

    setCanEdit(true);
    setPasswordInMemory(input);
    localStorage.setItem("editModeEnabled", "true");
    localStorage.setItem("savedPassword", input);
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
    setStoredEncrypted(null);
    setCanEdit(false);
    setPasswordInMemory(null);
    setShowDeleteModal(false);

    if (textareaRef.current) textareaRef.current.value = "";

    alert("All notes deleted!");
  };

  const handleExitEditMode = () => {
    setCanEdit(false);
    setPasswordInMemory(null);
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
          defaultValue={text}
          readOnly={!canEdit}
          className={`notepad-textarea ${canEdit ? "editable" : "readonly"}`}
          placeholder={canEdit ? "Start typing..." : "No text to display"}
          onBlur={() => {
            if (canEdit) setText(textareaRef.current.value);
          }}
        />

        {!canEdit && (
          <p className="readonly-hint">
            Read-only mode — click “Edit Mode” to unlock editing.
          </p>
        )}

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
