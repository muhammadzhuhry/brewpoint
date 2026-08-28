import { test as setup, request as pwRequest, expect } from "@playwright/test";
import path from "path";
import { CASHIER_CREDENTIALS, ADMIN_CREDENTIALS } from "./fixtures";

const ADMIN_STATE = path.join(__dirname, ".auth", "admin.json");
const CASHIER_STATE = path.join(__dirname, ".auth", "cashier.json");

const BASE_URL = "http://localhost:3000";

setup("authenticate as admin and provision an e2e cashier", async () => {
  const api = await pwRequest.newContext({ baseURL: BASE_URL });

  // Log in as the seeded admin.
  const loginRes = await api.post("/api/v1/auth/login", {
    data: ADMIN_CREDENTIALS,
  });
  expect(loginRes.ok()).toBeTruthy();

  // Save admin storage state for tests that need to start already logged in.
  await api.storageState({ path: ADMIN_STATE });

  // Create (or reuse) a dedicated cashier account for RBAC / checkout tests.
  const createRes = await api.post("/api/v1/users", {
    data: {
      username: CASHIER_CREDENTIALS.username,
      password: CASHIER_CREDENTIALS.password,
      name: CASHIER_CREDENTIALS.name,
      role: "cashier",
    },
  });
  if (!createRes.ok()) {
    const body = await createRes.json().catch(() => null);
    const code = body?.error?.code;
    if (code !== "CONFLICT") {
      throw new Error(
        `Failed to provision e2e cashier: ${createRes.status()} ${JSON.stringify(body)}`,
      );
    }
    // Already exists from a previous run — that's fine, we just log in below.
  }

  await api.dispose();

  // Log in as the cashier in a fresh context and save its storage state.
  const cashierApi = await pwRequest.newContext({ baseURL: BASE_URL });
  const cashierLogin = await cashierApi.post("/api/v1/auth/login", {
    data: {
      username: CASHIER_CREDENTIALS.username,
      password: CASHIER_CREDENTIALS.password,
    },
  });
  expect(cashierLogin.ok()).toBeTruthy();
  await cashierApi.storageState({ path: CASHIER_STATE });
  await cashierApi.dispose();
});
