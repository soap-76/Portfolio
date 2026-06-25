/* ============================================
   PORTFOLIO — JÉRÉMY DEZOÏDE
   Scripts : Data Loading, Rendering, Canvas, Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // =============================================
  // 0. LOAD DATA & RENDER
  // =============================================
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      renderPortfolio(data);
      initAnimations(data);
    })
    .catch(err => {
      console.error('Erreur de chargement de data.json:', err);
    });

  // =============================================
  // RENDER FUNCTIONS
  // =============================================
  function renderPortfolio(data) {
    renderHero(data);
    renderAbout(data);
    renderSkills(data);
    renderProjects(data);
    renderExperience(data);
    renderCertifications(data);
    renderContact(data);
    renderFooter(data);
  }

  // ---------- HERO ----------
  function renderHero(data) {
    const p = data.personal;

    // Nav logo
    const navLogo = document.getElementById('nav-logo-text');
    if (navLogo) {
      const first = (p.firstName || '').charAt(0).toLowerCase();
      const last = (p.lastName || '').toLowerCase();
      navLogo.textContent = first + last;
    }

    // Badge
    const badge = document.getElementById('hero-badge-text');
    if (badge) badge.textContent = p.badgeText || '';

    // Name
    const firstName = document.getElementById('hero-first-name');
    const lastName = document.getElementById('hero-last-name');
    if (firstName) firstName.textContent = p.firstName || '';
    if (lastName) lastName.textContent = p.lastName || '';

    // Description
    const desc = document.getElementById('hero-description');
    if (desc) desc.textContent = p.description || '';

    // Page title
    document.title = `${p.firstName} ${p.lastName} — ${p.title}`;
  }

  // ---------- ABOUT ----------
  function renderAbout(data) {
    const a = data.about;

    // Photo / Avatar
    const frame = document.querySelector('#about .about-image-frame');
    if (frame) {
      if (a.photo) {
        frame.innerHTML = `<img src="${a.photo}" alt="${data.personal.firstName || ''} ${data.personal.lastName || ''}" />`;
      } else {
        frame.innerHTML = `<div class="about-avatar-placeholder">👨‍💻</div>`;
      }
    }

    // Title
    const title = document.getElementById('about-title');
    if (title) title.textContent = a.title || '';

    // Paragraphs
    const paragraphs = document.getElementById('about-paragraphs');
    if (paragraphs && a.paragraphs) {
      paragraphs.innerHTML = a.paragraphs.map(p => `<p>${p}</p>`).join('');
    }

    // Terminal decoration
    const terminal = document.getElementById('about-terminal');
    if (terminal && a.terminal) {
      const commandLines = a.terminal.map(t =>
        `<span class="line"><span class="prompt-sign">$</span> ${t.command}</span>
         <span class="line" style="color: #00ff88;">${t.output}</span>`
      ).join('');
      
      const cursorLine = `<span class="line"><span class="prompt-sign">$</span> <span class="terminal-cursor"></span></span>`;
      terminal.innerHTML = commandLines + cursorLine;
    }

    // Stats
    const stats = document.getElementById('about-stats');
    if (stats && a.stats) {
      stats.innerHTML = a.stats.map(s =>
        `<div class="stat-item">
          <div class="stat-number" data-count="${s.value}" data-suffix="${s.suffix || ''}">0</div>
          <div class="stat-label">${s.label}</div>
        </div>`
      ).join('');
    }
  }

  // ---------- SKILLS ----------
  function renderSkills(data) {
    const grid = document.getElementById('skills-grid');
    if (!grid || !data.skills) return;

    grid.innerHTML = data.skills.map((cat, i) =>
      `<div class="skill-category reveal reveal-delay-${i + 1}">
        <div class="skill-category-icon ${cat.colorClass}">${cat.icon}</div>
        <h3>${cat.category}</h3>
        <div class="skill-tags">
          ${cat.items.map((skill, j) =>
            `<div class="skill-tag-wrapper">
              <button class="skill-tag ${cat.colorClass}" data-cat="${i}" data-skill="${j}">
                ${skill.name}
                ${skill.subSkills && skill.subSkills.length ? '<span class="skill-tag-chevron">›</span>' : ''}
              </button>
              ${skill.subSkills && skill.subSkills.length ?
                `<div class="skill-sub-panel" id="sub-${i}-${j}">
                  ${skill.subSkills.map(sub => `<span class="skill-sub-tag ${cat.colorClass}">${sub}</span>`).join('')}
                </div>` : ''}
            </div>`
          ).join('')}
        </div>
      </div>`
    ).join('');

    // Toggle sub-skills on click
    grid.querySelectorAll('.skill-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const catIdx = tag.dataset.cat;
        const skillIdx = tag.dataset.skill;
        const panel = document.getElementById(`sub-${catIdx}-${skillIdx}`);
        if (!panel) return;

        const isOpen = tag.classList.contains('active');

        // Close all open panels in same category
        tag.closest('.skill-category').querySelectorAll('.skill-tag.active').forEach(t => {
          t.classList.remove('active');
          const p = document.getElementById(`sub-${t.dataset.cat}-${t.dataset.skill}`);
          if (p) p.classList.remove('open');
        });

        if (!isOpen) {
          tag.classList.add('active');
          panel.classList.add('open');
        }
      });
    });
  }

  // ---------- PROJECTS ----------
  function renderProjects(data) {
    const grid = document.getElementById('projects-grid');
    if (!grid || !data.projects) return;

    grid.innerHTML = data.projects.map((proj, i) => {
      const coverStyle = proj.cover 
        ? `background-image: url('${proj.cover}'); background-size: cover; background-position: center;` 
        : `background: ${proj.gradient};`;
      const innerContent = proj.cover ? '' : proj.icon;

      return `<div class="project-card reveal reveal-delay-${(i % 4) + 1}">
        <div class="project-image">
          <div class="project-image-inner" style="${coverStyle}">
            ${innerContent}
          </div>
          <div class="project-overlay"></div>
          <div class="project-tags">
            ${proj.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="project-body">
          <h3 class="project-title">
            ${proj.title}
            <span class="arrow">→</span>
          </h3>
          <p class="project-description">${proj.description}</p>
          <div class="project-tech-stack">
            ${proj.techStack.map(t => `<span class="tech-badge">${t}</span>`).join('')}
          </div>
        </div>
      </div>`;
    }).join('');

    // Attach click events for project detail modal
    const cards = grid.querySelectorAll('.project-card');
    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        openProjectModal(data.projects[idx]);
      });
    });
  }

  // ---------- PROJECT DETAIL MODAL ----------
  function openProjectModal(proj) {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Build modal markup
    const overlay = document.createElement('div');
    overlay.className = 'project-modal-overlay';

    // Tags
    const tagsHTML = (proj.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('');
    
    // Tech badges
    const techHTML = (proj.techStack || []).map(t => `<span class="tech-badge">${t}</span>`).join('');

    // Missions list
    let missionsHTML = '';
    if (proj.missions && proj.missions.length > 0) {
      missionsHTML = `
        <div class="project-modal-section">
          <h4 class="project-modal-section-title">Missions menées</h4>
          <ul class="project-modal-list">
            ${proj.missions.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>`;
    }

    // Results list
    let resultsHTML = '';
    if (proj.results && proj.results.length > 0) {
      resultsHTML = `
        <div class="project-modal-section">
          <h4 class="project-modal-section-title">Résultats obtenus</h4>
          <div class="project-results-container">
            ${proj.results.map(r => `
              <div class="project-result-card">
                <span class="project-result-icon">✨</span>
                <span class="project-result-text">${r}</span>
              </div>
            `).join('')}
          </div>
        </div>`;
    }

    // Context section
    let contextHTML = '';
    if (proj.context) {
      contextHTML = `
        <div class="project-modal-section">
          <h4 class="project-modal-section-title">Contexte du projet</h4>
          <p class="project-modal-text">${proj.context}</p>
        </div>`;
    }

    // Diagram section
    let diagramHTML = '';
    if (proj.diagram) {
      diagramHTML = `
        <div class="project-modal-section">
          <h4 class="project-modal-section-title">Architecture / Schéma Réseau</h4>
          <div class="project-modal-diagram" title="Cliquer pour agrandir le schéma">
            <img src="${proj.diagram}" alt="Schéma d'architecture de ${proj.title}" />
          </div>
        </div>`;
    }

    // Challenges section
    let challengesHTML = '';
    if (proj.challenges) {
      challengesHTML = `
        <div class="project-modal-section">
          <h4 class="project-modal-section-title">Défis techniques</h4>
          <div class="project-modal-challenges">${proj.challenges}</div>
        </div>`;
    }

    overlay.innerHTML = `
      <div class="project-modal">
        <div class="project-modal-header">
          <div class="project-modal-header-info">
            <div class="project-tags">
              ${tagsHTML}
            </div>
            <h3 class="project-modal-title">${proj.title}</h3>
          </div>
          <button class="project-modal-close" aria-label="Fermer">✕</button>
        </div>
        <div class="project-modal-body">
          ${contextHTML}
          ${diagramHTML}
          ${missionsHTML}
          ${resultsHTML}
          ${challengesHTML}
          <div class="project-modal-tech">
            ${techHTML}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    // Close function
    function closeModal() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        overlay.remove();
      }, 400); // match CSS transition duration
    }

    // Event listeners
    overlay.querySelector('.project-modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Event listener for zoomable diagram
    const diagEl = overlay.querySelector('.project-modal-diagram');
    if (diagEl) {
      diagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(proj.diagram, `Schéma d'architecture — ${proj.title}`);
      });
    }

    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeLbActive();
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Helper to close lightbox if open when hitting escape
    function closeLbActive() {
      const activeLb = document.querySelector('.lightbox-overlay');
      if (activeLb) {
        activeLb.querySelector('.lightbox-close').click();
      }
    }
  }

  // ---------- LIGHTBOX FOR DIAGRAMS ----------
  function openLightbox(imgSrc, titleText) {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    const lb = document.createElement('div');
    lb.className = 'lightbox-overlay';
    lb.innerHTML = `
      <div class="lightbox-content">
        <img src="${imgSrc}" alt="${titleText}" />
        <p class="lightbox-title">${titleText}</p>
        <button class="lightbox-close" aria-label="Fermer">✕</button>
      </div>
    `;
    document.body.appendChild(lb);

    requestAnimationFrame(() => {
      lb.classList.add('active');
    });

    const closeLb = () => {
      lb.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        lb.remove();
      }, 300);
    };

    lb.querySelector('.lightbox-close').addEventListener('click', closeLb);
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.classList.contains('lightbox-content')) {
        closeLb();
      }
    });

    const handleLbEsc = (e) => {
      if (e.key === 'Escape') {
        closeLb();
        document.removeEventListener('keydown', handleLbEsc);
      }
    };
    document.addEventListener('keydown', handleLbEsc);
  }


  // ---------- EXPERIENCE ----------
  function renderExperience(data) {
    const timeline = document.getElementById('timeline');
    if (!timeline || !data.experience) return;

    timeline.innerHTML = data.experience.map(exp =>
      `<div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <span class="timeline-date">${exp.date}</span>
        <div class="timeline-card">
          <h3 class="timeline-role">${exp.role}</h3>
          <p class="timeline-company">${exp.company} — ${exp.location}</p>
          <ul class="timeline-description">
            ${exp.tasks.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      </div>`
    ).join('');
  }

  // ---------- CERTIFICATIONS ----------
  function renderCertifications(data) {
    const grid = document.getElementById('certifications-grid');
    if (!grid || !data.certifications) return;

    grid.innerHTML = data.certifications.map((cert, i) =>
      `<div class="cert-card reveal reveal-delay-${(i % 3) + 1}">
        <div class="cert-icon">${cert.icon}</div>
        <h3 class="cert-name">${cert.name}</h3>
        <p class="cert-issuer">${cert.issuer}</p>
      </div>`
    ).join('');
  }

  // ---------- CONTACT ----------
  function renderContact(data) {
    const p = data.personal;
    const c = data.contact;

    const title = document.getElementById('contact-title');
    if (title) title.textContent = c.title || '';

    const desc = document.getElementById('contact-description');
    if (desc) desc.textContent = c.description || '';

    const links = document.getElementById('contact-links');
    if (links) {
      links.innerHTML = `
        <a href="mailto:${p.email}" class="contact-link">
          <span class="contact-link-icon">✉️</span>
          ${p.email}
        </a>
        <a href="${p.linkedin}" class="contact-link" target="_blank" rel="noopener">
          <span class="contact-link-icon">💼</span>
          LinkedIn
        </a>
        <a href="${p.github}" class="contact-link" target="_blank" rel="noopener">
          <span class="contact-link-icon">⚡</span>
          GitHub
        </a>`;
    }
  }

  // ---------- FOOTER ----------
  function renderFooter(data) {
    const p = data.personal;
    const year = new Date().getFullYear();

    const text = document.getElementById('footer-text');
    if (text) text.textContent = `© ${year} ${p.firstName} ${p.lastName} — Tous droits réservés - L'ésthétique de ce site a été réalisée via intelligence artificielle (IA)`;

    const links = document.getElementById('footer-links');
    if (links) {
      links.innerHTML = `
        <a href="${p.github}" target="_blank" rel="noopener" aria-label="GitHub">⚡</a>
        <a href="${p.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">💼</a>
        <a href="mailto:${p.email}" aria-label="Email">✉️</a>`;
    }
  }

  // =============================================
  // INIT ANIMATIONS (called after render)
  // =============================================
  function initAnimations(data) {
    initCanvas();
    initTyping(data.typingStrings || []);
    initNavbar();
    initMobileNav();
    initScrollReveal();
    initStatCounters();
    initContactForm();
    initSmoothScroll();
  }

  // =============================================
  // 1. NETWORK CANVAS ANIMATION
  // =============================================
  function initCanvas() {
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    const PARTICLE_COUNT = 80;
    const CONNECTION_DISTANCE = 150;
    const MOUSE_RADIUS = 200;
    let mouse = { x: null, y: null };

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.isNode = Math.random() > 0.7;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            this.vx += (dx / dist) * force * 0.02;
            this.vy += (dy / dist) * force * 0.02;
          }
        }

        this.vx *= 0.999;
        this.vy *= 0.999;
      }

      draw() {
        ctx.beginPath();
        if (this.isNode) {
          ctx.arc(this.x, this.y, this.radius + 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity * 0.15})`;
          ctx.fill();
        } else {
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 136, ${this.opacity * 0.6})`;
          ctx.fill();
        }
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    }

    function drawDataPackets() {
      const time = Date.now() * 0.001;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE * 0.6 && particles[i].isNode && particles[j].isNode) {
            const t = (Math.sin(time + i * 0.5) + 1) / 2;
            const px = particles[i].x + dx * t;
            const py = particles[i].y + dy * t;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
            ctx.fill();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      drawDataPackets();
      animationId = requestAnimationFrame(animate);
    }

    function init() {
      resizeCanvas();
      particles = [];
      const count = window.innerWidth < 768 ? 40 : PARTICLE_COUNT;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
      animate();
    }

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animationId);
      init();
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    init();
  }

  // =============================================
  // 2. TYPING EFFECT
  // =============================================
  function initTyping(strings) {
    const typedElement = document.getElementById('typed-text');
    if (!typedElement || strings.length === 0) return;

    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typeWriter() {
      const current = strings[stringIndex];

      if (isDeleting) {
        typedElement.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40;
      } else {
        typedElement.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 80;
      }

      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        typingSpeed = 2000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        stringIndex = (stringIndex + 1) % strings.length;
        typingSpeed = 500;
      }

      setTimeout(typeWriter, typingSpeed);
    }

    typeWriter();
  }

  // =============================================
  // 3. NAVBAR SCROLL EFFECT
  // =============================================
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // =============================================
  // 4. MOBILE NAVIGATION
  // =============================================
  function initMobileNav() {
    const burger = document.querySelector('.nav-burger');
    const navMenu = document.querySelector('.nav-links');

    if (burger) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
      });

      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          burger.classList.remove('active');
          navMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  // =============================================
  // 5. SCROLL REVEAL ANIMATIONS
  // =============================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }


  // =============================================
  // 7. STAT COUNTER ANIMATION
  // =============================================
  function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const finalValue = parseInt(target.dataset.count);
          const suffix = target.dataset.suffix || '';
          let current = 0;
          const increment = finalValue / 60;
          const timer = setInterval(() => {
            current += increment;
            if (current >= finalValue) {
              current = finalValue;
              clearInterval(timer);
            }
            target.textContent = Math.floor(current) + suffix;
          }, 25);
          counterObserver.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  // =============================================
  // 8. CONTACT FORM
  // =============================================
  function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn-submit');
        const originalText = btn.textContent;
        btn.textContent = '✓ Message envoyé !';
        btn.style.background = 'linear-gradient(135deg, #00ff88, #00d4ff)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          contactForm.reset();
        }, 3000);
      });
    }
  }

  // =============================================
  // 9. SMOOTH SCROLL
  // =============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

});
