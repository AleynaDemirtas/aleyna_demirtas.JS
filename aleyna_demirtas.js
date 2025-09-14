(() => {
  const config = {
    ROOT_ID: "suggested-products",
    TITLE: "Beğenebileceğinizi Düşündüklerimiz",
    JSON_PATH:
      "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
    CACHE_KEY: "products_cache",
    FAV_KEY: "fav_products",
  };

  async function init() {
    buildCSS();
    buildHtml();
    await productListData();
  }

  const loadFavorites = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(config.FAV_KEY)) || []);
    } catch {
      return new Set();
    }
  };
  const saveFavorites = (set) => {
    localStorage.setItem(config.FAV_KEY, JSON.stringify([...set]));
  };

  const isHomePage = () =>
    window.location.pathname === "/" ||
    window.location.pathname === "/index.html";

  isHomePage()
    ? console.log("You are on the homepage")
    : console.log("Wrong Page");

  async function productListData() {
    const cachedData = localStorage.getItem(config.CACHE_KEY);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      renderProducts(data);
      return data;
    }

    try {
      const response = await fetch(config.JSON_PATH);
      if (!response.ok) throw new Error("Failed " + response.status);

      const data = await response.json();
      localStorage.setItem(config.CACHE_KEY, JSON.stringify(data));
      renderProducts(data);
      return data;
    } catch (error) {
      console.error("Error fetching JSON:", error);
      return [];
    }
  }

  function buildHtml() {
    const old = document.getElementById(config.ROOT_ID);
    if (old) old.remove();

    const root = document.createElement("section");
    root.id = config.ROOT_ID;
    root.setAttribute("aria-label", config.TITLE);

    const header = document.createElement("div");
    header.className = "header";
    header.innerHTML = `<div class="title">${config.TITLE}</div>`;
    root.appendChild(header);

    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
      <button class="arrow prev" aria-label="Önceki">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <div class="track" id="${config.ROOT_ID}-list" role="list"></div>
      <button class="arrow next" aria-label="Sonraki">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    `;
    root.appendChild(panel);

    const track = root.querySelector(".track");
    const prev = root.querySelector(".arrow.prev");
    const next = root.querySelector(".arrow.next");
    const scrollBy = () => track.clientWidth * 0.92;

    prev.addEventListener("click", () =>
      track.scrollBy({ left: -scrollBy(), behavior: "smooth" })
    );
    next.addEventListener("click", () =>
      track.scrollBy({ left: +scrollBy(), behavior: "smooth" })
    );

    let down = false,
      sx = 0,
      sl = 0;
    track.addEventListener("mousedown", (e) => {
      down = true;
      sx = e.pageX;
      sl = track.scrollLeft;
      track.classList.add("grabbing");
    });
    window.addEventListener("mouseup", () => {
      down = false;
      track.classList.remove("grabbing");
    });
    track.addEventListener("mouseleave", () => {
      down = false;
      track.classList.remove("grabbing");
    });
    track.addEventListener(
      "mousemove",
      (e) => {
        if (!down) return;
        e.preventDefault();
        track.scrollLeft = sl - (e.pageX - sx);
      },
      { passive: false }
    );

    const target = document.querySelector("cx-page-slot[position='Section1']");
    if (target) target.appendChild(root);
    else {
      const main = document.querySelector("main");
      if (main) main.insertBefore(root, main.firstChild);
      else document.body.insertBefore(root, document.body.firstChild);
    }
  }

  function buildCSS() {
    const id = `${config.ROOT_ID}-styles`;
    if (document.getElementById(id)) return;

    const css = `
#${config.ROOT_ID}{
  --price-top:18px; --price-now:28px;
  --card-w:260px; --card-h:470px;
  --title-fs:14px; --title-lh:1.3; --title-rows:2;
  --price:#1d7f36; --save-bg:#E6F4EA; --save-bd:#C8E6D0; --star:#FFB400;
  --panel-bd:#EFEFEF; --panel-shadow1:0 6px 18px rgba(0,0,0,.05);
  --panel-shadow2:0 20px 40px rgba(0,0,0,.04);
  max-width:1320px; margin:16px auto; padding:0 16px;
  font-family:Quicksand-Medium;
  position:relative; z-index:0;
}
#${config.ROOT_ID} *{ box-sizing:border-box }

#${config.ROOT_ID}::before{
  content:""; position:absolute; left:8px; right:8px; top:26px; bottom:12px;
  border-radius:28px; background:#fff;
  box-shadow:0 22px 60px rgba(0,0,0,.06), 0 6px 18px rgba(0,0,0,.04);
  pointer-events:none; z-index:0;
}

