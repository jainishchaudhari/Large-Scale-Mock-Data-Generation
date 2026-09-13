import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Generate from "./pages/Generate";
import Results from "./pages/Results";
import Performance from "./pages/Performance";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/generate" element={<Generate />} />

        <Route path="/results" element={<Results />} />

        <Route path="/performance" element={<Performance />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;