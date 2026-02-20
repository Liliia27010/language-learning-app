import '@testing-library/jest-dom'
import { useContext } from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, AuthContext } from "../../context/LoginContext";
import { authClient } from "../../lib/auth-client";
import '@testing-library/jest-dom';

vi.mock("../../lib/auth-client", () => ({
  authClient: {
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
}));

const TestConsumer = () => {
  const { isLoggedIn, handleLogin, handleLogout, isLoginOpen, setIsLoginOpen } = useContext(AuthContext);

  return (
    <div>
      <p data-testid="status">{isLoggedIn ? "in" : "out"}</p>
      <p data-testid="modal">{isLoginOpen ? "open" : "closed"}</p>
      <button onClick={() => handleLogin({ name: "User" })} data-testid="login">Login</button>
      <button onClick={handleLogout} data-testid="logout">Logout</button>
      <button onClick={() => setIsLoginOpen(true)} data-testid="open">Login</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets user if session exists", async () => {
    authClient.getSession.mockResolvedValue({ data: { user: { name: "John" } } });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("in"));
  });

  it("handles login flow correctly", async () => {
    authClient.getSession.mockResolvedValue({ data: null });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByTestId("open"));
    expect(screen.getByTestId("modal")).toHaveTextContent("open");

    fireEvent.click(screen.getByTestId("login"));
    expect(screen.getByTestId("status")).toHaveTextContent("in");
    expect(screen.getByTestId("modal")).toHaveTextContent("closed");
  });

  it("handles logout and redirect", async () => {
    authClient.getSession.mockResolvedValue({ data: { user: {} } });
    authClient.signOut.mockResolvedValue({});

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("in"));

    fireEvent.click(screen.getByTestId("logout"));

    expect(authClient.signOut).toHaveBeenCalled();
    
  });

  it("changes body overflow when modal opens", () => {
    authClient.getSession.mockResolvedValue({ data: null });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    fireEvent.click(screen.getByTestId("open"));
    expect(document.body.style.overflow).toBe("hidden");
  });
});