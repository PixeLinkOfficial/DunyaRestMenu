import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Landing from "./Landing";
import "./index.css";

function Root() {
  const [lang, setLang] = useState(null);

  if (!lang) {
    return <Landing onSelectLang={setLang} />;
  }

  return <App lang={lang} setLang={setLang} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
