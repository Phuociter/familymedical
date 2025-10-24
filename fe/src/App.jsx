import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
//import DoctorPage from "./pages/DoctorPage";
//import FamilyMedicalPage from "./pages/FamilyMedicalPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterFamilyPage from "./pages/Auth/RegisterFamilyPage";
import RegisterDoctorPage from "./pages/Auth/RegisterDoctorPage";

export default function App() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    //<Router>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/family" element={<RegisterFamilyPage />} />
        <Route path="/register/doctor" element={<RegisterDoctorPage />} /> 

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
    //</Router>
  );
}
