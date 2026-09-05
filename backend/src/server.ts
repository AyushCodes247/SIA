import app from "@/app.js";
import env from "@configs/env.config.js";
import { createServer } from "http";

const server = createServer(app);

server.listen(env.PORT, () => {
  console.info(`SERVER IS RUNNING ON PORT NO.: ${env.PORT}`);
});
