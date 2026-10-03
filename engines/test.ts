import toolEngine from "./src/engines/tool/tool.engine";
import { registerTools } from "./src/engines/tool/bootstrap.tool";

registerTools();

const result = await toolEngine.execute({
  query: "Stage all files then Commit with the message 'Git tools finished' then Push to the main branch.",
  context: {
    workingDirectory: process.cwd(),
  },
});

console.dir(result, { depth: null, colors: true });
