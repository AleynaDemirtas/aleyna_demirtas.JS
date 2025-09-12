(() => {
  const config = {
    ROOT_ID: "suggested-products",
    TITLE: "Beğenebileceğinizi Düşündüklerimiz",
    JSON_PATH:
      "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
    CACHE_KEY: "products_cache",
  };

  async function init() {
    buildCSS();
    buildHtml();
    const data = await productListData();
  }

  const money = (n) =>
    Number(n).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

  // Check if we are on the homepage
  const isHomePage = () => {
    return (
      window.location.pathname === "/" ||
      window.location.pathname === "/index.html"
    );
  };

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
      if (!response.ok) {
        throw new Error("Failed" + response.status);
      }
      const data = await response.json();

      localStorage.setItem(config.CACHE_KEY, JSON.stringify(data));

      console.log(data);

      renderProducts(data);
      return data;
    } catch (error) {
      console.error("Error fetching JSON:", error);
    }
  }

  function buildHtml() {
    const old = document.getElementById(config.ROOT_ID);
    if (old) {
      old.remove();
    }

    const root = document.createElement("section");
    root.id = config.ROOT_ID;
    root.setAttribute("aria-label", config.TITLE);

    const stack = document.createElement("div");
    stack.className = "stack";

    const panel = document.createElement("div");
    panel.className = "panel";

    const list = document.createElement("div");
    list.className = "product";
    list.id = `${config.ROOT_ID}-list`;
    panel.appendChild(list);

    const header = document.createElement("div");
    header.className = "header";
    header.innerHTML = `<div class="title">${config.TITLE}</div>`;

    stack.appendChild(panel);
    stack.appendChild(header);
    root.appendChild(stack);

    const target = document.querySelector("cx-page-slot[position='Section1']");

    if (target) {
      target.appendChild(root);
    } else {
      const main = document.querySelector("main");
      if (main) main.insertBefore(root, main.firstChild);
      else document.body.insertBefore(root, document.body.firstChild);
    }
  }

  function buildCSS() {
    const css = `
      #${config.ROOT_ID}{box-sizing:border-box;max-width:1200px;margin:16px auto;padding:8px 12px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial}
  #${config.ROOT_ID} *{box-sizing:border-box}

  /* Overlap için sarmal */
  #${config.ROOT_ID} .stack{ position:relative; }

  /* Panel (beyaz kutu) – üstte başlık için yastık bırak */
  #${config.ROOT_ID} .panel{
    position:relative;
    margin-top:22px;
    padding:46px 16px 16px; /* ÜST: header içeri girecek */
    background:#fff;
    border:1px solid #EFEFEF;
    border-radius:24px;
    box-shadow:
      0 8px 22px rgba(0,0,0,.05),
      0 24px 48px rgba(0,0,0,.04);
  }

  /* Header (krem şerit) – panelin üst kenarından içeri sarkar */
  #${config.ROOT_ID} .header{
    position:absolute; left:20px; right:20px; top:-22px; z-index:2;
    display:flex; align-items:center;
    padding:14px 20px;
    background:linear-gradient(180deg,#FFF7EA 0%,rgb(255, 255, 255) 100%);
    border:1px solid #FFE0B3;
    border-radius:20px;
    box-shadow:0 10px 24px rgba(255,168,0,.08), inset 0 1px 0 rgba(255,255,255,.6);
  }

  #${config.ROOT_ID} .title{
    margin:0; font-weight:800; letter-spacing:.2px; color:#D08100; line-height:1.2;
    font-size:22px;
  }
  @media(min-width:768px){ #${config.ROOT_ID} .title{ font-size:26px } }
  @media(min-width:1024px){ #${config.ROOT_ID} .title{ font-size:28px } }

  /* Ürün alanı (panel içinde) */
  #${config.ROOT_ID} .product{
    min-height:140px; background:#fff; padding:12px;
    display:grid; gap:12px; overflow-x:auto; scroll-snap-type:x mandatory;
    grid-auto-flow:column; grid-auto-columns:75%;
  }
  @media(min-width:480px){#${config.ROOT_ID} .product{ grid-auto-columns:55%; }}
  @media(min-width:768px){#${config.ROOT_ID} .product{ grid-auto-columns:35%; }}
  @media(min-width:1024px){#${config.ROOT_ID} .product{ grid-auto-columns:25%; }}

  /* Kart */
  #${config.ROOT_ID} .card{
    scroll-snap-align:start;
    background:#fff; border:1px solid #eee; border-radius:16px; overflow:hidden;
    display:flex; flex-direction:column; position:relative;
    box-shadow:0 1px 2px rgba(0,0,0,.04);
  }

  /* Görsel alanı */
  #${config.ROOT_ID} .imgwrap{ background:#fff; border-bottom:1px solid #f0f0f0; }
  #${config.ROOT_ID} .imgwrap img{ width:100%; aspect-ratio:1/1; object-fit:contain; display:block; }

  /* Metin alanı */
  #${config.ROOT_ID} .body{ padding:12px 14px 14px; }

  /* brand + name yan yana */
  /* Başlık satırı: yan yana başlasın, sığmazsa sarılsın */
#${config.ROOT_ID} .title-line{
  display: flex;
  flex-wrap: wrap;       /* satır taşmasına izin ver */
  align-items: baseline;
  gap: 0;                /* araya ekstra boşluk koyma */
  margin-bottom: 6px;
  line-height: 1.35;
}

/* Marka: kalın ve satır başında; yanına tireyi CSS ile ekleyelim */
.brand{
  display: inline;       /* inline akış */
  font-size: 14px;
  font-weight: 700;
  color: #222;
  white-space: normal;   /* gerekirse o da kırılabilsin */
  margin: 0;
}
 .brand::after{
  content: " -";         /* tireyi otomatik ekle */
}

/* İsim: inline akış; ESKİ clamp/block stillerini iptal et */
.name{
  display: inline;               /* ÖNEMLİ: inline'a dön */
  font-size: 14px;
  color: #222;
  white-space: normal;           /* kırılmaya izin ver */
  overflow: visible;             /* clamp kalıntılarını iptal */
  -webkit-line-clamp: unset;     /* clamp kapat */
  -webkit-box-orient: unset;     /* clamp kapat */
  min-height: 0;                 /* sabit yükseklik kaldır */
  margin: 0;
}

/* (İsteğe bağlı) Eski kuralların çalışmasını tamamen bastırmak için spesifik iptal */
.title-line .name{
  display: inline !important;
  -webkit-line-clamp: unset !important;
  -webkit-box-orient: unset !important;
  overflow: visible !important;
  min-height: 0 !important;
}


  /* Fiyat alanı */
  #${config.ROOT_ID} .price{ display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; }
  #${config.ROOT_ID} .now{ font-size:18px; font-weight:800; color:#1d7f36; }
  #${config.ROOT_ID} .original{ font-size:13px; color:#9b9b9b; text-decoration:line-through; }
  #${config.ROOT_ID} .discount{
    font-size:12px; font-weight:800; color:#1d7f36; background:#E6F4EA; border:1px solid #C8E6D0; border-radius:999px; padding:2px 6px;
  }

  /* Üstte indirim rozeti (TL değil, % gösterilecek) */
  #${config.ROOT_ID} .badge{
    position:absolute; top:8px; left:8px; padding:4px 8px;
    background:#fff3e6; color:#ff7a00; border:1px solid #ffd6b0;
    font-size:12px; font-weight:800; border-radius:999px;
  }

  /* Favori kalp */
  #${config.ROOT_ID} .heart{
    position:absolute; top:8px; right:8px; width:36px; height:36px;
    display:grid; place-items:center; border-radius:999px; background:#fff; border:1px solid #eee; cursor:pointer;
  }
  #${config.ROOT_ID} .heart svg{ width:18px; height:18px; fill:none; stroke:#ff7a00; stroke-width:2; }
  #${config.ROOT_ID} .heart[data-active="true"] svg{ fill:#ff7a00; stroke:#ff7a00; }

  /* Tüm kart tıklanabilir */
  #${config.ROOT_ID} .plink{ position:absolute; inset:0; text-indent:-9999px; overflow:hidden; }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    style.id = `${config.ROOT_ID}-styles`;
    document.head.appendChild(style);
  }

  function renderProducts(items) {
    const list = document.getElementById(`${config.ROOT_ID}-list`);
    if (!list) return;

    list.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      const hasDiscount =
        item.original_price != null &&
        Number(item.original_price) > Number(item.price);
      const discountAmount = hasDiscount
        ? Number(item.original_price) - Number(item.price)
        : 0;

      const discountPercent = hasDiscount
        ? Math.round((1 - item.price / item.original_price) * 100)
        : 0;

      const imgw = document.createElement("div");
      imgw.className = "imgwrap";
      imgw.innerHTML = `<img alt="${(
        item.name || ""
      ).trim()}" loading="lazy" src="${item.img}">`;
      card.appendChild(imgw);

      //discount eklenecek

      const body = document.createElement("div");
      body.className = "body";
      body.innerHTML = `

        <div class="title-line"> 
        <span class="brand">${item.brand || ""}</span>
        <span class="name">${item.name || ""}</span>
        </div>
        
        <div class="price">
          ${
            hasDiscount
              ? `<span class="original">${money(item.original_price)}</span>`
              : ""
          }
          <span class='now'>${money(item.price) || ""}</span>
           ${
             hasDiscount
               ? `<span class="discount">${discountPercent}</span>`
               : ""
           }
        </div>
      `;
      card.appendChild(body);

      if (hasDiscount) {
        const discount = document.createElement("div");
        discount.className = "badge";
        discount.textContent = `-%${money(discountAmount)}`;
        card.appendChild(discount);
      }

      list.appendChild(card);
    });
  }

  init();
})();
