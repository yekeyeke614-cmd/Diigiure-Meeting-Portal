/* ISHAK.exe — logic. Everything editable lives in CONFIG below. No dependencies. */

/* ============ CONFIGURATION — edit text here only ============ */
const CONFIG = {
  recipient: "ISHAK",                     // shown in capitals on the intro and reveal
  classified: "CLASSIFIED PROJECT",
  intro: "An exclusive mission has been prepared for you.",
  initLines: ["INITIALIZING...", "VERIFYING IDENTITY...", "ACCESS GRANTED."],
  tagline: "Today is not just another day. It's your day.",
  message:
    "Happy Birthday, Ishak!\n\n" +
    "Wishing you a year full of happiness, success, and unforgettable moments.\n\n" +
    "Keep shining, keep growing, and never stop chasing your dreams.\n\n" +
    "Enjoy your special day!",
  doneTitle: "MISSION COMPLETED",
  doneSub: "ANOTHER YEAR UNLOCKED.",
  footer: "Made with ❤️ specially for Ishak.",
  typeSpeedMs: 38                         // delay per character in the message
};
/* ============================================================ */

(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let run = 0, stage = 1;

  // Fill configurable text
  document.querySelectorAll("[data-cfg]").forEach((el) => { el.textContent = CONFIG[el.dataset.cfg]; });

  /* ---------- Particles & fireworks ---------- */
  const cv = $("#fx"), cx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, dust = [], sparks = [], fwTimer = 0;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = W < 600 ? 35 : 70;
    dust = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .4, v: Math.random() * .25 + .05, a: Math.random() * .5 + .2, p: Math.random() * 6 }));
  }
  function burst() {
    const x = W * (.15 + Math.random() * .7), y = H * (.12 + Math.random() * .38), n = W < 600 ? 46 : 70;
    const hue = Math.random() < .5 ? "246,226,122" : "212,175,55";
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, s = 1.2 + Math.random() * 2.6;
      sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, d: .008 + Math.random() * .01, c: hue });
    }
  }
  function frame() {
    cx.clearRect(0, 0, W, H);
    cx.globalCompositeOperation = "lighter";
    for (const d of dust) {
      d.y -= d.v; d.p += .02; d.x += Math.sin(d.p) * .2;
      if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W; }
      cx.fillStyle = `rgba(212,175,55,${d.a * (.6 + Math.sin(d.p * 2) * .4)})`;
      cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.283); cx.fill();
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vx *= .985; s.vy = s.vy * .985 + .035; s.life -= s.d;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      cx.fillStyle = `rgba(${s.c},${s.life})`;
      cx.beginPath(); cx.arc(s.x, s.y, 1.7 * s.life + .3, 0, 6.283); cx.fill();
    }
    requestAnimationFrame(frame);
  }
  function startFireworks() {
    clearInterval(fwTimer);
    if (reduce.matches) return;
    burst(); fwTimer = setInterval(burst, 1100);
  }
  function stopFireworks() { clearInterval(fwTimer); }
  addEventListener("resize", resize);
  resize();
  if (reduce.matches) { dust.length = Math.min(dust.length, 20); }
  requestAnimationFrame(frame);

  /* ---------- Stage control ---------- */
  function show(n) {
    stage = n;
    document.querySelectorAll(".stage").forEach((s) => s.classList.toggle("active", s.id === "s" + n));
    const btn = $("#s" + n + " .btn:not(.hidden)");
    if (btn) setTimeout(() => btn.focus({ preventScroll: true }), n === 3 ? 4700 : 600);
    if (n === 3 || n === 4 || n === 5) { if (!fwTimer || n === 3) startFireworks(); }
  }
  const wait = (ms, t) => new Promise((res) => setTimeout(() => res(t === run), reduce.matches ? Math.min(ms, 250) : ms));

  async function initSequence() {
    const t = ++run, log = $("#log"), fill = $("#barfill"), count = $("#count");
    log.innerHTML = ""; fill.style.transition = "none"; fill.style.width = "0";
    count.classList.remove("on"); count.innerHTML = "";
    show(2);
    for (let i = 0; i < CONFIG.initLines.length; i++) {
      if (!(await wait(i ? 1000 : 500, t))) return;
      const p = document.createElement("p");
      p.textContent = CONFIG.initLines[i];
      if (i === CONFIG.initLines.length - 1) p.className = "ok";
      log.appendChild(p);
      fill.style.transition = "width 1s linear";
      fill.style.width = ((i + 1) / CONFIG.initLines.length * 100) + "%";
    }
    if (!(await wait(1100, t))) return;
    count.classList.add("on");
    for (const n of ["3", "2", "1"]) {
      count.innerHTML = "<span>" + n + "</span>";
      if (!(await wait(1000, t))) return;
    }
    count.classList.remove("on");
    show(3);
  }

  async function typeMessage() {
    const t = ++run, el = $("#msg"), next = $("#next");
    el.textContent = ""; next.classList.add("hidden");
    show(4);
    el.classList.add("typing");
    if (!(await wait(900, t))) return;
    if (reduce.matches) { el.textContent = CONFIG.message; }
    else {
      for (let i = 1; i <= CONFIG.message.length; i++) {
        el.textContent = CONFIG.message.slice(0, i);
        const ch = CONFIG.message[i - 1];
        if (!(await wait(/[.,!]/.test(ch) ? CONFIG.typeSpeedMs * 8 : ch === "\n" ? CONFIG.typeSpeedMs * 4 : CONFIG.typeSpeedMs, t))) return;
      }
    }
    el.classList.remove("typing");
    next.classList.remove("hidden"); next.focus({ preventScroll: true });
  }

  function replay() {
    run++; sparks.length = 0; stopFireworks();
    $("#msg").textContent = ""; $("#msg").classList.remove("typing");
    show(1);
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) { const n = +b.dataset.go; if (n === 2) initSequence(); else if (n === 4) typeMessage(); else { run++; show(n); } }
  });
  $("#replay").addEventListener("click", replay);

  /* ---------- Optional music (generated live with Web Audio; no files, no autoplay) ---------- */
  const sndBtn = $("#sound");
  let ac = null, master = null, loop = 0, step = 0;
  const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 392, 440, 523.25, 440, 349.23];
  function tone(f, t0, dur, vol, type) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + .04);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + .05);
  }
  function tick() {
    const t = ac.currentTime + .05, f = notes[step % notes.length];
    tone(f, t, 1.6, .16, "triangle");
    if (step % 4 === 0) { tone(f / 4, t, 3.2, .12, "sine"); tone(f / 2, t, 3.2, .05, "sine"); }
    step++;
  }
  function setSound(on) {
    try {
      if (on) {
        if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.connect(ac.destination); }
        if (ac.state === "suspended") ac.resume();
        master.gain.value = .6; clearInterval(loop); tick(); loop = setInterval(tick, 700);
      } else {
        clearInterval(loop); if (master) master.gain.value = 0;
      }
    } catch (err) { on = false; }
    sndBtn.setAttribute("aria-pressed", String(on));
    sndBtn.setAttribute("aria-label", on ? "Turn music off" : "Turn music on");
  }
  sndBtn.addEventListener("click", () => setSound(sndBtn.getAttribute("aria-pressed") !== "true"));
  document.addEventListener("visibilitychange", () => { if (document.hidden && ac) ac.suspend(); else if (ac && sndBtn.getAttribute("aria-pressed") === "true") ac.resume(); });

  show(1);
})();
