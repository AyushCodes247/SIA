import mouseService from "./src/engines/tool/tools/desktop/mouse.service";

const screen = await mouseService.getScreenSize();

console.log("Screen:", screen);

await mouseService.move(0.5, 0.5);

console.log("Mouse moved.");

await mouseService.click("left");

console.log("Clicked.");

mouseService.stop();