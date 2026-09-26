import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import "dotenv/config";
import Vaihe from "./models/vaihe.js";
import { z } from "zod";

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  console.log("Получен MCP запрос"); //MCP-клиент будет общаться с сервером через "POST /" Когда Claude обращается к серверу, запрос приходит сюда.
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
    await transport.handleRequest(req, res, req.body); //получает запрос от клиента;передаёт его MCP-серверу;запускает нужный tool;отправляет ответ обратно.
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
  console.log("MCP server toimi p 3000");
});
