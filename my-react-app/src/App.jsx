import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import { Menu as MenuIcon } from "lucide-react";
import { useAuth } from "./context/LoginContext";

import Menu from "./components/Manu";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Flashcards from "./reviews/Flashcards";
import Test from "./reviews/Test";
import Live from "./reviews/Live";
import Home from "./reviews/Home";
import SetCards from "./sets_manager/SetCards";
import Library from "./sets_manager/Library";
import Folder from "./sets_manager/Folder";
import FolderDetail from "./sets_manager/FolderDetail";
import "./styles/App.css";
import LearnCard from "./sets_manager/LearnCard";


export default function App() {
  const {
    isLoggedIn,
    setIsLoginOpen,
    isLoginOpen,
    isSignupOpen,
    setIsSignupOpen,
  } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleSignup = () => {
     setIsLoginOpen(false);
    setIsSignupOpen(true);
  };
  const toggleLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  return (
    
        <BrowserRouter>
          <div className="site-container">
            <header className="main-header">
              <div className="header-left">
                <div
                  className="icon-wrapper"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MenuIcon size={26} />
                </div>
                <Link
                  to="/"
                  className="logo-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <h2 className="sidebar-subtitle">FINLEARN</h2>
                </Link>
              </div>

              <div className="header">
                {!isLoggedIn && (
                  <button
                    className="login-link"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Log in
                  </button>
                )}
              </div>
            </header>

            <div className="middle-section">
              <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

              <Login
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSwitchToSignup={toggleSignup}
              />

              <Signup
                isOpen={isSignupOpen}
                onClose={() => setIsSignupOpen(false)}
                onSwitchToLogin={toggleLogin}
              />

              <main className="content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/flashcards" element={<Flashcards />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/live" element={<Live />} />
                  <Route path="/setcards" element={<SetCards />} />
                  <Route path="/setcards/:setId" element={<SetCards />} />
                  <Route path="/folder/:folderId" element={<FolderDetail />} />
                  <Route path="/folder" element={<Folder />} />
                  <Route path="/cards/:setId" element={<LearnCard />} />
                  <Route path="/library" element={<Library />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>

  );
}
