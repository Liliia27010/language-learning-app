import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SetCards from "../SetCards";
import { LibraryContext } from "../../context/LibraryContext";
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ setId: undefined }),
  };
});

describe("SetCards Component", () => {
  const mockHandleAddSetToFolder = vi.fn();
  
  const mockContextValue = {
    savedSets: [],
    folders: [{ _id: "f1", name: "My Folder" }],
    handleAddSetToFolder: mockHandleAddSetToFolder,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.alert = vi.fn();
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token');
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  const renderComponent = (initialEntries = ["/create-set"]) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <LibraryContext.Provider value={mockContextValue}>
          <Routes>
            <Route path="/create-set" element={<SetCards />} />
            <Route path="/edit-set/:setId" element={<SetCards />} />
          </Routes>
        </LibraryContext.Provider>
      </MemoryRouter>
    );

  it("renders correctly for creating a new set", () => {
    renderComponent();
    expect(screen.getByText("Create New Set")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toHaveValue("");
  });

  it("adds a new card when '+ ADD CARD' button is clicked", () => {
    renderComponent();
    expect(screen.getByText("1")).toBeInTheDocument();
    
    const addBtn = screen.getByText("+ ADD CARD");
    fireEvent.click(addBtn);
    
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("successfully saves a set and opens the folder modal", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: "new-set-123" }),
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "New Language Set" },
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/setcards", expect.objectContaining({
        method: "POST",
      }));
      expect(screen.getByText("Categorize your Set")).toBeInTheDocument();
    });
  });

  it("shows alert if name is missing during save", () => {
    renderComponent();
    
    const saveBtn = screen.getByText("Create");
    fireEvent.click(saveBtn);
    
    expect(window.alert).toHaveBeenCalledWith("Name is required");
  });

  it("deletes a card when delete icon is clicked", () => {
    renderComponent();
    
    fireEvent.click(screen.getByText("+ ADD CARD"));
    expect(screen.getByText("2")).toBeInTheDocument();

    const deleteBtns = screen.getAllByText("delete");
    fireEvent.click(deleteBtns[0]);

    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });
});