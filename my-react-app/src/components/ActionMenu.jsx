import React, { useState, useEffect, useRef } from "react";

export default function ActionMenu({ actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="action-menu-container" ref={menuRef}>
      <button 
        className="three-dots-btn" 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        ⋮
      </button>

      {isOpen && (
        <div className="action-dropdown">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`action-item ${action.className || ""}`}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                setIsOpen(false);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}