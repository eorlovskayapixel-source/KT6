import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import "dotenv/config";
import Vaihe from "./models/vaihe.js";
import { z } from "zod";

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  // The MCP client (e.g. Claude) sends every request to "POST /".
  console.log("MCP request received");
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    const server = new McpServer({
      name: "opinnaytetyot",
      version: "1.0.0",
    });

    server.registerTool(
      "allVaiheet",
      {
        title: "all Vaiheet",
        description: "Hae kentästä vaiheet kaikki tietueet",
      },

      async () => {
        try {
          const vaiheet = await Vaihe.findAllVaiheet();
          if (vaiheet.length === 0) {
            return {
              content: [
                { type: "text", text: "Vaiheita ei löytynyt tietokannasta." },
              ],
            };
          }
          const allVaiheet: string[] = vaiheet.map((v) => v.vaihe);
          return {
            content: [{ type: "text", text: JSON.stringify(allVaiheet) }],
          };
        } catch (error) {
          console.error("Virhe haettaessa vaiheita:", error);
          return {
            content: [{ type: "text", text: "Virhe tietokantahaussa." }],
          };
        }
      },
    );

    server.registerTool(
      "vaiheSelitys",
      {
        title: "Vaiheen selitys",
        description: "Palauttaa opinnäytetyön vaiheen selityksen. Anna vaiheen nimi parametrina.",
        inputSchema: {vaihe: z.string().describe("Vaihe")},
      },     

      async (input) => {
        try {
          const selitys = await Vaihe.getSelitys(input.vaihe);
          if (!selitys) {
            return {
              content: [
                { type: "text", text: "Selitysta ei löytynyt tietokannasta." },
              ],
            };
          }
          
          return {
            content: [{ type: "text", text: JSON.stringify(selitys) }],
          };
        } catch (error) {
          console.error("Virhe haettaessa selitysta:", error);
          return {
            content: [{ type: "text", text: "Virhe tietokantahaussa." }],
          };
        }
      },
    );

    await server.connect(transport);
    // Passes the request to the MCP server, runs the requested tool and sends the response back to the client.
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.listen(3000, () => {
  console.log("MCP server running on port 3000");
});
