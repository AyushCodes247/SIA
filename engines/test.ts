import toolEngine from "./src/engines/tool/tool.engine";
import { registerTools } from "./src/engines/tool/bootstrap.tool";

registerTools();

const result = await toolEngine.execute({
  query: "Read ../../../../etc/passwd",

  context: {
    workingDirectory: process.cwd(),
  },
});

console.dir(result, {
  depth: null,
});
