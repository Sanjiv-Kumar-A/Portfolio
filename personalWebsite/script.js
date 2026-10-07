/* ==========================================================================
   SANJIV KUMAR A — INTERACTIVE ENGINE & ANIMATIONS (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. INITIALIZE AUDIO SYNTH (Web Audio API)
    // ----------------------------------------------------------------------
    let audioCtx = null;
    let soundEnabled = true;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
    }

    function playSynthTone(freq = 440, type = 'sine', duration = 0.08) {
        if (!soundEnabled) return;
        try {
            initAudio();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Silence if audio context is restricted
        }
    }

    // Sound toggle button listener
    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (soundEnabled) {
                soundIcon.className = 'fa-solid fa-volume-high';
                showToast('Audio SFX Enabled 🔊');
                playSynthTone(587.33, 'sine', 0.1);
            } else {
                soundIcon.className = 'fa-solid fa-volume-xmark';
                showToast('Audio SFX Muted 🔇');
            }
        });
    }

    // Add sound feedback on buttons & links
    document.querySelectorAll('.btn, .nav-link, .filter-btn, .cert-card, .icon-btn').forEach(el => {
        el.addEventListener('mouseenter', () => playSynthTone(523.25, 'sine', 0.04));
        el.addEventListener('click', () => playSynthTone(659.25, 'triangle', 0.08));
    });

    // ----------------------------------------------------------------------
    // 2. CANVAS NEURAL CONSTELLATION BACKGROUND
    // ----------------------------------------------------------------------
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = Math.min(Math.floor(width / 18), 75);
        let mouse = { x: null, y: null, radius: 150 };

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = (Math.random() - 0.5) * 0.8;
                this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, ' : 'rgba(99, 102, 241, ';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;

                // Mouse interaction
                if (mouse.x && mouse.y) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        this.x -= (dx / dist) * force * 2;
                        this.y -= (dy / dist) * force * 2;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + '0.7)';
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 130) {
                        const alpha = 1 - (dist / 130);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 243, 255, ${alpha * 0.25})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    // ----------------------------------------------------------------------
    // 3. NAVBAR SCROLL & READING PROGRESS BAR
    // ----------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (scrollProgress) {
            scrollProgress.style.width = scrolled + '%';
        }

        if (winScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            hamburgerBtn.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                hamburgerBtn.classList.remove('active');
            });
        });
    }

    // Nav Active Link Observer
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
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

    // ----------------------------------------------------------------------
    // 4. DARK / LIGHT THEME TOGGLE
    // ----------------------------------------------------------------------
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            showToast(`Switched to ${newTheme.toUpperCase()} theme 🌓`);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-moon';
        } else {
            themeIcon.className = 'fa-solid fa-sun';
        }
    }

    // ----------------------------------------------------------------------
    // 5. TYPING ANIMATION IN HERO
    // ----------------------------------------------------------------------
    const typingEl = document.getElementById('typing-text');
    if (typingEl) {
        const phrases = [
            'AI & Machine Learning Engineer',
            'Oracle Agentic AI Certified Specialist',
            'ICPC Competitive Programmer',
            'Srinivasa Ramanujan Math Awardee',
            'Japanese Language N5 Practitioner',
            'Problem Solver & Continuous Learner'
        ];
        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;

        function typeLoop() {
            const currentPhrase = phrases[phraseIdx];
            if (isDeleting) {
                typingEl.textContent = currentPhrase.substring(0, charIdx - 1);
                charIdx--;
            } else {
                typingEl.textContent = currentPhrase.substring(0, charIdx + 1);
                charIdx++;
            }

            let typeSpeed = isDeleting ? 40 : 80;

            if (!isDeleting && charIdx === currentPhrase.length) {
                typeSpeed = 2200; // Pause at full phrase
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                typeSpeed = 500;
            }

            setTimeout(typeLoop, typeSpeed);
        }
        typeLoop();
    }

    // ----------------------------------------------------------------------
    // 6. SCROLL-TRIGGERED NUMBER COUNTER ANIMATIONS
    // ----------------------------------------------------------------------
    const counters = document.querySelectorAll('.counter, .stat-value[data-count]');
    let counted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseFloat(target.getAttribute('data-count') || target.getAttribute('data-target'));
                const decimals = parseInt(target.getAttribute('data-decimals') || '0', 10);
                
                if (!isNaN(endVal)) {
                    animateValue(target, 0, endVal, 1800, decimals);
                }
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateValue(obj, start, end, duration, decimals = 0) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = progress * (end - start) + start;
            obj.textContent = current.toFixed(decimals);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = end.toFixed(decimals);
            }
        };
        window.requestAnimationFrame(step);
    }

    // ----------------------------------------------------------------------
    // 7. SKILLS FILTER TABS
    // ----------------------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            skillCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || filter === category) {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeIn 0.4s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 8. CERTIFICATE MODAL PREVIEWS
    // ----------------------------------------------------------------------
    const certModalData = {
        oracle: {
            title: 'Oracle Agentic AI Certification',
            issuer: 'Oracle Corporation',
            date: '2026',
            description: 'Comprehensive certification verifying knowledge in building autonomous agentic AI architectures, LLM tool integration, prompt engineering, multi-agent orchestrations, and real-world deployment.',
            tags: ['Oracle Certified', 'Agentic AI', 'Multi-Agent Workflows', 'LLMs'],
            icon: 'fa-solid fa-brain'
        },
        srmc: {
            title: 'Srinivasa Ramanujan Mathematical Competition',
            issuer: 'SRMC Examination Board',
            date: 'Levels 1, 2 & 3 Cleared',
            description: 'Cleared three consecutive levels of the Srinivasa Ramanujan Mathematical Competition, demonstrating advanced mathematical problem-solving, logical deduction, discrete math concepts, and analytical rigor.',
            tags: ['Level 1 Cleared', 'Level 2 Cleared', 'Level 3 Cleared', 'Problem Solving'],
            icon: 'fa-solid fa-calculator'
        },
        japanese: {
            title: 'Japanese Language — N5 Certificate',
            issuer: 'Mirai Academy',
            date: 'Certified Practitioner',
            description: 'Completed basic Japanese language proficiency training (JLPT N5 level) at Mirai Academy, covering basic Hiragana, Katakana, Kanji, grammar structures, and conversational comprehension.',
            tags: ['JLPT N5', 'Mirai Academy', 'Multilingual', 'Japanese Grammar'],
            icon: 'fa-solid fa-torii-gate'
        },
        nptel: {
            title: 'Soft Skill Development Certification',
            issuer: 'NPTEL (IIT Courseware)',
            date: 'NPTEL Certified',
            description: 'Completed NPTEL certification course focusing on interpersonal communication, teamwork dynamics, workplace adaptability, public presentation, and analytical problem-solving.',
            tags: ['NPTEL', 'Soft Skills', 'Leadership', 'Team Collaboration'],
            icon: 'fa-solid fa-user-check'
        }
    };

    window.openCertModal = function(key) {
        const data = certModalData[key];
        if (!data) return;

        const contentBox = document.getElementById('cert-modal-content');
        contentBox.innerHTML = `
            <div class="cert-modal-header text-center">
                <div class="cert-icon" style="font-size: 3rem; margin-bottom: 1rem;"><i class="${data.icon}"></i></div>
                <h2 class="gradient-text">${data.title}</h2>
                <h4 style="color: var(--accent-cyan); margin-top: 0.5rem;">${data.issuer} • ${data.date}</h4>
            </div>
            <div class="cert-modal-body mt-md text-body">
                <p>${data.description}</p>
                <div class="interest-tags-wrapper mt-lg">
                    ${data.tags.map(t => `<span class="tag" style="background: rgba(0, 243, 255, 0.1); color: var(--accent-cyan);">${t}</span>`).join('')}
                </div>
            </div>
            <div class="mt-xl text-center">
                <button class="btn btn-primary" onclick="closeCertModal()"><i class="fa-solid fa-check"></i> Close Preview</button>
            </div>
        `;

        document.getElementById('cert-modal').classList.add('active');
        playSynthTone(783.99, 'sine', 0.1);
    };

    window.closeCertModal = function() {
        document.getElementById('cert-modal').classList.remove('active');
    };

    // Close modal on click outside
    document.getElementById('cert-modal').addEventListener('click', (e) => {
        if (e.target.id === 'cert-modal') closeCertModal();
    });

    // Resume Modal / Button
    const resumeBtn = document.getElementById('open-resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            openCertModal('oracle');
            showToast('Showing Sanjiv\'s Profile & Certification Summary 📄');
        });
    }

    // ----------------------------------------------------------------------
    // 9. INTERACTIVE AI TERMINAL CONSOLE MODAL
    // ----------------------------------------------------------------------
    const terminalModal = document.getElementById('terminal-modal');
    const terminalTrigger = document.getElementById('floating-terminal-trigger');
    const terminalNavBtn = document.getElementById('terminal-toggle-btn');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    function openTerminalModal() {
        if (!terminalModal) return;
        terminalModal.classList.add('active');
        if (terminalInput) terminalInput.focus();
        playSynthTone(880, 'sine', 0.1);
    }

    window.closeTerminalModal = function() {
        if (!terminalModal) return;
        terminalModal.classList.remove('active');
    };

    if (terminalTrigger) terminalTrigger.addEventListener('click', openTerminalModal);
    if (terminalNavBtn) terminalNavBtn.addEventListener('click', openTerminalModal);

    // Ctrl + K shortcut
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (terminalModal.classList.contains('active')) {
                closeTerminalModal();
            } else {
                openTerminalModal();
            }
        } else if (e.key === 'Escape' && terminalModal.classList.contains('active')) {
            closeTerminalModal();
        }
    });

    if (terminalInput && terminalOutput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim().toLowerCase();
                processTerminalCommand(cmd);
                terminalInput.value = '';
            }
        });
    }

    function processTerminalCommand(cmd) {
        const line = document.createElement('div');
        line.className = 'term-cmd-line';
        line.innerHTML = `<span class="term-prompt">sanjiv@portfolio:~$</span> ${escapeHTML(cmd)}`;
        terminalOutput.appendChild(line);

        const response = document.createElement('div');
        response.className = 'term-response-line';

        switch (cmd) {
            case 'help':
                response.innerHTML = `
                    <p>Available Sanjiv AI Console Commands:</p>
                    <p>  - <span class="term-hl">bio</span> / <span class="term-hl">about</span>: Brief summary about Sanjiv</p>
                    <p>  - <span class="term-hl">cgpa</span> / <span class="term-hl">grades</span>: Academic CGPA & Semester breakdown</p>
                    <p>  - <span class="term-hl">skills</span>: Technical and web stack overview</p>
                    <p>  - <span class="term-hl">internship</span>: ANTYK Technologies AI internship record</p>
                    <p>  - <span class="term-hl">certs</span>: Oracle Agentic AI, SRMC, Japanese N5, NPTEL</p>
                    <p>  - <span class="term-hl">icpc</span> / <span class="term-hl">achievements</span>: Competitions & achievements</p>
                    <p>  - <span class="term-hl">contact</span>: How to connect with Sanjiv</p>
                    <p>  - <span class="term-hl">quote</span>: Philosophy quote</p>
                    <p>  - <span class="term-hl">clear</span>: Clear terminal console</p>
                    <p>  - <span class="term-hl">exit</span>: Close terminal</p>
                `;
                break;

            case 'bio':
            case 'about':
                response.innerHTML = `<p>Sanjiv Kumar A is a 2nd year B.Tech student in Artificial Intelligence & Machine Learning at RMD Engineering College. Passionate about Agentic AI, math logic, and real-world software applications. CGPA: 9.34 / 10.</p>`;
                break;

            case 'cgpa':
            case 'grades':
            case 'academics':
                response.innerHTML = `
                    <p>=== ACADEMIC PERFORMANCE SUMMARY ===</p>
                    <p>• Institution: RMD Engineering College (AI & ML Dept)</p>
                    <p>• Overall CGPA: <span class="term-hl">9.34 / 10</span></p>
                    <p>• Semester 1 GPA: 9.23</p>
                    <p>• Semester 2 GPA: 9.458</p>
                    <p>• High School (10th & 12th): 92% (Apple Perks International School)</p>
                `;
                break;

            case 'skills':
                response.innerHTML = `
                    <p>=== TECHNICAL SKILLS MATRIX ===</p>
                    <p>• Languages: Java, Python, C++, SQL</p>
                    <p>• Web Technologies: HTML5, CSS3, JavaScript (ES6+)</p>
                    <p>• Domains: Agentic AI Systems, Machine Learning, Intelligent Automation</p>
                    <p>• Soft Skills: Communication, Leadership, Teamwork, Analytical Problem Solving</p>
                `;
                break;

            case 'internship':
            case 'experience':
                response.innerHTML = `
                    <p>=== INTERNSHIP RECORD ===</p>
                    <p>• Role: AI Developer Intern</p>
                    <p>• Company: ANTYK Technologies (Chennai, Tamil Nadu)</p>
                    <p>• Duration: June 1, 2026 – June 15, 2026</p>
                    <p>• Letter Issued: June 22, 2026</p>
                    <p>• Performance Evaluation: <span class="term-hl">GOOD</span></p>
                `;
                break;

            case 'certs':
            case 'certifications':
                response.innerHTML = `
                    <p>=== CERTIFICATIONS ===</p>
                    <p>1. Oracle Agentic AI Certification (Oracle)</p>
                    <p>2. Srinivasa Ramanujan Mathematical Competition (Cleared Levels 1, 2, 3)</p>
                    <p>3. Japanese Language N5 Certificate (Mirai Academy)</p>
                    <p>4. Soft Skill Development Certification (NPTEL)</p>
                `;
                break;

            case 'icpc':
            case 'achievements':
                response.innerHTML = `
                    <p>=== ACHIEVEMENTS ===</p>
                    <p>• ICPC Participant (International Collegiate Programming Contest)</p>
                    <p>• SRMC Level 1, 2, & 3 Cleared</p>
                    <p>• Mirai Academy Japanese N5 Certified</p>
                `;
                break;

            case 'contact':
            case 'hire':
                response.innerHTML = `
                    <p>Connect with Sanjiv Kumar A:</p>
                    <p>• Institution: RMD Engineering College, Chennai</p>
                    <p>• Status: Open for AI Internships, Hackathons & Research Projects</p>
                    <p>• Email: Use the form on the page or contact directly!</p>
                `;
                break;

            case 'quote':
                response.innerHTML = `<p><em>"Learning by building, growing through curiosity — one project at a time."</em></p>`;
                break;

            case 'clear':
                terminalOutput.innerHTML = '';
                return;

            case 'exit':
                closeTerminalModal();
                return;

            case '':
                return;

            default:
                response.innerHTML = `<p>Command not recognized: '<span style="color:#ff5f56;">${escapeHTML(cmd)}</span>'. Type <span class="term-hl">'help'</span> for list of commands.</p>`;
                break;
        }

        terminalOutput.appendChild(response);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        playSynthTone(440, 'triangle', 0.05);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // ----------------------------------------------------------------------
    // 10. CONTACT FORM HANDLING & QUICK COPY
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('sender-name').value;
            showToast(`Thank you, ${name}! Your message has been sent to Sanjiv. 🚀`);
            contactForm.reset();
            playSynthTone(880, 'sine', 0.15);
        });
    }

    const quickCopyBtn = document.getElementById('quick-copy-email-btn');
    if (quickCopyBtn) {
        quickCopyBtn.addEventListener('click', () => {
            const info = "Sanjiv Kumar A | B.Tech AI & ML Student | CGPA: 9.34 | RMD Engineering College";
            navigator.clipboard.writeText(info).then(() => {
                showToast("Sanjiv's Profile Summary copied to clipboard! 📋");
                playSynthTone(700, 'sine', 0.08);
            }).catch(() => {
                showToast("Summary ready to share! 📋");
            });
        });
    }

    // ----------------------------------------------------------------------
    // 11. TOAST NOTIFICATION ENGINE
    // ----------------------------------------------------------------------
    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
    window.showToast = showToast;

    // Current Year Update
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
