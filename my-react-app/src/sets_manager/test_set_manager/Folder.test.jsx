//The first we start to importing tools to rendeer components, find elementand wait for async actions
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
//After we inport testing functions from Vitest to group test assert results, and create mocks
import { describe, it, expect, vi, beforeEach } from "vitest";
//Our also need to import the memoryRouter for allows testing components using "Navigate" without real browser
import { MemoryRouter } from "react-router-dom";
//Necessarily import file thet we are going to test
import Folder from "../Folder";
//Impot context to take test data to the components
import { LibraryContext } from "../../context/LibraryContext";
//Import DOM for checking if an element is visible or with part of code we doesnt have testid
import '@testing-library/jest-dom';

//Create mock function to track navigate calls
const mockNavigate = vi.fn();
//Mocking the react-router library and we can mockNavigate use for testing navigation without real page transitions
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

//Grouping all tes for Folder component
describe("Folder Component", () => {
  //We create a mock for updates the folder list
  const mockSetFolders = vi.fn();
  //Transfer our setFolder information for new mock function
  const mockContextValue = {
    setFolders: mockSetFolders,
  };
//A function witch we use for clear all before eact test
  beforeEach(() => {
    //Clearing the history of all mocks and this don't effect new ones functions
    vi.clearAllMocks();
    //We create a mock for global fetch mean server requests
    global.fetch = vi.fn();
    //Also create a mock for the browsers alert windows
    window.alert = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
//The helper function whitch render the Folder components inside the MemoryRouter and LibraryContext with our mock data
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <LibraryContext.Provider value={mockContextValue}>
          <Folder />
        </LibraryContext.Provider>
      </MemoryRouter>
    );

    //We create first test
  it("successfully creates a folder and navigates to library", async () => {
    //We simulating a successful server response when creating a folder
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: "123" }),
    });

    renderComponent();
    //Simulating that use typing tex "name " for folder
    fireEvent.change(screen.getByTestId("name-field"), {
      target: { value: "Spanish Vocabulary" },
    });
    //Simulating that user typing text "description" for folder    
    fireEvent.change(screen.getByTestId("description-field"), {
      target: { value: "A folder for Spanish words" },
    });
    //Simulation that user click the button after input text
    fireEvent.submit(screen.getByRole("button", { name: /Create Folder/i }));


//We waiting for asynchronous process 
    await waitFor(() => {
      //Checking if POST request is correctly send to the server
      expect(global.fetch).toHaveBeenCalledWith("/api/folder", expect.objectContaining({
        method: "POST",
      }));
      expect(mockSetFolders).toHaveBeenCalled();
      //Checking if user is navigated to the library page
      expect(mockNavigate).toHaveBeenCalledWith("/library");
    });
  });
//Create the second test
  it("shows alert if server returns success: false", async () => {
    //Simulating a server response with success false
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    });

    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Fruits/i), { target: { value: "Test" } });
    fireEvent.submit(screen.getByRole("button", { name: /Create Folder/i }));
//After we chack if alert window send the message about faild
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to create folder");
    });
  });
  
  it("handles network errors during submission", async () => {
    global.fetch.mockRejectedValue(new Error("Network Error"));

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Fruits/i), { target: { value: "Error Test" } });
    fireEvent.submit(screen.getByRole("button", { name: /Create Folder/i }));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Could not connect to the server");
    });
  });

  it("navigates back when backdrop is clicked", () => {
    const { container } = renderComponent();

    const backdrop = container.querySelector(".backdrop");
    fireEvent.click(backdrop);
    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });

  it("prevents multiple submissions while loading", async () => {

    global.fetch.mockReturnValue(new Promise(() => {})); 
    
    renderComponent();
    const input = screen.getByPlaceholderText(/Fruits/i);
    fireEvent.change(input, { target: { value: "Speedy Folder" } });

    const submitBtn = screen.getByRole("button", { name: /Create Folder/i });
    fireEvent.change(input)
    

    fireEvent.click(submitBtn);
    fireEvent.click(submitBtn);
    
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("navigates back when X button is clicked", () => {
    renderComponent();
    const closeBtn = screen.getByRole("button", { name: "" }); 
    fireEvent.click(closeBtn); 
    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });
});