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

    // 5. Parallax effect for the Services (Arsenal)
    const serviceRows = document.querySelectorAll('.service-row');
    serviceRows.forEach((row, i) => {
        gsap.from(row, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: row,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    });

});
