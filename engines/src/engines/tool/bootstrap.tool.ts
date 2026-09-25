import toolRegistery from "./tool.registery.js";
import readFileTool from "./tools/fileSystem/read.tool.js";
import listTool from "./tools/fileSystem/list.tool.js";
import writeFileTool from "./tools/fileSystem/write.tool.js";
import editFileTool from "./tools/fileSystem/edit.tool.js";
import createDirectoryTool from "./tools/fileSystem/create.tool.js";
import deleteTool from "./tools/fileSystem/delete.tool.js";
import moveTool from "./tools/fileSystem/move.tool.js";
import copyTool from "./tools/fileSystem/copy.tool.js";
import searchTool from "./tools/fileSystem/search.tool.js";
import infoTool from "./tools/fileSystem/info.tool.js";
import contentTool from "./tools/fileSystem/content.tool.js";

export const registerTools = (): void => {
  toolRegistery.register(readFileTool);
  toolRegistery.register(listTool);
  toolRegistery.register(writeFileTool);
  toolRegistery.register(editFileTool);
  toolRegistery.register(createDirectoryTool);
  toolRegistery.register(deleteTool);
  toolRegistery.register(moveTool);
  toolRegistery.register(copyTool);
  toolRegistery.register(searchTool);
  toolRegistery.register(infoTool);
  toolRegistery.register(contentTool);
};
