import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { useEffect } from "react";
import { Toaster } from "sonner";

function App() {
  useEffect(() => {
    // Redirect logic if needed, but for now just basic routing
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-center" theme="dark" richColors />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
