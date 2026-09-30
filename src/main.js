(function () {
  var WA = window.TD.wa;
  var d = document;
  d.documentElement.classList.add("js");

  // ---- menü
  var ust = d.getElementById("ust"), dugme = d.getElementById("menuDugme");
  if (dugme) dugme.addEventListener("click", function () {
    var acik = ust.classList.toggle("menu-acik");
    dugme.setAttribute("aria-expanded", acik);
    dugme.setAttribute("aria-label", acik ? "Menüyü kapat" : "Menüyü aç");
  });

  // ---- ana sayfada fotoğrafın üstündeki menü, kaydırınca koyulaşır
  if (d.body.classList.contains("ana") && ust) {
    var kaydir = function () { ust.classList.toggle("dolu", window.scrollY > 40); };
    window.addEventListener("scroll", kaydir, { passive: true });
    kaydir();
  }

  // ---- görünme animasyonu (+ teknik çizimin çizilmesi)
  var gozlenecek = d.querySelectorAll(".kart, .foto-kart, .surec li, .neden-liste li, .tur, .sirali li, .takvim li, .vitrin-kart, .neden-foto");
  var tanitlar = d.querySelectorAll(".tanit");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) {
        if (g.isIntersecting) { g.target.classList.add("gorundu"); io.unobserve(g.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    gozlenecek.forEach(function (el) { el.classList.add("gozle"); io.observe(el); });
    tanitlar.forEach(function (el) { io.observe(el); });
  } else tanitlar.forEach(function (el) { el.classList.add("gorundu"); });

  // ---- makineyi tanıyın: çizimdeki noktalar ve sekmeler aynı parçayı açar
  tanitlar.forEach(function (t) {
    function sec(i) {
      t.querySelectorAll(".parca").forEach(function (p, j) { if (j === i) p.removeAttribute("data-gizli"); else p.setAttribute("data-gizli", ""); });
      t.querySelectorAll(".ps").forEach(function (b) { b.setAttribute("aria-selected", +b.dataset.parca === i ? "true" : "false"); });
      t.querySelectorAll(".nokta-d").forEach(function (b) { b.setAttribute("aria-current", +b.dataset.parca === i ? "true" : "false"); });
    }
    t.addEventListener("click", function (e) {
      var b = e.target.closest("[data-parca]"); if (!b) return;
      sec(+b.dataset.parca);
      if (b.classList.contains("nokta-d") && window.innerWidth < 960) t.querySelector(".tanit-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    sec(0);
  });

  // ---- talep formu: al / sat → WhatsApp mesajı hazırlar, hiçbir yere kaydetmez
  var form = d.getElementById("talep");
  if (!form) return;
  var mod = "al";
  function modSec(m) {
    mod = m;
    form.querySelectorAll(".mod-dugme").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.mod === m ? "true" : "false"); });
    form.querySelectorAll("[data-al]").forEach(function (el) { el.hidden = m !== "al"; });
    form.querySelectorAll("[data-sat]").forEach(function (el) { el.hidden = m !== "sat"; });
    ozetle();
  }
  form.querySelector(".mod").addEventListener("click", function (e) {
    var b = e.target.closest(".mod-dugme"); if (b) modSec(b.dataset.mod);
  });

  var ozet = d.getElementById("tOzet");
  function deger(ad) { var el = form.elements[ad]; return el ? String(el.value || "").trim() : ""; }
  function ozetle() {
    var parca = [deger("tur"), deger("marka"), deger("yil") && (mod === "al" ? deger("yil") + " ve sonrası" : deger("yil")), deger("cekis") !== "Fark etmez" && deger("cekis")].filter(Boolean);
    ozet.innerHTML = "<b>" + (mod === "al" ? "Aranan" : "Satılık") + ":</b> " + parca.map(function (s) { return s.replace(/</g, "&lt;"); }).join(" · ");
  }
  form.addEventListener("input", ozetle);
  form.addEventListener("change", ozetle);

  // ?mod=sat ve ?tur=... ile ön seçim
  var q = new URLSearchParams(location.search);
  if (q.get("tur")) form.querySelectorAll("input[name=tur]").forEach(function (k) { if (k.value === q.get("tur")) k.checked = true; });
  modSec(q.get("mod") === "sat" ? "sat" : "al");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var s = [];
    if (mod === "al") {
      s.push("Merhaba, aşağıdaki makineyi arıyorum.");
      s.push("Aranan: " + deger("tur"));
      if (deger("marka")) s.push("Marka / model: " + deger("marka"));
      if (deger("yil")) s.push("Model yılı: " + deger("yil") + " ve sonrası");
      if (deger("guc") !== "Fark etmez") s.push("Güç: " + deger("guc"));
      if (deger("cekis") !== "Fark etmez") s.push("Çekiş: " + deger("cekis"));
      if (deger("butce")) s.push("Bütçe: " + deger("butce"));
    } else {
      s.push("Merhaba, makinemi satmak istiyorum.");
      s.push("Makine: " + deger("tur"));
      if (deger("marka")) s.push("Marka / model: " + deger("marka"));
      if (deger("yil")) s.push("Model yılı: " + deger("yil"));
      if (deger("saat")) s.push("Çalışma saati: " + deger("saat"));
      if (deger("cekis") !== "Fark etmez") s.push("Çekiş: " + deger("cekis"));
      if (deger("butce")) s.push("Beklenen fiyat: " + deger("butce"));
    }
    if (deger("ad")) s.push("Ad: " + deger("ad"));
    if (deger("yer")) s.push("Yer: " + deger("yer"));
    if (deger("not")) s.push("Not: " + deger("not"));
    if (mod === "sat") s.push("(Fotoğrafları bu mesajın ardından gönderiyorum.)");
    if (window.gtag) window.gtag("event", mod === "al" ? "talep_al" : "talep_sat");
    location.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(s.join("\n"));
  });
})();

// ---- dönüşüm ölçümü (GA4 eklendiğinde çalışır)
document.addEventListener("click", function (e) {
  var a = e.target.closest("[data-track]");
  if (a && window.gtag) window.gtag("event", a.dataset.track + "_tiklama");
});
