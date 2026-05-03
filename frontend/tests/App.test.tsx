import { render, screen } from "@testing-library/react";
import App from "../src/App";

describe("App", () => {
  test("renders landing page", () => {
    render(<App />);

    expect(screen.getByText(/See Your Sound/i)).toBeInTheDocument();
  });

  test("renders CTA links with correct routes", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: /Try the Demo/i })).toHaveAttribute(
      "href",
      "/visualizer/demo"
    );

    expect(
      screen.getByRole("link", { name: /Get Started Free/i })
    ).toHaveAttribute("href", "/signup");
  });

  test("renders feature cards", () => {
    render(<App />);

    expect(screen.getByText(/Audio-reactive shaders/i)).toBeInTheDocument();
    expect(screen.getByText(/No-setup mic access/i)).toBeInTheDocument();
    expect(screen.getByText(/Growing visualizer library/i)).toBeInTheDocument();
  });
});
