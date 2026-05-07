(function () {
  const year = document.querySelector("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const canvas = document.querySelector("#signal-canvas");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const pointer = { x: 0, y: 0, active: false };
  const colors = ["#34d399", "#2563eb", "#f05d4f", "#f6c945"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let particles = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(42, Math.floor((width * height) / 18000));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      radius: 1.4 + Math.random() * 2.2,
      color: colors[index % colors.length],
    }));
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = "rgba(247, 248, 243, 0.055)";
    ctx.lineWidth = 1;
    const gap = 56;

    for (let x = 0; x < width + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height + gap; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function updateParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    if (pointer.active) {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 140 && distance > 0.1) {
        const force = (140 - distance) / 140;
        particle.x += (dx / distance) * force * 1.1;
        particle.y += (dy / distance) * force * 1.1;
      }
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (distance < 122) {
          ctx.strokeStyle = `rgba(247, 248, 243, ${0.13 * (1 - distance / 122)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawParticles() {
    particles.forEach((particle) => {
      updateParticle(particle);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0b0f0e";
    ctx.fillRect(0, 0, width, height);
    drawGrid();
    drawConnections();
    drawParticles();
    if (!reduceMotion) {
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) {
      frame();
    }
  });
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  resize();
  frame();
})();
