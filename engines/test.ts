import toolEngine from "./src/engines/tool/tool.engine";
import { registerTools } from "./src/engines/tool/bootstrap.tool";

registerTools();

const result = await toolEngine.execute({
  query: "Commit all the file with the message 'Testing git tools'. in current working directory",
  context: {
    workingDirectory: process.cwd(),
  },
});

console.dir(result, { depth: null, colors: true });
