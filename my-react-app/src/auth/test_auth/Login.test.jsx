import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../Login"; 
import { AuthContext } from "../../context/LoginContext";
import { authClient } from "../../lib/auth-client";

vi.mock("../../lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

describe("Login Component Full Coverage", () => {
  const mockContext = { 
    handleLogin: vi.fn() 
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });


  it("calls handleLogin and onClose on successful login", async () => {
    const mockOnClose = vi.fn();
    authClient.signIn.email.mockResolvedValue({ data: { user: {} }, error: null });

    render(
      <AuthContext.Provider value={mockContext}>
        <Login isOpen={true} onClose={mockOnClose} onSwitchToSignup={vi.fn()} />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "success@test.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.submit(screen.getByTestId("login-form"));

    await waitFor(() => {
      expect(mockContext.handleLogin).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });


  it("shows error message when login fails with server error", async () => {
    authClient.signIn.email.mockResolvedValue({ 
      data: null, 
      error: { message: "Invalid credentials" } 
    });

    render(
      <AuthContext.Provider value={mockContext}>
        <Login isOpen={true} onClose={vi.fn()} onSwitchToSignup={vi.fn()} />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrongpass" } });

    fireEvent.submit(screen.getByTestId("login-form"));

    const errorMsg = await screen.findByText(/Invalid credentials/i);
    expect(errorMsg).toBeInTheDocument();
  });


  it("shows connection error when authClient throws an exception", async () => {
    authClient.signIn.email.mockRejectedValue(new Error("Network Failure"));

    render(
      <AuthContext.Provider value={mockContext}>
        <Login isOpen={true} onClose={vi.fn()} onSwitchToSignup={vi.fn()} />
      </AuthContext.Provider>
    );

    fireEvent.submit(screen.getByTestId("login-form"));

    const errorMsg = await screen.findByText(/Connection error/i);
    expect(errorMsg).toBeInTheDocument();
  });


  it("calls onClose when the close button is clicked", () => {
    const mockOnClose = vi.fn();
    render(
      <AuthContext.Provider value={mockContext}>
        <Login isOpen={true} onClose={mockOnClose} onSwitchToSignup={vi.fn()} />
      </AuthContext.Provider>
    );


    const closeBtn = screen.getAllByRole("button")[0]; 
    fireEvent.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

 
  it("calls onSwitchToSignup when 'Sign up?' is clicked", () => {
    const mockOnSwitch = vi.fn();
    render(
      <AuthContext.Provider value={mockContext}>
        <Login isOpen={true} onClose={vi.fn()} onSwitchToSignup={mockOnSwitch} />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/Sign up\?/i));
    expect(mockOnSwitch).toHaveBeenCalled();
  });


  it("does not render anything when isOpen is false", () => {
    const { container } = render(
      <AuthContext.Provider value={mockContext}>
        <Login isOpen={false} onClose={vi.fn()} onSwitchToSignup={vi.fn()} />
      </AuthContext.Provider>
    );

    expect(container.firstChild).toBeNull();
  });
});