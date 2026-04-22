/*
    Base class for custom API errors. 
    Allows us to handle various error types consistently.
 */
export class CustomAPIError extends Error {
  constructor(message: string) {
    super(message);
  }
}
