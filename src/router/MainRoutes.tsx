
import React from "react";
import { Routes, Route } from "react-router-dom";

// Import direto de páginas principais
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import { ResetPassword } from "@/pages/ResetPassword";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/NotFound";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
};

export default MainRoutes;
