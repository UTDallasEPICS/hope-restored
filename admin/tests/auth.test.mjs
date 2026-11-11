import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const createError = (options) => Object.assign(new Error(options.message || options.statusMessage), options);

// Exercise the real middleware and handlers, replacing only framework/DB/QR-file boundaries.
function harness(role, { production = true, cachedRole = role, allowlisted = false, server = false, fetchStatus, routePath = "/qr-code/ShirtsMMale", account = { id: "another-user", name: "Existing User", email: "old@example.com", role: "staff" }, updateErrorCode, createErrorCode } = {}) {
  const writes = { inventory: [], logs: [], users: [], updates: [], deletes: [], requests: [], redirects: [] };
  const user = { id: "user-1", role: cachedRole, email: "user@example.com", name: "Test User" };
  const session = role ? { user, session: { id: "session-1" } } : null;
  const modules = new Map();
  const accounts = new Map();
  if (role) accounts.set(user.id, { ...user, role });
  if (account) accounts.set(account.id, { ...account });
  const prisma = {
    user: {
      findUnique: async ({ where }) => accounts.get(where.id) ?? null,
      findMany: async () => [],
      create: async ({ data }) => {
        if (createErrorCode) throw { code: createErrorCode };
        writes.users.push(data);
        return { id: "created-user", ...data };
      },
      update: async (args) => {
        if (updateErrorCode) throw { code: updateErrorCode };
        if (!accounts.has(args.where.id)) throw { code: "P2025" };
        const updated = { ...accounts.get(args.where.id), ...args.data };
        accounts.set(args.where.id, updated);
        writes.updates.push(args);
        return updated;
      },
      deleteMany: async (args) => { writes.deletes.push(args); return { count: 1 }; },
    },
    inventory: { upsert: async (args) => { writes.inventory.push(args); } },
    activityLog: { create: async (args) => { writes.logs.push(args); } },
  };
  const h3 = {
    createError,
    defineEventHandler: (handler) => handler,
    getHeaders: (event) => event.headers || {},
    getRequestURL: (event) => new URL(event.path, "https://example.com"),
    getRouterParam: (event, name, options) => options?.decode ? decodeURIComponent(event.params[name]) : event.params[name],
    readBody: async (event) => event.body,
    setResponseStatus: (event, status) => { event.status = status; },
  };
  const nuxt = {
    createError,
    defineNuxtRouteMiddleware: (handler) => handler,
    navigateTo: (target) => { writes.redirects.push(target); return { redirect: target }; },
    abortNavigation: (error) => { throw error; },
    useRequestHeaders: () => ({ cookie: "session=test" }),
    useRoute: () => ({ path: routePath }),
    useNuxtApp: () => ({ runWithContext: (operation) => operation() }),
    useRequestFetch: () => async (...args) => {
      writes.requests.push(args);
      if (fetchStatus) throw createError({ statusCode: fetchStatus });
      return { ok: true };
    },
  };
  const overrides = {
    h3,
    "nuxt/app": nuxt,
    [resolve(root, "lib/auth.ts")]: { auth: { api: { getSession: async () => session } } },
    [resolve(root, "lib/auth-client.ts")]: { authClient: { getSession: async () => ({ data: session }) } },
    [resolve(root, "lib/prisma.ts")]: { __esModule: true, default: prisma },
    [resolve(root, "server/utils/qr-types.ts")]: {
      readQRTypes: async () => [{ category: "Blankets", sizePreset: "one-size", genders: [] }],
      addQRType: async (body) => body,
      QRTypeError: class extends Error {},
    },
    [resolve(root, "scripts/itemToQRCode.ts")]: { __esModule: true, default: async () => {}, generateQRCodesForType: async () => {} },
  };

  function load(file) {
    const filename = resolve(root, file);
    if (overrides[filename]) return overrides[filename];
    if (modules.has(filename)) return modules.get(filename).exports;
    const module = { exports: {} };
    modules.set(filename, module);
    const source = readFileSync(filename, "utf8").replaceAll("import.meta.server", String(server));
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    });
    function requireModule(specifier) {
      if (overrides[specifier]) return overrides[specifier];
      if (specifier.startsWith("~/") || specifier.startsWith(".")) {
        let target = specifier.startsWith("~/") ? resolve(root, specifier.slice(2)) : resolve(dirname(filename), specifier);
        if (target.endsWith(".js")) target = target.slice(0, -3) + ".ts";
        if (!existsSync(target)) target += ".ts";
        return load(target);
      }
      return createRequire(filename)(specifier);
    }
    runInNewContext(outputText, {
      exports: module.exports, module, require: requireModule, Headers, console,
      process: { cwd: () => root, env: { NODE_ENV: production ? "production" : "development" } },
      useRuntimeConfig: () => ({ betterAuthAdminEmails: allowlisted ? user.email : "", betterAuthStaffEmails: allowlisted ? user.email : "" }),
    }, { filename });
    return module.exports;
  }
  const event = (path, method = "GET", body, code = "ShirtsMMale") => ({
    path, node: { req: { method } }, params: { code, id: "another-user" }, body,
  });
  return { load, event, writes };
}

