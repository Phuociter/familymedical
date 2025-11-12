import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterFamilyPage from "./pages/Auth/RegisterFamilyPage";
import RegisterDoctorPage from "./pages/Auth/RegisterDoctorPage";
import OAuth2CallbackPage from "./pages/Auth/OAuth2CallbackPage.jsx";
import OAuth2CompleteProfilePage from "./pages/Auth/OAuth2CompleteProfilePage.jsx";
import MomoCallbackPage from "./pages/MomoCallbackPage";
import FamilyMedicalPage from "./pages/FamilyMedicalPage.jsx";

// Doctor Portal Components with MUI
import DoctorLayout from "./components/Doctor/DoctorLayout";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorRequestsPage from "./pages/Doctor/DoctorRequestsPage";
import DoctorFamiliesPage from "./pages/Doctor/DoctorFamiliesPage";
import PatientDetailPage from "./pages/Doctor/PatientDetailPage";
import DoctorMessagesPage from "./pages/Doctor/DoctorMessagesPage";
import DoctorAppointmentsPage from "./pages/Doctor/DoctorAppointmentsPage";
import { doctorTheme } from "./theme/doctorTheme";

export default function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuth2CallbackPage />} />
      <Route path="/register/family" element={<RegisterFamilyPage />} />
      <Route path="/register/doctor" element={<RegisterDoctorPage />} />
      <Route path="/oauth/complete-profile" element={<OAuth2CompleteProfilePage />} />
      <Route path="/payment/callback" element={<MomoCallbackPage />} />

      {/* Family Routes (Tailwind CSS) */}
      <Route path="/families" element={<FamilyMedicalPage />} />

      {/* Doctor Portal Routes (MUI) */}
      <Route
        path="/doctor/*"
        element={
          <ThemeProvider theme={doctorTheme}>
            <CssBaseline />
            <Routes>
              <Route element={<DoctorLayout />}>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="requests" element={<DoctorRequestsPage />} />
                <Route path="families" element={<DoctorFamiliesPage />} />
                <Route path="families/:familyId" element={<DoctorFamiliesPage />} />
                <Route path="families/:familyId/members/:memberId" element={<PatientDetailPage />} />
                <Route path="messages" element={<DoctorMessagesPage />} />
                <Route path="appointments" element={<DoctorAppointmentsPage />} />
              </Route>
            </Routes>
          </ThemeProvider>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
