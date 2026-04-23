import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "./connect";

vi.mock("mongoose", () => ({
  default: {
    connect: vi.fn(),
  },
}));

describe("connectDB", () => {
  const mockedConnect = vi.mocked(mongoose.connect);

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    processExitSpy = vi.spyOn(process, "exit").mockImplementation(((
      code?: number
    ) => {
      throw new Error(`process.exit called with code ${code}`);
    }) as never);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it("connects successfully and logs a success message", async () => {
    mockedConnect.mockResolvedValueOnce(mongoose as never);

    await connectDB("mongodb://127.0.0.1:27017/test-db");

    expect(mockedConnect).toHaveBeenCalledWith(
      "mongodb://127.0.0.1:27017/test-db"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "MongoDB connected successfully"
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("logs an error and exits the process when connection fails", async () => {
    const dbError = new Error("Connection failed");
    mockedConnect.mockRejectedValueOnce(dbError);

    await expect(connectDB("bad-uri")).rejects.toThrow(
      "process.exit called with code 1"
    );

    expect(mockedConnect).toHaveBeenCalledWith("bad-uri");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to connect to MongoDB:",
      dbError
    );
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
