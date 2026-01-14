import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./index.css";
import restImg from "./assets/others/restimg.png";
import CardImage from "./CardImage";

export default function App({ lang, setLang }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);

  const [imgLoading, setImgLoading] = useState(true);



// forgiving search: finds closest match across all items
function handleSearch(input) {
  setSearchTerm(input);

  // Reset when empty
  if (!input || !input.trim()) {
    setSearchResult(null);
    return;
  }

  // Text normalization
  const norm = (s) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

  const query = norm(input);

  // Helpers
  const levenshtein = (a, b, maxThreshold = Infinity) => {
    const alen = a.length, blen = b.length;
    if (alen === 0) return blen;
    if (blen === 0) return alen;

    // Early exit: if length difference already exceeds threshold
    if (Math.abs(alen - blen) > maxThreshold) return maxThreshold + 1;

    const prev = new Array(blen + 1);
    const curr = new Array(blen + 1);

    for (let j = 0; j <= blen; j++) prev[j] = j;

    for (let i = 1; i <= alen; i++) {
      curr[0] = i;
      let rowMin = curr[0];

      for (let j = 1; j <= blen; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(
          prev[j] + 1,      // deletion
          curr[j - 1] + 1,  // insertion
          prev[j - 1] + cost // substitution
        );
        if (curr[j] < rowMin) rowMin = curr[j];
      }

      // Early exit per row if already worse than threshold
      if (rowMin > maxThreshold) return maxThreshold + 1;

      // swap rows
      for (let j = 0; j <= blen; j++) prev[j] = curr[j];
    }

    return curr[blen];
  };

  const similarity = (a, b) => {
    // Exact substring / prefix bonuses
    const A = norm(a), B = norm(b);
    if (B.includes(A)) return 0.98;        // strong substring
    if (B.startsWith(A)) return 0.95;      // strong prefix

    // Fuzzy similarity from edit distance
    const maxLen = Math.max(A.length, B.length);
    if (maxLen === 0) return 0;

    // Cap threshold to ~40% of the longer string for strictness
    const threshold = Math.ceil(maxLen * 0.4);
    const dist = levenshtein(A, B, threshold);

    if (dist > threshold) return 0;        // too far → reject
    return 1 - dist / maxLen;
  };

  // Score items and pick best
  let bestItem = null;
  let bestScore = 0;

  for (const item of items) {
    const nameRaw = lang === "en" ? item.nameEn : item.nameAr;
    if (!nameRaw) continue;

    const name = norm(nameRaw);
    let score = similarity(query, name);

    // Token-aware bump: check each word in the name
    if (score < 0.98) {
      const tokens = name.split(" ");
      for (const t of tokens) {
        const tokenScore = similarity(query, t);
        if (tokenScore > score) score = tokenScore;
      }
    }

    // Slight boost for longer names containing the query
    if (name.includes(query) && name.length > query.length + 2) {
      score = Math.max(score, 0.98);
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  // Minimum quality gate: avoid random matches
  const MIN_SIMILARITY = 0.55; // adjust to taste: 0.5–0.6 is a good band
  setSearchResult(bestScore >= MIN_SIMILARITY ? bestItem : null);
}





  // Fetch categories
 useEffect(() => {
  const fetchCategories = async () => {
    setLoadingCategories(true);
    const catSnap = await getDocs(collection(db, "categories"));
    const cats = [];
    catSnap.forEach((doc) => {
      cats.push({ id: doc.id, ...doc.data() });
    });
    cats.sort((a, b) => a.createdAt - b.createdAt);
    setCategories(cats);
    if (cats.length > 0) setCategory(cats[0].id);
    setLoadingCategories(false);
  };
  fetchCategories();
}, []);

useEffect(() => {
  const fetchItems = async () => {
    if (!category) return;
    setLoadingItems(true);
    const itemsSnap = await getDocs(
      collection(db, "categories", category, "items")
    );
    const list = [];
    itemsSnap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    list.sort((a, b) => a.createdAt - b.createdAt);
    setItems(list);
    setLoadingItems(false);
  };
  fetchItems();
}, [category]);



  return (
    <div className={`app ${lang}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header + Lang Switch */}
      <div className="header">
        <div
          className={`lang-switch ${lang}`}
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
        >
          <div className="lang-option">
            <img src="https://flagcdn.com/gb.svg" alt="English" />
            <span>EN</span>
          </div>
          <div className="lang-option">
            <img src="https://flagcdn.com/sa.svg" alt="Arabic" />
            <span>AR</span>
          </div>
          <div className="lang-thumb" />
        </div>
      </div>

      <div className="content">
        {/* Hero Image */}
        <div className="hero-image">
          <img src={restImg} alt="Restaurant" />
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder={lang === "en" ? "Search..." : "ابحث ..."}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>





        {/* Tabs from Firebase */}
        {loadingCategories ? ( <div className="skeleton-card">Loading categories...</div> ) : ( <div className="tabs">
          {categories.map((cat) => (
            <button
  key={cat.id}
  className={category === cat.id ? "active" : ""}
  onClick={() => {
    setCategory(cat.id);
    setSearchTerm("");      // clear search input
    setSearchResult(null);  // clear search result
  }}
>
  {lang === "en" ? cat.titleEn : cat.titleAr}
</button>

          ))}
        </div> )}
          
        

        {/* Active category or search title */}
{searchTerm ? (
  <p className="title">
    {lang === "en" ? "Search Result" : "نتيجة البحث"}
  </p>
) : category && (
  <p className="title">
    {lang === "en"
      ? categories.find((c) => c.id === category)?.titleEn
      : categories.find((c) => c.id === category)?.titleAr}
  </p>
)}

{/* Items list */}
{loadingItems ? ( <div className="spinner"></div> ) :(<div className="list">
  {searchTerm ? (
    searchResult ? (
      <div
        className="card"
        key={searchResult.id}
        onClick={() => setSelectedItem(searchResult)}
      >
        <div>
          <p className="p1">
            {lang === "en" ? searchResult.nameEn : searchResult.nameAr}
          </p>
          <p>{searchResult.price}</p>
        </div>
        {searchResult.image && (
          <CardImage src={searchResult.image} alt={searchResult.nameEn} />
        )}
      </div>
    ) : (
      // empty search result → no cards
      null
    )
  ) : (
    items.map((item) => (
      <div
        className="card"
        key={item.id}
        onClick={() => setSelectedItem(item)}
      >
        <div>
          <p className="p1">{lang === "en" ? item.nameEn : item.nameAr}</p>
          <p>{item.price}</p>
        </div>
        {item.image && <CardImage src={item.image} alt={item.nameEn} />}
      </div>
    ))
  )}
</div>) }
      </div>

      {/* Popup */}
      {selectedItem && (
        <div className="popup-overlay" onClick={() => setSelectedItem(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSelectedItem(null)}>
              ✕
            </button>
            <div className="popup-img">
              {imgLoading && <div className="img-skeleton">Loading...</div>}
              <img
                src={selectedItem.image}
                alt={selectedItem.nameEn}
                style={{ display: imgLoading ? "none" : "block" }}
                onLoad={() => setImgLoading(false)}
                onError={() => setImgLoading(false)} // hide loader even if error
              />
            </div>

            <div className="popup-info">
              <h2>{lang === "en" ? selectedItem.nameEn : selectedItem.nameAr}</h2>
              <p>{selectedItem.price}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
