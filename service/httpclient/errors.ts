export interface ApiError {
  message: string;
  fieldErrors: Record<string, string>;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getApiError(error: unknown): ApiError {
  const result: ApiError = { message: "Unable to sign in. Please try again.", fieldErrors: {} };
  if (!isRecord(error)) return result;
  const data = isRecord(error.data) ? error.data : error;

  if (typeof data.responseMessage === "string" && data.responseMessage.trim()) {
    result.message = data.responseMessage;
  } else if (typeof data.detail === "string" && data.detail.trim()) {
    result.message = data.detail;
  } else if (typeof data.message === "string" && data.message.trim()) {
    result.message = data.message;
  } else if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
    result.message = "We couldn't reach the server. Check your connection and try again.";
  } else if (error.status === "PARSING_ERROR") {
    result.message = "The server returned an unexpected response. Please try again.";
  } else if (error.status === 401) {
    result.message = "The email or password is incorrect.";
  } else if (error.status === 422) {
    result.message = "Please check your details and try again.";
  }

  if (Array.isArray(data.detail)) {
    for (const item of data.detail) {
      if (!isRecord(item) || typeof item.msg !== "string") continue;
      const location = Array.isArray(item.loc) ? item.loc : [];
      const field = location.at(-1);
      if (field === "email" || field === "password") result.fieldErrors[field] = item.msg;
      else result.message = item.msg;
    }
  }
  return result;
}