#${config.ROOT_ID}#${config.ROOT_ID} > .header{
  display:flex !important; visibility:visible !important; opacity:1 !important;
  height:auto !important; overflow:visible !important;
}
#${config.ROOT_ID} .header{
  align-items:center; flex-wrap:wrap; gap:8px;
  margin:0 0 14px; padding:18px 24px;
  background:#faf5eb; border-radius:24px;
  position:relative; z-index:2;
}
#${config.ROOT_ID} .title{
  margin:0; color:#f09e2e; font-weight:600; font-size:22px; line-height:1.2;
}

#${config.ROOT_ID} .panel{
  position:relative; z-index:1;
  padding:22px 10px; background:#fff;
  border:1px solid #EFEFEF; border-radius:24px;
  box-shadow:var(--panel-shadow1), var(--panel-shadow2);
}

#${config.ROOT_ID} .arrow{
  position:absolute; top:50%; transform:translateY(-50%);
  width:38px; height:38px; border-radius:999px;
  border:1px solid #eee; background:#faf5eb;
  display:grid; place-items:center; cursor:pointer;
  box-shadow:0 2px 6px rgba(0,0,0,.06); z-index:3;
}
#${config.ROOT_ID} .arrow.prev{ left:-10px }
#${config.ROOT_ID} .arrow.next{ right:-10px }
#${config.ROOT_ID} .arrow svg{ width:18px; height:18px; fill:none; stroke:#f4be71; stroke-width:2 }

#${config.ROOT_ID} .track{
  display:flex; gap:18px; align-items:stretch;
  overflow-x:auto; -webkit-overflow-scrolling:touch;
  scroll-snap-type:x mandatory; padding:6px 10px;
  scrollbar-width:none; -ms-overflow-style:none;
}
#${config.ROOT_ID} .track::-webkit-scrollbar{ display:none }
#${config.ROOT_ID} .track.grabbing{ cursor:grabbing }

#${config.ROOT_ID} .card{
  position:relative; scroll-snap-align:start;
  flex:0 0 var(--card-w); max-width:var(--card-w);
  height:var(--card-h);
  display:grid; grid-template-rows:auto 1fr; 
  background:#fff; border:1px solid #EDEDED; border-radius:16px;
  overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,.03);
  cursor:pointer;
}
@media(min-width:1200px){
  #${config.ROOT_ID} .card{ flex-basis:280px; max-width:280px }
}

#${config.ROOT_ID} .imgwrap{ background:#fff; border-bottom:1px solid #F2F2F2 }
#${config.ROOT_ID} .imgwrap img{ width:100%; aspect-ratio:1/1; object-fit:contain; display:block }

#${config.ROOT_ID} .body{
  display:grid;
  grid-template-rows:
    calc(var(--title-rows) * var(--title-lh) * var(--title-fs))
    calc(var(--price-top) + var(--price-now))
    1fr
    44px;
  gap:8px; padding:12px 14px 14px;
}

#${config.ROOT_ID} .title-line{ margin:0 }
#${config.ROOT_ID} .title-wrap{
  display:-webkit-box; -webkit-line-clamp:var(--title-rows); -webkit-box-orient:vertical;
  overflow:hidden; line-height:var(--title-lh); font-size:var(--title-fs); color:#222;
}
#${config.ROOT_ID} .brand{ font-weight:700 }
#${config.ROOT_ID} .brand + .name::before{ content:" - "; }

#${config.ROOT_ID} .price-block{
  display:grid; grid-template-rows:var(--price-top) var(--price-now);
  height:calc(var(--price-top) + var(--price-now)); align-content:end;
}
#${config.ROOT_ID} .price-block.no-disc{ grid-template-rows:0 var(--price-now) }
#${config.ROOT_ID} .price-top{ display:flex; align-items:center; gap:6px; overflow:hidden }
#${config.ROOT_ID} .line-through{ font-size:13px; color:#9aa0a6; text-decoration:line-through }
#${config.ROOT_ID} .percent{ font-size:12px; font-weight:800; color:#1d7f36; background:#E6F4EA; border:1px solid #C8E6D0; border-radius:999px; padding:2px 6px }
#${config.ROOT_ID} .now{ display:flex; align-items:flex-end; font-size:20px; font-weight:800; color:#7E8185 }
#${config.ROOT_ID} .price-block:not(.no-disc) .now{ color:#2AB17C }

