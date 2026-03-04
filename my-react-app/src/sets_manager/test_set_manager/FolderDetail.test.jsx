import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import FolderDetail from "../FolderDetail";
import { LibraryContext } from "../../context/LibraryContext";
import "@testing-library/jest-dom";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ folderId: "f1" }),
  };
});

describe("FolderDetail Component", () => {
  const mockHandleAddSetToFolder = vi.fn();

  const mockContextValue = {
    folders: [
      {
        _id: "f1",
        name: "Spanish Folder",
        sets: [
          { _id: "s1", name: "Verbs", cards: [1, 2, 3] }
        ],
      },
    ],
    savedSets: [
      { _id: "s1", name: "Verbs" },
      { _id: "s2", name: "Nouns" },
    ],
    handleAddSetToFolder: mockHandleAddSetToFolder,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.alert = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  
  });

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={["/folder/f1"]}>
        <LibraryContext.Provider value={mockContextValue}>
          <Routes>
            <Route path="/folder/:folderId" element={<FolderDetail />} />
          </Routes>
        </LibraryContext.Provider>
      </MemoryRouter>
    );

  it("renders folder name and sets correctly", () => {
    renderComponent();
    expect(screen.getByText("Spanish Folder")).toBeInTheDocument();
    expect(screen.getByText("1 sets in this folder")).toBeInTheDocument();
    expect(screen.getByText("Verbs")).toBeInTheDocument();
  });

  it("navigates to Learn page when Learn button is clicked", () => {
    renderComponent();
    const learnBtn = screen.getByRole("button", { name: /Learn/i });
    fireEvent.click(learnBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/cards/s1");
  });

  it("opens modal and adds a new set to the folder", async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText("+ Add Set to Folder"));

    expect(screen.getByText("Add Set to Spanish Folder")).toBeInTheDocument();
    const addBtn = screen.getByRole("button", { name: /^Add$/i });
    
    fireEvent.click(addBtn);

    expect(mockHandleAddSetToFolder).toHaveBeenCalledWith("f1", expect.objectContaining({ _id: "s2" }));
  });

  it("closes modal when X button is clicked", () => {
    renderComponent();
    
    fireEvent.click(screen.getByText("+ Add Set to Folder"));
    const closeBtn = screen.getByRole("button", { name: "" }); 
    fireEvent.click(closeBtn);

    expect(screen.queryByText("Add Set to Spanish Folder")).not.toBeInTheDocument();
  });

  it("shows 'Folder not found' if ID is invalid", () => {
    const emptyContext = { ...mockContextValue, folders: [] };
    
    render(
      <MemoryRouter>
        <LibraryContext.Provider value={emptyContext}>
          <FolderDetail />
        </LibraryContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("Folder not found")).toBeInTheDocument();
  });
});