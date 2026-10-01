import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClientProvider } from "@tanstack/react-query";
import { AxiosError, type AxiosResponse } from "axios";
import test from "node:test";
import { logout } from "../src/api/diagnostics/queries.ts";
import { apiClient, queryClient } from "../src/config/index.ts";
import { AuthContext, type AuthState } from "../src/context/index.ts";
import LoginPage from "../src/pages/login/LoginPage.tsx";

const authState = (overrides: Partial<AuthState> = {}): AuthState => ({
  session: null, isLoading: false, isError: false, isLoggingOut: false, logoutFailed: false,
  login: () => {}, logout: async () => {}, retry: () => {}, ...overrides,
});
const renderLogin = (state: AuthState) => renderToStaticMarkup(createElement(QueryClientProvider, { client: queryClient }, createElement(AuthContext, { value: state }, createElement(LoginPage))));

for (const isLoggingOut of [false, true]) {
  test(`unconfirmed logout locks login and exposes only the logout retry (pending=${isLoggingOut})`, () => {
    const html = renderLogin(authState({ logoutFailed: true, isLoggingOut }));
    assert.match(html, /role="alert"/);
    assert.match(html.match(/<input[^>]*name="password"[^>]*>/)?.[0] ?? "", /disabled=""/);
    assert.match(html, /<button[^>]*type="submit"[^>]*disabled=""/);
    const retry = html.match(/<button[^>]*>Retry logout<\/button>/)?.[0];
    assert.ok(retry);
    assert.equal(retry.includes('disabled=""'), isLoggingOut);
  });
}

test("confirmed logout allows a new login without a retry warning", () => {
  const html = renderLogin(authState());
  assert.doesNotMatch(html, /Retry logout|disabled=""/);
});

for (const status of [200, 204, 401, 202, 403, 429, 503]) {
  test(`logout API accepts only confirmed revocation or invalid session (status=${status})`, async () => {
    const adapter = apiClient.defaults.adapter;
    const originalWindow = globalThis.window;
    const events = new EventTarget();
    Object.assign(globalThis, { window: events });
    apiClient.defaults.adapter = async (config) => {
      assert.equal(config.url, "/logout");
      assert.equal(config.method, "post");
      assert.equal(config.withCredentials, true);
      assert.equal(config.data, "{}");
      const response: AxiosResponse = { config, data: {}, status, statusText: "", headers: {} };
      if (config.validateStatus && !config.validateStatus(status)) throw new AxiosError("Rejected", "ERR_BAD_RESPONSE", config, undefined, response);
      return response;
    };
    try {
      if ([200, 204, 401].includes(status)) await assert.doesNotReject(logout());
      else await assert.rejects(logout());
    } finally {
      apiClient.defaults.adapter = adapter;
      Object.assign(globalThis, { window: originalWindow });
    }
  });
}

test("logout network failure remains retryable rather than reporting success", async () => {
  const adapter = apiClient.defaults.adapter;
  let calls = 0;
  apiClient.defaults.adapter = async (config) => {
    assert.equal(config.withCredentials, true);
    calls++;
    if (calls === 1) throw new AxiosError("Network unavailable", "ERR_NETWORK", config);
    return { config, data: {}, status: 200, statusText: "OK", headers: {} };
  };
  try {
    await assert.rejects(logout());
    await assert.doesNotReject(logout());
    assert.equal(calls, 2);
  } finally { apiClient.defaults.adapter = adapter; }
});
