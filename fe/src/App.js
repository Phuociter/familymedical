import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/LoginPage.jsx";
import DoctorPage from "./pages/DoctorPage";
import FamilyMedicalPage from "./pages/FamilyMedicalPage.jsx";

export default function App() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        {isLoggedIn ? (
          <>
            <Route path="/doctors" element={<DoctorPage />} />
            <Route path="/families" element={<FamilyMedicalPage />} />
            <Route path="*" element={<Navigate to="/families" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}
