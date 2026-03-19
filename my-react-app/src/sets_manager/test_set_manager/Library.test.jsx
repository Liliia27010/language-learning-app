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

describe("Library Component - Extended Coverage", () => {
  const mockDeleteCardSet = vi.fn();
  const mockSetFolders = vi.fn();
  const TEACHER_ID = "t1";
  const STUDENT_ID = "s1";

  const mockTests = [
    { _id: "test1", title: "Geography Quiz", timeLimit: 10, setId: "set123", sharedBy: "Teacher John" }
  ];

  const mockContextValue = {
    savedSets: [
      { _id: "s1", name: "Spanish Set", cards: [1], userId: [TEACHER_ID] }
    ],
    folders: [
      { _id: "f1", name: "School Folder", userId: [TEACHER_ID], sets: [] }
    ],
    deleteCardSet: mockDeleteCardSet,
    setFolders: mockSetFolders,
  };

  const renderComponent = (userType = "teacher", userId = TEACHER_ID) =>
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { id: userId, name: "User", userType: userType } }}>
          <LibraryContext.Provider value={mockContextValue}>
            <Library />
          </LibraryContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn((url) => {
      if (url.includes("/api/tests")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, tests: mockTests }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    });
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
    window.prompt = vi.fn();
  });

  it("shares a card set via email prompt", async () => {
    window.prompt.mockReturnValue("student@example.com");
    renderComponent();

    const menuBtn = within(screen.getByText("Spanish Set").closest(".folder-card")).getByText("⋮");
    fireEvent.click(menuBtn);

    const shareBtn = await screen.findByText(/share/i);
    fireEvent.click(shareBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/setcards/s1/share"),
        expect.objectContaining({ method: "POST" })
      );
      expect(window.alert).toHaveBeenCalledWith("Shared successfully!");
    });
  });

  it("assigns a student to a test", async () => {
    window.prompt.mockReturnValue("newstudent@test.com");
    renderComponent();

    const testCard = await screen.findByText("Geography Quiz");
    const menuBtn = within(testCard.closest(".folder-card")).getByText("⋮");
    fireEvent.click(menuBtn);

    const addStudentBtn = await screen.findByText(/add student/i);
    fireEvent.click(addStudentBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tests/test1/assign"),
        expect.any(Object)
      );
    });
  });

  it("deletes a test after confirmation", async () => {
    renderComponent();

    const testCard = await screen.findByText("Geography Quiz");
    const menuBtn = within(testCard.closest(".folder-card")).getByText("⋮");
    fireEvent.click(menuBtn);

    const deleteBtn = await screen.findByText(/delete/i);
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tests/test1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("renders student view without create buttons", async () => {
    renderComponent("student", STUDENT_ID);

    expect(screen.getByText("Assigned Tests")).toBeInTheDocument();
    
    expect(screen.queryByText("+ Create New Test")).not.toBeInTheDocument();
    

    const sharedBadge = await screen.findByText(/Teacher: Teacher John/i);
    expect(sharedBadge).toBeInTheDocument();
  });

  it("shares a folder via email prompt", async () => {
    window.prompt.mockReturnValue("friend@test.com");
    renderComponent();

    const menuBtn = within(screen.getByText("School Folder").closest(".folder-card")).getByRole("button");
    fireEvent.click(menuBtn);

    const shareBtn = await screen.findByText(/share/i);
    fireEvent.click(shareBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/folder/f1/share"),
        expect.any(Object)
      );
    });
  });
});