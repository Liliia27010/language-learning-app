import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FeatureItem from "../Feature-item";

describe ("FeatureItem", () => {

  it("renders the title correctly", async () => {
    render(<FeatureItem title="Test Title" description="Test Description" />);

  
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders everything", async () => {
    render(<FeatureItem title="Test Title" description="Test Description" image="live.gif" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "live.gif");
  });
});