// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Initialize Lenis (Smooth Scrolling)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical', 
        gestureDirection: 'vertical', 
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // 2. Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);

    // 3. GSAP Text Reveal Animations
    // Grab every element with the 'reveal-text' class
    const revealElements = document.querySelectorAll('.reveal-text');
    
    revealElements.forEach((el) => {
        gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
                trigger: el.parentElement, // The parent is the overflow: hidden mask
                start: "top 95%",          // Trigger when the top of the Parent hits 85% of viewport
                toggleActions: "play reverse play reverse", // Re-animate if scrolled up & down
            }
        });
    });

    // 4. Subtle Parallax for Foreign Accents (Japanese / Arabic Backgrounds)
    const kanjiAccents = document.querySelectorAll('.bg-accent-kanji');
    kanjiAccents.forEach((el) => {
        gsap.to(el, {
            y: -150,
            ease: "none",
            scrollTrigger: {
                trigger: el.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    const arabicAccents = document.querySelectorAll('.bg-accent-arabic');
    arabicAccents.forEach((el) => {
        gsap.to(el, {
            y: -250,
            ease: "none",
            scrollTrigger: {
                trigger: el.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    const amazighAccents = document.querySelectorAll('.bg-accent-amazigh');
    amazighAccents.forEach((el) => {
        gsap.to(el, {
            y: -200, // Slightly different speed for variation
            ease: "none",
            scrollTrigger: {
                trigger: el.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // 5. THREE.JS TORN FLAG CLOTH SIMULATION
    (function initFlag() {
        const canvas = document.getElementById('flag-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const rect = canvas.parentElement.getBoundingClientRect();
        const camera = new THREE.PerspectiveCamera(30, rect.width / rect.height, 0.1, 1000);
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(2, 2, 5);
        scene.add(dirLight);

        // Flag geometry - wide horizontal banner
        const flagW = 8;
        const flagH = 1.2;
        const segsX = 80;
        const segsY = 12;
        const geo = new THREE.PlaneGeometry(flagW, flagH, segsX, segsY);

        // Create canvas texture with text
        const texCanvas = document.createElement('canvas');
        texCanvas.width = 2048;
        texCanvas.height = 256;
        const ctx = texCanvas.getContext('2d');

        // Orange background
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(0, 0, texCanvas.width, texCanvas.height);

        // Torn edges - top
        ctx.fillStyle = '#050505';
        for (let x = 0; x < texCanvas.width; x += 8) {
            const h = Math.random() * 18 + 4;
            ctx.fillRect(x, 0, 8, h);
        }
        // Torn edges - bottom
        for (let x = 0; x < texCanvas.width; x += 8) {
            const h = Math.random() * 18 + 4;
            ctx.fillRect(x, texCanvas.height - h, 8, h);
        }

        // Text
        ctx.fillStyle = '#050505';
        ctx.font = '900 90px Inter, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const text = 'SEO  \u2022  GOOGLE ADS  \u2022  META ADS  \u2022  MEDIA BUYING  \u2022  COPYWRITING  \u2022  AEO  \u2022  EMAIL  \u2022  WEB DEV  \u2022  DESIGN';
        ctx.fillText(text, 40, texCanvas.height / 2 + 2);

        // Fabric noise
        const imgData = ctx.getImageData(0, 0, texCanvas.width, texCanvas.height);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 20;
            imgData.data[i] += noise;
            imgData.data[i+1] += noise;
            imgData.data[i+2] += noise;
        }
        ctx.putImageData(imgData, 0, 0);

        const texture = new THREE.CanvasTexture(texCanvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.0,
        });

        const flag = new THREE.Mesh(geo, mat);
        flag.rotation.x = 0.05;
        scene.add(flag);

        // Store original positions for wave animation
        const originalPositions = new Float32Array(geo.attributes.position.array);

        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.015;

            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const ox = originalPositions[i * 3];
                const oy = originalPositions[i * 3 + 1];

                // Normalize x position (0 to 1) for wave intensity
                const nx = (ox + flagW / 2) / flagW;

                // Multiple wave layers for realistic cloth movement
                const wave1 = Math.sin(ox * 2.0 + time * 2.5) * 0.12 * nx;
                const wave2 = Math.sin(ox * 3.5 + oy * 2.0 + time * 3.0) * 0.06 * nx;
                const wave3 = Math.cos(ox * 1.5 + time * 1.8) * 0.04 * nx * nx;
                const ripple = Math.sin(ox * 5.0 + oy * 3.0 + time * 4.0) * 0.02 * nx;

                pos.array[i * 3 + 2] = wave1 + wave2 + wave3 + ripple;

                // Slight Y displacement for fluttering
                pos.array[i * 3 + 1] = oy + Math.sin(ox * 2.0 + time * 2.0) * 0.02 * nx;
            }

            pos.needsUpdate = true;
            geo.computeVertexNormals();
            renderer.render(scene, camera);
        }

        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            const r = canvas.parentElement.getBoundingClientRect();
            camera.aspect = r.width / r.height;
            camera.updateProjectionMatrix();
            renderer.setSize(r.width, r.height);
        });
    })();

    // 6. Staggered reveal for Digital Trades grid
    const tradeCards = document.querySelectorAll('.trade-card');
    tradeCards.forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 60,
            duration: 0.8,
            delay: (i % 3) * 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 92%",
                toggleActions: "play none none reverse"
            }
        });
    });

});
