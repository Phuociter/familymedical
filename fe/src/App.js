import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/LoginPage.jsx";
// import DoctorPage from "./pages/DoctorPage";
import FamilyMedicalPage from "./pages/FamilyMedicalPage.jsx";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterFamilyPage from "./pages/Auth/RegisterFamilyPage";
import RegisterDoctorPage from "./pages/Auth/RegisterDoctorPage";
import OAuth2CallbackPage from "./pages/Auth/OAuth2CallbackPage.jsx";
import OAuth2CompleteProfilePage from "./pages/Auth/OAuth2CompleteProfilePage.jsx";

export default function App() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <Routes>
      {/* Login Page */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuth2CallbackPage />} />
      <Route path="/register/family" element={<RegisterFamilyPage />} />
      <Route path="/register/doctor" element={<RegisterDoctorPage />} />
      <Route path="/oauth/complete-profile" element={<OAuth2CompleteProfilePage />} />

      <Route path="/families" element={<FamilyMedicalPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
