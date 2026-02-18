import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FeatureContainer from "../Feature-container";
 
describe("FeatureContainer", () => {
  
  it("renders the title correctly", async () => {
    render(<FeatureContainer title="Welcome to FINLEARN" subtitle="Test Sub" />);

    expect(screen.getByText("Welcome to FINLEARN")).toBeInTheDocument();
  });

  it("renders the subtitle correctly", async () => {
    render(<FeatureContainer title="Test Title" subtitle="Learn languages easily" />);

    expect(screen.getByText("Learn languages easily")).toBeInTheDocument();
  });

});