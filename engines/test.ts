import toolEngine from "./src/engines/tool/tool.engine";
import { registerTools } from "./src/engines/tool/bootstrap.tool";

registerTools();

const result = await toolEngine.execute({
  query: "Stage all the file and Commit with the message 'git tool are under development'.",
  context: {
    workingDirectory: process.cwd(),
  },
});

console.dir(result, { depth: null, colors: true });
