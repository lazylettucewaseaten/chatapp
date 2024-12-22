import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./LoginForm";
import Register from "./Register";
import App from "./App";
// import NotFoundPage from "./pages/NotFoundPage"; 
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />

        <Route path="/register" element={<Register />} />

        <Route path="/chat" element={<App />} />

        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
