const dataURL = "https://docs.google.com/spreadsheets/d/1I6ijIu4Lok4PXsSaJqmcN3EafoUWCXDF2sxh6OgVAZs/gviz/tq?tqx=out:csv&sheet=Data";
const imageURL = "https://docs.google.com/spreadsheets/d/1I6ijIu4Lok4PXsSaJqmcN3EafoUWCXDF2sxh6OgVAZs/gviz/tq?tqx=out:csv&sheet=Images";

let dataRows = [], imgMap = {};

async function fetchCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  return Papa.parse(text, { header: true }).data;
}

async function loadData() {
  dataRows = await fetchCSV(dataURL);
  const imageRows = await fetchCSV(imageURL);
  imageRows.forEach(r => imgMap[r["Item Code"]] = r["Image URL"]);
  initUI();
}

function initUI() {
  const categories = [...new Set(dataRows.map(row => row.Category))].sort();
  const catSelect = document.getElementById("categorySelect");
  catSelect.innerHTML = "<option value=''>-- Select --</option>" + categories.map(cat => `<option value="{cat}">{cat}</option>`.replace(/{cat}/g, cat)).join("");
  catSelect.addEventListener("change", renderCatalogue);
  document.getElementById("searchInput").addEventListener("input", renderCatalogue);
}

function renderCatalogue() {
  const cat = document.getElementById("categorySelect").value;
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filtered = dataRows.filter(r => r.Category === cat && r["Item Name"].toLowerCase().includes(search));

  const grouped = {};
  filtered.forEach(row => {
    if (!grouped[row["Item Code"]]) {
      grouped[row["Item Code"]] = {
        name: row["Item Name"],
        specs: row["Specs"],
        variants: []
      };
    }
    grouped[row["Item Code"]].variants.push({
      code: row["Variant Code"],
      desc: row["Description"],
      price: row["Price/Unit"],
      unit: row["Unit"]
    });
  });

  const container = document.getElementById("catalogueContainer");
  container.innerHTML = "";

  Object.entries(grouped).forEach(([code, item]) => {
    const block = document.createElement("div");
    block.className = "item-block";
    const img = imgMap[code] || "https://via.placeholder.com/120";
    block.innerHTML = `
      <img src="${img}" />
      <h3>${item.name}</h3>
      <p>${item.specs}</p>
      <table>
        <tr><th>Variant Code</th><th>Description</th><th>Price</th><th>Unit</th></tr>
        ${item.variants.map(v => `<tr><td>${v.code}</td><td>${v.desc}</td><td>${v.price}</td><td>${v.unit}</td></tr>`).join("")}
      </table>
    `;
    container.appendChild(block);
  });
}

window.onload = loadData;
