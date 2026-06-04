#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import * as z from "zod/v4";
import { fetchCatalogProduct, searchCatalog } from "./victoriosa-catalog-data.mjs";

const APP_VERSION = "0.1.0";
const WIDGET_URI = "ui://victoriosa/catalog-widget.html";
const appDir = path.dirname(fileURLToPath(import.meta.url));

const productSchema = {
  id: z.string(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  url: z.string().url(),
  priceLabel: z.string(),
  tags: z.array(z.string()),
};

const searchOutputSchema = {
  results: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      text: z.string(),
      url: z.string().url(),
      metadata: z.object({
        category: z.string(),
        price: z.string(),
      }),
    })
  ),
};

const fetchOutputSchema = {
  product: z.object(productSchema).nullable(),
};

const widgetOutputSchema = {
  products: z.array(z.object(productSchema)),
  notice: z.string(),
};

function createServer() {
  const server = new McpServer({
    name: "victoriosa-catalog-chatgpt-app",
    version: APP_VERSION,
  });

  server.registerResource(
    "victoriosa-catalog-widget",
    WIDGET_URI,
    {
      title: "Victoriosa Catalog Widget",
      description: "Renders a read-only Victoriosa catalog result list.",
      mimeType: "text/html;profile=mcp-app",
      _meta: {
        ui: {
          prefersBorder: true,
          csp: {
            connectDomains: [],
            resourceDomains: [],
          },
        },
        "openai/widgetDescription":
          "Shows read-only Victoriosa catalog matches with category and price labels.",
      },
    },
    async () => ({
      contents: [
        {
          uri: WIDGET_URI,
          mimeType: "text/html;profile=mcp-app",
          text: await readFile(path.join(appDir, "widget.html"), "utf8"),
          _meta: {
            ui: {
              prefersBorder: true,
              csp: {
                connectDomains: [],
                resourceDomains: [],
              },
            },
            "openai/widgetDescription":
              "Shows read-only Victoriosa catalog matches with category and price labels.",
          },
        },
      ],
    })
  );

  server.registerTool(
    "search",
    {
      title: "Search Victoriosa catalog",
      description:
        "Use this when the user wants to find public Victoriosa catalog items by query or category.",
      inputSchema: {
        query: z.string().default("").describe("Search text for product title, category, description, or tags."),
        category: z.string().optional().describe("Optional exact category filter."),
        limit: z.number().int().min(1).max(10).default(5),
      },
      outputSchema: searchOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ query, category, limit }) => {
      const results = searchCatalog({ query, category, limit }).map((product) => ({
        id: product.id,
        title: product.title,
        text: product.description,
        url: product.url,
        metadata: {
          category: product.category,
          price: product.priceLabel,
        },
      }));

      return {
        structuredContent: { results },
        content: [
          {
            type: "text",
            text: results.length
              ? `Encontre ${results.length} resultado(s) del catalogo Victoriosa.`
              : "No encontre resultados del catalogo Victoriosa con esos filtros.",
          },
        ],
      };
    }
  );

  server.registerTool(
    "fetch",
    {
      title: "Fetch Victoriosa catalog item",
      description:
        "Use this when the user wants details for one public Victoriosa catalog item returned by search.",
      inputSchema: {
        id: z.string().describe("Catalog product id returned by search."),
      },
      outputSchema: fetchOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ id }) => {
      const product = fetchCatalogProduct(id) ?? null;
      return {
        structuredContent: { product },
        content: [
          {
            type: "text",
            text: product
              ? `${product.title}: ${product.description}`
              : "No encontre un producto Victoriosa con ese id.",
          },
        ],
      };
    }
  );

  server.registerTool(
    "show_catalog_widget",
    {
      title: "Show Victoriosa catalog widget",
      description:
        "Use this when the user wants a visual read-only list of Victoriosa catalog matches.",
      inputSchema: {
        query: z.string().default("").describe("Search text for the visual catalog."),
        category: z.string().optional().describe("Optional exact category filter."),
        limit: z.number().int().min(1).max(10).default(5),
      },
      outputSchema: widgetOutputSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        "openai/outputTemplate": WIDGET_URI,
        ui: {
          resourceUri: WIDGET_URI,
        },
      },
    },
    async ({ query, category, limit }) => {
      const products = searchCatalog({ query, category, limit });
      return {
        structuredContent: {
          products,
          notice: "Compras reales, pagos live y publicacion automatica siguen deshabilitados.",
        },
        content: [
          {
            type: "text",
            text: products.length
              ? `Muestro ${products.length} producto(s) Victoriosa en el widget.`
              : "No hay productos Victoriosa para mostrar con esos filtros.",
          },
        ],
        _meta: {
          products,
        },
      };
    }
  );

  return server;
}

const app = createMcpExpressApp();

app.post("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

const port = Number(process.env.CHATGPT_APP_PORT ?? 8787);
app.listen(port, (error) => {
  if (error) {
    console.error("Failed to start Victoriosa ChatGPT app MCP server:", error);
    process.exit(1);
  }
  console.log(`Victoriosa ChatGPT app MCP server listening on http://localhost:${port}/mcp`);
});
