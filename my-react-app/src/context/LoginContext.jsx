import { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "../lib/auth-client"


export const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);


  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await authClient.getSession();
      if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
      }
    };
    
    checkSession();

    document.body.style.overflow =
      isLoginOpen || isSignupOpen ? "hidden" : "unset";
  }, [isLoginOpen, isSignupOpen]);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setIsLoginOpen(false);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setIsLoggedIn(false);
    setUser(null);
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
