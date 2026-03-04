import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Learn from "../LearnCard.jsx";
import { LibraryContext } from "../../context/LibraryContext";
import "@testing-library/jest-dom";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ setId: "set-123" }),
  };
});

describe("Learn Component", () => {
  const mockContextValue = {
    savedSets: [
      {
        _id: "set-123",
        name: "Vocabulary",
        cards: [
          { term: "Hello", definition: "Hei" },
          { term: "Like", definition: "Tyykää" },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (contextValue = mockContextValue) =>
    render(
      <MemoryRouter initialEntries={["/learn/set-123"]}>
        <LibraryContext.Provider value={contextValue}>
          <Routes>
            <Route path="/learn/:setId" element={<Learn />} />
          </Routes>
        </LibraryContext.Provider>
      </MemoryRouter>
    );

  it("renders the first card and set name correctly", () => {
    renderComponent();
    expect(screen.getByText("Vocabulary")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("flips the card when clicked", () => {
    renderComponent();
    const card = screen.getByText("Hello").closest(".flashcard-container");
    
    expect(card).not.toHaveClass("flipped");
    fireEvent.click(card);
    expect(card).toHaveClass("flipped");
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("navigates to the next card when 'Next' is clicked", () => {
    renderComponent();
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    
    fireEvent.click(nextBtn);
    expect(screen.getByText("Like")).toBeInTheDocument();
    expect(nextBtn).toBeDisabled();
  });

  it("navigates back to the previous card when 'Back' is clicked", () => {
    renderComponent();
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    const backBtn = screen.getByRole("button", { name: /Back/i });

    expect(backBtn).toBeDisabled();
    
    fireEvent.click(nextBtn);
    expect(screen.getByText("Like")).toBeInTheDocument();
    
    fireEvent.click(backBtn);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("navigates to library when close button is clicked", () => {
    renderComponent();
    const closeBtn = screen.getByRole("button", { name: "" }); 
    fireEvent.click(closeBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });

  it("shows error message if no cards are found", () => {
    const emptyContext = {
      savedSets: [{ _id: "set-123", name: "Empty Set", cards: [] }],
    };
    renderComponent(emptyContext);
    expect(screen.getByText("No cards found in this set.")).toBeInTheDocument();
  });
});