const denied = (operation, statusCode = 403) => assert.rejects(operation, (error) => error.statusCode === statusCode);

test("frontend: admin > staff > scanner hierarchy; QR management stays admin-only", async () => {
  for (const server of [false, true]) {
    for (const role of ["scanner", "staff", "admin"]) {
      const h = harness(role, { server });
      const middleware = h.load("middleware/auth.global.ts").default;
      for (const path of ["/qr-code/ShirtsMMale", "/qr-code/Blankets"]) {
        assert.equal(await middleware({ path, fullPath: path }), undefined);
      }
      for (const path of ["/qr-code", "/qr-code/", "/qr-code/new", "/QR-CODE/NEW/", "/qr-code/%6Eew", "/accounts", "/admin"]) {
        const result = await middleware({ path, fullPath: path });
        assert.equal(role !== "admin" ? result.redirect : result, role !== "admin" ? "/Home" : undefined);
      }
      for (const path of ["/inventory", "/checkout", "/reports", "/REPORTS/"]) {
        const result = await middleware({ path, fullPath: path });
        assert.equal(role === "scanner" ? result.redirect : result, role === "scanner" ? "/Home" : undefined);
      }
      for (const path of ["/activity", "/ACTIVITY/", "/future-page"]) {
        const result = await middleware({ path, fullPath: path });
        assert.equal(role !== "admin" ? result.redirect : result, role !== "admin" ? "/Home" : undefined);
      }
      for (const path of ["/", "/Home", "/login"]) {
        assert.equal(await middleware({ path, fullPath: path }), undefined);
      }
    }
  }
});

test("frontend: signed-out scan preserves the item URL through login; redirect rejects other destinations", async () => {
  const h = harness(null);
  const middleware = h.load("middleware/auth.global.ts").default;
  const result = await middleware({ path: "/qr-code/ShirtsMMale", fullPath: "/qr-code/ShirtsMMale" });
  assert.equal(result.redirect.path, "/login");
  assert.equal(result.redirect.query.redirect, "/qr-code/ShirtsMMale");
  const { qrLoginTarget } = h.load("utils/permissions.ts");
  assert.equal(qrLoginTarget(result.redirect.query.redirect), "/qr-code/ShirtsMMale");
  for (const target of ["//evil.example", "https://evil.example", "/inventory", "/qr-code/new", "/qr-code/%6eew", "/qr-code/a%2fb", "/qr-code/\\evil", ["/qr-code/Blankets"]]) {
    assert.equal(qrLoginTarget(target), undefined);
  }
});

test("backend middleware: QR role and method matrix, including direct API access", async () => {
  const routes = [
    ["/api/qr-codes", "GET", ["admin"]],
    ["/api/qr-codes/", "GET", ["admin"]],
    ["/api/qr-codes/types", "GET", ["admin"]],
    ["/api/qr-codes/types", "POST", ["admin"]],
    ["/api/QR-CODES/%74ypes/", "POST", ["admin"]],
    ["/api/qr-codes/ShirtsMMale", "GET", ["admin", "staff", "scanner"]],
    ["/api/qr-codes/ShirtsMMale", "POST", ["admin", "staff", "scanner"]],
    ["/api/qr-codes/ShirtsMMale", "DELETE", ["admin"]],
    ["/api/qr-codes/ShirtsMMale/nested", "POST", ["admin"]],
    ["/api/user/accounts/another-user", "PATCH", ["admin"]],
    ["/api/reports", "GET", ["admin", "staff"]],
    ["/api/REPORTS/", "GET", ["admin", "staff"]],
    ["/api/activity", "GET", ["admin"]],
    ...["inventory", "checkout", "reports", "activity", "user/accounts", "amend", "resource/create"].map((path) => [`/api/${path}`, "POST", ["inventory", "checkout", "reports", "resource/create"].includes(path) ? ["admin", "staff"] : ["admin"]]),
  ];
  for (const role of [null, "scanner", "staff", "admin"]) {
    const h = harness(role);
    const middleware = h.load("server/middleware/auth.ts").default;
    for (const [path, method, allowed] of routes) {
      if (allowed.includes(role)) assert.equal(await middleware(h.event(path, method)), undefined, `${role} ${path}`);
      else await denied(() => middleware(h.event(path, method)), role ? 403 : 401);
    }
    if (role === "scanner") {
      for (const path of ["/api/user/someone@example.com", "/api/future-endpoint", "/api/qr-codes-other"]) {
        await denied(() => middleware(h.event(path)));
      }
    }
    assert.equal(await middleware(h.event("/api/auth/get-session")), undefined);
    assert.equal(await middleware(h.event("/api/qr-codes", "OPTIONS")), undefined);
  }
});

