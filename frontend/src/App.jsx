import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { DarkModeProvider } from "./hooks/useDarkMode";

import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ChatsPage from "./pages/Chats";
import ChatPage from "./pages/Chat";
import FriendsPage from "./pages/Friends";
import SettingsPage from "./pages/Settings";

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
