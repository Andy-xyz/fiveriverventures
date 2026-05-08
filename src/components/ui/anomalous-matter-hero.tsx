import React, { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import logo from "@/assets/logo.svg";
import { TimeDisplay } from "@/components/ui/time-display";

const HERO_TEXT_BOTTOM = "clamp(88px, 10svh, 120px)";

export function GenerativeArtScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;
    const scene = new THREE.Scene();

    // Adjust camera position based on viewport width for mobile
    const isMobile = currentMount.clientWidth < 768;
    const cameraZ = isMobile ? 3.5 : 3;
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = cameraZ;
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // Adjust mesh size for mobile
    const meshSize = isMobile ? 1.1 : 1.2;
    const geometry = new THREE.IcosahedronGeometry(meshSize, 24);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#333333"),
      wireframe: true,
      transparent: true,
      opacity: 0.56
    });
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const basePositions = Float32Array.from(positions.array as ArrayLike<number>);
    const vertexSeeds = new Float32Array(positions.count);
    const direction = new THREE.Vector3();
    const targetRotation = new THREE.Vector2(0, 0);
    const currentRotation = new THREE.Vector2(0, 0);
    let hoverStrength = 0;
    let targetHoverStrength = 0;

    for (let i = 0; i < positions.count; i++) {
      const seededValue = Math.sin(i * 12.9898) * 43758.5453;
      vertexSeeds[i] = seededValue - Math.floor(seededValue);
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -0.16;
    mesh.rotation.y = 0.24;
    scene.add(mesh);

    let frameId: number;
    const animate = (t: number) => {
      const time = t * 0.0004;
      hoverStrength += (targetHoverStrength - hoverStrength) * 0.06;
      currentRotation.lerp(targetRotation, 0.045);

      for (let i = 0; i < positions.count; i++) {
        const index = i * 3;
        const x = basePositions[index];
        const y = basePositions[index + 1];
        const z = basePositions[index + 2];
        direction.set(x, y, z);
        const radius = direction.length();
        direction.normalize();
        const seed = vertexSeeds[i];
        const waveA = Math.sin(direction.x * 4.2 + time * 1.15 + seed * Math.PI * 2);
        const waveB = Math.cos(direction.y * 3.6 - time * 0.9 + seed * 9.0);
        const waveC = Math.sin((direction.z + direction.x) * 3.1 + time * 0.7 + seed * 5.0);
        const displacement = (waveA * 0.075 + waveB * 0.05 + waveC * 0.035) * (1 + hoverStrength * 0.22);
        const scaledRadius = radius * (1 + displacement);
        positions.setXYZ(i, direction.x * scaledRadius, direction.y * scaledRadius, direction.z * scaledRadius);
      }

      positions.needsUpdate = true;
      mesh.rotation.y += 0.0018 + currentRotation.x * 0.015;
      mesh.rotation.x = -0.16 + currentRotation.y * 0.12 + Math.sin(time * 0.9) * 0.04;
      mesh.rotation.z = Math.sin(time * 0.55) * 0.05;
      mesh.scale.setScalar(1 + hoverStrength * 0.035);
      material.opacity = 0.56 - hoverStrength * 0.08 + (Math.sin(time * 1.2) + 1) * 0.015;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate(0);
    const handleResize = () => {
      if (!currentMount) return;
      const isMobile = currentMount.clientWidth < 768;
      camera.position.z = isMobile ? 3.5 : 3;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotation.set(x * 0.35, y * 0.28);
      targetHoverStrength = 1;
    };
    const handlePointerLeave = () => {
      targetRotation.set(0, 0);
      targetHoverStrength = 0;
    };

    window.addEventListener("resize", handleResize);
    currentMount.addEventListener("mousemove", handleMouseMove);
    currentMount.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      currentMount.removeEventListener("mousemove", handleMouseMove);
      currentMount.removeEventListener("mouseleave", handlePointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);
  return <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />;
}
export function AnomalousMatterHero({
  title = "Observation Log: Anomaly 7",
  subtitle = "Matter in a state of constant, beautiful flux.",
  description = "A new form of digital existence has been observed. It responds to stimuli, changes form, and exudes an unknown energy. Further study is required."
}: {
  title?: string;
  subtitle?: string;
  description?: string;
}) {
  return <section role="banner" className="relative w-full h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute top-4 md:top-8 left-0 px-4 md:px-8 z-30">
        <img src={logo} alt="Five Rivers Logo" className="w-32 md:w-48 h-auto object-contain" />
      </div>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="absolute top-4 md:top-8 right-4 md:right-8 z-30 text-xs md:text-sm font-mono tracking-widest uppercase text-foreground hover:opacity-70 transition-opacity cursor-pointer"
      >
        LP Login
      </a>
      <TimeDisplay />

      <a
        href="mailto:andy@fiveriver.vc"
        className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 text-xs md:text-sm font-mono tracking-widest uppercase text-foreground hover:opacity-70 transition-opacity cursor-pointer"
      >
        Contact
      </a>

      <Suspense fallback={<div className="w-full h-full bg-background" />}>
        <GenerativeArtScene />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent z-10" />

      <div className="absolute left-1/2 z-20 w-full max-w-3xl -translate-x-1/2 px-5 text-center" style={{ bottom: HERO_TEXT_BOTTOM }}>
        <div className="animate-fade-in-long">
          <h1 className="text-sm font-mono tracking-widest text-foreground uppercase">
            {title}
          </h1>
          <p className="mt-4 text-3xl md:text-5xl font-bold leading-tight min-h-[1lh]">
            {subtitle}
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-[1.55] text-foreground uppercase">
            {description}
          </p>
        </div>
      </div>
    </section>;
}