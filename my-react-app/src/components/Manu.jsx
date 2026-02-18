import React, { useEffect, useRef } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/LoginContext";

export default function Menu({ isOpen, onClose }) {
  const { isLoggedIn, handleLogout } = useAuth();
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="menu-window" ref={menuRef}>
      {!isLoggedIn && (
        <>
          <h2 className="sidebar-title">Students</h2>

          <Link to="/flashcards" className="nav-link" onClick={onClose}>
            Flashcards
          </Link>

          <Link to="/test" className="nav-link" onClick={onClose}>
            Test
          </Link>

          <h2 className="sidebar-title">Teachers</h2>

          <Link to="/live" className="nav-link" onClick={onClose}>
            Live
          </Link>
        </>
      )}

      {isLoggedIn && (
        <>
          <h2 className="sidebar-title">My Stuff</h2>
          <Link to="/library" className="nav-link" onClick={onClose}>
            My Library
          </Link>

          <Link to="/setcards" className="nav-link" onClick={onClose}>
            Add New Set
          </Link>

          <Link to="/folder" className="nav-link" onClick={onClose}>
            Add Folder
          </Link>

          <div
            className="logout-button"
            onClick={() => {
              handleLogout();
              onClose();
            }}
          >
            Logout
          </div>
        </>
      )}
    </div>
  );
}
