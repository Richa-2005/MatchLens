import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewAnalysis from "./pages/NewAnalysis";
import Resume from "./pages/Resume";
import Jobs from "./pages/Jobs";
import AnalysisHistory from "./pages/AnalysisHistory";
import { useEffect, useState } from "react";


import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <Resume theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis-history"
        element={
          <ProtectedRoute>
            <AnalysisHistory theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-analysis"
        element={
          <ProtectedRoute>
            <NewAnalysis theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;