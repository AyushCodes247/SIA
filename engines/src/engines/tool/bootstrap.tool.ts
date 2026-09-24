import toolRegistery from "./tool.registery.js";
import readFileTool from "./tools/fileSystem/read.tool.js";

export const registerTools = () : void => {
    toolRegistery.register(readFileTool);
}