test("authenticated fetch includes session credentials and resumes the scan after an expired session", async () => {
  const h = harness("scanner");
  const fetch = h.load("composables/useAuthenticatedFetch.ts").useAuthenticatedFetch();
  await fetch("/api/qr-codes/ShirtsMMale", { method: "POST", body: { quantity: 1 } });
  assert.equal(h.writes.requests[0][1].credentials, "include");
  for (const routePath of ["/qr-code/ShirtsMMale", "/inventory"]) {
    const expired = harness(null, { fetchStatus: 401, routePath });
    const request = expired.load("composables/useAuthenticatedFetch.ts").useAuthenticatedFetch();
    await denied(() => request("/api/qr-codes/ShirtsMMale"), 401);
    const target = expired.writes.redirects[0];
    if (routePath === "/inventory") assert.equal(target, "/login");
    else {
      assert.equal(target.path, "/login");
      assert.equal(target.query.redirect, routePath);
    }
  }
});

test("backend: scanner never inherits staff/admin access from stale sessions, allowlists, or development bypass", async () => {
  for (const production of [false, true]) {
    const h = harness("scanner", { production, cachedRole: "admin", allowlisted: true });
    const { requireSession } = h.load("server/utils/auth.ts");
    await denied(() => requireSession(h.event("/"), "staff"));
    await denied(() => requireSession(h.event("/"), "admin"));
    const session = await requireSession(h.event("/"), "scanner");
    assert.equal(session.user.role, "scanner");
  }
});

test("QR handlers enforce their own permissions without middleware", async () => {
  for (const role of [null, "scanner", "staff", "admin"]) {
    const h = harness(role);
    for (const file of ["index.get", "types.get", "types.post"]) {
      const handler = h.load(`server/api/qr-codes/${file}.ts`).default;
      const event = h.event("/", "POST", { category: "Blankets", sizePreset: "one-size", genders: [] });
      if (role === "admin") await handler(event);
      else await denied(() => handler(event), role ? 403 : 401);
    }
    const getItem = h.load("server/api/qr-codes/[code].get.ts").default;
    if (role) {
      assert.equal((await getItem(h.event("/"))).code, "ShirtsMMale");
      assert.equal((await getItem(h.event("/", "GET", undefined, "Blankets"))).category, "Blankets");
      await denied(() => getItem(h.event("/", "GET", undefined, "unknown")), 404);
    } else await denied(() => getItem(h.event("/")), role ? 403 : 401);
    const postItem = h.load("server/api/qr-codes/[code].post.ts").default;
    if (!role) await denied(() => postItem(h.event("/", "POST", { quantity: 1 })), 401);
  }
});

test("QR additions use the catalog item, increment stock and log the user; reject invalid quantities and unknown codes", async () => {
  const h = harness("scanner");
  const handler = h.load("server/api/qr-codes/[code].post.ts").default;
  await handler(h.event("/", "POST", { quantity: 3, category: "Forged", gender: "Female", size: "XL" }));
  const write = h.writes.inventory[0];
  assert.equal(write.where.code, "ShirtsMMale");
  assert.equal(write.create.category, "Shirts");
  assert.equal(write.create.gender, "Male");
  assert.equal(write.create.size, "M");
  assert.equal(write.create.quantity, 3);
  assert.equal(write.update.quantity.increment, 3);
  assert.equal(write.update.additions.increment, 3);
  assert.equal(h.writes.logs[0].data.email, "user@example.com");
  assert.equal(h.writes.logs[0].data.action, "Addition");
  for (const quantity of [0, -1, 1.5, "3", null, undefined, Number.MAX_SAFE_INTEGER + 1]) {
    await denied(() => handler(h.event("/", "POST", { quantity })), 400);
  }
  await denied(() => handler(h.event("/", "POST", { quantity: 1 }, "unknown")), 404);
  assert.equal(h.writes.inventory.length, 1);
});

test("staff inventory additions still use the existing inventory API; scanners cannot", async () => {
  for (const role of ["staff", "admin", "scanner"]) {
    const h = harness(role);
    const handler = h.load("server/api/inventory/index.post.ts").default;
    const event = h.event("/", "POST", { category: "Shirts", gender: "Male", size: "M", quantity: 2 });
    if (role === "scanner") await denied(() => handler(event));
    else {
      await handler(event);
      assert.equal(h.writes.inventory[0].where.code, "ShirtsMMale");
      assert.equal(h.writes.logs[0].data.amount, 2);
    }
  }
});

