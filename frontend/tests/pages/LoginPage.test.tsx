import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../src/context/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock("../../src/components/NavBar", () => ({
  default: () => <div>NavBar</div>,
}));

vi.mock("../../src/components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import LoginPage from "../../src/pages/LoginPage";

function renderPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it("renders login form fields", () => {
    renderPage();

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("shows validation error if email or password is missing", async () => {
    renderPage();
    const submitButton = screen.getByRole("button", { name: "Log In" });
    const form = submitButton.closest("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    expect(
      await screen.findByText("Please fill in email and password"),
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("toggles password visibility with eye button", () => {
    renderPage();
    const password = screen.getByPlaceholderText(
      "Enter your password",
    ) as HTMLInputElement;
    expect(password.type).toBe("password");

    const toggle = screen.getAllByRole("button").find((btn) => {
      return btn.getAttribute("type") === "button";
    });
    expect(toggle).toBeTruthy();
    fireEvent.click(toggle!);

    expect(password.type).toBe("text");
  });

  it("submits, trims email, and navigates on success", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "  user@example.com  " },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password123"),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/explore", { replace: true });
  });

  it("shows backend error on failed login", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid Credentials"));
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "bad-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("Invalid Credentials")).toBeInTheDocument();
  });
});
