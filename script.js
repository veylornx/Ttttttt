
/* =========================================
   TASHFIN MIRA — BIRTHDAY SURPRISE
   Complete fixed script.js
   ========================================= */

(() => {
  "use strict";

  /* ---------- HELPERS ---------- */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  const random = (min, max) =>
    Math.random() * (max - min) + min;

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- PRELOADER ---------- */

  const preloader = $("#preloader");
  const preFill = $("#preFill");
  const prePct = $("#prePct");

  let loaderHidden = false;

  function updateLoader(percent) {
    const value = clamp(Math.round(percent), 0, 100);

    if (preFill) {
      preFill.style.width = `${value}%`;
    }

    if (prePct) {
      prePct.textContent = `${value}%`;
    }
  }

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;

    updateLoader(100);

    if (preloader) {
      preloader.classList.add("loaded");
      preloader.setAttribute("aria-hidden", "true");

      // Fallback if the CSS has no exit animation.
      window.setTimeout(() => {
        if (preloader) {
          preloader.style.pointerEvents = "none";
        }
      }, 1000);
    }
  }

  let loadingProgress = 0;

  const loaderTimer = window.setInterval(() => {
    if (loaderHidden) {
      window.clearInterval(loaderTimer);
      return;
    }

    loadingProgress = Math.min(
      loadingProgress + random(3, 12),
      92
    );

    updateLoader(loadingProgress);
  }, 100);

  window.addEventListener("load", () => {
    window.clearInterval(loaderTimer);
    updateLoader(100);
    window.setTimeout(hideLoader, 350);
  }, { once: true });

  // Prevent the preloader from getting stuck.
  window.setTimeout(hideLoader, 6000);


  /* ---------- SECTION NAVIGATION ---------- */

  const sections = $$('section[id^="sec"]');
  const navDots = $$(".nd");
  const startButton = $("#btnStart");
  const replayButton = $("#btnReplay");

  let currentSection = 0;

  function getSectionIndex(section) {
    return sections.indexOf(section);
  }

  function showSection(index, options = {}) {
    if (!sections.length) return;

    const nextIndex = clamp(
      Number(index) || 0,
      0,
      sections.length - 1
    );

    currentSection = nextIndex;

    sections.forEach((section, i) => {
      const isActive = i === nextIndex;

      section.classList.toggle("active", isActive);
      section.classList.toggle("is-active", isActive);

      section.setAttribute(
        "aria-hidden",
        isActive ? "false" : "true"
      );

      if (isActive) {
        section.removeAttribute("inert");
      } else {
        section.setAttribute("inert", "");
      }
    });

    navDots.forEach((dot, i) => {
      const dotIndex = Number(dot.dataset.index);
      const isActive = dotIndex === nextIndex || i === nextIndex;

      dot.classList.toggle("active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "step");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    // Support ordinary scrolling layouts as well.
    if (options.scroll !== false) {
      const target = sections[nextIndex];

      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
      }
    }

    if (nextIndex === 2) {
      startTypewriter();
    }

    if (nextIndex === 3) {
      startConfetti();
    }

    if (nextIndex === 4) {
      startFireworks();
    } else {
      stopFireworks();
    }
  }

  function goToSection(index) {
    showSection(index);
  }

  if (startButton) {
    startButton.addEventListener("click", () => {
      goToSection(1);
    });
  }

  navDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.index);

      goToSection(
        Number.isFinite(targetIndex) ? targetIndex : index
      );
    });
  });

  $$("[data-goto]").forEach((element) => {
    element.addEventListener("click", () => {
      const targetIndex = Number(element.dataset.goto);

      if (Number.isFinite(targetIndex)) {
        goToSection(targetIndex);
      }
    });
  });

  // Optional keyboard navigation between sections.
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;

    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(tag) ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    if (event.key === "ArrowRight" && currentSection < sections.length - 1) {
      goToSection(currentSection + 1);
    }

    if (event.key === "ArrowLeft" && currentSection > 0) {
      goToSection(currentSection - 1);
    }
  });


  /* ---------- BACKGROUND MUSIC ---------- */

  const bgMusic = $("#bgMusic");
  const musicToggle = $("#musicToggle");

  let musicPlaying = false;

  if (bgMusic) {
    bgMusic.loop = true;
    bgMusic.preload = "none";
    bgMusic.volume = 0.45;

    bgMusic.addEventListener("play", () => {
      musicPlaying = true;
      updateMusicButton();
    });

    bgMusic.addEventListener("pause", () => {
      musicPlaying = false;
      updateMusicButton();
    });

    bgMusic.addEventListener("ended", () => {
      musicPlaying = false;
      updateMusicButton();
    });

    bgMusic.addEventListener("error", () => {
      musicPlaying = false;
      updateMusicButton();
      console.warn(
        "Music could not be loaded. Check the audio URL and file format."
      );
    });
  }

  function updateMusicButton() {
    if (!musicToggle) return;

    musicToggle.classList.toggle("mt-on", musicPlaying);
    musicToggle.classList.toggle("mt-off", !musicPlaying);

    musicToggle.setAttribute(
      "aria-label",
      musicPlaying ? "Pause background music" : "Play background music"
    );

    musicToggle.setAttribute(
      "aria-pressed",
      String(musicPlaying)
    );
  }

  async function toggleMusic() {
    if (!bgMusic) {
      console.warn("Audio element #bgMusic was not found.");
      return;
    }

    if (musicPlaying || !bgMusic.paused) {
      bgMusic.pause();
      return;
    }

    try {
      await bgMusic.play();
    } catch (error) {
      console.warn(
        "Music playback was blocked or the audio file is invalid.",
        error
      );
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", toggleMusic);
    updateMusicButton();
  }


  /* ---------- CANVAS SETUP ---------- */

  function setupCanvas(canvas) {
    if (!canvas) return null;

    const context = canvas.getContext("2d");
    if (!context) return null;

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

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    return {
      canvas,
      ctx: context,
      get width() {
        return width;
      },
      get height() {
        return height;
      },
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


  /* ---------- FLOATING BACKGROUND PARTICLES ---------- */

  let particles = [];
  let particleFrame = 0;

  function createParticle() {
    const width = particleCanvas?.width || window.innerWidth;
    const height = particleCanvas?.height || window.innerHeight;

    return {
      x: random(0, width),
      y: random(0, height),
      radius: random(0.8, 2.8),
      speedX: random(-0.25, 0.25),
      speedY: random(-0.45, -0.08),
      alpha: random(0.2, 0.8),
      twinkle: random(0.005, 0.02),
      phase: random(0, Math.PI * 2)
    };
  }

  function initParticles() {
    if (!particleCanvas) return;

    const area =
      particleCanvas.width * particleCanvas.height;

    const count = prefersReducedMotion
      ? 20
      : Math.round(clamp(area / 18000, 25, 90));

    particles = Array.from(
      { length: count },
      createParticle
    );
  }

  function animateParticles() {
    if (!particleCanvas) return;

    const { ctx, width, height } = particleCanvas;

    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.phase += particle.twinkle;

      const glow =
        particle.alpha *
        (0.65 + Math.sin(particle.phase) * 0.35);

      if (particle.y < -5) {
        particle.y = height + 5;
        particle.x = random(0, width);
      }

      if (particle.x < -5) particle.x = width + 5;
      if (particle.x > width + 5) particle.x = -5;

      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = `rgba(255, 220, 240, ${glow})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(255, 160, 210, 0.6)";
      ctx.fill();
    });

    ctx.shadowBlur = 0;

    if (!prefersReducedMotion) {
      particleFrame = requestAnimationFrame(animateParticles);
    }
  }

  if (particleCanvas) {
    initParticles();

    if (prefersReducedMotion) {
      animateParticles();
    } else {
      particleFrame = requestAnimationFrame(animateParticles);
    }
  }


  /* ---------- TYPEWRITER MESSAGE ---------- */

  const typewriterElement = $("#twText");
  const messageSign = $("#msgSign");

  const birthdayMessage = typewriterElement
    ? (
        typewriterElement.dataset.message ||
        typewriterElement.textContent.trim() ||
        "Happy Birthday, Mira! 🎂💖 Tui shobshomoy happy thakish. Tor shob shopno puron hok, ar tor life bhore uthuk hasi, bhalobasha ar beautiful memories diye. ✨"
      )
    : "";

  let typewriterTimer = null;
  let typewriterToken = 0;

  function startTypewriter() {
    if (!typewriterElement) return;

    // Avoid restarting the animation every time the section is visited.
    if (typewriterElement.dataset.typed === "true") return;

    if (typewriterTimer) {
      window.clearTimeout(typewriterTimer);
    }

    const token = ++typewriterToken;
    let index = 0;

    typewriterElement.dataset.typed = "typing";
    typewriterElement.textContent = "";

    if (messageSign) {
      messageSign.style.opacity = "0";
    }

    if (prefersReducedMotion) {
      typewriterElement.textContent = birthdayMessage;
      typewriterElement.dataset.typed = "true";

      if (messageSign) {
        messageSign.style.opacity = "1";
      }

      return;
    }

    function typeNextCharacter() {
      if (token !== typewriterToken) return;

      if (index < birthdayMessage.length) {
        typewriterElement.textContent += birthdayMessage.charAt(index);
        index += 1;

        const character = birthdayMessage.charAt(index - 1);
        const delay =
          character === "." ||
          character === "!" ||
          character === "?"
            ? 320
            : character === "," 
              ? 180
              : random(28, 55);

        typewriterTimer = window.setTimeout(
          typeNextCharacter,
          delay
        );
      } else {
        typewriterElement.dataset.typed = "true";

        if (messageSign) {
          messageSign.style.opacity = "1";
          messageSign.classList.add("show");
        }
      }
    }

    typeNextCharacter();
  }


  /* ---------- CONFETTI ANIMATION ---------- */

  let confettiPieces = [];
  let confettiFrame = 0;
  let confettiRunning = false;

  function createConfettiPiece() {
    const width = confettiCanvas?.width || window.innerWidth;
    const height = confettiCanvas?.height || window.innerHeight;

    const colors = [
      "#ff6fae",
      "#ffd166",
      "#c9a7ff",
      "#8be9fd",
      "#ff8fab",
      "#ffffff"
    ];

    return {
      x: random(0, width),
      y: random(-height, 0),
      width: random(4, 9),
      height: random(7, 14),
      speedX: random(-1.3, 1.3),
      speedY: random(1.2, 3.5),
      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-0.08, 0.08),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: random(0.65, 1)
    };
  }

  function startConfetti() {
    if (!confettiCanvas || confettiRunning) return;

    confettiRunning = true;

    const area = confettiCanvas.width * confettiCanvas.height;
    const count = prefersReducedMotion
      ? 0
      : Math.round(clamp(area / 8000, 60, 160));

    confettiPieces = Array.from(
      { length: count },
      createConfettiPiece
    );

    if (count > 0) {
      confettiFrame = requestAnimationFrame(animateConfetti);
    }
  }

  function animateConfetti() {
    if (!confettiCanvas || !confettiRunning) return;

    const { ctx, width, height } = confettiCanvas;

    ctx.clearRect(0, 0, width, height);

    confettiPieces.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.rotation += piece.rotationSpeed;

      if (piece.y > height + 20) {
        piece.y = random(-40, -10);
        piece.x = random(0, width);
      }

      if (piece.x < -20) piece.x = width + 20;
      if (piece.x > width + 20) piece.x = -20;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.globalAlpha = piece.alpha;
      ctx.fillStyle = piece.color;

      ctx.fillRect(
        -piece.width / 2,
        -piece.height / 2,
        piece.width,
        piece.height
      );

      ctx.restore();
    });

    ctx.globalAlpha = 1;
    confettiFrame = requestAnimationFrame(animateConfetti);
  }

  function stopConfetti() {
    confettiRunning = false;

    if (confettiFrame) {
      cancelAnimationFrame(confettiFrame);
      confettiFrame = 0;
    }

    if (confettiCanvas) {
      confettiCanvas.ctx.clearRect(
        0,
        0,
        confettiCanvas.width,
        confettiCanvas.height
      );
    }
  }


  /* ---------- FIREWORKS ANIMATION ---------- */

  let fireworks = [];
  let sparks = [];
  let fireworksFrame = 0;
  let fireworksRunning = false;
  let lastFireworkTime = 0;

  function launchFirework() {
    if (!fireworksCanvas) return;

    const width = fireworksCanvas.width;
    const height = fireworksCanvas.height;

    const colors = [
      "#ff6fae",
      "#ffd166",
      "#c9a7ff",
      "#8be9fd",
      "#ffffff",
      "#ff8fab"
    ];

    fireworks.push({
      x: random(width * 0.12, width * 0.88),
      y: height + 5,
      targetX: random(width * 0.15, width * 0.85),
      targetY: random(height * 0.12, height * 0.55),
      speed: random(3.5, 6),
      color: colors[Math.floor(Math.random() * colors.length)],
      exploded: false
    });
  }

  function explodeFirework(firework) {
    const particleCount = prefersReducedMotion ? 0 : 45;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = random(1.1, 4.1);

      sparks.push({
        x: firework.x,
        y: firework.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.035,
        life: 1,
        decay: random(0.012, 0.025),
        radius: random(1, 2.5),
        color: firework.color
      });
    }
  }

  function startFireworks() {
    if (!fireworksCanvas || fireworksRunning) return;

    fireworksRunning = true;
    lastFireworkTime = 0;

    if (!prefersReducedMotion) {
      launchFirework();
      fireworksFrame = requestAnimationFrame(animateFireworks);
    }
  }

  function animateFireworks(timestamp) {
    if (!fireworksCanvas || !fireworksRunning) return;

    const { ctx, width, height } = fireworksCanvas;

    ctx.clearRect(0, 0, width, height);

    if (
      !lastFireworkTime ||
      timestamp - lastFireworkTime > 750
    ) {
      launchFirework();
      lastFireworkTime = timestamp;
    }

    // Move rockets toward their targets.
    fireworks = fireworks.filter((firework) => {
      const dx = firework.targetX - firework.x;
      const dy = firework.targetY - firework.y;
      const distance = Math.hypot(dx, dy);

      if (distance < firework.speed + 2) {
        explodeFirework(firework);
        return false;
      }

      firework.x += (dx / distance) * firework.speed;
      firework.y += (dy / distance) * firework.speed;

      ctx.beginPath();
      ctx.arc(firework.x, firework.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = firework.color;
      ctx.fill();

      return true;
    });

    // Draw the exploding sparks.
    sparks = sparks.filter((spark) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += spark.gravity;
      spark.vx *= 0.99;
      spark.life -= spark.decay;

      if (spark.life <= 0) return false;

      ctx.globalAlpha = clamp(spark.life, 0, 1);
      ctx.beginPath();
      ctx.arc(
        spark.x,
        spark.y,
        spark.radius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = spark.color;
      ctx.fill();

      return true;
    });

    ctx.globalAlpha = 1;

    fireworksFrame = requestAnimationFrame(animateFireworks);
  }

  function stopFireworks() {
    fireworksRunning = false;

    if (fireworksFrame) {
      cancelAnimationFrame(fireworksFrame);
      fireworksFrame = 0;
    }

    fireworks = [];
    sparks = [];

    if (fireworksCanvas) {
      fireworksCanvas.ctx.clearRect(
        0,
        0,
        fireworksCanvas.width,
        fireworksCanvas.height
      );
    }
  }


  /* ---------- REPLAY BUTTON ---------- */

  if (replayButton) {
    replayButton.addEventListener("click", () => {
      stopFireworks();
      stopConfetti();

      // Allow the final section to be revisited and replayed.
      if (typewriterElement) {
        typewriterElement.dataset.typed = "false";
      }

      if (messageSign) {
        messageSign.classList.remove("show");
        messageSign.style.opacity = "0";
      }

      if (typewriterTimer) {
        window.clearTimeout(typewriterTimer);
        typewriterTimer = null;
      }

      typewriterToken++;

      goToSection(0);
    });
  }


  /* ---------- INITIALIZE ---------- */

  function initializePage() {
    updateMusicButton();

    if (sections.length) {
      // Respect any active section already set in the HTML.
      let initialIndex = sections.findIndex((section) =>
        section.classList.contains("active")
      );

      if (initialIndex < 0) initialIndex = 0;

      showSection(initialIndex, { scroll: false });
    }

    // Make images fade in when loaded, without changing their URLs.
    $$("img").forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add("loaded");
      } else {
        img.addEventListener("load", () => {
          img.classList.add("loaded");
        }, { once: true });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, {
      once: true
    });
  } else {
    initializePage();
  }

})();
                        
