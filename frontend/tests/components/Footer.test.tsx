import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Footer from "../../src/components/Footer";

describe("Footer", () => {
  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText("© 2026 Sonix")).toBeInTheDocument();
  });
});
