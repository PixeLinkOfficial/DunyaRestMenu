import { useState } from "react";

export default function CardImage({ src, alt }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="img-placeholder">
      {loading && <div className="spinner"></div>}
      <img
        src={src}
        alt={alt}
        style={{ display: loading ? "none" : "block" }}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </div>
  );
}
