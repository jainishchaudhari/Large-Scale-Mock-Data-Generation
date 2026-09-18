import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Generate from "./pages/Generate";
import Results from "./pages/Results";
import Performance from "./pages/Performance";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/generate" element={<Generate />} />

        <Route path="/results" element={<Results />} />

        <Route path="/performance" element={<Performance />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;