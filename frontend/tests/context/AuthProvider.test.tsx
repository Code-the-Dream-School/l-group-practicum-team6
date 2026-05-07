import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../../src/context/AuthProvider";
import { useAuth } from "../../src/context/useAuth";

function AuthProbe() {
  const { user, login, register, logout } = useAuth();

  return (
    <div>
      <p data-testid="user-name">{user ? user.name : "none"}</p>
      <button
        type="button"
        onClick={() => void login("test@example.com", "password123")}
      >
        login
      </button>
      <button
        type="button"
        onClick={() =>
          void register("John", "john@example.com", "password123")
        }
      >
        register
      </button>
      <button type="button" onClick={() => void logout()}>
        logout
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("restores user on successful bootstrap", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          _id: "u1",
          name: "Sam",
          email: "sam@example.com",
          createdAt: "2026-01-01",
        },
      }),
    } as Response);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(await screen.findByTestId("user-name")).toHaveTextContent("Sam");
  });

  it("sets user null when bootstrap returns non-ok response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(await screen.findByTestId("user-name")).toHaveTextContent("none");
  });

  it("sets user null when bootstrap request throws", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("network down"));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(await screen.findByTestId("user-name")).toHaveTextContent("none");
  });

  it("logs in and updates context user", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            _id: "u2",
            name: "Login User",
            email: "test@example.com",
            createdAt: "2026-01-02",
          },
        }),
      } as Response);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await screen.findByTestId("user-name");
    fireEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() =>
      expect(screen.getByTestId("user-name")).toHaveTextContent("Login User"),
    );
  });

  it("throws login error from api message", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: "Bad credentials" } }),
      } as Response);

    function ErrorProbe() {
      const { login } = useAuth();
      return (
        <button
          type="button"
          onClick={async () => {
            try {
              await login("x@y.com", "bad");
            } catch (e) {
              (window as unknown as { __loginError?: string }).__loginError =
                e instanceof Error ? e.message : "unknown";
            }
          }}
        >
          do-login
        </button>
      );
    }

    render(
      <AuthProvider>
        <ErrorProbe />
      </AuthProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "do-login" }));
    await waitFor(() =>
      expect(
        (window as unknown as { __loginError?: string }).__loginError,
      ).toBe("Bad credentials"),
    );
  });

  it("throws when login response has no data", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

    function InvalidLoginProbe() {
      const { login } = useAuth();
      return (
        <button
          type="button"
          onClick={async () => {
            try {
              await login("x@y.com", "password123");
            } catch (e) {
              (window as unknown as { __invalidLogin?: string }).__invalidLogin =
                e instanceof Error ? e.message : "unknown";
            }
          }}
        >
          invalid-login
        </button>
      );
    }

    render(
      <AuthProvider>
        <InvalidLoginProbe />
      </AuthProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "invalid-login" }),
    );
    await waitFor(() =>
      expect(
        (window as unknown as { __invalidLogin?: string }).__invalidLogin,
      ).toBe("Invalid login response"),
    );
  });

  it("registers and then logout clears user even if request fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            _id: "u3",
            name: "John",
            email: "john@example.com",
            createdAt: "2026-01-03",
          },
        }),
      } as Response)
      .mockRejectedValueOnce(new Error("network down"));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await screen.findByTestId("user-name");
    fireEvent.click(screen.getByRole("button", { name: "register" }));
    await waitFor(() =>
      expect(screen.getByTestId("user-name")).toHaveTextContent("John"),
    );

    fireEvent.click(screen.getByRole("button", { name: "logout" }));
    await waitFor(() =>
      expect(screen.getByTestId("user-name")).toHaveTextContent("none"),
    );
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("throws register fallback error when error body parsing fails", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error("bad json");
        },
      } as unknown as Response);

    function RegisterErrorProbe() {
      const { register } = useAuth();
      return (
        <button
          type="button"
          onClick={async () => {
            try {
              await register("x", "x@y.com", "password123");
            } catch (e) {
              (
                window as unknown as { __registerError?: string }
              ).__registerError = e instanceof Error ? e.message : "unknown";
            }
          }}
        >
          do-register
        </button>
      );
    }

    render(
      <AuthProvider>
        <RegisterErrorProbe />
      </AuthProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "do-register" }),
    );
    await waitFor(() =>
      expect(
        (window as unknown as { __registerError?: string }).__registerError,
      ).toBe("Registration failed"),
    );
  });

  it("throws when register response has no data", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

    function InvalidRegisterProbe() {
      const { register } = useAuth();
      return (
        <button
          type="button"
          onClick={async () => {
            try {
              await register("John", "john@example.com", "password123");
            } catch (e) {
              (
                window as unknown as { __invalidRegister?: string }
              ).__invalidRegister = e instanceof Error ? e.message : "unknown";
            }
          }}
        >
          invalid-register
        </button>
      );
    }

    render(
      <AuthProvider>
        <InvalidRegisterProbe />
      </AuthProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "invalid-register" }),
    );
    await waitFor(() =>
      expect(
        (window as unknown as { __invalidRegister?: string }).__invalidRegister,
      ).toBe("Invalid registration response"),
    );
  });
});
