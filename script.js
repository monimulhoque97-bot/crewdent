/* =============================================
   CREWDENT — MAIN JAVASCRIPT
   ============================================= */

   'use strict';

   // ---- LOADER ----
   window.addEventListener('load', () => {
     setTimeout(() => {
       const loader = document.getElementById('loader');
       if (loader) {
         loader.classList.add('hidden');
         document.body.classList.remove('loading');
         revealVisible(); // trigger initial reveals
       }
     }, 2000);
   });
   document.body.classList.add('loading');
   
   // ---- CUSTOM CURSOR ----
   const cursor = document.getElementById('cursor');
   const follower = document.getElementById('cursor-follower');
   let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
   
   if (window.matchMedia('(pointer: fine)').matches && cursor && follower) {
     document.addEventListener('mousemove', (e) => {
       mouseX = e.clientX;
       mouseY = e.clientY;
       cursor.style.left = mouseX + 'px';
       cursor.style.top = mouseY + 'px';
     });
   
     function animateFollower() {
       followerX += (mouseX - followerX) * 0.12;
       followerY += (mouseY - followerY) * 0.12;
       follower.style.left = followerX + 'px';
       follower.style.top = followerY + 'px';
       requestAnimationFrame(animateFollower);
     }
     animateFollower();
   
     const hoverEls = document.querySelectorAll('a, button, .service-card, .team-card, .portfolio-img');
     hoverEls.forEach(el => {
       el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
       el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
     });
   }
   
   // ---- PARTICLES ----
   const canvas = document.getElementById('particles-canvas');
   const ctx = canvas ? canvas.getContext('2d') : null;
   let particles = [];
   const PARTICLE_COUNT = 60;
   
   function resizeCanvas() {
     if (!canvas) return;
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
   }
   
   function createParticle() {
     return {
       x: Math.random() * (canvas ? canvas.width : window.innerWidth),
       y: Math.random() * (canvas ? canvas.height : window.innerHeight),
       r: Math.random() * 1.5 + 0.3,
       dx: (Math.random() - 0.5) * 0.3,
       dy: -(Math.random() * 0.4 + 0.1),
       opacity: Math.random() * 0.5 + 0.1,
       color: Math.random() > 0.5 ? '61,126,255' : '139,92,246',
     };
   }
   
   function initParticles() {
     particles = [];
     for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
   }
   
   function drawParticles() {
     if (!ctx || !canvas) return;
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     particles.forEach((p, i) => {
       ctx.beginPath();
       ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
       ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
       ctx.fill();
   
       // draw connecting lines
       particles.forEach((p2, j) => {
         if (j <= i) return;
         const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
         if (dist < 120) {
           ctx.beginPath();
           ctx.moveTo(p.x, p.y);
           ctx.lineTo(p2.x, p2.y);
           ctx.strokeStyle = `rgba(61,126,255,${0.06 * (1 - dist / 120)})`;
           ctx.lineWidth = 0.5;
           ctx.stroke();
         }
       });
   
       p.x += p.dx;
       p.y += p.dy;
       if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
       if (p.x < -10) p.x = canvas.width + 10;
       if (p.x > canvas.width + 10) p.x = -10;
     });
     requestAnimationFrame(drawParticles);
   }
   
   if (canvas && ctx) {
     resizeCanvas();
     initParticles();
     drawParticles();
     window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
   }
   
   // ---- NAVBAR ----
   const navbar = document.getElementById('navbar');
   const hamburger = document.getElementById('hamburger');
   const navLinks = document.getElementById('nav-links');
   const navLinkItems = document.querySelectorAll('.nav-link');
   
   window.addEventListener('scroll', () => {
     if (navbar) {
       navbar.classList.toggle('scrolled', window.scrollY > 40);
     }
     highlightNav();
   });
   
   hamburger && hamburger.addEventListener('click', () => {
     hamburger.classList.toggle('open');
     navLinks && navLinks.classList.toggle('open');
   });
   
   navLinkItems.forEach(link => {
     link.addEventListener('click', () => {
       hamburger && hamburger.classList.remove('open');
       navLinks && navLinks.classList.remove('open');
     });
   });
   
   function highlightNav() {
     const sections = document.querySelectorAll('section[id]');
     let current = '';
     sections.forEach(section => {
       if (window.scrollY >= section.offsetTop - 120) current = section.id;
     });
     navLinkItems.forEach(link => {
       link.classList.toggle('active', link.getAttribute('href') === '#' + current);
     });
   }
   
   // ---- SMOOTH SCROLL ----
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
     anchor.addEventListener('click', (e) => {
       const target = document.querySelector(anchor.getAttribute('href'));
       if (target) {
         e.preventDefault();
         window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
       }
     });
   });
   
   // ---- SCROLL REVEAL ----
   function revealVisible() {
     const reveals = document.querySelectorAll('.reveal-up');
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           entry.target.classList.add('visible');
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
     reveals.forEach(el => observer.observe(el));
   }
   
   // Run on DOMContentLoaded too for elements already in view
   document.addEventListener('DOMContentLoaded', revealVisible);
   
   // ---- TESTIMONIAL CAROUSEL ----
   const track = document.getElementById('testimonial-track');
   const dots = document.querySelectorAll('.dot');
   const prevBtn = document.getElementById('prev-btn');
   const nextBtn = document.getElementById('next-btn');
   let currentSlide = 0;
   let autoSlideTimer;
   
   function goToSlide(index) {
     const total = document.querySelectorAll('.testimonial-slide').length;
     currentSlide = (index + total) % total;
     if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
     dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
   }
   
   function startAutoSlide() {
     clearInterval(autoSlideTimer);
     autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
   }
   
   if (track) {
     prevBtn && prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoSlide(); });
     nextBtn && nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoSlide(); });
     dots.forEach(dot => {
       dot.addEventListener('click', () => { goToSlide(parseInt(dot.dataset.index)); startAutoSlide(); });
     });
     startAutoSlide();
   
     // Touch swipe for mobile
     let startX = 0;
     track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
     track.addEventListener('touchend', e => {
       const diff = startX - e.changedTouches[0].clientX;
       if (Math.abs(diff) > 40) { goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1); startAutoSlide(); }
     });
   }
   
   // ---- CONTACT FORM ----
   const form = document.getElementById('contact-form');
   const formSuccess = document.getElementById('form-success');
   if (form) {
     form.addEventListener('submit', (e) => {
       e.preventDefault();
       // Simulate submission
       const btn = form.querySelector('.btn-primary');
       const originalText = btn.innerHTML;
       btn.innerHTML = 'Sending...';
       btn.disabled = true;
       setTimeout(() => {
         btn.innerHTML = originalText;
         btn.disabled = false;
         if (formSuccess) { formSuccess.style.display = 'block'; }
         form.reset();
         setTimeout(() => { if (formSuccess) formSuccess.style.display = 'none'; }, 4000);
       }, 1500);
     });
   }
   
   // ---- STAT NUMBER COUNTER ----
   function animateCounter(el, target) {
     let start = 0;
     const duration = 2000;
     const step = (timestamp) => {
       if (!start) start = timestamp;
       const progress = Math.min((timestamp - start) / duration, 1);
       const eased = 1 - Math.pow(1 - progress, 3);
       el.textContent = Math.floor(eased * target) + '+';
       if (progress < 1) requestAnimationFrame(step);
     };
     requestAnimationFrame(step);
   }
   
   const statNums = document.querySelectorAll('.stat-num');
   const counterTargets = [50, 30, 8];
   let countersAnimated = false;
   
   function checkCounters() {
     if (countersAnimated) return;
     const hero = document.querySelector('.hero-stats');
     if (!hero) return;
     const rect = hero.getBoundingClientRect();
     if (rect.top < window.innerHeight - 100) {
       countersAnimated = true;
       statNums.forEach((el, i) => animateCounter(el, counterTargets[i]));
       window.removeEventListener('scroll', checkCounters);
     }
   }
   
   window.addEventListener('scroll', checkCounters);
   setTimeout(checkCounters, 2500); // check after loader
   
   // ---- SERVICE CARD TILT EFFECT ----
   document.querySelectorAll('.service-card:not(.service-card--cta)').forEach(card => {
     card.addEventListener('mousemove', (e) => {
       const rect = card.getBoundingClientRect();
       const x = e.clientX - rect.left - rect.width / 2;
       const y = e.clientY - rect.top - rect.height / 2;
       card.style.transform = `translateY(-6px) rotateX(${-y / 30}deg) rotateY(${x / 30}deg)`;
     });
     card.addEventListener('mouseleave', () => {
       card.style.transform = '';
       card.style.transition = 'transform 0.5s ease';
       setTimeout(() => { card.style.transition = ''; }, 500);
     });
   });
   
   // ---- TEAM CARD GLOW ----
   document.querySelectorAll('.team-card').forEach(card => {
     card.addEventListener('mousemove', (e) => {
       const rect = card.getBoundingClientRect();
       const x = ((e.clientX - rect.left) / rect.width) * 100;
       const y = ((e.clientY - rect.top) / rect.height) * 100;
       card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(61,126,255,0.08) 0%, rgba(255,255,255,0.04) 60%)`;
     });
     card.addEventListener('mouseleave', () => {
       card.style.background = '';
     });
   });
   
   // ---- CLOSE MENU ON OUTSIDE CLICK ----
   document.addEventListener('click', (e) => {
     if (navLinks && navLinks.classList.contains('open')) {
       if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
         hamburger && hamburger.classList.remove('open');
         navLinks.classList.remove('open');
       }
     }
   });