test("admins can create all account roles and delete scanner accounts", async () => {
  const h = harness("admin");
  const create = h.load("server/api/user/accounts/index.post.ts").default;
  const body = { name: "Scanner", email: " SCANNER@example.com ", role: "scanner" };
  await create(h.event("/", "POST", body));
  assert.equal(h.writes.users[0].role, "scanner");
  assert.equal(h.writes.users[0].email, "scanner@example.com");
  for (const role of ["admin", "staff"]) {
    await create(h.event("/", "POST", { ...body, role }));
    assert.equal(h.writes.users.at(-1).role, role);
  }
  await denied(() => create(h.event("/", "POST", { ...body, role: "owner" })), 400);
  const remove = h.load("server/api/user/accounts/[id].delete.ts").default;
  await remove(h.event("/", "DELETE"));
  assert.equal(h.writes.deletes[0].where.role.in.includes("scanner"), true);
  assert.equal(h.writes.deletes[0].where.role.in.includes("admin"), false);
  const selfDelete = h.event("/", "DELETE");
  selfDelete.params.id = "user-1";
  await denied(() => remove(selfDelete));
});

test("account creation and updates require admin access, including direct handler calls", async () => {
  for (const role of [null, "scanner", "staff"]) {
    const h = harness(role);
    const body = { name: "New Admin", email: "admin@example.com", role: "admin" };
    for (const file of ["index.post", "[id].patch"]) {
      const handler = h.load(`server/api/user/accounts/${file}.ts`).default;
      await denied(() => handler(h.event("/", "PATCH", body)), role ? 403 : 401);
    }
    assert.equal(h.writes.users.length, 0);
    assert.equal(h.writes.updates.length, 0);
  }
});

test("admin updates change only name and role, preserving email and verification", async () => {
  const h = harness("admin");
  const update = h.load("server/api/user/accounts/[id].patch.ts").default;
  for (const role of ["admin", "staff", "scanner"]) {
    const updated = await update(h.event("/", "PATCH", {
      name: " Updated Name ", role,
      id: "forged-id", emailVerified: true,
    }));
    assert.equal(updated.id, "another-user");
    assert.equal(updated.name, "Updated Name");
    assert.equal(updated.email, "old@example.com");
    assert.equal(updated.role, role);
    assert.equal(h.writes.updates.at(-1).where.id, "another-user");
    assert.equal(h.writes.updates.at(-1).data.id, undefined);
    assert.deepEqual(Object.keys(h.writes.updates.at(-1).data).sort(), ["name", "role"]);
  }
});

test("account updates reject attempts to submit an email without writing", async () => {
  const h = harness("admin");
  const update = h.load("server/api/user/accounts/[id].patch.ts").default;
  for (const email of ["new@example.com", "old@example.com", "", null]) {
    await denied(() => update(h.event("/", "PATCH", { name: "Updated Name", role: "staff", email })), 400);
  }
  assert.equal(h.writes.updates.length, 0);
});

test("account updates reject invalid fields and missing accounts without writing", async () => {
  const h = harness("admin");
  const update = h.load("server/api/user/accounts/[id].patch.ts").default;
  const valid = { name: "Updated Name", role: "admin" };
  for (const changes of [{ name: " " }, { name: "a".repeat(201) }, { role: "owner" }, { role: undefined }]) {
    await denied(() => update(h.event("/", "PATCH", { ...valid, ...changes })), 400);
  }
  const missingId = h.event("/", "PATCH", valid);
  missingId.params.id = "";
  await denied(() => update(missingId), 400);
  const missing = harness("admin", { account: null });
  await denied(() => missing.load("server/api/user/accounts/[id].patch.ts").default(missing.event("/", "PATCH", valid)), 404);
  assert.equal(h.writes.updates.length, 0);
  assert.equal(missing.writes.updates.length, 0);
});

test("account updates report concurrently removed accounts; creation still detects duplicate emails", async () => {
  const body = { name: "Updated Name", role: "staff" };
  const h = harness("admin", { updateErrorCode: "P2025" });
  const update = h.load("server/api/user/accounts/[id].patch.ts").default;
  await denied(() => update(h.event("/", "PATCH", body)), 404);
  const duplicate = harness("admin", { createErrorCode: "P2002" });
  await denied(() => duplicate.load("server/api/user/accounts/index.post.ts").default(duplicate.event("/", "POST", { ...body, email: "new@example.com" })), 409);
});

test("demoting an admin takes effect on their next protected request", async () => {
  const h = harness("admin");
  const update = h.load("server/api/user/accounts/[id].patch.ts").default;
  const event = h.event("/", "PATCH", { name: "Test User", role: "scanner" });
  event.params.id = "user-1";
  await update(event);
  const { requireSession } = h.load("server/utils/auth.ts");
  await denied(() => requireSession(h.event("/"), "admin"));
  await denied(() => requireSession(h.event("/"), "staff"));
  assert.equal((await requireSession(h.event("/"), "scanner")).user.role, "scanner");
});
