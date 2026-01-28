import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EngineerDashboard from './pages/EngineerDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import RDSHDashboard from './pages/RDSHDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VehicleList from './pages/VehicleList';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/engineer" element={<EngineerDashboard />} />
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/rdhs" element={<RDSHDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;