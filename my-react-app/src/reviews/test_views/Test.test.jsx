import '@testing-library/jest-dom'
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import Test from "../Test"; 

describe("Test Component", () => {
  
  it("renders the title and subtitle correctly", () => {
    render(
      <MemoryRouter>
        <Test />
      </MemoryRouter>
    );
    
    expect(screen.getByText("Make the material stick with Test mode")).toBeInTheDocument();

    expect(screen.getByText("Questions formatted your way")).toBeInTheDocument();
    expect(screen.getByText("Get graded on your responses")).toBeInTheDocument();
    expect(screen.getByText("Take a test, anywhere")).toBeInTheDocument();
  });

});