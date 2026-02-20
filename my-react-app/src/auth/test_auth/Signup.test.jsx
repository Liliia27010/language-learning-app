import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Signup from "../Signup";
import { authClient } from "../../lib/auth-client";
import '@testing-library/jest-dom';

vi.mock("../../lib/auth-client", () => ({
  authClient: { signUp: { email: vi.fn() } },
}));

describe("Signup Component", () => {
  const props = { isOpen: true, onClose: vi.fn(), onSwitchToLogin: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn(); 
  });

  it("renders only when isOpen is true", () => {
    const { rerender, container } = render(<Signup {...props} />);
    expect(screen.getByText(/Welcome to FINLEARN/i)).toBeInTheDocument();

    rerender(<Signup {...props} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("checks password validation", () => {
    render(<Signup {...props} />);
    
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "123" } });
    
    const form = screen.getByRole("button", { name: /Sign up/i }).closest('form');
    fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalled();
  });

  it("checks teacher code validation", () => {
    render(<Signup {...props} />);
    
    fireEvent.click(screen.getByText("Teacher"));
    

    fireEvent.change(screen.getByPlaceholderText(/Enter FINLEARN code/i), { target: { value: "WRONGCODE" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "12abcdef" } });
    
    const form = screen.getByRole("button", { name: /Sign up/i }).closest('form');
    fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalledWith("Invalid Teacher Code!");
  });

  it("completes signup successfully", async () => {
    authClient.signUp.email.mockResolvedValue({ data: {}, error: null });

    render(<Signup {...props} />);

    fireEvent.change(screen.getByPlaceholderText(/Antonio Poual/i), { target: { value: "Liliia" } });
    fireEvent.change(screen.getByPlaceholderText(/example@mail.com/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "12abcdef" } });

    const form = screen.getByRole("button", { name: /Sign up/i }).closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Registration successful!");
      expect(props.onSwitchToLogin).toHaveBeenCalled();
    });
  });

  it("closes modal on X button click", () => {
    render(<Signup {...props} />);
    const closeBtn = screen.getByRole("button", { name: "" }); 
    fireEvent.click(closeBtn);
    expect(props.onClose).toHaveBeenCalled();
  });
});