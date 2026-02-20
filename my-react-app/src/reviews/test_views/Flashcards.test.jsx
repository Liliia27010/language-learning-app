import '@testing-library/jest-dom'
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import Flashcards from "../Flashcards";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Flashcards Component", () => {
  const mockOnOpenLogin = vi.fn();

  it("renders the title and features", () => {
    render(
      <MemoryRouter>
        <Flashcards isLoggedIn={false} onOpenLogin={mockOnOpenLogin} />
      </MemoryRouter>
    );

    expect(screen.getByText(/The easiest way to make and study flashcards/i)).toBeInTheDocument();
    expect(screen.getByText("Import")).toBeInTheDocument();
  });

  it("calls onOpenLogin when clicking Create if not logged in", () => {
    render(
      <MemoryRouter>
        <Flashcards isLoggedIn={false} onOpenLogin={mockOnOpenLogin} />
      </MemoryRouter>
    );

    const button = screen.getByText("+ Create a flashcard set");
    fireEvent.click(button);

    expect(mockOnOpenLogin).toHaveBeenCalled();
  });

  it("navigates to /SetCards when clicking Create if logged in", () => {
    render(
      <MemoryRouter>
        <Flashcards isLoggedIn={true} onOpenLogin={mockOnOpenLogin} />
      </MemoryRouter>
    );

    const button = screen.getByText("+ Create a flashcard set");
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/SetCards");
  });
});