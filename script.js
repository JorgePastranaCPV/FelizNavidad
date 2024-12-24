/* Poly Heart model by Quaternius [CC0] (https://creativecommons.org/publicdomain/zero/1.0/) via Poly Pizza (https://poly.pizza/m/1yCRUwFnwX)
 */

import * as THREE from "https://cdn.skypack.dev/three@0.135.0";
import { gsap } from "https://cdn.skypack.dev/gsap@3.8.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.135.0/examples/jsm/loaders/GLTFLoader.js";

// Variables globales para el audio
let audioContext;
let audioElement;
let analyser;
let dataArray;

// Inicializar el audio
function initAudio() {
  audioElement = document.getElementById("background-music");
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaElementSource(audioElement);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 32; // Valor más bajo para mejor rendimiento
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
}

// Inicializar cuando el documento esté listo
document.addEventListener("DOMContentLoaded", initAudio);

class World {
  constructor({
    canvas,
    width,
    height,
    cameraPosition,
    fieldOfView = 75,
    nearPlane = 0.1,
    farPlane = 100,
  }) {
    this.parameters = {
      count: 1500,
      max: 12.5 * Math.PI,
      a: 2,
      c: 4.5,
    };
    this.isMobile = window.innerWidth <= 768;
    this.textureLoader = new THREE.TextureLoader();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x16000a);
    this.clock = new THREE.Clock();
    this.data = 0;
    this.time = { current: 0, t0: 0, t1: 0, t: 0, frequency: 0.0005 };
    this.angle = { x: 0, z: 0 };
    this.width = width || window.innerWidth;
    this.height = height || window.innerHeight;
    this.aspectRatio = this.width / this.height;
    this.fieldOfView = this.isMobile ? 90 : fieldOfView;
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      this.aspectRatio,
      nearPlane,
      farPlane
    );
    const zPosition = this.isMobile ? 6.5 : 4.5;
    this.camera.position.set(cameraPosition.x, cameraPosition.y, zPosition);
    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.timer = 0;
    this.addToScene();
    this.addButton();

    this.render();
    this.listenToResize();
    this.listenToMouseMove();

    // Agregar propiedades para las imágenes
    this.photos = [
      "foto1.jpg",
      "foto2.jpg",
      "foto3.jpg",
      "foto4.jpg",
      "foto5.jpg",
      "foto6.jpg",
      "foto7.jpg",
      "foto8.jpg",
      "foto9.jpg",
      "foto10.jpg",
      "foto11.jpg",
      "foto12.jpg",
      "foto13.jpg",
      "foto14.jpg",
      "foto15.jpg",
      "foto16.jpg",
    ];
    this.currentPhotoIndex = 0;
    this.orbitingPhotos = [];
    this.photoContainer = document.getElementById("photo-container");

    this.loveTexts = [
      "Desde el primer momento que te vi... ❤️",
      "Supe que eras especial 🌟",
      "Cada día junto a ti ha sido mágico 💫",
      "Me enamoré de tu sonrisa ✨",
      "De tu forma de ser 💝",
      "De tu dulzura y bondad 🌸",
      "Me haces muy feliz cada día 💖",
      "Eres mi compañera perfecta 💑",
      "Mi apoyo incondicional 🤗",
      "Mi amor verdadero 💘",
      "Mi presente y mi futuro 🌟",
      "Cada momento contigo es un tesoro 💎",
      "Nuestro amor crece día a día 🌱",
      "Eres mi mayor bendición 🙏",
      "Mi razón de sonreír 😊",
      "Por todo esto y mucho más, ¡Feliz Navidad! 🎄❤️",
    ];
  }
  start() {}
  render() {
    this.renderer.render(this.scene, this.camera);
    this.composer && this.composer.render();
  }
  loop() {
    this.time.elapsed = this.clock.getElapsedTime();
    this.time.delta = Math.min(
      60,
      (this.time.current - this.time.elapsed) * 1000
    );

    if (this.isRunning && analyser) {
      this.time.t = this.time.elapsed - this.time.t0 + this.time.t1;

      // Obtener datos reales del análisis de audio
      analyser.getByteFrequencyData(dataArray);
      const average =
        Array.from(dataArray).reduce((a, b) => a + b, 0) / dataArray.length;
      this.data = average / 256.0; // Normalizar a un rango de 0-1

      // Calcular el tiempo transcurrido desde que empezó la música
      const musicTime = this.time.t % 231; // 3:51 = 231 segundos

      // Diferentes estados de animación basados en el tiempo
      if (musicTime < 30) {
        // Primera fase: Movimiento suave
        this.angle.x += this.time.delta * 0.001 * 0.63;
        this.angle.z += this.time.delta * 0.001 * 0.39;
        this.camera.position.x = Math.sin(this.angle.x) * this.parameters.a;
        this.camera.position.z = Math.min(
          Math.max(Math.cos(this.angle.z) * this.parameters.c, 1.75),
          6.5
        );
      } else if (musicTime < 60) {
        // Segunda fase: Rotación en espiral
        const spiralTime = (musicTime - 30) * 0.1;
        this.camera.position.x =
          Math.sin(spiralTime) * (3 + Math.cos(spiralTime * 0.5));
        this.camera.position.z =
          Math.cos(spiralTime) * (3 + Math.cos(spiralTime * 0.5));
        this.camera.position.y = Math.sin(spiralTime * 0.5) * 0.5;
      } else if (musicTime < 90) {
        // Tercera fase: Latidos al ritmo de la música
        const pulseScale = 1 + this.data * 0.2;
        if (this.model) {
          this.model.scale.set(
            pulseScale * 0.35,
            pulseScale * 0.35,
            pulseScale * 0.35
          );
        }
        // Movimiento de cámara circular suave
        const circleTime = musicTime * 0.05;
        this.camera.position.x = Math.sin(circleTime) * 4;
        this.camera.position.z = Math.cos(circleTime) * 4;
      } else if (musicTime < 120) {
        // Cuarta fase: Movimiento de mariposa
        const t = musicTime * 0.05;
        const butterflyX =
          Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t));
        const butterflyZ =
          Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t));
        this.camera.position.x = butterflyX * 2;
        this.camera.position.z = butterflyZ * 2 + 4;
      } else if (musicTime < 150) {
        // Quinta fase: Zoom in/out con rotación
        const zoomTime = musicTime * 0.03;
        const distance = 4 + Math.sin(zoomTime) * 2;
        this.camera.position.x = Math.sin(zoomTime * 2) * distance;
        this.camera.position.z = Math.cos(zoomTime * 2) * distance;
        this.camera.position.y = Math.cos(zoomTime) * 0.5;
      } else if (musicTime < 180) {
        // Sexta fase: Movimiento en forma de infinito
        const t = musicTime * 0.04;
        const scale = 3;
        this.camera.position.x = Math.sin(t) * scale;
        this.camera.position.z = Math.sin(t) * Math.cos(t) * scale + 4;
      } else if (musicTime < 210) {
        // Séptima fase: Espiral vertical
        const t = musicTime * 0.1;
        this.camera.position.x = Math.sin(t) * 3;
        this.camera.position.z = Math.cos(t) * 3 + 4;
        this.camera.position.y = Math.cos(t * 2) * 0.5;
      } else {
        // Fase final: Volver al movimiento original
        this.angle.x += this.time.delta * 0.001 * 0.63;
        this.angle.z += this.time.delta * 0.001 * 0.39;
        this.camera.position.x = Math.sin(this.angle.x) * this.parameters.a;
        this.camera.position.z = Math.min(
          Math.max(Math.cos(this.angle.z) * this.parameters.c, 1.75),
          6.5
        );
      }

      // Siempre mirar al centro
      this.camera.lookAt(this.scene.position);
    }

    // Actualizar materiales
    if (this.heartMaterial) {
      this.heartMaterial.uniforms.uTime.value +=
        this.time.delta * this.time.frequency * (1 + this.data * 0.2);
    }

    if (this.model) {
      // Rotación del modelo basada en el audio
      const rotationSpeed = 0.0005 * this.time.delta * (1 + this.data);
      this.model.rotation.y -= rotationSpeed;

      // Añadir un ligero movimiento de flotación
      const floatY = Math.sin(this.time.elapsed * 2) * 0.05;
      this.model.position.y = floatY;
    }

    if (this.snowMaterial) {
      this.snowMaterial.uniforms.uTime.value +=
        this.time.delta * 0.0004 * (1 + this.data);
    }

    this.render();
    this.time.current = this.time.elapsed;
    requestAnimationFrame(this.loop.bind(this));

    if (this.isRunning) {
      // Actualizar posiciones de las fotos orbitando
      this.updateOrbitingPhotos();
    }
  }
  listenToResize() {
    window.addEventListener("resize", () => {
      // Update sizes
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Update camera
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }
  listenToMouseMove() {
    window.addEventListener("mousemove", (e) => {
      const x = e.clientX;
      const y = e.clientY;
      gsap.to(this.camera.position, {
        x: gsap.utils.mapRange(0, window.innerWidth, 0.2, -0.2, x),
        y: gsap.utils.mapRange(0, window.innerHeight, 0.2, -0.2, -y),
      });
    });
  }
  addHeart() {
    const scale = this.isMobile ? 0.15 : 0.2;
    this.heartMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById("fragmentShader").textContent,
      vertexShader: document.getElementById("vertexShader").textContent,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: scale },
        uTex: {
          value: new THREE.TextureLoader().load(
            "https://assets.codepen.io/74321/heart.png"
          ),
        },
      },
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });

    const count = this.isMobile ? 1000 : this.parameters.count;
    const scales = new Float32Array(count * 1);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const randoms = new Float32Array(count);
    const randoms1 = new Float32Array(count);
    const colorChoices = [
      "white",
      "red",
      "pink",
      "crimson",
      "hotpink",
      "green",
    ];

    const squareGeometry = new THREE.PlaneGeometry(1, 1);
    this.instancedGeometry = new THREE.InstancedBufferGeometry();
    Object.keys(squareGeometry.attributes).forEach((attr) => {
      this.instancedGeometry.attributes[attr] = squareGeometry.attributes[attr];
    });
    this.instancedGeometry.index = squareGeometry.index;
    this.instancedGeometry.maxInstancedCount = count;

    for (let i = 0; i < count; i++) {
      const phi = Math.random() * Math.PI * 2;
      const i3 = 3 * i;
      randoms[i] = Math.random();
      randoms1[i] = Math.random();
      scales[i] = Math.random() * 0.35;
      speeds[i] = Math.random() * this.parameters.max;
      const colorIndex = Math.floor(Math.random() * colorChoices.length);
      const color = new THREE.Color(colorChoices[colorIndex]);
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    this.instancedGeometry.setAttribute(
      "random",
      new THREE.InstancedBufferAttribute(randoms, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "random1",
      new THREE.InstancedBufferAttribute(randoms1, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "aScale",
      new THREE.InstancedBufferAttribute(scales, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "aSpeed",
      new THREE.InstancedBufferAttribute(speeds, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "aColor",
      new THREE.InstancedBufferAttribute(colors, 3, false)
    );
    this.heart = new THREE.Mesh(this.instancedGeometry, this.heartMaterial);
    this.scene.add(this.heart);
  }
  addToScene() {
    this.addModel();
    this.addHeart();
    this.addSnow();
  }
  async addModel() {
    this.model = await this.loadObj(
      "https://assets.codepen.io/74321/heart.glb"
    );
    const initialScale = this.isMobile ? 0.005 : 0.01;
    const finalScale = this.isMobile ? 0.25 : 0.35;

    this.model.scale.set(initialScale, initialScale, initialScale);
    this.model.material = new THREE.MeshMatcapMaterial({
      matcap: this.textureLoader.load(
        "https://assets.codepen.io/74321/3.png",
        () => {
          gsap.to(this.model.scale, {
            x: finalScale,
            y: finalScale,
            z: finalScale,
            duration: 1.5,
            ease: "Elastic.easeOut",
          });
        }
      ),
      color: "#ff89aC",
    });
    this.scene.add(this.model);
  }
  addButton() {
    this.audioBtn = document.querySelector("button");
    this.audioBtn.addEventListener("click", async () => {
      console.log("Button clicked");

      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        if (audioElement.paused) {
          await audioElement.play();
          this.time.t0 = this.time.elapsed;
          this.data = 0;
          this.isRunning = true;
          gsap.to(this.audioBtn, {
            opacity: 0,
            duration: 1,
            ease: "power1.out",
          });

          // Calculamos el intervalo basado en la duración total
          // 232 segundos / 16 fotos ≈ 14.5 segundos por foto
          // Reducimos a 12 segundos para menos tiempo orbitando
          const intervalTime = 12000; // 12 segundos en milisegundos

          // Comenzar a mostrar fotos
          this.photoInterval = setInterval(() => {
            this.showNextPhoto();
          }, intervalTime);

          // Mostrar la primera foto inmediatamente
          this.showNextPhoto();
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        this.audioBtn.disabled = false;
      }
    });
  }
  loadObj(path) {
    const loader = new GLTFLoader();
    return new Promise((resolve) => {
      loader.load(
        path,
        (response) => {
          resolve(response.scene.children[0]);
        },
        (xhr) => {},
        (err) => {
          console.log(err);
        }
      );
    });
  }
  addSnow() {
    const scale = this.isMobile ? 0.2 : 0.3;
    this.snowMaterial = new THREE.ShaderMaterial({
      fragmentShader: document.getElementById("fragmentShader1").textContent,
      vertexShader: document.getElementById("vertexShader1").textContent,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: scale },
        uTex: {
          value: new THREE.TextureLoader().load(
            "https://assets.codepen.io/74321/heart.png"
          ),
        },
      },
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const count = this.isMobile ? 350 : 550;
    const scales = new Float32Array(count * 1);
    const colors = new Float32Array(count * 3);
    const phis = new Float32Array(count);
    const randoms = new Float32Array(count);
    const randoms1 = new Float32Array(count);
    const colorChoices = ["red", "pink", "hotpink", "green"];

    const squareGeometry = new THREE.PlaneGeometry(1, 1);
    this.instancedGeometry = new THREE.InstancedBufferGeometry();
    Object.keys(squareGeometry.attributes).forEach((attr) => {
      this.instancedGeometry.attributes[attr] = squareGeometry.attributes[attr];
    });
    this.instancedGeometry.index = squareGeometry.index;
    this.instancedGeometry.maxInstancedCount = count;

    for (let i = 0; i < count; i++) {
      const phi = (Math.random() - 0.5) * 10;
      const i3 = 3 * i;
      phis[i] = phi;
      randoms[i] = Math.random();
      randoms1[i] = Math.random();
      scales[i] = Math.random() * 0.35;
      const colorIndex = Math.floor(Math.random() * colorChoices.length);
      const color = new THREE.Color(colorChoices[colorIndex]);
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    this.instancedGeometry.setAttribute(
      "phi",
      new THREE.InstancedBufferAttribute(phis, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "random",
      new THREE.InstancedBufferAttribute(randoms, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "random1",
      new THREE.InstancedBufferAttribute(randoms1, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "aScale",
      new THREE.InstancedBufferAttribute(scales, 1, false)
    );
    this.instancedGeometry.setAttribute(
      "aColor",
      new THREE.InstancedBufferAttribute(colors, 3, false)
    );
    this.snow = new THREE.Mesh(this.instancedGeometry, this.snowMaterial);
    this.scene.add(this.snow);
  }
  showNextPhoto() {
    if (this.currentPhotoIndex >= this.photos.length) return;

    const photo = document.createElement("img");
    photo.src = this.photos[this.currentPhotoIndex];
    photo.className = "photo";

    // Crear texto
    const text = document.createElement("div");
    text.className = "love-text";
    text.textContent =
      this.loveTexts[this.currentPhotoIndex % this.loveTexts.length];

    // Crear wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "photo-wrapper";
    wrapper.appendChild(photo);
    wrapper.appendChild(text);

    wrapper.style.left = `50%`;
    wrapper.style.top = `50%`;
    wrapper.style.transform = `translate(-50%, -50%)`;

    photo.onload = () => {
      this.photoContainer.appendChild(wrapper);

      requestAnimationFrame(() => {
        setTimeout(() => {
          wrapper.classList.add("active");
        }, 50);
      });

      // Aumentamos el tiempo que la foto se muestra grande
      setTimeout(() => {
        wrapper.classList.remove("active");
        wrapper.classList.add("orbiting");

        const orbitData = {
          element: wrapper,
          angle: Math.random() * Math.PI * 2,
          speed: 0.001 + Math.random() * 0.002,
          radius: 300 + Math.random() * 100,
        };

        this.orbitingPhotos.push(orbitData);
        this.updatePhotoPosition(orbitData);
      }, 8000); // Aumentado a 8 segundos antes de comenzar a orbitar
    };

    this.currentPhotoIndex++;
  }

  updatePhotoPosition(photoData) {
    const { element, angle, radius } = photoData;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.6;
    element.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }

  updateOrbitingPhotos() {
    this.orbitingPhotos.forEach((photo) => {
      photo.angle += photo.speed;
      this.updatePhotoPosition(photo);
    });
  }
}

const world = new World({
  canvas: document.querySelector("canvas.webgl"),
  cameraPosition: { x: 0, y: 0, z: 4.5 },
});

world.loop();
