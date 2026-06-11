// frontend/src/components/landing/HeroScene.tsx
import React, { useRef, useEffect, useState } from 'react';

interface Cube {
  gridX: number;
  gridY: number;
  height: number;
  targetHeight: number;
  currentZ: number;
  targetZ: number;
  color: string;
  glowColor: string;
  status: 'empty' | 'claimed' | 'approved';
  taskTitle: string;
  points: number;
  pulsePhase: number;
}

export const HeroScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTask, setHoveredTask] = useState<{
    title: string;
    points: number;
    status: string;
    x: number;
    y: number;
  } | null>(null);

  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  // Predefined mock tasks to display on hover
  const mockTasks = [
    { title: 'Fix auth middleware token leakage', points: 30, status: 'Approved' },
    { title: 'Optimize thread pool allocator', points: 40, status: 'Approved' },
    { title: 'Document CLI commands', points: 10, status: 'Open' },
    { title: 'Add streaming completions support', points: 60, status: 'In Progress' },
    { title: 'Fix argument parser startup script', points: 12, status: 'Approved' },
    { title: 'Write Jest unit tests for API routes', points: 25, status: 'Open' },
    { title: 'Optimize image resizing matrix loops', points: 80, status: 'Approved' },
    { title: 'CLI terminal spinner animation', points: 35, status: 'In Progress' },
    { title: 'Write integration test suite for AST', points: 30, status: 'Open' },
    { title: 'Refactor client storage local fallback', points: 15, status: 'Approved' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      canvas.width = rect?.width || 600;
      canvas.height = rect?.height || 500;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize isometric cube grid (12 columns x 7 rows)
    const cols = 12;
    const rows = 7;
    const cubes: Cube[] = [];

    // Curated Light/Pastel Colors matching design.md
    const emptyColor = '#fafaf7';
    const claimedColor = '#9fbbe0'; // timeline-read (pastel blue)
    const approvedColor = '#9fc9a2'; // timeline-grep (mint)

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const rand = Math.random();
        let status: 'empty' | 'claimed' | 'approved' = 'empty';
        let color = emptyColor;
        let glowColor = 'transparent';
        let targetHeight = 6; // base flat block

        if (rand > 0.82) {
          status = 'claimed';
          color = claimedColor;
          glowColor = '#c0a8dd'; // timeline-edit (lavender glow)
          targetHeight = 16 + Math.random() * 24;
        } else if (rand > 0.45) {
          status = 'approved';
          color = approvedColor;
          glowColor = '#9fc9a2'; // mint glow
          targetHeight = 22 + Math.random() * 32;
        }

        const taskIndex = Math.floor(Math.random() * mockTasks.length);
        const task = mockTasks[taskIndex];

        cubes.push({
          gridX: x,
          gridY: y,
          height: 0,
          targetHeight,
          currentZ: -120 - (x + y) * 15, // Rise entrance staggered
          targetZ: 0,
          color,
          glowColor,
          status,
          taskTitle: task.title,
          points: task.points,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Isometric Projection Math
    const size = 30; // isometric cube size
    const originXOffset = cols * size * 0.35;
    const originYOffset = rows * size * 0.2;

    const isoProj = (gridX: number, gridY: number, z: number, w: number, h: number) => {
      const originX = w / 2 - originXOffset + originYOffset;
      const originY = h / 2.3;
      
      const cartX = gridX * size;
      const cartY = gridY * size;
      
      const projX = originX + (cartX - cartY) * Math.cos(Math.PI / 6);
      const projY = originY + (cartX + cartY) * Math.sin(Math.PI / 6) - z;
      
      return { x: projX, y: projY };
    };

    // Parallax damping
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    // Hover wave pulse
    let waveTime = 0;

    // Background floating sparks
    const sparks: { x: number; y: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 20; i++) {
      sparks.push({
        x: Math.random() * 600,
        y: Math.random() * 500,
        vy: -0.2 - Math.random() * 0.4,
        size: 1 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.4
      });
    }

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waveTime += 0.03;

      // Smooth mouse parallax interpolation
      currentParallaxX += (mouseRef.current.x - currentParallaxX) * 0.07;
      currentParallaxY += (mouseRef.current.y - currentParallaxY) * 0.07;

      const parallaxX = currentParallaxX * 35;
      const parallaxY = currentParallaxY * 20;

      // 1. Draw glowing perspectival grid floor lines
      ctx.strokeStyle = '#e6e5e0';
      ctx.lineWidth = 0.5;
      ctx.shadowBlur = 0;
      
      // Grid Row lines
      ctx.globalAlpha = 0.35;
      for (let x = 0; x <= cols; x++) {
        const start = isoProj(x, 0, 0, canvas.width, canvas.height);
        const end = isoProj(x, rows, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(start.x + parallaxX, start.y + parallaxY);
        ctx.lineTo(end.x + parallaxX, end.y + parallaxY);
        ctx.stroke();
      }
      // Grid Column lines
      for (let y = 0; y <= rows; y++) {
        const start = isoProj(0, y, 0, canvas.width, canvas.height);
        const end = isoProj(cols, y, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(start.x + parallaxX, start.y + parallaxY);
        ctx.lineTo(end.x + parallaxX, end.y + parallaxY);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // 2. Draw floating code particles
      sparks.forEach(s => {
        s.y += s.vy;
        if (s.y < 0) s.y = canvas.height;
        ctx.fillStyle = '#cfcdc4';
        ctx.globalAlpha = s.alpha * 0.5;
        ctx.beginPath();
        ctx.arc(s.x + mouseRef.current.x * 10, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      let foundHover: any = null;

      // Draw back-to-front
      const sortedCubes = [...cubes].sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY));

      sortedCubes.forEach((cube) => {
        cube.pulsePhase += 0.02;
        const pulse = Math.sin(cube.pulsePhase) * 1.5;

        // Animate heights
        cube.currentZ += (cube.targetZ - cube.currentZ) * 0.05;
        cube.height += (cube.targetHeight - cube.height) * 0.05;

        const h = cube.height + (cube.status !== 'empty' ? pulse : 0);

        const pos = isoProj(cube.gridX, cube.gridY, cube.currentZ, canvas.width, canvas.height);
        const drawX = pos.x + parallaxX;
        const drawY = pos.y + parallaxY;

        const slant = Math.sin(Math.PI / 6) * (size / 2);

        // Face coordinates
        const topPoly = [
          { x: drawX, y: drawY - h },
          { x: drawX + (size / 2) * Math.cos(Math.PI / 6), y: drawY - h + slant },
          { x: drawX, y: drawY - h + slant * 2 },
          { x: drawX - (size / 2) * Math.cos(Math.PI / 6), y: drawY - h + slant },
        ];

        const leftPoly = [
          { x: drawX - (size / 2) * Math.cos(Math.PI / 6), y: drawY - h + slant },
          { x: drawX, y: drawY - h + slant * 2 },
          { x: drawX, y: drawY + slant * 2 },
          { x: drawX - (size / 2) * Math.cos(Math.PI / 6), y: drawY + slant },
        ];

        const rightPoly = [
          { x: drawX, y: drawY - h + slant * 2 },
          { x: drawX + (size / 2) * Math.cos(Math.PI / 6), y: drawY - h + slant },
          { x: drawX + (size / 2) * Math.cos(Math.PI / 6), y: drawY + slant },
          { x: drawX, y: drawY + slant * 2 },
        ];

        // Hit-test check
        const mx = targetMouseRef.current.x * canvas.width;
        const my = targetMouseRef.current.y * canvas.height;
        let isHovered = false;

        if (mx > drawX - (size / 2) && mx < drawX + (size / 2) && my > drawY - h && my < drawY + slant * 2) {
          isHovered = true;
        }

        // Color projection shading
        let topColor = cube.color;
        let leftColor = darkenColor(cube.color, 0.2);
        let rightColor = darkenColor(cube.color, 0.4);

        if (cube.status === 'empty') {
          topColor = '#fafaf7';
          leftColor = '#efeee8';
          rightColor = '#e6e5e0';
        }

        if (isHovered && cube.status !== 'empty') {
          topColor = lightenColor(cube.color, 0.3);
          leftColor = lightenColor(cube.color, 0.1);
          rightColor = darkenColor(cube.color, 0.1);
          foundHover = {
            title: cube.taskTitle,
            points: cube.points,
            status: cube.status === 'approved' ? 'Approved' : 'Under Review',
            x: drawX,
            y: drawY - h - 15
          };
        }

        // Left Face
        ctx.fillStyle = leftColor;
        ctx.beginPath();
        ctx.moveTo(leftPoly[0].x, leftPoly[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(leftPoly[i].x, leftPoly[i].y);
        ctx.closePath();
        ctx.fill();

        // Right Face
        ctx.fillStyle = rightColor;
        ctx.beginPath();
        ctx.moveTo(rightPoly[0].x, rightPoly[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(rightPoly[i].x, rightPoly[i].y);
        ctx.closePath();
        ctx.fill();

        // Top Face
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(topPoly[0].x, topPoly[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(topPoly[i].x, topPoly[i].y);
        ctx.closePath();
        ctx.fill();

        // Glowing border strokes (minimal non-glow hairline outline on hover)
        if (isHovered && cube.status !== 'empty' && cube.glowColor !== 'transparent') {
          ctx.strokeStyle = '#26251e';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(topPoly[0].x, topPoly[0].y);
          for (let i = 1; i < 4; i++) ctx.lineTo(topPoly[i].x, topPoly[i].y);
          ctx.closePath();
          ctx.stroke();
        }
      });

      setHoveredTask(foundHover);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Darken helper
    function darkenColor(hex: string, percent: number) {
      if (hex.startsWith('#')) hex = hex.slice(1);
      let num = parseInt(hex, 16);
      let r = (num >> 16) * (1 - percent);
      let g = ((num >> 8) & 0x00FF) * (1 - percent);
      let b = (num & 0x0000FF) * (1 - percent);
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    // Lighten helper
    function lightenColor(hex: string, percent: number) {
      if (hex.startsWith('#')) hex = hex.slice(1);
      let num = parseInt(hex, 16);
      let r = Math.min(255, (num >> 16) * (1 + percent));
      let g = Math.min(255, ((num >> 8) & 0x00FF) * (1 + percent));
      let b = Math.min(255, (num & 0x0000FF) * (1 + percent));
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    targetMouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    mouseRef.current = { x: x * 0.35, y: y * 0.35 };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: 0, y: 0 };
    targetMouseRef.current = { x: 0, y: 0 };
    setHoveredTask(null);
  };


  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[380px] md:h-[480px] flex items-center justify-center cursor-crosshair overflow-visible select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* HUD Tooltip */}
      {hoveredTask && (
        <div
          style={{
            left: `${hoveredTask.x}px`,
            top: `${hoveredTask.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute pointer-events-none z-30 p-3 rounded-md border border-hairline bg-surface-card shadow-sm max-w-[210px] animate-in fade-in zoom-in-95 duration-100 font-mono"
        >
          <div className="flex items-center justify-between gap-2 border-b border-hairline pb-1 mb-1.5">
            <span className="text-[9px] font-mono text-primary tracking-wider uppercase">Contribution Node</span>
            <span className="text-[10px] font-mono text-timeline-done font-bold">+{hoveredTask.points} pts</span>
          </div>
          <p className="text-[10px] font-mono text-ink leading-normal line-clamp-2">
            &gt; {hoveredTask.title}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hoveredTask.status === 'Approved' ? 'bg-semantic-success' : 'bg-primary animate-pulse'
              }`}
            ></span>
            <span className="text-[8px] font-mono text-body uppercase">
              {hoveredTask.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
