import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FeatureContainer from "../components/Feature-container";
 

describe("FeatureContainer", () => {
  
  it("renders the title correctly", () => {
    render(<FeatureContainer title="Welcome to FINLEARN" subtitle="Test Sub" />);
    
    expect(screen.getByText("Welcome to FINLEARN")).toBeInTheDocument();
  });

  it("renders the subtitle correctly", () => {
    render(<FeatureContainer title="Test Title" subtitle="Learn languages easily" />);

    expect(screen.getByText("Learn languages easily")).toBeInTheDocument();
  });

});