// src/App.js
import React, { useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Notepad from "./components/Notepad";

function App() {
  useEffect(() => {
    async function test() {
      const snapshot = await getDocs(collection(db, "notes"));
      console.log("Firestore connected, documents:", snapshot.docs.length);
    }
    test();
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Notepad />} />
      </Routes>
    </Router>
  );
}

export default App;
