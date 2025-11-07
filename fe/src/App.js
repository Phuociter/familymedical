import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/LoginPage.jsx";
// import DoctorPage from "./pages/DoctorPage";
import FamilyMedicalPage from "./pages/FamilyMedicalPage.jsx";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterFamilyPage from "./pages/Auth/RegisterFamilyPage";
import RegisterDoctorPage from "./pages/Auth/RegisterDoctorPage";
import OAuth2CallbackPage from "./pages/Auth/OAuth2CallbackPage.jsx";
import OAuth2CompleteProfilePage from "./pages/Auth/OAuth2CompleteProfilePage.jsx";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminFamilyMembers from "./pages/admin/AdminFamilyMembers";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminDoctorRequests from "./pages/admin/AdminDoctorRequests";
import AdminPayments from "./pages/admin/AdminPayments";
import ProtectedRoute from "./components/admin/ProtectedRoute";

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

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="Admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="family-members/:familyId" element={<AdminFamilyMembers />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="doctor-requests" element={<AdminDoctorRequests />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      <Route path="/families" element={<FamilyMedicalPage />} />
      <Route path="*" element={<Navigate to="/families" />} />
    </Routes>
  );
}
