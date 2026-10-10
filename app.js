// 主页交互逻辑
const ATTESTATIONS = window.__ATTESTATIONS || [];
const META = window.__META || {};

// 排序后分配区块号
const sorted = [...ATTESTATIONS].sort((a,b)=>a.ts-b.ts);
sorted.forEach((a,i)=>{ a.block = 31 + Math.floor(i/4); });

document.getElementById('totalCount').textContent = ATTESTATIONS.length;
document.getElementById('statCount').textContent = ATTESTATIONS.length;
document.getElementById('statSuccess').textContent = ATTESTATIONS.length;
const uniqueAddr = new Set(ATTESTATIONS.map(a=>a.addr)).size;
document.getElementById('statAddr').textContent = uniqueAddr;

let total = 0;
ATTESTATIONS.forEach(a => total += parseFloat(a.amount) || 0);
document.getElementById('statTotal').textContent = total.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

function shortHash(h, head, tail) {
  head = head || 12; tail = tail || 8;
  if (!h) return '';
  if (h.length <= head+tail+3) return h;
  return h.slice(0,head) + '...' + h.slice(-tail);
}

function fmtTime(ts) {
  const d = new Date(ts);
  const pad = function(n){ return String(n).padStart(2,'0'); };
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
  });
}

function renderTable(list) {
  const tbody = document.getElementById('txTableBody');
  const empty = document.getElementById('emptyMsg');
  if (!list.length) { tbody.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  tbody.innerHTML = list.map(function(a){
    const m = JSON.parse(a.memo);
    return '<tr onclick="location.href=\'tx/'+a.txid+'.html\'" style="cursor:pointer;">'
      + '<td>'+escapeHtml(m.r)+'</td>'
      + '<td>'+escapeHtml(m.t)+'</td>'
      + '<td class="mono">'+shortHash(a.txid, 14, 10)+'</td>'
      + '<td class="amount">'+escapeHtml(a.amount)+' USDT</td>'
      + '<td><span class="token-badge">USDT</span></td>'
      + '<td>#'+(a.block||31)+'</td>'
      + '<td>'+fmtTime(a.ts)+'</td>'
      + '<td><span class="status-badge">成功</span></td>'
      + '</tr>';
  }).join('');
}

renderTable(sorted);

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function(){
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { renderTable(sorted); return; }
  const filtered = sorted.filter(function(a){
    const m = JSON.parse(a.memo);
    return (m.t||'').toLowerCase().indexOf(q)>=0 ||
           (m.r||'').toLowerCase().indexOf(q)>=0 ||
           (a.txid||'').toLowerCase().indexOf(q)>=0 ||
           (a.addr||'').toLowerCase().indexOf(q)>=0;
  });
  renderTable(filtered);
});

// URL 参数查询
const params = new URLSearchParams(location.search);
const addrParam = params.get('addr');
if (addrParam) {
  searchInput.value = addrParam;
  searchInput.dispatchEvent(new Event('input'));
}
