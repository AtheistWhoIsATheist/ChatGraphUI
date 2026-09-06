import React, { useEffect, useRef } from 'react';

export const CosmicCosmosBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Stars generation
    const starCount = 220;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      isGiant: Math.random() > 0.94,
      hue: Math.random() > 0.7 ? 270 : Math.random() > 0.4 ? 220 : 0 // violet, blue, white
    }));

    // Floating cosmic dust particles
    const dustCount = 35;
    const dustParticles = Array.from({ length: dustCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: (Math.random() - 0.5) * 0.08,
      alpha: Math.random() * 0.4 + 0.1
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.015;

      // Base void gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#040308');
      bgGrad.addColorStop(0.35, '#070512');
      bgGrad.addColorStop(0.7, '#0b081c');
      bgGrad.addColorStop(1, '#05030a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Deep cosmic nebula clouds
      // Nebula 1: Upper Right near Black Hole (Deep Violet/Magenta)
      const neb1 = ctx.createRadialGradient(
        width * 0.78, height * 0.18, 50,
        width * 0.78, height * 0.18, width * 0.55
      );
      neb1.addColorStop(0, 'rgba(147, 51, 234, 0.28)');
      neb1.addColorStop(0.3, 'rgba(126, 34, 206, 0.18)');
      neb1.addColorStop(0.6, 'rgba(76, 29, 149, 0.08)');
      neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      // Nebula 2: Center/Lower Ambient Indigo
      const neb2 = ctx.createRadialGradient(
        width * 0.4, height * 0.6, 20,
        width * 0.4, height * 0.6, width * 0.5
      );
      neb2.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
      neb2.addColorStop(0.4, 'rgba(79, 70, 229, 0.06)');
      neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // Nebula 3: Lower Left near planetary moon
      const neb3 = ctx.createRadialGradient(
        width * 0.15, height * 0.78, 30,
        width * 0.15, height * 0.78, width * 0.4
      );
      neb3.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
      neb3.addColorStop(0.5, 'rgba(88, 28, 135, 0.07)');
      neb3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb3;
      ctx.fillRect(0, 0, width, height);

      // Draw Twinkling Stars
      for (const s of stars) {
        const twinkle = Math.sin(time * 1.5 + s.twinkleOffset) * 0.35 + 0.65;
        const currentAlpha = Math.max(0.1, Math.min(1, s.alpha * twinkle));
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        if (s.hue === 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        } else {
          ctx.fillStyle = `hsla(${s.hue}, 80%, 75%, ${currentAlpha})`;
        }
        ctx.fill();

        // Lens flare spike for giant stars
        if (s.isGiant && currentAlpha > 0.6) {
          ctx.strokeStyle = `rgba(216, 180, 254, ${currentAlpha * 0.4})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - s.radius * 4, s.y);
          ctx.lineTo(s.x + s.radius * 4, s.y);
          ctx.moveTo(s.x, s.y - s.radius * 4);
          ctx.lineTo(s.x, s.y + s.radius * 4);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw floating cosmic dust
      ctx.fillStyle = 'rgba(233, 213, 255, 0.25)';
      for (const d of dustParticles) {
        d.x += d.speedX;
        d.y += d.speedY;
        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192, 132, 252, ${d.alpha * (0.8 + 0.2 * Math.sin(time + d.x))})`;
        ctx.fill();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // BLACK HOLE & ACCRETION DISK (Top Right, exactly like screenshot)
      // -------------------------------------------------------------
      const bhX = width * 0.74;
      const bhY = height * 0.12;
      const bhRadius = Math.min(width * 0.05, 55);

      ctx.save();
      ctx.translate(bhX, bhY);
      // Gentle tilt of accretion disk
      ctx.rotate(-0.25);

      // Outer Gravitational Lensing Halo (Back glow)
      const outerHalo = ctx.createRadialGradient(0, 0, bhRadius * 0.8, 0, 0, bhRadius * 4.5);
      outerHalo.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      outerHalo.addColorStop(0.15, 'rgba(216, 180, 254, 0.7)');
      outerHalo.addColorStop(0.35, 'rgba(168, 85, 247, 0.35)');
      outerHalo.addColorStop(0.65, 'rgba(109, 40, 217, 0.15)');
      outerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.scale(1, 0.38); // Flatten to create accretion ellipse
      ctx.fillStyle = outerHalo;
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius * 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Glowing accretion stream rings with subtle rotation
      for (let i = 0; i < 3; i++) {
        const ringRad = bhRadius * (1.6 + i * 0.7);
        ctx.beginPath();
        ctx.arc(0, 0, ringRad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 230, 255, ${0.45 - i * 0.12})`;
        ctx.lineWidth = 2.5 - i * 0.6;
        ctx.stroke();
      }
      ctx.restore();

      // Gravitational lensing upper arc (the warped light behind the sphere)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, -bhRadius * 0.25, bhRadius * 1.55, bhRadius * 0.85, 0, Math.PI * 0.8, Math.PI * 2.2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // The Pitch Black Event Horizon (The Singularity)
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#020104';
      ctx.shadowColor = '#d8b4fe';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      // Front accretion disk ring crossing over the black hole
      ctx.save();
      ctx.scale(1, 0.35);
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius * 2.2, 0.1, Math.PI - 0.1);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#e9d5ff';
      ctx.shadowBlur = 16;
      ctx.stroke();

      // Secondary soft glow ring
      ctx.beginPath();
      ctx.arc(0, 0, bhRadius * 3.2, 0.2, Math.PI - 0.2);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Exit black hole coordinate space

      // -------------------------------------------------------------
      // LUNAR / ALIEN PLANET HORIZON (Bottom Left, exactly like screenshot)
      // -------------------------------------------------------------
      const planetCenterX = width * 0.1;
      const planetCenterY = height * 0.95;
      const planetRadius = width * 0.28;

      ctx.save();
      // Moon limb atmosphere glow
      const moonAtm = ctx.createRadialGradient(
        planetCenterX, planetCenterY, planetRadius * 0.88,
        planetCenterX, planetCenterY, planetRadius * 1.05
      );
      moonAtm.addColorStop(0, 'rgba(192, 132, 252, 0)');
      moonAtm.addColorStop(0.7, 'rgba(216, 180, 254, 0.15)');
      moonAtm.addColorStop(0.9, 'rgba(233, 213, 255, 0.25)');
      moonAtm.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonAtm;
      ctx.beginPath();
      ctx.arc(planetCenterX, planetCenterY, planetRadius * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // Dark celestial body silhouette
      ctx.beginPath();
      ctx.arc(planetCenterX, planetCenterY, planetRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#06040c';
      ctx.fill();

      // Craggy mountain peaks silhouette at the very bottom
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.88);
      // Jagged mountain ridge line
      const ridgePoints = [
        [0.02, 0.86], [0.05, 0.81], [0.07, 0.84], [0.1, 0.77],
        [0.12, 0.82], [0.15, 0.74], [0.17, 0.79], [0.2, 0.82],
        [0.22, 0.88], [0.26, 0.93], [0.32, 0.96], [0.38, 1.0]
      ];
      for (const [rx, ry] of ridgePoints) {
        ctx.lineTo(width * rx, height * ry);
      }
      ctx.lineTo(width * 0.4, height);
      ctx.closePath();
      ctx.fillStyle = '#040208';
      ctx.fill();

      // Rim light on jagged mountain edges
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/70 pointer-events-none" />
    </div>
  );
};
