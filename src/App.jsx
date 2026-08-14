import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import WaitingRoom from "./pages/WaitingRoom";
import PreJoin from "./pages/PreJoin";
import Meeting from "./pages/Meeting";
import NotFound from "./pages/Notfound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Home */}
        <Route path="/home" element={<Home />} />

        {/* Waiting Room */}
        <Route path="/waiting/:code" element={<WaitingRoom />} />

        {/* Pre-Join */}
        <Route path="/prejoin/:code" element={<PreJoin />} />

        {/* Live Meeting */}
        <Route path="/meeting/:code" element={<Meeting />} />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;