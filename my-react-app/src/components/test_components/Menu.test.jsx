import '@testing-library/jest-dom'; 
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router"; 
import { AuthContext } from "../../context/LoginContext"; 
import Menu from "../Manu";

describe("Menu Component Tests", () => {
  const mockOnClose = vi.fn();
  const mockHandleLogout = vi.fn();

  it("should return null when isOpen is false", () => {
    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isLoggedIn: false }}>
          <Menu isOpen={false} onClose={mockOnClose} />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });


  it("should show menu items when open", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isLoggedIn: false }}>
          <Menu isOpen={true} onClose={mockOnClose} />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(screen.getByText("Students")).toBeInTheDocument();
  });


  it("should handle clicks outside and inside", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isLoggedIn: false }}>
          <div data-testid="outside">Outside Area</div>
          <Menu isOpen={true} onClose={mockOnClose} />
        </AuthContext.Provider>
      </MemoryRouter>
    );


    fireEvent.mouseDown(screen.getByText("Students"));
    expect(mockOnClose).not.toHaveBeenCalled();


    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show My Stuff and handle logout", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ isLoggedIn: true, handleLogout: mockHandleLogout }}>
          <Menu isOpen={true} onClose={mockOnClose} />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const logoutBtn = screen.getByText("Logout");
    fireEvent.click(logoutBtn);

    expect(mockHandleLogout).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});