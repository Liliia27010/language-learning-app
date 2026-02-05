import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);


  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") setIsLoggedIn(true);

    document.body.style.overflow =
      isLoginOpen || isSignupOpen ? "hidden" : "unset";
  }, [isLoginOpen, isSignupOpen]);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsLoggedIn(false);
    window.location.href = "/";
  };
  console.log('rendering auth provider')
  return (
    <AuthContext.Provider
      value={{
        handleLogin,
        handleLogout,
        isLoggedIn,
        isLoginOpen,
        setIsLoggedIn,
        isSignupOpen,
        setIsSignupOpen,
        setIsLoginOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
