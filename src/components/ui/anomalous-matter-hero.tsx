import React, { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import logo from "@/assets/logo.svg";
import { TimeDisplay } from "@/components/ui/time-display";
export function GenerativeArtScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
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
    const geometry = new THREE.IcosahedronGeometry(meshSize, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          value: 0
        },
        pointLightPosition: {
          value: new THREE.Vector3(0, 0, 5)
        },
        color: {
          value: new THREE.Color("#333333")
        }
      },
      vertexShader: `
                precision highp float;
                uniform float time;
                varying vec3 vWorldNormal;
                varying vec3 vWorldPosition;
                
                // Perlin Noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    vec4 x = x_ * ns.x + ns.yyyy;
                    vec4 y = y_ * ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    vec4 s0 = floor(b0) * 2.0 + 1.0;
                    vec4 s1 = floor(b1) * 2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
                    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
                }

                void main() {
                    float displacement = snoise(position * 2.0 + time * 0.5) * 0.2;
                    vec3 displacedPosition = position + normal * displacement;
                    vec4 worldPosition = modelMatrix * vec4(displacedPosition, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    vWorldNormal = normalize(mat3(modelMatrix) * normal);
                    gl_Position = projectionMatrix * viewMatrix * worldPosition;
                }`,
      fragmentShader: `
                precision highp float;
                uniform vec3 color;
                uniform vec3 pointLightPosition;
                varying vec3 vWorldNormal;
                varying vec3 vWorldPosition;
                
                void main() {
                    vec3 normal = normalize(vWorldNormal);
                    vec3 lightDir = normalize(pointLightPosition - vWorldPosition);
                    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                    float diffuse = max(dot(normal, lightDir), 0.0);
                    float ambient = 0.38;
                    
                    float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
                    fresnel = pow(fresnel, 2.0);
                    
                    vec3 finalColor = color * (ambient + diffuse * 0.72 + fresnel * 0.22);
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }`,
      wireframe: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    lightRef.current = pointLight;
    scene.add(pointLight);
    let frameId: number;
    const animate = (t: number) => {
      material.uniforms.time.value = t * 0.0003;
      mesh.rotation.y += 0.0005;
      mesh.rotation.x += 0.0002;
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
    };
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(dist));
      if (lightRef.current) {
        lightRef.current.position.copy(pos);
        material.uniforms.pointLightPosition.value = pos;
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
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

      <div className="absolute left-1/2 bottom-[72px] md:bottom-[108px] lg:bottom-[132px] z-20 w-full max-w-3xl -translate-x-1/2 px-5 text-center">
        <div className="animate-fade-in-long">
          <h1 className="text-sm font-mono tracking-widest text-foreground uppercase">
            {title}
          </h1>
          <p className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
            {subtitle}
          </p>
          <p className="mt-10 max-w-xl mx-auto text-base leading-relaxed text-foreground uppercase">
            {description}
          </p>
        </div>
      </div>
    </section>;
}