import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../src/context/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import NavBar from "../../src/components/NavBar";

describe("NavBar", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockNavigate.mockReset();
  });

  it("shows login/signup for guests", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("shows greeting and allows logout for authenticated user", async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: {
        _id: "u1",
        name: "Alex",
        email: "alex@example.com",
        createdAt: "2026-01-01",
      },
      logout,
    });

    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Hi, Alex")).toBeInTheDocument();
    const logoutButton = screen.getByRole("button", { name: "Log out" });
    fireEvent.click(logoutButton);

    await Promise.resolve();
    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
