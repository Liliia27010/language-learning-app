import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: import.meta.env.BASE_URL,
  fetchOptions: {
        credentials: "include"
  }
});
