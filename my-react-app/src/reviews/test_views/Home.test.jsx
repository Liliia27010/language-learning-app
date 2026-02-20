import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "../Home"; 

describe("Home Component", () => {
  it("renders all features and titles correctly", () => {
    render(<Home />);
    
 
    expect(screen.getByText("Welcome to FINLEARN")).toBeInTheDocument();
    
    expect(screen.getByText("Interactive Flashcards")).toBeInTheDocument();
    expect(screen.getByText("Smart Practice Tests")).toBeInTheDocument();
    expect(screen.getByText("FINLEARN Live")).toBeInTheDocument();
  });
});