import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { testing } from "@prismatic-io/spectral";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { ts } from "ts-morph";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withWorkingDirectory } from "../../../../command-context.js";
import { write } from "../../writer/index.js";
import { read } from "./index.js";

const server = setupServer();
let directory: string;
let harness: ReturnType<typeof testing.createHarness>;
let generated: Awaited<ReturnType<typeof read>>;
const baseUrl = "https://openapi-regression.invalid";
const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0xff, 0x80]);
const response = {
  "200": { description: "ok", content: { "application/json": { schema: { type: "object" } } } },
};
const operation = (operationId: string, security?: object[]) => ({
  operationId,
  security,
  responses: response,
});

beforeAll(async () => {
  directory = await mkdtemp(resolve(".openapi-runtime-"));
  const spec = {
    openapi: "3.0.3",
    info: { title: "Runtime regression", version: "1" },
    servers: [{ url: baseUrl }],
    security: [{ HeaderKey: [] }],
    components: {
      securitySchemes: {
        HeaderKey: { type: "apiKey", in: "header", name: "X-Partner-Key" },
        QueryKey: { type: "apiKey", in: "query", name: "access_key" },
        CookieKey: { type: "apiKey", in: "cookie", name: "session" },
        Basic: { type: "http", scheme: "basic" },
        Bearer: { type: "http", scheme: "bearer" },
        OAuth: {
          type: "oauth2",
          flows: {
            clientCredentials: { tokenUrl: `${baseUrl}/token`, scopes: {} },
          },
        },
      },
    },
    paths: {
      "/public": { get: operation("publicGet", []) },
      "/optional": { get: operation("optionalGet", [{}, { HeaderKey: [] }]) },
      "/key": { get: operation("keyGet") },
      "/alternatives": { get: operation("alternativesGet", [{ HeaderKey: [] }, { Basic: [] }]) },
      "/query": {
        get: {
          ...operation("queryGet", [{ QueryKey: [] }]),
          parameters: [{ name: "page", in: "query", schema: { type: "integer" } }],
        },
      },
      "/cookie": { get: operation("cookieGet", [{ CookieKey: [] }]) },
      "/bearer": { get: operation("bearerGet", [{ Bearer: [] }]) },
      "/oauth": { get: operation("oauthGet", [{ OAuth: [] }]) },
      "/image/{id}": {
        get: {
          operationId: "imageGet",
          security: [{ Basic: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "image",
              content: { "image/png": { schema: { type: "string", format: "binary" } } },
            },
          },
        },
      },
      "/composed": {
        post: {
          ...operation("composedPost", []),
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  allOf: [
                    {
                      type: "object",
                      properties: { name: { type: "string", default: "hello" } },
                      required: ["name"],
                    },
                    {
                      allOf: [
                        {
                          type: "object",
                          properties: { date: { type: "string" } },
                          required: ["date"],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  };
  const specPath = resolve(directory, "openapi.json");
  await writeFile(specPath, JSON.stringify(spec));
  generated = await read(specPath);
  await withWorkingDirectory(directory, () => write("openapi-regression", false, generated));
  const component = await import(resolve(directory, "src/index.ts"));
  harness = testing.createHarness(component.default);
  server.listen({ onUnhandledRequest: "error" });
});
afterAll(async () => {
  server.close();
  if (directory) await rm(directory, { recursive: true, force: true });
});

const connection = (key: string, fields: Record<string, string>) => ({
  key,
  fields,
  configVarKey: "test",
});

describe("generated OpenAPI actions against HTTP responses", () => {
  it("allows explicit public and optional-auth actions without a connection", async () => {
    server.use(
      http.get(`${baseUrl}/public`, ({ request }) => {
        expect(request.headers.has("Authorization")).toBe(false);
        return HttpResponse.json({ ok: true });
      }),
      http.get(`${baseUrl}/optional`, () => HttpResponse.json({ ok: true })),
    );
    expect((await harness.action("publicGet", {})).data).toEqual({ ok: true });
    expect((await harness.action("optionalGet", {})).data).toEqual({ ok: true });
    expect(generated.actions.find(({ key }) => key === "publicGet")?.inputs).not.toHaveProperty(
      "connection",
    );
  });
  it("allows optional credentials to select an authenticated view", async () => {
    server.use(
      http.get(`${baseUrl}/optional`, ({ request }) => {
        expect(request.headers.get("X-Partner-Key")).toBe("private-key");
        return HttpResponse.json({ private: true });
      }),
    );
    expect(
      (
        await harness.action("optionalGet", {
          connection: connection("headerKey", { apiKey: "private-key" }),
        })
      ).data,
    ).toEqual({ private: true });
    expect(
      generated.actions.find(({ key }) => key === "optionalGet")?.inputs.connection.required,
    ).toBe(false);
  });
  it("sends API keys in their declared header or query location", async () => {
    server.use(
      http.get(`${baseUrl}/key`, ({ request }) => {
        expect(request.headers.get("X-Partner-Key")).toBe("secret-key");
        expect(request.headers.has("Authorization")).toBe(false);
        return HttpResponse.json({ ok: true });
      }),
      http.get(`${baseUrl}/query`, ({ request }) => {
        expect(new URL(request.url).searchParams.get("access_key")).toBe("secret/key");
        expect(new URL(request.url).searchParams.get("page")).toBe("2");
        return HttpResponse.json({ ok: true });
      }),
    );
    await harness.action("keyGet", {
      connection: connection("headerKey", { apiKey: "secret-key" }),
    });
    await harness.action("queryGet", {
      connection: connection("queryKey", { apiKey: "secret/key" }),
      page: 2,
    });
  });
  it("encodes cookie credentials without dropping their declared name", async () => {
    server.use(
      http.get(`${baseUrl}/cookie`, ({ request }) => {
        expect(request.headers.get("Cookie")).toBe("session=a%3Bb%20c");
        return HttpResponse.json({ ok: true });
      }),
    );
    await harness.action("cookieGet", { connection: connection("cookieKey", { apiKey: "a;b c" }) });
  });
  it("accepts either security alternative, without requiring both", async () => {
    const seen: (string | null)[] = [];
    server.use(
      http.get(`${baseUrl}/alternatives`, ({ request }) => {
        seen.push(request.headers.get("X-Partner-Key") ?? request.headers.get("Authorization"));
        return HttpResponse.json({ ok: true });
      }),
    );
    await harness.action("alternativesGet", {
      connection: connection("headerKey", { apiKey: "key" }),
    });
    await harness.action("alternativesGet", {
      connection: connection("basic", { username: "alice", password: "secret" }),
    });
    expect(seen).toEqual(["key", `Basic ${Buffer.from("alice:secret").toString("base64")}`]);
  });
  it("preserves non-text binary bytes, Basic auth and an opaque path segment", async () => {
    server.use(
      http.get(`${baseUrl}/image/:id`, ({ request }) => {
        expect(new URL(request.url).pathname).toBe("/image/a%2Fb%20%3F%23");
        expect(request.headers.get("Authorization")).toBe(
          `Basic ${Buffer.from("alice:secret").toString("base64")}`,
        );
        expect(request.headers.get("Accept")).toBe("image/png");
        return HttpResponse.arrayBuffer(bytes.buffer, { headers: { "Content-Type": "image/png" } });
      }),
    );
    const result = await harness.action("imageGet", {
      id: "a/b ?#",
      connection: connection("basic", { username: "alice", password: "secret" }),
    });
    expect(Buffer.from(result.data as Uint8Array)).toEqual(Buffer.from(bytes));
    expect(result.contentType).toBe("image/png");
  });
  it("uses the configured bearer credential or OAuth token without guessing from other fields", async () => {
    server.use(
      http.get(`${baseUrl}/bearer`, ({ request }) => {
        expect(request.headers.get("Authorization")).toBe("Bearer configured-key");
        return HttpResponse.json({ ok: true });
      }),
      http.get(`${baseUrl}/oauth`, ({ request }) => {
        expect(request.headers.get("Authorization")).toBe("Bearer access-token");
        return HttpResponse.json({ ok: true });
      }),
    );
    await harness.action("bearerGet", {
      connection: {
        ...connection("bearer", { apiKey: "configured-key" }),
        token: { access_token: "wrong-token" },
      },
    });
    await harness.action("oauthGet", {
      connection: {
        ...connection("oAuth", { apiKey: "wrong-key" }),
        token: { access_token: "access-token" },
      },
    });
  });

  it("propagates authentication failures rather than returning a successful action result", async () => {
    server.use(http.get(`${baseUrl}/key`, () => new HttpResponse(null, { status: 401 })));
    await expect(
      harness.action("keyGet", { connection: connection("headerKey", { apiKey: "expired" }) }),
    ).rejects.toThrow();
  });

  it("generates runnable scaffold tests for a public API with a string default", async () => {
    const specPath = resolve(directory, "rates.json");
    await writeFile(
      specPath,
      JSON.stringify({
        openapi: "3.0.3",
        info: { title: "Public rates", version: "1" },
        servers: [{ url: baseUrl }],
        paths: {
          "/rates/{base}": {
            get: {
              ...operation("getRates"),
              parameters: [
                {
                  name: "base",
                  in: "path",
                  required: true,
                  schema: { type: "string", default: "EUR" },
                },
              ],
            },
          },
        },
      }),
    );
    const publicApi = await read(specPath);
    expect(publicApi.connections).toEqual([]);
    const project = await withWorkingDirectory(resolve(directory, "public"), () =>
      write("public-rates", false, publicApi),
    );
    const component = await import(resolve(directory, "public/src/index.ts"));
    let requests = 0;
    server.use(
      http.get(`${baseUrl}/rates/EUR`, ({ request }) => {
        requests++;
        expect(request.headers.has("Authorization")).toBe(false);
        return HttpResponse.json({ base: "EUR", rate: 1.23456 });
      }),
    );

    // Execute the emitted scaffold test: an unquoted EUR default fails at runtime.
    const callbacks: (() => Promise<void>)[] = [];
    const source = project.getSourceFileOrThrow("src/component.test.ts").getFullText();
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    });
    runInNewContext(compiled.outputText, {
      exports: {},
      require: (name: string) => {
        if (name === "@prismatic-io/spectral") return { testing };
        if (name === ".") return { __esModule: true, default: component.default };
        throw new Error(`Unexpected generated test import: ${name}`);
      },
      describe: (_name: string, callback: () => void) => callback(),
      it: (_name: string, callback: () => Promise<void>) => callbacks.push(callback),
      expect,
    });
    expect(callbacks).toHaveLength(1);
    await callbacks[0]();
    expect(requests).toBe(1);
  });

  it("retains required fields across nested allOf schemas", () => {
    const inputs = generated.actions.find(({ key }) => key === "composedPost")?.inputs;
    expect(inputs?.name.required).toBe(true);
    expect(inputs?.date.required).toBe(true);
  });
});
