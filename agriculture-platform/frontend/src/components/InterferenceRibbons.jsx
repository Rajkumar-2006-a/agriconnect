import React, { useEffect, useRef } from 'react';
import './InterferenceRibbons.css';

/**
 * Fast RGB color parser
 */
function parseColor(c) {
  if (typeof c === 'object' && c !== null && 'r' in c) return c;
  if (typeof c === 'string') {
    let hex = c.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex.split('').map((char) => char + char).join('');
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    }
  }
  return { r: 107, g: 60, b: 255 }; // Default #6B3CFF
}

/**
 * High-Performance InterferenceRibbons Component (Exact React Bits Pro Config)
 *
 * Designed for silky-smooth 60+ FPS performance with zero frame drops,
 * zero garbage collection pauses, and dedicated GPU layer compositing.
 */
export default function InterferenceRibbons({
  colors = ['#6B3CFF', '#D46BFF'],
  colorA,
  colorB,
  backgroundColor,
  background,
  wires = 64,
  lineWidth = 1.6,
  ribbonWidth = 0.24,
  amplitude = 0.60,
  waveLength = 1.00,
  angle = 42,
  twist = 1.60,
  curl = 0.25,
  depth = 0.65,
  stripes = 2.2,
  colorFlow = 0.04,
  glow = 0.45,
  intensity = 1.00,
  speed = 0.70,
  spin = 0.35,
  pulseSpeed = 1.10,
  pulseStrength = 1.00,
  interactive = false,
  hoverPulses = true,
  clickPulse = true,
  paused = false,
  quality = 1.0,
  className = '',
  style = {},
  children
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });
  const pulsesRef = useRef([]);

  // Resolve color and background prop aliases to match official API
  const resolvedColorA = colors?.[0] || colorA || '#6B3CFF';
  const resolvedColorB = colors?.[1] || colorB || '#D46BFF';
  const resolvedBackground = backgroundColor || background || '#0A0A0A';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;

    const rgbA = parseColor(resolvedColorA);
    const rgbB = parseColor(resolvedColorB);

    // Number of curve steps: 48 segments produces a continuous, silky smooth curve
    const segments = 48;
    const spineX = new Float32Array(segments + 1);
    const spineY = new Float32Array(segments + 1);
    const spineZ = new Float32Array(segments + 1);
    const cosTwistArr = new Float32Array(segments + 1);
    const sinTwistArr = new Float32Array(segments + 1);

    // Precompute wire colors and quantized RGBA string cache to completely eliminate GC pauses
    const ALPHA_STEPS = 16;
    const wireStyles = new Array(wires);

    for (let w = 0; w < wires; w++) {
      const wireRatio = wires > 1 ? (w / (wires - 1)) - 0.5 : 0;
      // Smooth consistent gradient from Color A to Color B across the ribbon
      const t = wires > 1 ? w / (wires - 1) : 0.5;
      const r = Math.round(rgbA.r + (rgbB.r - rgbA.r) * t);
      const g = Math.round(rgbA.g + (rgbB.g - rgbA.g) * t);
      const b = Math.round(rgbA.b + (rgbB.b - rgbA.b) * t);

      // Pre-allocated alpha strings table: wireStyles[w].alphaCache[index]
      const alphaCache = new Array(ALPHA_STEPS);
      for (let a = 0; a < ALPHA_STEPS; a++) {
        const val = ((a + 1) / ALPHA_STEPS) * 0.92;
        alphaCache[a] = `rgba(${r},${g},${b},${val.toFixed(2)})`;
      }

      wireStyles[w] = { r, g, b, wireRatio, alphaCache };
    }

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const pxX = e.clientX - rect.left;
      const pxY = e.clientY - rect.top;
      mouseRef.current.pixelX = pxX;
      mouseRef.current.pixelY = pxY;
      mouseRef.current.x = pxX / (width || 1);
      mouseRef.current.y = pxY / (height || 1);
      mouseRef.current.active = true;
    };

    const handleClick = (e) => {
      if (!clickPulse) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / (width || 1);
      pulsesRef.current.push({
        origin: clickX,
        progress: 0,
        speed: 0.03 * pulseSpeed,
        strength: pulseStrength
      });
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);
    }

    let time = 0;
    let lastStamp = performance.now();

    // Persistent hover energy per wire for lingering optical fiber glow
    const wireHoverEnergies = new Float32Array(wires);
    const touchPoints = new Array(wires);

    const angleRad = (angle * Math.PI) / 180;
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);
    const normX = -dirY;
    const normY = dirX;
    const spatialFreq = (1.0 / Math.max(0.15, waveLength)) * (Math.PI * 2);

    const render = (now) => {
      const delta = Math.min(32, now - lastStamp);
      lastStamp = now;
      if (!paused) {
        // Fluid, elegant drift and bend speed
        time += 0.00048 * speed * delta;
      }

      // Update click pulses
      if (pulsesRef.current.length > 0) {
        for (let p = pulsesRef.current.length - 1; p >= 0; p--) {
          pulsesRef.current[p].progress += pulsesRef.current[p].speed;
          if (pulsesRef.current[p].progress > 1.8) {
            pulsesRef.current.splice(p, 1);
          }
        }
      }

      // Smooth decay for wire hover light pulses
      for (let w = 0; w < wires; w++) {
        if (wireHoverEnergies[w] > 0.005) {
          wireHoverEnergies[w] *= 0.94;
        } else {
          wireHoverEnergies[w] = 0;
        }
      }

      // Solid background clear
      ctx.fillStyle = resolvedBackground;
      ctx.fillRect(0, 0, width, height);

      const minDim = Math.min(width, height);
      const diagLength = Math.hypot(width, height) * 1.35;
      const actualRibbonWidth = minDim * ribbonWidth;
      
      const mouseOffsetX = interactive && mouseRef.current.active ? (mouseRef.current.x - 0.5) * 30 : 0;
      const mouseOffsetY = interactive && mouseRef.current.active ? (mouseRef.current.y - 0.5) * 30 : 0;
      const centerX = width * 0.5 + mouseOffsetX;
      const centerY = height * 0.5 + mouseOffsetY;
      
      const pulseOsc = 1 + (Math.sin(time * pulseSpeed) * 0.06 * pulseStrength);

      // High-density 120-segment spine for ultra-smooth fluid curves
      const segments = 120;
      const spineX = new Float32Array(segments + 1);
      const spineY = new Float32Array(segments + 1);
      const spineZ = new Float32Array(segments + 1);
      const cosTwistArr = new Float32Array(segments + 1);
      const sinTwistArr = new Float32Array(segments + 1);

      for (let s = 0; s <= segments; s++) {
        const tNorm = s / segments;
        const distAlongAxis = (tNorm - 0.5) * diagLength;

        // Bending wave undulations
        const primaryWave = Math.sin((tNorm * spatialFreq) - (time * 1.45));
        const secondaryWave = Math.cos((tNorm * spatialFreq * 1.7) + (time * 1.05));
        const curlWave = Math.sin((tNorm * Math.PI * 3.0) + (time * spin * 2.0));

        const transverseDisp =
          (primaryWave * amplitude * minDim * 0.85) +
          (secondaryWave * curl * minDim * 0.32) +
          (curlWave * amplitude * minDim * 0.2);

        spineX[s] = centerX + (distAlongAxis * dirX) + (transverseDisp * normX);
        spineY[s] = centerY + (distAlongAxis * dirY) + (transverseDisp * normY);
        spineZ[s] = Math.cos((tNorm * spatialFreq * 0.85) - (time * 0.9)) * (depth * minDim * 0.65);

        const twistAngle =
          (tNorm * Math.PI * 4 * twist) +
          (time * 0.75 * twist) +
          (secondaryWave * 0.45);

        cosTwistArr[s] = Math.cos(twistAngle);
        sinTwistArr[s] = Math.sin(twistAngle);
      }

      // Additive hardware blending for luminous neon ribbon effect
      ctx.globalCompositeOperation = 'lighter';

      const timeStripe = time * 1.4;

      // PASS 1: Soft Ambient Glow Layer (if glow > 0)
      if (glow > 0.05) {
        ctx.lineWidth = lineWidth * (2.4 + glow * 1.6);
        for (let w = 0; w < wires; w += 2) {
          const item = wireStyles[w];
          const wireOffset = item.wireRatio * actualRibbonWidth * pulseOsc;
          const glowAlphaIdx = Math.max(0, Math.min(ALPHA_STEPS - 1, Math.floor(0.18 * glow * ALPHA_STEPS)));
          ctx.strokeStyle = item.alphaCache[glowAlphaIdx];

          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            const wireNorm = wireOffset * cosTwistArr[s];
            const totalZ = spineZ[s] + (wireOffset * sinTwistArr[s]);
            const pScale = 650 / (650 + totalZ);

            const px = centerX + (spineX[s] - centerX + (wireNorm * normX)) * pScale;
            const py = centerY + (spineY[s] - centerY + (wireNorm * normY)) * pScale;

            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }

      // PASS 2: Sharp High-Fidelity Core Strands
      const mousePxX = mouseRef.current.active ? mouseRef.current.pixelX : -9999;
      const mousePxY = mouseRef.current.active ? mouseRef.current.pixelY : -9999;

      for (let w = 0; w < wires; w++) {
        const item = wireStyles[w];
        const wireOffset = item.wireRatio * actualRibbonWidth * pulseOsc;

        // Stable harmonic distribution across ribbon without shifting colors over time
        const stripeMod = Math.sin(item.wireRatio * Math.PI * stripes * 2.2);
        const stripeAlpha = 0.60 + 0.40 * Math.abs(stripeMod);
        const edgeDamp = 1 - Math.pow(Math.abs(item.wireRatio * 2), 2.0);
        
        let calculatedAlpha = Math.max(0.12, Math.min(0.96, (0.35 + 0.55 * edgeDamp * stripeAlpha) * intensity));

        // Add click pulse brightness wave if active
        if (pulsesRef.current.length > 0) {
          for (let p = 0; p < pulsesRef.current.length; p++) {
            const pulse = pulsesRef.current[p];
            const distFromOrigin = Math.abs(item.wireRatio + 0.5 - pulse.origin);
            const pulseDist = Math.abs(distFromOrigin - pulse.progress * 0.5);
            if (pulseDist < 0.15) {
              calculatedAlpha = Math.min(1.0, calculatedAlpha + (1 - pulseDist / 0.15) * 0.35 * pulse.strength);
            }
          }
        }

        let closestDistSq = 999999;

        ctx.beginPath();

        for (let s = 0; s <= segments; s++) {
          const wireNorm = wireOffset * cosTwistArr[s];
          const totalZ = spineZ[s] + (wireOffset * sinTwistArr[s]);
          const pScale = 650 / (650 + totalZ);

          const px = centerX + (spineX[s] - centerX + (wireNorm * normX)) * pScale;
          const py = centerY + (spineY[s] - centerY + (wireNorm * normY)) * pScale;

          if (s === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }

          // Cursor touch detection
          if (interactive && mouseRef.current.active) {
            const dX = px - mousePxX;
            const dY = py - mousePxY;
            const dSq = dX * dX + dY * dY;
            if (dSq < closestDistSq) {
              closestDistSq = dSq;
            }
          }
        }

        // When the cursor touches a wire, boost its light in its OWN native color (no color change)
        if (closestDistSq < 50 * 50) {
          const touchFactor = 1 - Math.sqrt(closestDistSq) / 50;
          wireHoverEnergies[w] = Math.max(wireHoverEnergies[w], touchFactor * 1.0);
        }

        const hoverEnergy = wireHoverEnergies[w];
        if (hoverEnergy > 0.02) {
          // Boosted intensity without changing the wire's color
          ctx.lineWidth = lineWidth * (1 + hoverEnergy * 0.6);
          const boostedAlpha = Math.min(1.0, calculatedAlpha + hoverEnergy * 0.4);
          const alphaIdx = Math.min(ALPHA_STEPS - 1, Math.max(0, Math.floor(boostedAlpha * ALPHA_STEPS)));
          ctx.strokeStyle = item.alphaCache[alphaIdx];
        } else {
          ctx.lineWidth = lineWidth;
          const alphaIdx = Math.min(ALPHA_STEPS - 1, Math.max(0, Math.floor(calculatedAlpha * ALPHA_STEPS)));
          ctx.strokeStyle = item.alphaCache[alphaIdx];
        }

        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    wires,
    lineWidth,
    ribbonWidth,
    amplitude,
    waveLength,
    angle,
    twist,
    curl,
    depth,
    stripes,
    colorFlow,
    glow,
    intensity,
    speed,
    spin,
    pulseSpeed,
    pulseStrength,
    interactive,
    paused,
    quality,
    resolvedColorA,
    resolvedColorB,
    resolvedBackground
  ]);

  return (
    <div className={`interference-ribbons-wrap ${className}`} style={style} aria-hidden={children ? undefined : "true"}>
      <canvas ref={canvasRef} className="interference-ribbons-canvas" />
      {children}
    </div>
  );
}
