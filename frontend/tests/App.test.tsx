import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders message from API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ data: { message: "Hello World" } }),
        } as Response),
      ),
    );
    render(<App />);
    expect(
      await screen.findByText(/Hello World/, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("shows error when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        } as Response),
      ),
    );
    render(<App />);
    expect(
      await screen.findByText(/Failed to fetch from backend/),
    ).toBeInTheDocument();
  });
});
