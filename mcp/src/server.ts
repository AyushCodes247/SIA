import app from "@/app.js";
import http from "http";
import env from "@configs/env.config.js";

const server = http.createServer(app);

async function startMcpServer() : Promise<void>{
    server.listen(env.PORT, () => {
        console.info(`MCP SERVER IS RUNNING ON PORT NO.: ${env.PORT}`);
    });
}

startMcpServer();