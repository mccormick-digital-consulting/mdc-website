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

    // 5. THREE.JS WAR-TORN SCROLLING FLAG
    (function initFlag() {
        const canvas = document.getElementById('flag-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const rect = canvas.parentElement.getBoundingClientRect();
        const camera = new THREE.OrthographicCamera(
            -rect.width / rect.height * 1.5, rect.width / rect.height * 1.5,
            1.5, -1.5, 0.1, 100
        );
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x050505, 1);

        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(3, 2, 5);
        scene.add(dirLight);

        // Flag fills entire viewport width with extra for scrolling
        const aspect = rect.width / rect.height;
        const flagH = 2.8;
        const flagW = aspect * flagH * 3; // 3x viewport width for seamless scroll
        const segsX = 200;
        const segsY = 30;
        const geo = new THREE.PlaneGeometry(flagW, flagH, segsX, segsY);

        // --- SCROLLING TEXTURE (extra wide for seamless tiling) ---
        const texW = 8192;
        const texH = 1024;
        const texCanvas = document.createElement('canvas');
        texCanvas.width = texW;
        texCanvas.height = texH;
        const ctx = texCanvas.getContext('2d');

        // Orange base
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(0, 0, texW, texH);

        // Torn edges top + bottom (ragged cloth edges)
        ctx.fillStyle = '#050505';
        for (let x = 0; x < texW; x += 4) {
            ctx.fillRect(x, 0, 4, Math.random() * 40 + 8);
            ctx.fillRect(x, texH - (Math.random() * 40 + 8), 4, 55);
        }

        // Single line of text - each word fills top to bottom of flag
        ctx.fillStyle = '#050505';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';

        // English trade words (primary) + multilingual sprinkles
        const engWords = [
            'SEO', 'AEO', 'MEDIA BUYING', 'COPYWRITING', 'GOOGLE ADS', 'BING ADS',
            'META ADS', 'SOCIAL MEDIA', 'BOOKKEEPING', 'GRAPHIC DESIGN', 'EXCEL',
            'EMAIL MARKETING', 'WEB DEV', 'CONTENT', 'VIRTUAL ASSISTANT'
        ];
        const foreignWords = [
            '\u062A\u0633\u0648\u064A\u0642',           // Arabic: Marketing
            '\u30C7\u30B6\u30A4\u30F3',                   // Japanese: Design
            '\u8425\u9500',                                 // Chinese: Marketing
            '\u2D5C\u2D30\u2D4E\u2D53\u2D54\u2D5C',       // Berber: Commerce
            '\u041C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433', // Ukrainian: Marketing
            '\u5E83\u544A',                                 // Japanese: Advertising
            '\u0625\u0639\u0644\u0627\u0646\u0627\u062A', // Arabic: Ads
            '\u7F51\u7AD9',                                 // Chinese: Website
            '\u0420\u0435\u043A\u043B\u0430\u043C\u0430', // Ukrainian: Advertising
            '\u5275\u9020',                                 // Japanese: Creation
        ];

        // Build repeating strip with foreign words sprinkled in
        const allWords = [];
        for (let rep = 0; rep < 3; rep++) {
            for (let w = 0; w < engWords.length; w++) {
                allWords.push(engWords[w]);
                if (w % 3 === 2) {
                    allWords.push(foreignWords[(w + rep * 3) % foreignWords.length]);
                }
            }
        }

        // Single row - text sized to fill flag height (top to bottom)
        ctx.font = '900 ' + Math.floor(texH * 0.55) + 'px Inter, Arial, sans-serif';
        let xPos = 30;
        for (const word of allWords) {
            ctx.fillText(word, xPos, texH * 0.52);
            xPos += ctx.measureText(word).width + 80;
            ctx.font = '900 ' + Math.floor(texH * 0.35) + 'px Inter, Arial, sans-serif';
            ctx.fillText('\u2022', xPos - 55, texH * 0.52);
            ctx.font = '900 ' + Math.floor(texH * 0.55) + 'px Inter, Arial, sans-serif';
        }

        // Fabric noise texture
        const imgData = ctx.getImageData(0, 0, texW, texH);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 18;
            imgData.data[i] += noise;
            imgData.data[i+1] += noise;
            imgData.data[i+2] += noise;
        }
        ctx.putImageData(imgData, 0, 0);

        const texture = new THREE.CanvasTexture(texCanvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);

        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            roughness: 0.85,
            metalness: 0.0,
        });

        const flag = new THREE.Mesh(geo, mat);
        flag.rotation.x = 0.06;
        scene.add(flag);

        const originalPositions = new Float32Array(geo.attributes.position.array);
        let time = 0;

        function animate() {
            requestAnimationFrame(animate);
            time += 0.012;

            // Scroll the texture horizontally (slow)
            texture.offset.x = (time * 0.015) % 1.0;

            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const ox = originalPositions[i * 3];
                const oy = originalPositions[i * 3 + 1];
                const nx = (ox + flagW / 2) / flagW;

                // Deep rolling waves
                const wave1 = Math.sin(ox * 1.8 + time * 2.2) * 0.15;
                const wave2 = Math.sin(ox * 3.0 + oy * 2.5 + time * 2.8) * 0.08;
                const wave3 = Math.cos(ox * 1.2 + time * 1.5) * 0.06;
                const ripple = Math.sin(ox * 6.0 + oy * 4.0 + time * 4.5) * 0.025;

                pos.array[i * 3 + 2] = wave1 + wave2 + wave3 + ripple;
                pos.array[i * 3 + 1] = oy + Math.sin(ox * 1.5 + time * 1.8) * 0.03;
            }

            pos.needsUpdate = true;
            geo.computeVertexNormals();
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            const r = canvas.parentElement.getBoundingClientRect();
            const a = r.width / r.height;
            camera.left = -a * 1.5;
            camera.right = a * 1.5;
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
