import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./LoginForm";
import Register from "./Register";
import App from "./App";
import Readme from "./Readme";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<App />} />
        <Route path="/readme" element={<Readme />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
