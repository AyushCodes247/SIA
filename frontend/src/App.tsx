import React from "react";
import { Routes , Route } from "react-router";
import Voice from "./Components/Index"

const App = () => {
  return <>
    <Routes>
      <Route path="/" element={<Voice/>}/>
    </Routes>
  </>;
};

export default App;
