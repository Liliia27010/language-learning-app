import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router";
import Live from "../Live";

describe("Live Component", () => {
  it("renders all features and titles correctly", () => {
    render(
      <MemoryRouter>
        <Live />
      </MemoryRouter>
    );

    expect(screen.getByText("FINLEARN Live")).toBeInTheDocument();

    expect(screen.getByText("Seamless Integration")).toBeInTheDocument();
    expect(screen.getByText("Energize the Room")).toBeInTheDocument();
    expect(screen.getByText("Master the Material")).toBeInTheDocument();
  });
});