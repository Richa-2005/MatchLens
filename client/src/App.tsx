import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewAnalysis from "./pages/NewAnalysis";
import Resume from "./pages/Resume";
import Jobs from "./pages/Jobs";

import { ProtectedRoute } from "./components/ProtectedRoute";

function Placeholder({ title }: { title: string }) {
  return <div className="text-slate-600">{title} page coming soon.</div>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <Resume/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis-history"
        element={
          <ProtectedRoute>
            <Placeholder title="Analysis History" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-analysis"
        element={
          <ProtectedRoute>
            <NewAnalysis />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;