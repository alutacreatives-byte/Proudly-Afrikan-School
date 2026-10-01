import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Grid,
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  Compass,
  X,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { SavedResource } from '../types';

export interface SlideItem {
  id?: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  bullets?: string[];
  keyPoints?: string[];
  speakerNotes?: string;
  visualCue?: string;
  layout?: string;
  conceptBadge?: string;
}

interface BuildInteractivePresentationProps {
  resource: SavedResource;
  activeSlideIndex: number;
  setActiveSlideIndex: (idx: number) => void;
  showSpeakerNotes: boolean;
  setShowSpeakerNotes: (show: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fs: boolean) => void;
  onExportDoc?: () => void;
  onExportPdf?: () => void;
}

// ==========================================
// WebGL Fluid Distortion & Movement Shader
// Directly inspired by: https://codepen.io/grisum/pen/gOEQVMO
// ==========================================
const VERTEX_SHADER_SRC = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  uniform float uDirection;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uDistortionStrength;
  uniform float uSlideSeed;

  // Simplex 2D noise helper
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 mouseP = (uMouse - 0.5) * vec2(aspect, 1.0);

    // Mouse distance ripple
    float distMouse = length(p - mouseP);
    float mouseWave = sin(distMouse * 14.0 - uTime * 3.5) * exp(-distMouse * 3.8);

    // Transition wave front sweeping across screen
    float waveFront = uv.x - uProgress;
    if (uDirection < 0.0) {
      waveFront = (1.0 - uv.x) - uProgress;
    }
    float transitionPulse = sin(clamp(uProgress * 3.14159, 0.0, 3.14159));
    float transitionWave = sin(waveFront * 16.0 + uTime * 4.0) * transitionPulse * uDistortionStrength;

    // Organic Perlin noise displacement
    float noise1 = snoise(uv * 3.2 + vec2(uTime * 0.12, uSlideSeed * 0.3));
    float noise2 = snoise(uv * 6.5 - vec2(uTime * 0.18, uSlideSeed * 0.5));
    float totalDisplacement = (noise1 * 0.045 + noise2 * 0.02) + (mouseWave * 0.06) + (transitionWave * 0.09);

    // Distorted UV coords with chromatic dispersion (RGB offset)
    vec2 uvR = uv + vec2(totalDisplacement * 1.15, totalDisplacement * 0.85);
    vec2 uvG = uv + vec2(totalDisplacement * 1.0, totalDisplacement * 1.0);
    vec2 uvB = uv + vec2(totalDisplacement * 0.85, totalDisplacement * 1.15);

    // Base background colors:
    // Charcoal deep base: #0F0F12
    vec3 cBg = vec3(0.06, 0.06, 0.075);
    // Signature QUIZ Orange: #E05A2B
    vec3 cOrange = vec3(0.878, 0.353, 0.169);
    // Warm Mustard Yellow: #D99B00
    vec3 cMustard = vec3(0.851, 0.608, 0.0);
    // Amber mid-tone: #EA8B1C
    vec3 cAmber = vec3(0.918, 0.545, 0.11);

    // Fluid ribbon gradient field
    float ribbon1 = sin(uvG.x * 3.8 + uvG.y * 4.2 + uTime * 0.35 + noise1 * 2.2);
    float ribbon2 = cos(uvG.x * 5.2 - uvG.y * 3.1 - uTime * 0.45 + noise2 * 2.5);
    float flow = smoothstep(-0.6, 0.9, ribbon1 * 0.5 + ribbon2 * 0.5);

    // Chromatic dispersion rendering
    float rChannel = smoothstep(-0.4, 0.8, sin(uvR.x * 3.8 + uvR.y * 4.2 + uTime * 0.35 + noise1 * 2.2));
    float gChannel = flow;
    float bChannel = smoothstep(-0.8, 0.6, cos(uvB.x * 5.2 - uvB.y * 3.1 - uTime * 0.45 + noise2 * 2.5));

    // Dynamic gradient blend from Orange to Mustard Yellow
    vec3 brandGradient = mix(cOrange, cMustard, clamp(uvG.x * 0.8 + uvG.y * 0.4 + sin(uTime * 0.2) * 0.2, 0.0, 1.0));
    brandGradient = mix(brandGradient, cAmber, clamp(noise1 * 0.5 + 0.5, 0.0, 1.0));

    // Composite fluid color with subtle vignette and dark stage
    vec3 finalColor = mix(cBg, brandGradient * 0.85, vec3(rChannel * 0.42, gChannel * 0.38, bChannel * 0.25));

    // Concentric glowing halo around center / mouse
    float halo = exp(-length(p) * 1.8) * 0.25;
    finalColor += brandGradient * halo;

    // Fluid shimmer on transition
    finalColor += vec3(1.0, 0.85, 0.5) * transitionPulse * 0.15;

    // Corner vignette
    float vignette = 1.0 - smoothstep(0.4, 1.3, length(uv - 0.5) * 1.4);
    finalColor *= clamp(vignette, 0.35, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function useWebGLShaderCanvas(
  slideIndex: number,
  isTransitioning: boolean,
  direction: number,
  enableWebGL: boolean,
  distortionLevel: number
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const progressRef = useRef<number>(0);
  const dirRef = useRef<number>(direction);

  useEffect(() => {
    dirRef.current = direction;
    progressRef.current = 0;
  }, [slideIndex, direction]);

  useEffect(() => {
    if (!enableWebGL) {
      const canvas = canvasRef.current;
      if (canvas) {
        const gl = canvas.getContext('webgl');
        if (gl) {
          gl.clearColor(0.06, 0.06, 0.075, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;
    glRef.current = gl;

    function createShader(type: number, src: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.warn('Shader compile failed', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Program link failed', gl.getProgramInfoLog(prog));
      return;
    }
    progRef.current = prog;
    gl.useProgram(prog);

    // Quad geometry: 2 triangles covering (-1..1)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(prog, 'uTime');
    const uProgressLoc = gl.getUniformLocation(prog, 'uProgress');
    const uDirectionLoc = gl.getUniformLocation(prog, 'uDirection');
    const uResolutionLoc = gl.getUniformLocation(prog, 'uResolution');
    const uMouseLoc = gl.getUniformLocation(prog, 'uMouse');
    const uDistStrengthLoc = gl.getUniformLocation(prog, 'uDistortionStrength');
    const uSlideSeedLoc = gl.getUniformLocation(prog, 'uSlideSeed');

    let running = true;

    function render(now: number) {
      if (!running || !gl || !progRef.current) return;

      const elapsed = (now - startTimeRef.current) * 0.001;

      // Smooth mouse follow
      mousePosRef.current.x += (targetMouseRef.current.x - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y += (targetMouseRef.current.y - mousePosRef.current.y) * 0.08;

      // Animate progress to 1
      if (progressRef.current < 1.0) {
        progressRef.current = Math.min(1.0, progressRef.current + 0.045);
      }

      // Check canvas dimensions
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = Math.max(1, canvas.clientWidth);
        canvas.height = Math.max(1, canvas.clientHeight);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.useProgram(progRef.current);
      if (uTimeLoc) gl.uniform1f(uTimeLoc, elapsed);
      if (uProgressLoc) gl.uniform1f(uProgressLoc, progressRef.current);
      if (uDirectionLoc) gl.uniform1f(uDirectionLoc, dirRef.current);
      if (uResolutionLoc) gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      if (uMouseLoc) gl.uniform2f(uMouseLoc, mousePosRef.current.x, mousePosRef.current.y);
      if (uDistStrengthLoc) gl.uniform1f(uDistStrengthLoc, (isTransitioning ? 1.6 : 0.8) * distortionLevel);
      if (uSlideSeedLoc) gl.uniform1f(uSlideSeedLoc, slideIndex * 1.37);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targetMouseRef.current.x = (e.clientX - rect.left) / rect.width;
        targetMouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      running = false;
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (gl) {
        gl.deleteBuffer(posBuffer);
        if (progRef.current) gl.deleteProgram(progRef.current);
      }
    };
  }, [slideIndex, isTransitioning, enableWebGL, distortionLevel]);

  return canvasRef;
}

export const BuildInteractivePresentation: React.FC<BuildInteractivePresentationProps> = ({
  resource,
  activeSlideIndex,
  setActiveSlideIndex,
  showSpeakerNotes,
  setShowSpeakerNotes,
  isFullscreen,
  setIsFullscreen,
  onExportDoc,
  onExportPdf,
}) => {
  const data = resource.data || {};
  const rawSlides: any[] = Array.isArray(data.slides) ? data.slides : [];

  // Standardize slides array
  const slides: SlideItem[] = rawSlides.map((s, idx) => ({
    id: s.id || `slide-${idx + 1}`,
    slideNumber: s.slideNumber || idx + 1,
    title: s.title || s.heading || `Slide ${idx + 1}`,
    subtitle: s.subtitle || s.subheading || '',
    bulletPoints: s.bulletPoints || s.bullets || s.keyPoints || [],
    speakerNotes: s.speakerNotes || s.notes || '',
    visualCue: s.visualCue || s.diagramDescription || '',
    layout: s.layout || (idx === 0 ? 'title' : idx === rawSlides.length - 1 ? 'summary' : 'content'),
    conceptBadge: s.conceptBadge || (idx === 0 ? 'OVERVIEW' : `KEY CONCEPT 0${idx}`),
  }));

  const totalSlides = slides.length;
  const currentSlide = slides[activeSlideIndex] || slides[0] || {
    slideNumber: 1,
    title: resource.title || 'Untitled Presentation',
    bulletPoints: ['Foundational curriculum points'],
  };

  // State
  const [transitionDirection, setTransitionDirection] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);
  const [autoplayProgress, setAutoplayProgress] = useState<number>(0);
  const [showGridModal, setShowGridModal] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [showControlsHud, setShowControlsHud] = useState<boolean>(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // WebGL Fluid & 3D Interactive Controls
  const [enableWebGL, setEnableWebGL] = useState<boolean>(true);
  const [enable3DTilt, setEnable3DTilt] = useState<boolean>(true);
  const [distortionLevel, setDistortionLevel] = useState<number>(1.2);

  // 3D Parallax Tilt state (Max Knight style)
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebGL shader canvas
  const shaderCanvasRef = useWebGLShaderCanvas(
    activeSlideIndex,
    isTransitioning,
    transitionDirection,
    enableWebGL,
    distortionLevel
  );

  // Slide transition logic with animation state
  const goToSlide = useCallback(
    (targetIdx: number) => {
      if (targetIdx === activeSlideIndex || targetIdx < 0 || targetIdx >= totalSlides) return;
      const dir = targetIdx > activeSlideIndex ? 1 : -1;
      setTransitionDirection(dir);
      setIsTransitioning(true);
      setActiveSlideIndex(targetIdx);
      setAutoplayProgress(0);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 550);
    },
    [activeSlideIndex, totalSlides, setActiveSlideIndex]
  );

  const nextSlide = useCallback(() => {
    if (activeSlideIndex < totalSlides - 1) {
      goToSlide(activeSlideIndex + 1);
    } else if (isAutoplay) {
      goToSlide(0);
    }
  }, [activeSlideIndex, totalSlides, goToSlide, isAutoplay]);

  const prevSlide = useCallback(() => {
    if (activeSlideIndex > 0) {
      goToSlide(activeSlideIndex - 1);
    }
  }, [activeSlideIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setShowSpeakerNotes(!showSpeakerNotes);
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          setShowGridModal((prev) => !prev);
          break;
        case 'Escape':
          if (showGridModal) {
            e.preventDefault();
            setShowGridModal(false);
          } else if (isFullscreen) {
            e.preventDefault();
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    nextSlide,
    prevSlide,
    goToSlide,
    totalSlides,
    isFullscreen,
    setIsFullscreen,
    showSpeakerNotes,
    setShowSpeakerNotes,
    showGridModal,
  ]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = 50; // tick every 50ms
    const totalDuration = 7000; // 7 seconds per slide
    const step = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setAutoplayProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoplay, nextSlide]);

  // Presentation stopwatch timer
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3D Mouse Parallax Tilt handler
  const handleMouseMoveArena = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!arenaRef.current || !enable3DTilt) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normalizedY = (y / rect.height - 0.5) * 2; // -1 to 1

    // Subtly tilt within max 9 degrees for smooth feel
    setTilt({
      rx: -normalizedY * 7,
      ry: normalizedX * 9,
    });

    // Reset HUD inactivity timer in fullscreen
    if (isFullscreen) {
      setShowControlsHud(true);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
      hudTimeoutRef.current = setTimeout(() => {
        setShowControlsHud(false);
      }, 3500);
    }
  };

  const handleMouseLeaveArena = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Touch Swipe handlers for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  // Wheel / trackpad gesture navigation (debounced)
  const wheelLockRef = useRef<boolean>(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaX) > 40 || Math.abs(e.deltaY) > 60) {
      wheelLockRef.current = true;
      if (e.deltaX > 40 || e.deltaY > 60) {
        nextSlide();
      } else {
        prevSlide();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    }
  };

  // Copy slide text
  const handleCopySlideText = () => {
    const text = `${currentSlide.title}\n${currentSlide.subtitle || ''}\n\nKey Points:\n${(
      currentSlide.bulletPoints || []
    )
      .map((b) => `• ${b}`)
      .join('\n')}\n\nSpeaker Notes:\n${currentSlide.speakerNotes || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Download standalone interactive HTML deck
  const handleDownloadStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${resource.title || 'Proudly Afrikan Presentation'}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f0f12;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    header {
      padding: 20px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(15,15,18,0.85);
      backdrop-filter: blur(10px);
    }
    .brand {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #E05A2B;
      text-transform: uppercase;
      font-family: monospace;
    }
    .topic {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
    }
    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      position: relative;
    }
    .slide-card {
      width: 100%;
      max-width: 960px;
      min-height: 480px;
      background: linear-gradient(145deg, #18181d, #121215);
      border: 1px solid rgba(224,90,43,0.25);
      border-radius: 28px;
      padding: 48px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      color: #D99B00;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-family: monospace;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.15;
      text-transform: uppercase;
      background: linear-gradient(to right, #ffffff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }
    p.subtitle {
      font-size: 18px;
      color: #94a3b8;
      margin-bottom: 28px;
      line-height: 1.5;
    }
    ul.bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    ul.bullets li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 17px;
      color: #cbd5e1;
      line-height: 1.5;
    }
    ul.bullets li::before {
      content: "•";
      color: #E05A2B;
      font-size: 24px;
      line-height: 1;
    }
    footer {
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255,255,255,0.08);
      background: rgba(15,15,18,0.85);
    }
    .nav-btn {
      background: #E05A2B;
      color: #fff;
      border: none;
      padding: 10px 22px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      cursor: pointer;
      font-family: monospace;
    }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .counter { font-family: monospace; font-size: 13px; color: #94a3b8; }
  </style>
</head>
<body>
  <header>
    <div class="brand">PROUDLY AFRIKAN • INTERACTIVE DECK</div>
    <div class="topic">${resource.title || 'Curriculum Deck'}</div>
  </header>
  <main class="stage">
    <div class="slide-card" id="slideBox">
      <div>
        <div class="badge" id="slideBadge"></div>
        <h1 id="slideTitle"></h1>
        <p class="subtitle" id="slideSubtitle"></p>
        <ul class="bullets" id="slideBullets"></ul>
      </div>
    </div>
  </main>
  <footer>
    <button class="nav-btn" id="prevBtn">← PREV</button>
    <div class="counter" id="slideCounter"></div>
    <button class="nav-btn" id="nextBtn">NEXT →</button>
  </footer>
  <script>
    const slides = ${JSON.stringify(slides)};
    let cur = 0;
    function render() {
      const s = slides[cur];
      document.getElementById('slideBadge').textContent = 'SLIDE ' + s.slideNumber + ' OF ' + slides.length;
      document.getElementById('slideTitle').textContent = s.title;
      document.getElementById('slideSubtitle').textContent = s.subtitle || '';
      const bContainer = document.getElementById('slideBullets');
      bContainer.innerHTML = '';
      (s.bulletPoints || []).forEach(pt => {
        const li = document.createElement('li');
        li.textContent = pt;
        bContainer.appendChild(li);
      });
      document.getElementById('slideCounter').textContent = (cur + 1) + ' / ' + slides.length;
      document.getElementById('prevBtn').disabled = cur === 0;
      document.getElementById('nextBtn').disabled = cur === slides.length - 1;
    }
    document.getElementById('prevBtn').onclick = () => { if(cur > 0) { cur--; render(); } };
    document.getElementById('nextBtn').onclick = () => { if(cur < slides.length - 1) { cur++; render(); } };
    window.onkeydown = (e) => {
      if(e.key === 'ArrowRight' || e.key === ' ') { if(cur < slides.length - 1) { cur++; render(); } }
      else if(e.key === 'ArrowLeft') { if(cur > 0) { cur--; render(); } }
    };
    render();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(resource.title || 'presentation').toLowerCase().replace(/\s+/g, '-')}-interactive-deck.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bullets = currentSlide.bulletPoints || [];
  const prevSlideItem = activeSlideIndex > 0 ? slides[activeSlideIndex - 1] : null;
  const nextSlideItem = activeSlideIndex < totalSlides - 1 ? slides[activeSlideIndex + 1] : null;

  return (
    <div
      className={`w-full transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] bg-[#0A0A0C] text-white flex flex-col justify-between overflow-hidden'
          : 'space-y-6'
      }`}
    >
      {/* ============================================================== */}
      {/* Top Deck Navigation & Meta Header (Sleek Glass Lozenge)       */}
      {/* ============================================================== */}
      <div
        className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm transition-opacity duration-300 ${
          isFullscreen && !showControlsHud ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${isFullscreen ? 'absolute top-4 left-4 right-4 z-50 bg-[#161619]/90 border-stone-800 text-white' : ''}`}
      >
        {/* Left: Brand Kicker & Slide Progress Segment */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#E05A2B] to-[#D99B00] animate-pulse" />
            <span className="font-mono text-xs font-bold text-stone-900 tracking-wider uppercase">
              {isFullscreen ? 'FULLSCREEN 3D THEATER' : 'INTERACTIVE DECK'}
            </span>
          </div>

          <span className="text-stone-300 font-mono hidden sm:inline">•</span>

          <div className="hidden md:flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-xs font-bold text-[#E05A2B] shrink-0">
              {String(activeSlideIndex + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-xs text-stone-400">/</span>
            <span className="font-mono text-xs text-stone-500 shrink-0">
              {String(totalSlides).padStart(2, '0')}
            </span>
            <span className="text-stone-700 text-xs truncate max-w-[200px] lg:max-w-xs font-medium ml-1">
              — {currentSlide.title}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Stopwatch elapsed timer */}
          <div
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/80 border border-stone-200 text-stone-700 font-mono text-xs cursor-pointer hover:bg-stone-200/60 transition-colors"
            title="Click to pause/resume lecture timer"
          >
            <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-[#E05A2B]' : 'text-stone-400'}`} />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Autoplay Toggle Button with progress ring */}
          <button
            type="button"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              isAutoplay
                ? 'bg-gradient-to-r from-[#E05A2B] to-[#D99B00] text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
            title="Toggle automatic presentation playback (7s per slide)"
          >
            {isAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#E05A2B]" />}
            <span className="hidden sm:inline">{isAutoplay ? 'PLAYING' : 'AUTOPLAY'}</span>
          </button>

          {/* Grid Overview Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowGridModal(true)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
            title="Slide overview grid (G key)"
          >
            <Grid className="w-4 h-4 text-stone-700" />
          </button>

          {/* Speaker Notes Toggle */}
          <button
            type="button"
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showSpeakerNotes
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600'
            }`}
            title="Toggle speaker lecture notes (N key)"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Copy slide text */}
          <button
            type="button"
            onClick={handleCopySlideText}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="Copy current slide text"
          >
            {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Standalone HTML Deck Download */}
          <button
            type="button"
            onClick={handleDownloadStandaloneHtml}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-mono text-xs font-bold cursor-pointer transition-colors"
            title="Download offline HTML presentation deck"
          >
            <Download className="w-3.5 h-3.5 text-[#E05A2B]" />
            <span>EXPORT HTML</span>
          </button>

          {/* WebGL Fluid Toggle */}
          <button
            type="button"
            onClick={() => setEnableWebGL(!enableWebGL)}
            className={`hidden sm:flex px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase items-center gap-1 transition-all cursor-pointer ${
              enableWebGL
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-stone-100 text-stone-500 border border-stone-200'
            }`}
            title="Toggle WebGL fluid movement & surface distortion"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D99B00]" />
            <span>FLUID</span>
          </button>

          {/* 3D Tilt Toggle */}
          <button
            type="button"
            onClick={() => {
              setEnable3DTilt(!enable3DTilt);
              if (enable3DTilt) setTilt({ rx: 0, ry: 0 });
            }}
            className={`hidden sm:flex px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold uppercase items-center gap-1 transition-all cursor-pointer ${
              enable3DTilt
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                : 'bg-stone-100 text-stone-500 border border-stone-200'
            }`}
            title="Toggle 3D card tilt & depth interaction"
          >
            <Layers className="w-3.5 h-3.5 text-[#E05A2B]" />
            <span>3D TILT</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-[#161619] hover:bg-stone-800 text-white shadow-sm transition-all cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen presentation (F key)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-[#D99B00]" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Main 3D Presentation Arena Stage (Max Knight BaVveWM style)   */}
      {/* ============================================================== */}
      <div
        ref={arenaRef}
        onMouseMove={handleMouseMoveArena}
        onMouseLeave={handleMouseLeaveArena}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ perspective: '1200px' }}
        className={`relative w-full rounded-[2.5rem] bg-[#0E0E12] overflow-hidden flex items-center justify-center transition-all ${
          isFullscreen ? 'h-full rounded-none' : 'min-h-[520px] sm:min-h-[580px] lg:min-h-[640px]'
        }`}
      >
        {/* Dynamic WebGL Shader Canvas in Background (Grisum gOEQVMO fluid displacement) */}
        <canvas
          ref={shaderCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-85 z-0"
        />

        {/* Ambient Topographical Overlay Grid & Subtle Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-black/60 pointer-events-none z-1" />

        {/* Left Side 3D Peeking Card (Previous Slide) */}
        {prevSlideItem && (
          <div
            onClick={prevSlide}
            style={{
              transform: `translateX(-68%) translateZ(-160px) rotateY(26deg) scale(0.85)`,
              transformStyle: 'preserve-3d',
            }}
            className="absolute left-0 w-[70%] max-w-[620px] h-[78%] rounded-3xl bg-stone-900/70 backdrop-blur-md border border-stone-700/50 p-8 text-stone-400 hidden md:flex flex-col justify-between cursor-pointer opacity-35 hover:opacity-70 transition-all duration-300 z-10 shadow-2xl"
          >
            <div className="flex items-center justify-between text-xs font-mono text-stone-500 uppercase">
              <span>PREVIOUS</span>
              <span>SLIDE {prevSlideItem.slideNumber}</span>
            </div>
            <div>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-stone-300 line-clamp-2">
                {prevSlideItem.title}
              </h3>
              {prevSlideItem.subtitle && (
                <p className="font-sans text-xs text-stone-400 mt-2 line-clamp-2">
                  {prevSlideItem.subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E05A2B]">
              <ChevronLeft className="w-4 h-4" />
              <span>TAP TO RETURN</span>
            </div>
          </div>
        )}

        {/* Right Side 3D Peeking Card (Next Slide) */}
        {nextSlideItem && (
          <div
            onClick={nextSlide}
            style={{
              transform: `translateX(68%) translateZ(-160px) rotateY(-26deg) scale(0.85)`,
              transformStyle: 'preserve-3d',
            }}
            className="absolute right-0 w-[70%] max-w-[620px] h-[78%] rounded-3xl bg-stone-900/70 backdrop-blur-md border border-stone-700/50 p-8 text-stone-400 hidden md:flex flex-col justify-between cursor-pointer opacity-35 hover:opacity-70 transition-all duration-300 z-10 shadow-2xl"
          >
            <div className="flex items-center justify-between text-xs font-mono text-stone-500 uppercase">
              <span>UP NEXT</span>
              <span>SLIDE {nextSlideItem.slideNumber}</span>
            </div>
            <div>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-stone-300 line-clamp-2">
                {nextSlideItem.title}
              </h3>
              {nextSlideItem.subtitle && (
                <p className="font-sans text-xs text-stone-400 mt-2 line-clamp-2">
                  {nextSlideItem.subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 text-xs font-mono font-bold text-[#D99B00]">
              <span>ADVANCE</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Active Center Slide (Layered 3D Tilt Card with Parallax Depth) */}
        <div
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0px)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.14s ease-out',
          }}
          className={`relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-between min-h-[460px] sm:min-h-[520px] transition-opacity duration-300 ${
            isTransitioning ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'
          }`}
        >
          {/* Card Top: Metadata and Concept Kicker with 3D Depth */}
          <div
            style={{ transform: 'translateZ(30px)' }}
            className="flex items-center justify-between gap-4 pb-4 border-b border-white/10"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#D99B00] px-3 py-1 rounded-full bg-[#D99B00]/15 border border-[#D99B00]/30 shadow-xs">
                {currentSlide.conceptBadge || `TOPIC INSIGHT • SLIDE ${currentSlide.slideNumber}`}
              </span>
              <span className="font-mono text-xs text-stone-400 hidden sm:inline">
                {resource.subject || 'Curriculum Domain'}
              </span>
            </div>

            <div className="font-mono text-xs font-bold text-stone-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E05A2B]" />
              <span>
                {currentSlide.slideNumber} OF {totalSlides}
              </span>
            </div>
          </div>

          {/* Card Middle: Main Pedagogical Content & Visuals */}
          <div
            style={{ transform: 'translateZ(50px)' }}
            className="my-auto py-6 sm:py-8 space-y-6"
          >
            {/* Slide Title with Brand Accent */}
            <div className="space-y-3">
              <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-[1.05] drop-shadow-md">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="font-sans text-base sm:text-xl text-stone-300 max-w-2xl font-normal leading-relaxed">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Bullet Points with High-Legibility Glass Pillars */}
            {bullets.length > 0 && (
              <div className="grid grid-cols-1 gap-3 pt-2">
                {bullets.map((point: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-[#E05A2B]/40 hover:bg-white/[0.1] transition-all flex items-start gap-3.5 group shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#E05A2B] to-[#D99B00] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                      {idx + 1}
                    </div>
                    <span className="font-sans text-sm sm:text-base text-stone-100 font-medium leading-relaxed group-hover:text-white transition-colors">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Visual Cue or Suggested Diagram */}
            {currentSlide.visualCue && (
              <div
                style={{ transform: 'translateZ(25px)' }}
                className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 font-mono text-xs flex items-center gap-2.5 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-[#D99B00] shrink-0" />
                <span className="truncate">
                  Suggested Pedagogical Visual: {currentSlide.visualCue}
                </span>
              </div>
            )}
          </div>

          {/* Card Bottom: Navigation Hints and Slide Dots Progress */}
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-stone-400"
          >
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/10 text-stone-300 font-bold">←</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-stone-300 font-bold">→</span>
              <span>keys or swipe to navigate</span>
            </div>

            {/* Mini Dots indicator */}
            <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => goToSlide(dotIdx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    dotIdx === activeSlideIndex
                      ? 'w-7 bg-gradient-to-r from-[#E05A2B] to-[#D99B00]'
                      : 'w-2 bg-stone-700 hover:bg-stone-500'
                  }`}
                  title={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 font-mono text-xs font-bold text-stone-300">
              <span>{Math.round(((activeSlideIndex + 1) / totalSlides) * 100)}% COMPLETE</span>
            </div>
          </div>
        </div>

        {/* Floating Lateral Navigation Arrows */}
        <button
          type="button"
          disabled={activeSlideIndex === 0}
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:scale-110 hover:border-[#E05A2B] active:scale-95 disabled:opacity-20 disabled:hover:scale-100 transition-all z-30 cursor-pointer shadow-xl"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          type="button"
          disabled={activeSlideIndex >= totalSlides - 1}
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:scale-110 hover:border-[#D99B00] active:scale-95 disabled:opacity-20 disabled:hover:scale-100 transition-all z-30 cursor-pointer shadow-xl"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* Segmented Timeline Rail Bar                                    */}
      {/* ============================================================== */}
      <div className="w-full space-y-2">
        <div className="w-full grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
          {slides.map((s, idx) => {
            const isCurrent = idx === activeSlideIndex;
            const isPassed = idx < activeSlideIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#E05A2B] to-[#D99B00] ring-2 ring-[#E05A2B]/40'
                    : isPassed
                    ? 'bg-stone-800'
                    : 'bg-stone-300 hover:bg-stone-400'
                }`}
                title={`Slide ${idx + 1}: ${s.title}`}
              />
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* Speaker Notes Drawer (Collapsible & Pedagogically Formatted)   */}
      {/* ============================================================== */}
      {showSpeakerNotes && currentSlide.speakerNotes && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/90 border border-amber-200/90 shadow-sm space-y-2 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              <span className="font-mono text-xs font-bold text-amber-900 uppercase tracking-wider">
                Speaker & Lecture Guide • Slide {currentSlide.slideNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSpeakerNotes(false)}
              className="text-amber-800 hover:text-amber-950 font-mono text-xs font-bold"
            >
              Hide Notes
            </button>
          </div>
          <p className="font-sans text-xs sm:text-sm text-amber-950 leading-relaxed">
            {currentSlide.speakerNotes}
          </p>
        </div>
      )}

      {/* ============================================================== */}
      {/* Slide Overview Grid Modal (Triggered by 'G' or Grid Icon)      */}
      {/* ============================================================== */}
      {showGridModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-5xl max-h-[85vh] bg-[#121216] border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col space-y-6 shadow-2xl overflow-hidden text-white">
            {/* Grid Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <Grid className="w-5 h-5 text-[#E05A2B]" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
                  Slide Deck Overview ({totalSlides} Slides)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGridModal(false)}
                className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Items */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pr-1">
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    goToSlide(idx);
                    setShowGridModal(false);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                    idx === activeSlideIndex
                      ? 'border-[#E05A2B] bg-gradient-to-br from-[#1c1410] to-[#121215] shadow-lg ring-2 ring-[#E05A2B]/40'
                      : 'border-stone-800 bg-stone-900/60 hover:border-stone-600 hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                    <span className="font-bold text-[#D99B00]">SLIDE {s.slideNumber}</span>
                    <span className="text-[10px] uppercase truncate max-w-[120px]">
                      {s.conceptBadge || 'CONCEPT'}
                    </span>
                  </div>

                  <h4 className="font-display font-black text-base uppercase text-stone-100 group-hover:text-white line-clamp-2">
                    {s.title}
                  </h4>

                  <p className="font-sans text-xs text-stone-400 line-clamp-2">
                    {s.subtitle || (s.bulletPoints && s.bulletPoints[0]) || ''}
                  </p>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono font-bold text-[#E05A2B]">
                    <span>{(s.bulletPoints || []).length} key takeaways</span>
                    <span>SELECT →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
