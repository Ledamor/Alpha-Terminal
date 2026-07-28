export * from "@alpha/validation";

export type JSendStatus = "success" | "fail" | "error";

export interface JSendResponse<T = null> {
  status: JSendStatus;
  message?: string;
  data: T | null;
}
