import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Library from "../Library";
import { LibraryContext } from "../../context/LibraryContext";
import { AuthContext } from "../../context/LoginContext";
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
  const TEST_USER_ID = "u1";

  const mockAuthValue = {
    user: { id: TEST_USER_ID, name: "Liliia", userType: "teacher" }
  };

  const mockContextValue = {
    savedSets: [
      {
        _id: "s1",
        name: "Spanish Set",
        cards: [1, 2],
        userId: [TEST_USER_ID],
        sets: [{ _id: "s2" }]
      },
      { _id: "s2", name: "In Folder Set", cards: [1] }
    ],
    folders: [
      {
        _id: "f1",
        name: "School Folder",
        userId: [TEST_USER_ID]
      }
    ],
    deleteCardSet: mockDeleteCardSet,
    setFolders: mockSetFolders,
  };

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <LibraryContext.Provider value={mockContextValue}>
            <Library />
          </LibraryContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, tests: [] }),
      })
    );

    window.alert = vi.fn();
    window.prompt = vi.fn();
  });

  it("renders folders and filtered sets correctly", () => {
    renderComponent();

    expect(screen.getByText("School Folder")).toBeInTheDocument();
    expect(screen.getByText(/0\s+sets/i)).toBeInTheDocument();

    expect(screen.getByText("Spanish Set")).toBeInTheDocument();
  });

  it("navigates to create new folder page", () => {
    renderComponent();

    fireEvent.click(screen.getByText(/\+.*folder/i));

    expect(mockNavigate).toHaveBeenCalledWith("/folder");
  });

  it("deletes a folder via API call", async () => {

  renderComponent();

  const folderCard = screen.getByText("School Folder").closest(".folder-card");

  const menuBtn = within(folderCard).getByRole("button");
  fireEvent.click(menuBtn);

  const deleteBtn = await screen.findByText(/delete/i);
  fireEvent.click(deleteBtn);

  await waitFor(() => {
    const called = global.fetch.mock.calls.some(
      call =>
        call[0].includes("/api/folder/f1") &&
        call[1]?.method?.toLowerCase() === "delete"
    );

    expect(called).toBe(true);
  });

});

  it("updates a folder name via prompt and API", async () => {

  const promptSpy = vi.spyOn(window, "prompt")
    .mockReturnValueOnce("New Name")
    .mockReturnValueOnce("New Description");

  renderComponent();

  const folderCard = screen.getByText("School Folder").closest(".folder-card");

  const menuBtn = within(folderCard).getByRole("button");
  fireEvent.click(menuBtn);

  const editBtn = await screen.findByText(/edit/i);
  fireEvent.click(editBtn);

  await waitFor(() => {
    expect(promptSpy).toHaveBeenCalled();
  });

  const called = global.fetch.mock.calls.some(
    call =>
      call[0].includes("/api/folder/f1") &&
      call[1]?.method === "PUT"
  );

  expect(called).toBe(true);

});

  it("calls deleteCardSet for a specific set", async () => {

    renderComponent();

    const spanishSetCard = screen.getByText("Spanish Set").closest(".folder-card");

    const menuBtn = within(spanishSetCard).getByText("⋮");
    fireEvent.click(menuBtn);

    const deleteBtn = await screen.findByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(mockDeleteCardSet).toHaveBeenCalledWith("s1");
  });

  it("navigates to learn page for a set", async () => {

    renderComponent();

    const spanishSetCard = screen.getByText("Spanish Set").closest(".folder-card");

    const menuBtn = within(spanishSetCard).getByText("⋮");
    fireEvent.click(menuBtn);

    const learnBtn = await screen.findByRole("button", { name: /learn/i });
    fireEvent.click(learnBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/cards/s1");
  });

});