import toolEngine from "./src/engines/tool/tool.engine";
import { registerTools } from "./src/engines/tool/bootstrap.tool";

registerTools();

const result = await toolEngine.execute({
  query: "Add all the files and then Commit with the message worked 'Git tools' then Push the commited changes to the upstream remote main branch.",
  context: {
    workingDirectory: process.cwd(),
  },
});

console.dir(result, { depth: null, colors: true });
