import { Route, Routes } from "react-router-dom";
import { SignUp } from "./pages/signup/SignUp";
import { LogIn } from "./pages/login/LogIn";
import { CreateCompany } from "./pages/createProvider/createCompany";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Lots } from "./pages/lots/Lots";
import { Reservations } from "./pages/reservations/Reservations";
import { Employee } from "./pages/employee/Employee";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { EmployeeInviteSignUp } from "./pages/signup/EmployeeInviteSignUp";
import ReservationDetail from "./pages/reservations/ReservationDetail";
import AlertsPage from "./pages/alerts/AlertsPage";
import WalkInReservation from "./pages/reservations/WalkInReservation";
import PricingManagement from "./pages/pricing";

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<LogIn />} />
      <Route path="/createcompany" element={<CreateCompany />} />
      <Route path="/add-employee" element={<EmployeeInviteSignUp />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employee />} />
          <Route path="/lots" element={<Lots />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/settings" element={<Dashboard />} />
          <Route path="/reservations/detail" element={<ReservationDetail />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reservations/walkin" element={<WalkInReservation />} />
          <Route path="/pricing" element={<PricingManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
