import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Library from "../Library";
import { LibraryContext } from "../../context/LibraryContext";
import "@testing-library/jest-dom";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

describe("Library Component", () => {
  const mockDeleteCardSet = vi.fn();
  const mockSetFolders = vi.fn();

  const mockContextValue = {
    savedSets: [
      { _id: "s1", name: "Spanish Set", description: "Basic words", cards: [1, 2] },
      { _id: "s2", name: "In Folder Set", cards: [1] }
    ],
    folders: [
      {
        _id: "f1",
        name: "School Folder",
        description: "Math and Science",
        sets: [{ _id: "s2" }]
      }
    ],
    deleteCardSet: mockDeleteCardSet,
    setFolders: mockSetFolders,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.alert = vi.fn();
    window.prompt = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <LibraryContext.Provider value={mockContextValue}>
          <Library />
        </LibraryContext.Provider>
      </MemoryRouter>
    );

  it("renders folders and filtered sets correctly", () => {
    renderComponent();
    expect(screen.getByText("School Folder")).toBeInTheDocument();
    expect(screen.getByText("1 sets")).toBeInTheDocument();
    expect(screen.getByText("Spanish Set")).toBeInTheDocument();
    expect(screen.queryByText("In Folder Set")).not.toBeInTheDocument();
  });

  it("navigates to create new folder page", () => {
    renderComponent();
    fireEvent.click(screen.getByText("+ New Folder"));
    expect(mockNavigate).toHaveBeenCalledWith("/folder");
  });

  it("deletes a folder via API call", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderComponent();
    
    const folderSection = screen.getByText("Your Folders").closest('.section');
    const deleteBtn = within(folderSection).getByRole("button", { name: /Delete/i });
    
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/folder/f1", expect.objectContaining({
        method: "delete"
      }));
      expect(mockSetFolders).toHaveBeenCalled();
    });
  });

  it("updates a folder name via prompt and API", async () => {
    window.prompt
      .mockReturnValueOnce("New Name")
      .mockReturnValueOnce("New Description");

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderComponent();
    
    const folderSection = screen.getByText("Your Folders").closest('.section');
    const editBtn = within(folderSection).getByRole("button", { name: /Edit/i });
    
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/folder/f1", expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "New Name", description: "New Description" })
      }));
    });
  });

  it("calls deleteCardSet for a specific set", () => {
    renderComponent();
    
    const setsSection = screen.getByText("Your Cards Set").closest('.section');
    const deleteBtn = within(setsSection).getByRole("button", { name: /Delete/i });
    
    fireEvent.click(deleteBtn);

    expect(mockDeleteCardSet).toHaveBeenCalledWith("s1");
  });

  it("navigates to learn page for a set", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Learn"));
    expect(mockNavigate).toHaveBeenCalledWith("/cards/s1");
  });
});