import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Import your pages here
import HomePage from "./page";
import InventoryPage from "./inventory/page";
import LoginPage from "./login/page";
import ProfilePage from "./profile/page";
import SettingsPage from "./settings/page";
import SuppliersPage from "./suppliers/page";
import TaxFilingPage from "./tax-filing/page";
import TransactionsPage from "./transactions/page";
import ExpiringPage from "./expiring/page";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/tax-filing" element={<TaxFilingPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/expiring" element={<ExpiringPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
