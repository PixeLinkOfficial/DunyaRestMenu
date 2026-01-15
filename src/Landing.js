import React from "react";
import "./index.css";
import bgGif from "./assets/bg/source.GIF";
import logo from "./assets/bg/logo.png";

export default function Landing({ onSelectLang }) {
  return (
    <div className="landing" style={{ backgroundImage: `url(${bgGif})` }}>
      {/*<div className="landing-logo">
        <img src={logo} alt="Dunya Logo" className="landing-logo-img" />
      </div>*/}
      <div className="landing-grid">
        <button className="landing-btn en" onClick={() => onSelectLang("en")}>
          English
        </button>
        <button className="landing-btn ar" onClick={() => onSelectLang("ar")}>
          العربية
        </button>
        <button className="landing-btn kr" onClick={() => onSelectLang("kr")}>
          كوردى
        </button>
      </div>
    </div>
  );
}
