# MCP server for thesis stages

A small [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that lets an AI assistant (e.g. Claude) query a MariaDB database of thesis stages (*opinnäytetyön vaiheet*) and their explanations.

Built as a course assignment in *Web-ohjelmointi 2* at Karelia University of Applied Sciences (2026).

## How it works

```
AI assistant (MCP client)
        │  POST /  (Streamable HTTP)
        ▼
Express + MCP server
        │  mysql2, parameterized SQL
        ▼
MariaDB: table "vaiheet" (stage + explanation)
```

## Tools

| Tool | Input | Returns |
|---|---|---|
| `allVaiheet` | – | List of all thesis stages |
| `vaiheSelitys` | `vaihe` (string, validated with zod) | Explanation of the given stage |

## Tech stack

TypeScript · Node.js · Express · MCP TypeScript SDK · mysql2 · zod · MariaDB

## Running locally

1. Import the database: run `opinnaytetyot2.sql` in MariaDB/MySQL.
2. Create a `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=opinnaytetyot
   ```
3. Install and start:
   ```bash
   npm install
   npm run dev
   ```
4. The server listens on `http://localhost:3000/`. Add this URL as an MCP server in your MCP client.
