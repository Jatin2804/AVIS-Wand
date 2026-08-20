import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/layout/Navbar/Navbar";
import Login from "./pages/Login/Login";
import Reservations from "./pages/Reservations/Reservations";
import Dashboard from "./pages/Dashboard/Dashboard";

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const [navSearchRA, setNavSearchRA] = useState(null);

  const handleNavSelect = (raNumber) => {
    setNavSearchRA(raNumber);
  };

  const clearNavSearch = () => {
    setNavSearchRA(null);
  };

  return (
    <>
      <Navbar onSelectRental={handleNavSelect} />
      <Routes>
        <Route
          path="/reservations"
          element={
            <Reservations
              navSelectedRA={navSearchRA}
              onClearNavSearch={clearNavSearch}
            />
          }
        />
        <Route path="/dashboard/:raNumber" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/reservations" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
