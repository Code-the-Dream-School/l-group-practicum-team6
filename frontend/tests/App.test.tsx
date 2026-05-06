import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

vi.mock("../src/pages/LandingPage", () => ({
  default: () => <div>Landing Page</div>,
}));

vi.mock("../src/pages/LoginPage", () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock("../src/pages/SignUpPage", () => ({
  default: () => <div>Sign Up Page</div>,
}));

vi.mock("../src/pages/ExplorePage", () => ({
  default: () => <div>Explore Page</div>,
}));

vi.mock("../src/pages/DemoPlayerPage", () => ({
  default: () => <div>Demo Player Page</div>,
}));

vi.mock("../src/pages/PlayerPage", () => ({
  default: () => <div>Player Page</div>,
}));

vi.mock("../src/pages/MyVisualsPage", () => ({
  default: () => <div>My Visuals Page</div>,
}));

vi.mock("../src/pages/NotFoundPage", () => ({
  default: () => <div>Not Found Page</div>,
}));

vi.mock("../src/routes/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../src/routes/GuestRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

function renderAt(path: string) {
  window.history.pushState({}, '', path);
  render(<App />);
}

describe("App routes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders landing page at /", () => {
    renderAt("/");
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
  });

  it("renders login page at /login", () => {
    renderAt("/login");
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it("renders sign up page at /signup", () => {
    renderAt("/signup");
    expect(screen.getByText('Sign Up Page')).toBeInTheDocument();
  });

  it("renders explore page at /explore", () => {
    renderAt("/explore");
    expect(screen.getByText('Explore Page')).toBeInTheDocument();
  });

  it("renders demo player page at /visualizers/demo", () => {
    renderAt("/visualizer/demo");
    expect(screen.getByText('Demo Player Page')).toBeInTheDocument();
  });

  it("renders player page at /visualizers/123", () => {
    renderAt("/visualizer/123");
    expect(screen.getByText('Player Page')).toBeInTheDocument();
  });

  it("renders my visuals page at /my-visuals", () => {
    renderAt("/my-visuals");
    expect(screen.getByText('My Visuals Page')).toBeInTheDocument();
  });

  it("renders not found page at unknown route", () => {
    renderAt("/some/unknown/path");
    expect(screen.getByText('Not Found Page')).toBeInTheDocument();
  });
});
