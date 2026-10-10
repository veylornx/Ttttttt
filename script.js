/* ================================================================
   BIRTHDAY WEBSITE — script.js
   Pure vanilla JS — no frameworks
   ================================================================ */
(function () {
  "use strict";

  /* ---------- STATE ---------- */
  var cur = 0,
    total = 5,
    busy = false,
    twDone = false,
    fwOn = false,
    musicOn = false;

  /* ---------- REFS ---------- */
  var secs = document.querySelectorAll(".sec");
  var dots = document.querySelectorAll(".nd");
  var pre = document.getElementById("preloader");
  var preFill = document.getElementById("preFill");
  var prePct = document.getElementById("prePct");
  var audio = document.getElementById("bgMusic");
  var mBtn = document.getElementById("musicToggle");
  var pCvs = document.getElementById("particlesBg");
  var cCvs = document.getElementById("confettiCvs");
  var fwCvs = document.getElementById("fwCvs");

  /* ================================================================
     PRELOADER
     ================================================================ */
  var preVal = 0;
  var preTimer = setInterval(function () {
    preVal += Math.random() * 4 + 1;
    if (preVal >= 100) {
      preVal = 100;
      clearInterval(preTimer);
      setTimeout(function () {
        pre.classList.add("done");
      }, 400);
    }
    preFill.style.width = preVal + "%";
    prePct.textContent = Math.floor(preVal) + "%";
  }, 60);

  /* ================================================================
     MUSIC
     ================================================================ */
  audio.volume = 0.4;

  function tryPlay() {
    audio.play().then(function () {
      musicOn = true;
      mBtn.querySelector(".mt-off").style.display = "none";
      mBtn.querySelector(".mt-on").style.display = "flex";
    }).catch(function () {});
  }

  mBtn.addEventListener("click", function () {
    if (musicOn) {
      audio.pause();
      musicOn = false;
      mBtn.querySelector(".mt-off").style.display = "flex";
      mBtn.querySelector(".mt-on").style.display = "none";
    } else {
      audio.play().then(function () {
        musicOn = true;
        mBtn.querySelector(".mt-off").style.display = "none";
        mBtn.querySelector(".mt-on").style.display = "flex";
      }).catch(function () {});
    }
  });

  /* ================================================================
     PARTICLES
     ================================================================ */
  var pc = pCvs.getContext("2d");
  var pts = [];

  function szP() {
    pCvs.width = window.innerWidth;
    pCvs.height = window.innerHeight;
  }
  szP();
  window.addEventListener("resize", szP);

  var pCount = window.innerWidth < 768 ? 45 : 100;
  for (var i = 0; i < pCount; i++) {
    pts.push({
      x: Math.random() * pCvs.width,
      y: Math.random() * pCvs.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.4 + 0.08,
      h: Math.random() * 60 + 270,
    });
  }

  function drawP() {
    pc.clearRect(0, 0, pCvs.width, pCvs.height);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = pCvs.width;
      if (p.x > pCvs.width) p.x = 0;
      if (p.y < 0) p.y = pCvs.height;
      if (p.y > pCvs.height) p.y = 0;
      pc.beginPath();
      pc.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pc.fillStyle = "hsla(" + p.h + ",80%,70%," + p.o + ")";
      pc.fill();
      // lines
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j];
        var dx = p.x - q.x,
          dy = p.y - q.y;
        var d = dx * dx + dy * dy;
        if (d < 14400) {
          pc.beginPath();
          pc.moveTo(p.x, p.y);
          pc.lineTo(q.x, q.y);
          pc.strokeStyle =
            "rgba(255,110,199," + (1 - Math.sqrt(d) / 120) * 0.12 + ")";
          pc.lineWidth = 0.5;
          pc.stroke();
        }
      }
    }
    requestAnimationFrame(drawP);
  }
  drawP();

  /* ================================================================
     PAGE NAVIGATION
     ================================================================ */
  function go(idx) {
    if (busy || idx === cur || idx < 0 || idx >= total) return;
    busy = true;
    secs[cur].classList.remove("active");
    dots[cur].classList.remove("active");
    cur = idx;
    secs[cur].classList.add("active");
    dots[cur].classList.add("active");

    // page-specific triggers
    if (cur === 1 && !musicOn) tryPlay();
    if (cur === 2 && !twDone) {
      setTimeout(startTW, 600);
      twDone = true;
    }
    if (cur === 3) setTimeout(launchConfetti, 400);
    if (cur === 4 && !fwOn) {
      setTimeout(startFW, 400);
      fwOn = true;
    }

    setTimeout(function () {
      busy = false;
    }, 800);
  }

  // dots
  dots.forEach(function (d) {
    d.addEventListener("click", function () {
      go(parseInt(this.getAttribute("data-index")));
    });
  });

  // start button
  document.getElementById("btnStart").addEventListener("click", function () {
    go(1);
  });

  // next buttons
  document.querySelectorAll("[data-goto]").forEach(function (b) {
    b.addEventListener("click", function () {
      go(parseInt(this.getAttribute("data-goto")));
    });
  });

  // replay
  document.getElementById("btnReplay").addEventListener("click", function () {
    twDone = false;
    fwOn = false;
    document.getElementById("twText").innerHTML = "";
    document.getElementById("msgSign").classList.remove("show");
    go(0);
  });

  // scroll
  var sThrot = false;
  document.addEventListener("wheel", function (e) {
    if (sThrot) return;
    sThrot = true;
    setTimeout(function () {
      sThrot = false;
    }, 1100);
    go(cur + (e.deltaY > 0 ? 1 : -1));
  });

  // touch
  var tsy = 0;
  document.addEventListener("touchstart", function (e) {
    tsy = e.changedTouches[0].screenY;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    var d = tsy - e.changedTouches[0].screenY;
    if (Math.abs(d) > 55) go(cur + (d > 0 ? 1 : -1));
  }, { passive: true });

  // keyboard
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") go(cur + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(cur - 1);
    else if (e.key === "m" || e.key === "M") mBtn.click();
  });

  /* ================================================================
     TYPEWRITER
     ================================================================ */
  var twMsg =
    "My Dearest Mira,\n\n" +
    "There are friends we meet by chance, and then there are souls we recognize from another lifetime. " +
    "You are my harbor in storms, my loudest cheerleader, and the one who knows my silence. " +
    "Today, on your birthday, I don\u2019t just celebrate another year \u2014 I celebrate the miracle of your existence. " +
    "Your kindness has painted my world with hope. Every memory with you is a treasure chest of laughter, " +
    "late-night epiphanies, and unshakable loyalty.\n\n" +
    "May the universe wrap you in its warmest light. May your dreams dance like fireflies, " +
    "and your heart never know loneliness. You deserve galaxies of happiness. " +
    "And remember, no matter where life drifts us, you\u2019ll always have a home in my heart.";

  function startTW() {
    var el = document.getElementById("twText");
    var ci = 0;
    function t() {
      if (ci >= twMsg.length) {
        document.getElementById("msgSign").classList.add("show");
        return;
      }
      var ch = twMsg[ci];
      if (ch === "\n") el.innerHTML += "<br>";
      else el.innerHTML += ch;
      ci++;
      var sp = 22;
      if (ch === "." || ch === "!" || ch === "?") sp = 180;
      else if (ch === ",") sp = 90;
      else if (ch === "\n") sp = 120;
      else sp = 18 + Math.random() * 18;
      setTimeout(t, sp);
    }
    t();
  }

  /* ================================================================
     CONFETTI
     ================================================================ */
  var cc = cCvs.getContext("2d");
  var cPcs = [];
  var cAnim = false;

  function szC() {
    cCvs.width = window.innerWidth;
    cCvs.height = window.innerHeight;
  }
  szC();
  window.addEventListener("resize", szC);

  var cColors = [
    "#ff6ec7","#7b68ee","#00d4ff","#ffd700",
    "#ff4444","#44ff44","#ff8800","#ff44ff",
    "#44ddff","#ffdd44",
  ];

  function CPiece() {
    this.x = Math.random() * cCvs.width;
    this.y = -15;
    this.s = Math.random() * 7 + 3;
    this.vy = Math.random() * 3 + 1.5;
    this.vx = (Math.random() - 0.5) * 3.5;
    this.rot = Math.random() * 360;
    this.rs = (Math.random() - 0.5) * 8;
    this.c = cColors[Math.floor(Math.random() * cColors.length)];
    this.sh = Math.random() > 0.5;
    this.o = 1;
  }

  function launchConfetti() {
    cPcs = [];
    for (var i = 0; i < 180; i++) cPcs.push(new CPiece());
    if (!cAnim) {
      cAnim = true;
      animC();
    }
  }

  function animC() {
    cc.clearRect(0, 0, cCvs.width, cCvs.height);
    cPcs = cPcs.filter(function (p) {
      return p.y < cCvs.height + 30 && p.o > 0;
    });
    for (var i = 0; i < cPcs.length; i++) {
      var p = cPcs[i];
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.rs;
      p.vy += 0.04;
      p.vx *= 0.99;
      p.o -= 0.002;
      cc.save();
      cc.translate(p.x, p.y);
      cc.rotate((p.rot * Math.PI) / 180);
      cc.globalAlpha = Math.max(0, p.o);
      cc.fillStyle = p.c;
      if (p.sh) cc.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      else {
        cc.beginPath();
        cc.arc(0, 0, p.s / 2, 0, Math.PI * 2);
        cc.fill();
      }
      cc.restore();
    }
    if (cPcs.length > 0) requestAnimationFrame(animC);
    else cAnim = false;
  }

  /* ================================================================
     FIREWORKS
     ================================================================ */
  var fc = fwCvs.getContext("2d");
  var fws = [],
    fps = [];

  function szF() {
    fwCvs.width = window.innerWidth;
    fwCvs.height = window.innerHeight;
  }
  szF();
  window.addEventListener("resize", szF);

  function FW(sx, sy, tx, ty) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.dist = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
    this.trav = 0;
    var a = Math.atan2(ty - sy, tx - sx);
    this.vx = Math.cos(a) * 3;
    this.vy = Math.sin(a) * 3;
    this.h = Math.random() * 360;
    this.trail = [];
    this.alive = true;
  }

  function FP(x, y, h) {
    this.x = x;
    this.y = y;
    var a = Math.random() * Math.PI * 2;
    var sp = Math.random() * 5 + 1;
    this.vx = Math.cos(a) * sp;
    this.vy = Math.sin(a) * sp;
    this.h = h + Math.random() * 30 - 15;
    this.a = 1;
    this.d = Math.random() * 0.018 + 0.005;
    this.r = Math.random() * 2.5 + 0.8;
  }

  function boom(x, y, h) {
    var n = 55 + Math.floor(Math.random() * 25);
    for (var i = 0; i < n; i++) fps.push(new FP(x, y, h));
  }

  function launchFW() {
    var sx = fwCvs.width / 2 + (Math.random() - 0.5) * fwCvs.width * 0.6;
    var tx =
      Math.random() * fwCvs.width * 0.7 + fwCvs.width * 0.15;
    var ty = Math.random() * fwCvs.height * 0.35 + 40;
    fws.push(new FW(sx, fwCvs.height, tx, ty));
  }

  var fwInt;
  function startFW() {
    launchFW();
    fwInt = setInterval(function () {
      if (cur === 4) {
        launchFW();
        if (Math.random() > 0.5) launchFW();
      }
    }, 900);
    animFW();
  }

  function animFW() {
    fc.fillStyle = "rgba(7,7,26,.18)";
    fc.fillRect(0, 0, fwCvs.width, fwCvs.height);

    fws = fws.filter(function (f) { return f.alive; });
    fps = fps.filter(function (p) { return p.a > 0.01; });

    for (var i = 0; i < fws.length; i++) {
      var f = fws[i];
      f.trail.push({ x: f.x, y: f.y });
      if (f.trail.length > 5) f.trail.shift();
      f.x += f.vx;
      f.y += f.vy;
      f.trav = Math.sqrt(
        Math.pow(f.x - f.sx, 2) + Math.pow(f.y - f.sy, 2)
      );
      if (f.trav >= f.dist * 0.88) {
        f.alive = false;
        boom(f.x, f.y, f.h);
      }
      if (f.trail.length > 1) {
        fc.beginPath();
        fc.moveTo(f.trail[0].x, f.trail[0].y);
        for (var j = 1; j < f.trail.length; j++)
          fc.lineTo(f.trail[j].x, f.trail[j].y);
        fc.strokeStyle = "hsla(" + f.h + ",100%,65%,.7)";
        fc.lineWidth = 2;
        fc.stroke();
      }
    }

    for (var k = 0; k < fps.length; k++) {
      var p = fps[k];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.035;
      p.vx *= 0.99;
      p.a -= p.d;
      fc.beginPath();
      fc.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fc.fillStyle =
        "hsla(" + p.h + ",100%,65%," + Math.max(0, p.a) + ")";
      fc.fill();
    }
    requestAnimationFrame(animFW);
  }
})();
