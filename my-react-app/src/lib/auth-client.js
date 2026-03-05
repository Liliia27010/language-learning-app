import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: import.meta.env.baseURL || "http://localhost:3000",
  fetchOptions: {
        credentials: "include"
  }
});
