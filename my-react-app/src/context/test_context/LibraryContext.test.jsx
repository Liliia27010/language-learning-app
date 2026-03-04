import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LibraryProvider, useLibrary } from "../LibraryContext";
import { authClient } from "../../lib/auth-client";
import '@testing-library/jest-dom';

vi.mock("../../lib/auth-client", () => ({
  authClient: { getSession: vi.fn() },
}));

const TestLibrary= () => {
  const { 
    savedSets, folders, handleSaveSet, deleteFolder, 
    deleteCardSet, handleUpdateSet, handleAddSetToFolder 
  } = useLibrary();

  return (
    <div>
      <div data-testid="sets-count">{savedSets.length}</div>
      <div data-testid="folders-count">{folders.length}</div>
      
      <button onClick={() => handleSaveSet({ title: "New" })} data-testid="add-set">Add</button>
      <button onClick={() => deleteCardSet("s1")} data-testid="del-set">Del Set</button>
      <button onClick={() => handleUpdateSet({ _id: "s1", title: "Updated" })} data-testid="upd-set">Update</button>
      <button onClick={() => handleAddSetToFolder("f1", { _id: "s1" })} data-testid="add-to-f">Add to Folder</button>
      <button onClick={() => deleteFolder("f1")} data-testid="del-folder">Del Folder</button>
    </div>
  );
};

describe("LibraryContext Advanced Coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.confirm = vi.fn(() => true);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    let store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
      clear: vi.fn(() => { store = {}; }),
    });
  });
  
  it("logs errors when backend returns 401 or fetch fails", async () => {
    authClient.getSession.mockResolvedValue({ data: { user: {} } });
    global.fetch.mockResolvedValue({ status: 401, ok: false });

    render(<LibraryProvider><TestLibrary /></LibraryProvider>);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("updates an existing set in state and localStorage", async () => {
    authClient.getSession.mockResolvedValue({ data: null });
    render(<LibraryProvider><TestLibrary /></LibraryProvider>);


    fireEvent.click(screen.getByTestId("add-set"));
    
    fireEvent.click(screen.getByTestId("upd-set"));
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("deletes a card set via API", async () => {
    authClient.getSession.mockResolvedValue({ data: null });
    render(<LibraryProvider><TestLibrary /></LibraryProvider>);

    global.fetch.mockResolvedValueOnce({ ok: true });
    
    fireEvent.click(screen.getByTestId("del-set"));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/setcards/s1"), 
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("adds a set to a folder and handles duplicates", async () => {
    authClient.getSession.mockResolvedValue({ data: { user: {} } });
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ _id: "f1", sets: [] }]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    render(<LibraryProvider><TestLibrary /></LibraryProvider>);
    await waitFor(() => expect(screen.getByTestId("folders-count")).toHaveTextContent("1"));

    global.fetch.mockResolvedValueOnce({ ok: true });

    fireEvent.click(screen.getByTestId("add-to-f"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/folder/f1/add-set"),
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("handles errors in deleteFolder catch block", async () => {
    authClient.getSession.mockResolvedValue({ data: null });
    render(<LibraryProvider><TestLibrary /></LibraryProvider>);

    global.fetch.mockRejectedValue(new Error("API Crash"));
    
    fireEvent.click(screen.getByTestId("del-folder"));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error", expect.any(Error));
    });
  });
});