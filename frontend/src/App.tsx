import React from "react";
import { Routes , Route } from "react-router";
// import Voice from "./Components/Index"
import VideoBrige from "./Components/VisionSocketBridge";

const App = () => {
  return <>
    <Routes>
      <Route path="/" element={<VideoBrige serverUrl={import.meta.env.VITE_CAMERA_SOCKET_URI} cameraId="hello_camera"/>}/>
    </Routes>
  </>;
};

export default App;
