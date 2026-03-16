import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CreateTest from "../CreateTest.jsx";
import { LibraryContext } from "../../context/LibraryContext";
import "@testing-library/jest-dom";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockNavigate };
});

global.fetch = vi.fn();

describe("CreateTest Component", () => {
  const mockContextValue = {
    savedSets: [
      { _id: "set-1", name: "Fruits" },
      { _id: "set-2", name: "Animals" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('alert', vi.fn());
  });

  const renderComponent = (contextValue = mockContextValue) =>
    render(
      <MemoryRouter>
        <LibraryContext.Provider value={contextValue}>
          <CreateTest />
        </LibraryContext.Provider>
      </MemoryRouter>
    );

  it("renders the form and loads card sets correctly", () => {
    renderComponent();
    expect(screen.getByText("Create New Test")).toBeInTheDocument();

    expect(screen.getByLabelText(/Select Set/i)).toBeInTheDocument();
  });

  it("submits the form successfully and navigates to library", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Fruits"), { target: { value: "Test 1" } });
    fireEvent.change(screen.getByLabelText(/Select Set/i), { target: { value: "set-1" } });
    
    const submitBtn = screen.getByRole("button", { name: /Create Test/i });
    fireEvent.submit(submitBtn.closest('form')); 

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/library");
    }, { timeout: 2000 });
  });

  it("shows an alert if no card set is selected", () => {
    renderComponent();
    const submitBtn = screen.getByRole("button", { name: /Create Test/i });
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith("Please select a card set!");
  });

  it("handles API error response correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: "Server error" }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Select Set/i), { target: { value: "set-1" } });
    fireEvent.submit(screen.getByRole("button", { name: /Create Test/i }).closest('form'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Error: Server error");
    });
  });
});