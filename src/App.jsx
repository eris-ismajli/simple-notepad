// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Notepad from "./components/Notepad";


function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/*" element={<Notepad />} />
      </Routes>
    </Router>
  );
}

export default App;
