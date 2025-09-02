
const WA_NUMBER = '6282136867674'; // Ganti dengan nomor WhatsAppmu tanpa + dan tanpa spasi

function formatRupiah(n){
  return new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(n);
}

async function loadProducts(){
  const res = await fetch('products.json');
  return await res.json();
}

function waLink(product, opts={}){
  const q = new URLSearchParams({
    text: `Halo, saya mau pesan *${product.name}*%0A` +
          (opts.variant? `Variasi: ${opts.variant}%0A` : '') +
          (opts.weight? `Berat: ${opts.weight}%0A` : '') +
          (opts.notes? `Catatan: ${opts.notes}%0A` : '') +
          `Harga: ${formatRupiah(product.price)}%0A` +
          `Link: ${location.href}`
  });
  return `https://wa.me/${WA_NUMBER}?${q.toString()}`;
}

async function renderList(){
  const listEl = document.querySelector('#product-list');
  if(!listEl) return;
  const products = await loadProducts();
  listEl.innerHTML = products.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <div class="badges">
          ${p.featured? '<span class="badge outstanding">UNGGULAN</span>':''}
          ${p.discount? '<span class="badge discount">DISKON</span>':''}
        </div>
        <h3>${p.name}</h3>
        <div class="price mono">${formatRupiah(p.price)}</div>
        <p class="small">${p.excerpt}</p>
        <div class="card-actions">
          <a class="button" href="product.html?id=${encodeURIComponent(p.id)}">Lihat Detail</a>
          <a class="button primary" href="${waFromCard(p)}" target="_blank" rel="noopener">Beli</a>
        </div>
      </div>
    </article>
  `).join('');
}

function waFromCard(p){
  const msg = new URLSearchParams({text:`Halo, saya mau pesan *${p.name}* (${formatRupiah(p.price)})`});
  return `https://wa.me/${WA_NUMBER}?${msg.toString()}`;
}

async function renderDetail(){
  const wrap = document.querySelector('#detail-wrap');
  if(!wrap) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const products = await loadProducts();
  const product = products.find(p => String(p.id) === String(id)) || products[0];
  document.querySelector('#title').textContent = product.name + ' – Warung Ikan Segar';
  document.querySelector('#pname').textContent = product.name;
  document.querySelector('#pprice').textContent = formatRupiah(product.price);
  document.querySelector('#pimg').src = product.image;
  document.querySelector('#pdesc').innerHTML = product.description;
  document.querySelector('#pstock').textContent = product.stock > 0 ? `Stok tersedia (sisa ${product.stock})` : 'Stok habis';

  const form = document.querySelector('#order-form');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const variant = form.variant.value.trim();
    const weight = form.weight.value.trim();
    const notes  = form.notes.value.trim();
    window.open(waLink(product, {variant, weight, notes}), '_blank');
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderList();
  renderDetail();
});
