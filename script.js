
/* ==========================================
   TASHFIN MIRA — BIRTHDAY SURPRISE
   Complete script.js with working navigation
   ========================================== */

(() => {
  "use strict";

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  const random = (min, max) =>
    Math.random() * (max - min) + min;

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ==========================================
     PRELOADER
     ========================================== */

  const preloader = $("#preloader");
  const preFill = $("#preFill");
  const prePct = $("#prePct");

  let loaderClosed = false;

  function updateLoader(percent) {
    const value = clamp(Math.round(percent), 0, 100);

    if (preFill) preFill.style.width = `${value}%`;
    if (prePct) prePct.textContent = `${value}%`;
  }

  function hideLoader() {
    if (loaderClosed) return;
    loaderClosed = true;

    updateLoader(100);

    if (preloader) {
      preloader.classList.add("loaded");
      preloader.setAttribute("aria-hidden", "true");
    }
  }

  let loaderProgress = 0;

  const loaderInterval = window.setInterval(() => {
    if (loaderClosed) {
      clearInterval(loaderInterval);
      return;
    }

    loaderProgress = Math.min(loaderProgress + random(4, 12), 90);
    updateLoader(loaderProgress);
  }, 100);

  window.addEventListener("load", () => {
    clearInterval(loaderInterval);
    updateLoader(100);
    setTimeout(hideLoader, 250);
  }, { once: true });

  setTimeout(hideLoader, 6000);


  /* ==========================================
     SECTION NAVIGATION
     ========================================== */

  const pageIds = [
    "secHero",
    "secMemories",
    "secMessage",
    "secFun",
    "secFinale"
  ];

  const pages = pageIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navDots = $$(".nd");

  let currentPage = 0;

  function callIfAvailable(functionName) {
    if (typeof window[functionName] === "function") {
      window[functionName]();
    }
  }

  function stopIfAvailable(functionName) {
    if (typeof window[functionName] === "function") {
      window[functionName]();
    }
  }

  function goToPage(index) {
    if (!pages.length) {
      console.warn("No birthday sections found. Check section IDs.");
      return;
    }

    const parsedIndex = Number(index);

    if (!Number.isFinite(parsedIndex)) return;

    const nextPage = clamp(
      Math.trunc(parsedIndex),
      0,
      pages.length - 1
    );

    currentPage = nextPage;

    pages.forEach((page, i) => {
      const active = i === nextPage;

      page.classList.toggle("active", active);
      page.classList.toggle("is-active", active);
      page.setAttribute("aria-hidden", active ? "false" : "true");

      if (active) {
        page.removeAttribute("inert");
      } else {
        page.setAttribute("inert", "");
      }
    });

    navDots.forEach((dot, i) => {
      const dotIndex = Number(dot.dataset.index ?? i);
      const active = dotIndex === nextPage;

      dot.classList.toggle("active", active);

      if (active) {
        dot.setAttribute("aria-current", "step");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    // Stop animations that belong to other pages.
    if (nextPage !== 3) stopConfetti();
    if (nextPage !== 4) stopFireworks();

    // Start animations for the current page.
    if (nextPage === 2) startTypewriter();
    if (nextPage === 3) startConfetti();
    if (nextPage === 4) startFireworks();

    // Keep the selected section visible.
    pages[nextPage].scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function nextPage() {
    if (currentPage < pages.length - 1) {
      goToPage(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }

  // Expose navigation for optional HTML onclick handlers.
  window.goToPage = goToPage;
  window.nextBirthdayPage = nextPage;
  window.previousBirthdayPage = previousPage;

  // Start button.
  $("#btnStart")?.addEventListener("click", nextPage);

  // Navigation dots.
  navDots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goToPage(Number(dot.dataset.index ?? i));
    });
  });

  // Any element with data-goto="0", "1", "2", "3", or "4".
  $$("[data-goto]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      goToPage(element.dataset.goto);
    });
  });

  // Generic Next and Previous buttons.
  $$("[data-next]").forEach((button) => {
    button.addEventListener("click", nextPage);
  });

  $$("[data-prev]").forEach((button) => {
    button.addEventListener("click", previousPage);
  });

  // Keyboard navigation.
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;

    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(tag) ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    if (event.key === "ArrowRight") nextPage();
    if (event.key === "ArrowLeft") previousPage();
  });


  /* ==========================================
     BACKGROUND MUSIC
     ========================================== */

  const music = $("#bgMusic");
  const musicToggle = $("#musicToggle");

  function updateMusicButton() {
    if (!musicToggle || !music) return;

    const playing = !music.paused;

    musicToggle.classList.toggle("mt-on", playing);
    musicToggle.classList.toggle("mt-off", !playing);

    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute(
      "aria-label",
      playing ? "Pause music" : "Play music"
    );
  }

  async function toggleMusic() {
    if (!music) {
      console.warn("Add an audio element with id='bgMusic' in index.html.");
      return;
    }

    if (!music.paused) {
      music.pause();
      return;
    }

    try {
      await music.play();
    } catch (error) {
      console.warn("Music could not play. Check the audio URL.", error);
    }
  }

  if (music) {
    music.loop = true;
    music.volume = 0.45;

    music.addEventListener("play", updateMusicButton);
    music.addEventListener("pause", updateMusicButton);
    music.addEventListener("ended", updateMusicButton);
    music.addEventListener("error", updateMusicButton);
  }

  musicToggle?.addEventListener("click", toggleMusic);
  updateMusicButton();


  /* ==========================================
     CANVAS HELPERS
     ========================================== */

  function setupCanvas(canvas) {
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();

      width = Math.max(1, rect.width || window.innerWidth);
      height = Math.max(1, rect.height || window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    return {
      canvas,
      ctx,
      get width() { return width; },
      get height() { return height; },
      resize
    };
  }

  const particleCanvas = setupCanvas($("#particlesBg"));
  const confettiCanvas = setupCanvas($("#confettiCvs"));
  const fireworksCanvas = setupCanvas($("#fwCvs"));

  window.addEventListener("resize", () => {
    particleCanvas?.resize();
    confettiCanvas?.resize();
    fireworksCanvas?.resize();
  });


  /* ==========================================
     FLOATING PARTICLES
     ========================================== */

  let particles = [];
  let particleFrame = 0;

  function createParticle() {
    return {
      x: random(0, particleCanvas.width),
      y: random(0, particleCanvas.height),
      radius: random(0.8, 2.5),
      speedX: random(-0.2, 0.2),
      speedY: random(-0.4, -0.08),
      alpha: random(0.25, 0.8),
      phase: random(0, Math.PI * 2)
    };
  }

  function initializeParticles() {
    if (!particleCanvas) return;

    const count = reducedMotion
      ? 15
      : Math.round(clamp(
          particleCanvas.width * particleCanvas.height / 18000,
          25,
          90
        ));

    particles = Array.from({ length: count }, createParticle);
  }

  function animateParticles() {
    if (!particleCanvas) return;

    const { ctx, width, height } = particleCanvas;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.phase += 0.015;

      if (particle.y < -5) {
        particle.y = height + 5;
        particle.x = random(0, width);
      }

      if (particle.x < -5) particle.x = width + 5;
      if (particle.x > width + 5) particle.x = -5;

      const alpha = particle.alpha *
        (0.7 + 0.3 * Math.sin(particle.phase));

      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = `rgba(255, 190, 225, ${alpha})`;
      ctx.fill();
    });

    if (!reducedMotion) {
      particleFrame = requestAnimationFrame(animateParticles);
    }
  }

  if (particleCanvas) {
    initializeParticles();
    animateParticles();
  }


  /* ==========================================
     TYPEWRITER MESSAGE
     ========================================== */

  const typewriter = $("#twText");
  const messageSign = $("#msgSign");

  const messageText = typewriter
    ? (
        typewriter.dataset.message ||
        typewriter.textContent.trim() ||
        "Happy Birthday, Mira! 🎂💖 Tui shobshomoy happy thakish. Tor shob shopno puron hok, ar tor life bhore uthuk hasi, bhalobasha ar beautiful memories diye. ✨"
      )
    : "";

  let typewriterTimer = null;
  let typewriterToken = 0;

  function startTypewriter() {
    if (!typewriter) return;
    if (typewriter.dataset.typed === "true") return;

    clearTimeout(typewriterTimer);

    const token = ++typewriterToken;
    let position = 0;

    typewriter.dataset.typed = "typing";
    typewriter.textContent = "";

    if (messageSign) {
      messageSign.classList.remove("show");
      messageSign.style.opacity = "0";
    }

    if (reducedMotion) {
      typewriter.textContent = messageText;
      typewriter.dataset.typed = "true";

      if (messageSign) {
        messageSign.classList.add("show");
        messageSign.style.opacity = "1";
      }

      return;
    }

    function typeCharacter() {
      if (token !== typewriterToken) return;

      if (position >= messageText.length) {
        typewriter.dataset.typed = "true";

        if (messageSign) {
          messageSign.classList.add("show");
          messageSign.style.opacity = "1";
        }

        return;
      }

      const character = messageText[position++];
      typewriter.textContent += character;

      const delay = ".!?".includes(character)
        ? 300
        : character === ","
          ? 160
          : random(25, 50);

      typewriterTimer = setTimeout(typeCharacter, delay);
    }

    typeCharacter();
  }


  /* ==========================================
     CONFETTI
     ========================================== */

  let confettiPieces = [];
  let confettiFrame = 0;
  let confettiRunning = false;

  function createConfettiPiece() {
    const colors = [
      "#ff6fae",
      "#ffd166",
      "#bd9aff",
      "#8be9fd",
      "#ff8fab",
      "#ffffff"
    ];

    return {
      x: random(0, confettiCanvas.width),
      y: random(-confettiCanvas.height, 0),
      w: random(4, 9),
      h: random(7, 14),
      vx: random(-1.2, 1.2),
      vy: random(1.2, 3.2),
      angle: random(0, Math.PI * 2),
      spin: random(-0.08, 0.08),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  function startConfetti() {
    if (!confettiCanvas || confettiRunning || reducedMotion) return;

    confettiRunning = true;

    const count = Math.round(clamp(
      confettiCanvas.width * confettiCanvas.height / 8000,
      50,
      150
    ));

    confettiPieces = Array.from(
      { length: count },
      createConfettiPiece
    );

    confettiFrame = requestAnimationFrame(animateConfetti);
  }

  function animateConfetti() {
    if (!confettiCanvas || !confettiRunning) return;

    const { ctx, width, height } = confettiCanvas;
    ctx.clearRect(0, 0, width, height);

    confettiPieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.angle += piece.spin;

      if (piece.y > height + 20) {
        piece.y = random(-50, -10);
        piece.x = random(0, width);
      }

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.angle);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();
    });

    confettiFrame = requestAnimationFrame(animateConfetti);
  }

  function stopConfetti() {
    confettiRunning = false;
    cancelAnimationFrame(confettiFrame);
    confettiFrame = 0;

    if (confettiCanvas) {
      confettiCanvas.ctx.clearRect(
        0, 0, confettiCanvas.width, confettiCanvas.height
      );
    }
  }


  /* ==========================================
     FIREWORKS
     ========================================== */

  let rockets = [];
  let sparks = [];
  let fireworksFrame = 0;
  let fireworksRunning = false;
  let lastLaunch = 0;

  function launchRocket() {
    if (!fireworksCanvas) return;

    rockets.push({
      x: random(fireworksCanvas.width * 0.15, fireworksCanvas.width * 0.85),
      y: fireworksCanvas.height,
      targetX: random(fireworksCanvas.width * 0.2, fireworksCanvas.width * 0.8),
      targetY: random(fireworksCanvas.height * 0.15, fireworksCanvas.height * 0.55),
      speed: random(3.5, 5.5),
      color: ["#ff75b5", "#ffd166", "#bd9aff", "#8be9fd"][
        Math.floor(Math.random() * 4)
      ]
    });
  }

  function explodeRocket(rocket) {
    for (let i = 0; i < 42; i++) {
      const angle = Math.PI * 2 * i / 42;
      const speed = random(1, 4);

      sparks.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.04,
        life: 1,
        decay: random(0.014, 0.025),
        color: rocket.color,
        radius: random(1, 2.5)
      });
    }
  }

  function startFireworks() {
    if (!fireworksCanvas || fireworksRunning || reducedMotion) return;

    fireworksRunning = true;
    lastLaunch = 0;
    launchRocket();

    fireworksFrame = requestAnimationFrame(animateFireworks);
  }

  function animateFireworks(timestamp) {
    if (!fireworksCanvas || !fireworksRunning) return;

    const { ctx, width, height } = fireworksCanvas;
    ctx.clearRect(0, 0, width, height);

    if (!lastLaunch || timestamp - lastLaunch > 800) {
      launchRocket();
      lastLaunch = timestamp;
    }

    rockets = rockets.filter((rocket) => {
      const dx = rocket.targetX - rocket.x;
      const dy = rocket.targetY - rocket.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= rocket.speed) {
        explodeRocket(rocket);
        return false;
      }

      rocket.x += dx / distance * rocket.speed;
      rocket.y += dy / distance * rocket.speed;

      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = rocket.color;
      ctx.fill();

      return true;
    });

    sparks = sparks.filter((spark) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += spark.gravity;
      spark.vx *= 0.99;
      spark.life -= spark.decay;

      if (spark.life <= 0) return false;

      ctx.globalAlpha = spark.life;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
      ctx.fillStyle = spark.color;
      ctx.fill();

      return true;
    });

    ctx.globalAlpha = 1;
    fireworksFrame = requestAnimationFrame(animateFireworks);
  }

  function stopFireworks() {
    fireworksRunning = false;
    cancelAnimationFrame(fireworksFrame);
    fireworksFrame = 0;

    rockets = [];
    sparks = [];

    if (fireworksCanvas) {
      fireworksCanvas.ctx.clearRect(
        0, 0, fireworksCanvas.width, fireworksCanvas.height
      );
    }
  }


  /* ==========================================
     REPLAY BUTTON
     ========================================== */

  $("#btnReplay")?.addEventListener("click", () => {
    stopConfetti();
    stopFireworks();

    clearTimeout(typewriterTimer);
    typewriterTimer = null;
    typewriterToken++;

    if (typewriter) {
      typewriter.textContent = "";
      typewriter.dataset.typed = "false";
    }

    if (messageSign) {
      messageSign.classList.remove("show");
      messageSign.style.opacity = "0";
    }

    goToPage(0);
  });


  /* ==========================================
     INITIALIZE
     ========================================== */

  function initialize() {
    if (!pages.length) {
      console.error(
        "Birthday sections missing. Required IDs: " + pageIds.join(", ")
      );
      return;
    }

    const existingActive = pages.findIndex(
      (page) => page.classList.contains("active")
    );

    const initialPage = existingActive >= 0 ? existingActive : 0;

    // Initialize without forcing an unnecessary scroll.
    pages.forEach((page, i) => {
      const active = i === initialPage;

      page.classList.toggle("active", active);
      page.classList.toggle("is-active", active);
      page.setAttribute("aria-hidden", active ? "false" : "true");

      if (active) {
        page.removeAttribute("inert");
      } else {
        page.setAttribute("inert", "");
      }
    });

    currentPage = initialPage;

    navDots.forEach((dot, i) => {
      const dotIndex = Number(dot.dataset.index ?? i);
      dot.classList.toggle("active", dotIndex === initialPage);
    });

    updateMusicButton();

    if (initialPage === 2) startTypewriter();
    if (initialPage === 3) startConfetti();
    if (initialPage === 4) startFireworks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

})();
     
