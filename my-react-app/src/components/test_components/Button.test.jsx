import '@testing-library/jest-dom'
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "../Button";

describe("Button Component", () => {
  
  it("renders correctly with label", async () => {
    render(<Button label="Click Me" />);

    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    render(<Button label="Submit" onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", async () => {
    render(<Button label="Style" className="test-class" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("test-class");
  });
});