#${config.ROOT_ID} .spacer{ min-height:0 }
#${config.ROOT_ID} .cart{
  width:100%; height:44px; border-radius:999px;
  border:1px solid #FFF0E0; background:#FFF0E0; color:#F08D34;
  font-weight:800; font-size:14px; cursor:pointer;
}
#${config.ROOT_ID} .cart:hover{ filter:brightness(.98) }

#${config.ROOT_ID} .heart{
  position:absolute; top:12px; right:12px; width:32px; height:32px;
  border-radius:999px; border:1px solid #eee; background:#fff;
  display:grid; place-items:center; cursor:pointer;
  box-shadow:0 2px 6px rgba(0,0,0,.06); padding:0; z-index:2;
}
#${config.ROOT_ID} .heart svg{ width:16px; height:16px; fill:#fff; stroke:#ccc; stroke-width:2 }
#${config.ROOT_ID} .heart[data-active="true"] svg{ fill:#FF9927; stroke:#FF9927 }
#${config.ROOT_ID} .heart:hover svg{ stroke:#FF9927 }

@media (max-width:720px){
  #${config.ROOT_ID} .header{ padding:12px 12px }
  #${config.ROOT_ID} .title{ font-size:10px }
}
@media (max-width:480px){
  #${config.ROOT_ID}{ --card-w:220px; --card-h:440px; --title-fs:13px }
  #${config.ROOT_ID} .header{ padding:12px 14px }
  #${config.ROOT_ID} .title{ font-size:18px }
  #${config.ROOT_ID} .arrow{ width:32px; height:32px }
}
`;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function renderProducts(items) {
    const list = document.getElementById(`${config.ROOT_ID}-list`);
    if (!list) return;
    list.innerHTML = "";

    const favorites = loadFavorites();

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";

      const heart = document.createElement("button");
      heart.type = "button";
      heart.className = "heart";
      const isFav = favorites.has(item.id);
      heart.dataset.active = isFav ? "true" : "false";
      heart.setAttribute("aria-pressed", isFav.toString());
      heart.setAttribute(
        "aria-label",
        isFav ? "Favorilerden Kaldır" : "Favorilere Ekle"
      );
      heart.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      `;
      heart.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const active = heart.dataset.active === "true";
        if (active) favorites.delete(item.id);
        else favorites.add(item.id);
        heart.dataset.active = (!active).toString();
        heart.setAttribute("aria-pressed", (!active).toString());
        saveFavorites(favorites);
      });
      card.appendChild(heart);

      const hasDiscount =
        item.original_price != null &&
        Number(item.original_price) > Number(item.price);

      const discountPercent = hasDiscount
        ? Math.round(
            (1 - Number(item.price) / Number(item.original_price)) * 100
          )
        : 0;

      const imgw = document.createElement("div");
      imgw.className = "imgwrap";
      imgw.innerHTML = `<img alt="${(
        item.name || ""
      ).trim()}" loading="lazy" src="${item.img}">`;
      card.appendChild(imgw);

      const body = document.createElement("div");
      body.className = "body";

      const brandHtml = item.brand
        ? `<span class="brand">${item.brand}</span>`
        : "";
      body.innerHTML = `
        <div class="title-line">
          <div class="title-wrap">
            ${brandHtml}
            <span class="name">${item.name || ""}</span>
          </div>
        </div>
      `;

      const productPrice = document.createElement("div");
      productPrice.className = `price-block ${hasDiscount ? "" : "no-disc"}`;
      productPrice.innerHTML = `
        <div class="price-top">
          ${
            hasDiscount
              ? `<span class="line-through">${item.original_price} TL</span><span class="percent">%${discountPercent}</span>`
              : ``
          }
        </div>
        <div class="now">${item.price} TL</div>
      `;
      body.appendChild(productPrice);

      body.appendChild(
        Object.assign(document.createElement("div"), { className: "spacer" })
      );

      const cart = document.createElement("button");
      cart.type = "button";
      cart.className = "cart";
      cart.textContent = "Sepete Ekle";
      cart.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert(`"${item.name}" sepete eklendi! (Demo amaçlı)`);
      });
      body.appendChild(cart);

      card.addEventListener("click", (e) => {
        if (e.target.closest(".cart, .heart")) return;
        const href = item.url;
        if (href) window.open(href, "_blank", "noopener,noreferrer");
      });

      card.appendChild(body);
      list.appendChild(card);
    });
  }

  init();
})();
