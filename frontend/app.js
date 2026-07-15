document.addEventListener('DOMContentLoaded', () => {
  /* --- Navbar Scroll Effect --- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
  }

  /* --- Mobile Hamburger Menu --- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  // Note: For a robust implementation, the navLinks would become a full-screen overlay on mobile
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
      
      if (!isExpanded) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.backgroundColor = 'var(--color-panel)';
        navLinks.style.padding = 'var(--space-24)';
        navLinks.style.borderBottom = '1px solid var(--color-border)';
      } else {
        navLinks.style.display = '';
        // Resets inline styles to allow CSS media query to take over
        navLinks.removeAttribute('style');
      }
    });
  }

  /* --- Intersection Observer for Scroll Animations --- */
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Staggered reveal for grid items
        if (entry.target.classList.contains('card')) {
           // max stagger 6 cards (60ms * 6 = 360ms max delay)
           const delay = Math.min(index * 60, 360);
           entry.target.style.transitionDelay = `${delay}ms`;
        }
        
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-up').forEach(el => {
    observer.observe(el);
  });

  /* --- Tabs / Accordion --- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active state
        tabButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanels.forEach(p => p.hidden = true);
        
        // Add active state
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        const panelId = btn.getAttribute('aria-controls');
        document.getElementById(panelId).hidden = false;
      });
    });
  }

  /* --- Project Filtering --- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.card');

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Reset all buttons
        filterButtons.forEach(b => {
          b.classList.remove('active');
          b.style.color = 'var(--color-text-muted)';
          b.style.textDecoration = 'none';
        });
        
        // Set active button
        btn.classList.add('active');
        btn.style.color = 'var(--color-text)';
        btn.style.textDecoration = 'underline';

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          if (filter === 'all') {
            card.style.display = 'flex'; // or block depending on layout
          } else if (filter === 'machine-learning' && card.classList.contains('card-machine-learning')) {
            card.style.display = 'flex';
          } else if (filter === 'data-analytics' && card.classList.contains('card-data-analytics')) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* --- Inject Missing Lucide Icons --- */
  const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`;
  const linkedinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`;
  
  document.querySelectorAll('i[data-lucide="github"]').forEach(el => {
    el.outerHTML = githubIcon;
  });
  
  document.querySelectorAll('i[data-lucide="linkedin"]').forEach(el => {
    el.outerHTML = linkedinIcon;
  });

  /* =========================================================================
   * Dynamic Data Rendering (API Integration)
   * ========================================================================= */
  
  // 1. Projects Rendering (Home & Projects pages)
  const renderProjects = async () => {
    const featuredGrid = document.getElementById('featured-projects-grid');
    const projectsGrid = document.getElementById('projects-grid');
    
    if (!featuredGrid && !projectsGrid) return;
    
    try {
      const isFeaturedOnly = !!featuredGrid;
      const projects = await window.api.getProjects(isFeaturedOnly);
      
      const generateProjectCard = (project) => {
        const techStackString = project.techStack && project.techStack.length > 0 ? project.techStack.join(' &bull; ') : '';
        const highlightsList = project.highlights && project.highlights.length > 0 ? project.highlights.map(h => `<li style="display:flex; gap:8px; align-items:start;"><span style="color:var(--color-primary); flex-shrink:0;">&#10003;</span> <span>${h}</span></li>`).join('') : '';
        
        return `
        <article class="card card-data-analytics reveal-up visible" style="display:flex; flex-direction:column; height: 100%;">
          <img src="${(project.images && project.images.length > 0) ? project.images[0] : 'images/project1.png'}" alt="${project.title}" style="margin: -24px -24px 24px -24px; width: calc(100% + 48px); max-width: none; height: 180px; object-fit: cover; border-radius: 5px 5px 0 0; border-bottom: 1px solid var(--color-border); display: block;">
          <div class="card-content" style="flex-grow: 1;">
            <h4 class="mb-8">${project.title}</h4>
            <p class="body-small mb-16">${project.summary}</p>
            
            ${techStackString ? `
            <div class="mb-16">
              <strong style="color:var(--color-text); font-size:14px;">Tech Stack:</strong><br>
              <span class="body-small" style="color:var(--color-text-muted);">${techStackString}</span>
            </div>` : ''}

            ${highlightsList ? `
            <div class="mb-24">
              <strong style="color:var(--color-text); font-size:14px; margin-bottom:8px; display:block;">Highlights</strong>
              <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:var(--color-text-muted); display:flex; flex-direction:column; gap:6px;">
                ${highlightsList}
              </ul>
            </div>` : ''}
          </div>
          <div class="card-footer flex justify-between items-center" style="margin-top:auto; padding-top:16px; border-top:1px solid var(--color-border); gap:8px; flex-wrap:wrap;">
            ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="btn btn-primary" style="flex:1; text-align:center; padding:6px 12px; font-size:13px;">Live Demo</a>` : ''}
            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn btn-secondary" style="flex:1; text-align:center; padding:6px 12px; font-size:13px;">GitHub</a>` : ''}
            ${project.caseStudyUrl ? `<a href="${project.caseStudyUrl}" class="btn btn-secondary" style="flex:1; text-align:center; padding:6px 12px; font-size:13px;">Case Study</a>` : `<a href="project-detail.html?slug=${project.slug}" class="btn btn-secondary" style="flex:1; text-align:center; padding:6px 12px; font-size:13px;">Case Study</a>`}
          </div>
        </article>
      `};

      const targetGrid = featuredGrid || projectsGrid;

      if (!projects || projects.length === 0) {
        targetGrid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:var(--space-64) 0;color:var(--color-text-muted)">
            <p style="font-size:1.25rem;margin-bottom:var(--space-8)">No projects yet.</p>
            <p>Check back soon — projects will appear here once published.</p>
          </div>`;
        return;
      }

      targetGrid.innerHTML = projects.map(generateProjectCard).join('');
      lucide.createIcons();

      // Re-wire filter buttons to work with the newly rendered cards
      if (projectsGrid) {
        const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
        const cards = projectsGrid.querySelectorAll('.card');
        filterButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
              b.classList.remove('active');
              b.style.color = 'var(--color-text-muted)';
              b.style.textDecoration = 'none';
            });
            btn.classList.add('active');
            btn.style.color = 'var(--color-text)';
            btn.style.textDecoration = 'underline';
            const filter = btn.getAttribute('data-filter');
            cards.forEach(card => {
              card.style.display = (filter === 'all' || card.classList.contains('card-' + filter)) ? '' : 'none';
            });
          });
        });
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      const targetGrid = document.getElementById('featured-projects-grid') || document.getElementById('projects-grid');
      if (targetGrid) {
        targetGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:var(--space-48) 0;color:var(--color-error)">Failed to load projects. Please try again later.</div>`;
      }
    }
  };

  // 2. Skills — Home page strip (flat badges in home.html)
  const renderSkills = async () => {
    const skillsStrip = document.getElementById('skills-strip');
    if (!skillsStrip) return;

    try {
      const skillsData = await window.api.getSkills(false); // flat array
      if (!skillsData || skillsData.length === 0) return;
      
      skillsStrip.innerHTML = skillsData
        .sort((a,b) => a.sortOrder - b.sortOrder)
        .map((skill, i) => `<span class="badge ${i%2===0?'badge-filled':''}">${skill.name}</span>`)
        .join('');
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  // 3. Skills — About page grouped by category (about.html)
  const CATEGORY_LABELS = {
    LANGUAGES:        'Languages',
    FRAMEWORKS:       'Frameworks & Libraries',
    FRONTEND:         'Frontend',
    BACKEND:          'Backend',
    DATABASE:         'Database',
    MACHINE_LEARNING: 'Machine Learning',
    DATA_SCIENCE:     'Data Science & BI',
    CLOUD:            'Cloud Platforms',
    DEVOPS:           'DevOps & CI/CD',
    TESTING:          'Testing & QA',
    TOOLS:            'Tools & Utilities',
    SOFT_SKILLS:      'Soft Skills',
    OTHER:            'Other',
  };

  const CATEGORY_COLORS = {
    LANGUAGES:        'var(--color-primary)',
    FRAMEWORKS:       '#7c6af7',
    FRONTEND:         'var(--color-primary)',
    BACKEND:          'var(--color-secondary)',
    DATABASE:         'var(--color-signal-amber)',
    MACHINE_LEARNING: '#e85d75',
    DATA_SCIENCE:     'var(--color-signal-amber)',
    CLOUD:            'var(--color-signal-teal)',
    DEVOPS:           'var(--color-signal-teal)',
    TESTING:          '#a78bfa',
    TOOLS:            'var(--color-text-muted)',
    SOFT_SKILLS:      '#34d399',
    OTHER:            'var(--color-text-muted)',
  };

  const renderSkillsGrouped = async () => {
    const grid = document.getElementById('skills-grouped-grid');
    if (!grid) return;

    try {
      const skills = await window.api.getSkills(false);

      if (!skills || skills.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:var(--space-32) 0;">No skills added yet.</div>';
        return;
      }

      // Group by category
      const grouped = {};
      skills.forEach(s => {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s);
      });

      // Preferred display order
      const ORDER = ['LANGUAGES','FRAMEWORKS','FRONTEND','BACKEND','DATABASE','MACHINE_LEARNING','DATA_SCIENCE','CLOUD','DEVOPS','TESTING','TOOLS','SOFT_SKILLS','OTHER'];
      const sortedCategories = ORDER.filter(c => grouped[c]).concat(
        Object.keys(grouped).filter(c => !ORDER.includes(c))
      );

      grid.innerHTML = sortedCategories.map(cat => {
        // Sort by proficiency (descending), then by sortOrder (ascending)
        const catSkills = grouped[cat].sort((a, b) => (b.proficiency - a.proficiency) || (a.sortOrder - b.sortOrder));
        const color = CATEGORY_COLORS[cat] || 'var(--color-text-muted)';
        const label = CATEGORY_LABELS[cat] || cat;
        const badges = catSkills.map((s, i) => {
          const filled = i % 2 === 0 ? 'badge-filled' : '';
          const stars = '★'.repeat(s.proficiency) + '☆'.repeat(5 - s.proficiency);
          return `<span class="badge ${filled}" title="Proficiency: ${s.proficiency}/5" style="cursor:default;">${s.name}</span>`;
        }).join('');

        return `
          <div style="padding: var(--space-24); background: var(--color-surface, var(--color-panel)); border: 1px solid var(--color-border); border-radius: var(--radius-md); border-top: 3px solid ${color};">
            <h4 class="mb-16" style="color:${color};">${label}</h4>
            <div class="badge-group">${badges}</div>
          </div>
        `;
      }).join('');

    } catch (error) {
      console.error('Failed to load grouped skills:', error);
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--color-error);padding:var(--space-32) 0;">Failed to load skills.</div>';
    }
  };

  // 4. Certificates — Resume page (resume.html)
  const renderCertificates = async () => {
    const grid = document.getElementById('certificates-grid');
    if (!grid) return;

    try {
      const certs = await window.api.getCertificates();

      if (!certs || certs.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:var(--space-32) 0;">No certificates added yet.</div>';
        return;
      }

      // Update count badge
      const countEl = document.getElementById('cert-count');
      if (countEl) {
        countEl.textContent = `${certs.length} ${certs.length === 1 ? 'Certificate' : 'Certificates'}`;
        countEl.style.display = 'inline-block';
      }

      grid.innerHTML = certs.map(c => {
        const dateStr = new Date(c.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const imgHtml = c.imageUrl
          ? `<img src="${c.imageUrl}" alt="${c.title}" style="width:100%; height:160px; object-fit:cover; border-radius: var(--radius-sm) var(--radius-sm) 0 0; border-bottom:1px solid var(--color-border); display:block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div style="display:none; width:100%; height:160px; align-items:center; justify-content:center; background:var(--color-inset); border-bottom:1px solid var(--color-border);">
               <i data-lucide="award" style="width:48px;height:48px;color:var(--color-text-muted);"></i>
             </div>`
          : `<div style="width:100%; height:160px; display:flex; align-items:center; justify-content:center; background:var(--color-inset); border-bottom:1px solid var(--color-border);">
               <i data-lucide="award" style="width:48px;height:48px;color:var(--color-text-muted);"></i>
             </div>`;

        const credLink = c.credentialUrl
          ? `<a href="${c.credentialUrl}" target="_blank" class="btn btn-secondary" style="width:100%;text-align:center;margin-top:var(--space-16);padding:6px 12px;font-size:13px;">View Credential</a>`
          : '';

        return `
          <article class="card reveal-up visible" style="padding:0; overflow:hidden; display:flex; flex-direction:column;">
            ${imgHtml}
            <div style="padding: var(--space-16); flex:1; display:flex; flex-direction:column;">
              <h4 class="mb-8" style="font-size:15px; line-height:1.4;">${c.title}</h4>
              <p style="color:var(--color-text-muted); font-size:13px; margin:0 0 4px;">${c.issuer}</p>
              <p style="color:var(--color-text-muted); font-size:12px; margin:0; opacity:0.7;">${dateStr}</p>
              ${credLink}
            </div>
          </article>
        `;
      }).join('');

      lucide.createIcons();

    } catch (error) {
      console.error('Failed to load certificates:', error);
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--color-error);padding:var(--space-32) 0;">Failed to load certificates.</div>';
    }
  };

  // 5. Dynamic Resumes — (resume.html)
  const renderResumes = async () => {
    const videoContainer = document.getElementById('resume-video-container');
    const pdfContainer = document.getElementById('resume-pdf-container');
    const downloadBtn = document.getElementById('download-resume-btn');
    
    // Only run on resume page
    if (!videoContainer && !pdfContainer) return;

    try {
      const data = await window.api.getResumeUrl();
      const backendOrigin = window.api.getBaseUrl();

      // 1. Render Video
      if (videoContainer) {
        if (data && data.videoUrl) {
          const fullVideoUrl = data.videoUrl.startsWith('/') ? backendOrigin + data.videoUrl : data.videoUrl;
          videoContainer.innerHTML = `
            <video controls style="width: 100%; border-radius: var(--radius-md); background: #000;">
              <source src="${fullVideoUrl}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          `;
          // Remove the border & bg since it's now a real player
          videoContainer.className = 'mb-48';
          videoContainer.style = 'width: 100%; max-width: 800px; margin: 0 auto 48px auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2);';
        } else {
          videoContainer.innerHTML = `
            <div class="card" style="width: 100%; aspect-ratio: 16/9; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 1px dashed var(--color-border); background-color: var(--color-panel);">
              <i data-lucide="video" width="48" style="color: var(--color-text-muted); margin-bottom: var(--space-16);"></i>
              <h3 class="mb-8">Video Resume</h3>
              <p class="body-small" style="color: var(--color-text-muted);">No video resume uploaded yet.</p>
            </div>
          `;
        }
      }

      // 2. Render PDF
      if (pdfContainer) {
        if (data && data.pdfUrl) {
          const fullPdfUrl = data.pdfUrl.startsWith('/') ? backendOrigin + data.pdfUrl : data.pdfUrl;
          pdfContainer.innerHTML = `
            <iframe src="${fullPdfUrl}" width="100%" height="100%" style="border: none; border-radius: var(--radius-md);"></iframe>
          `;
          pdfContainer.style = 'width: 100%; max-width: 850px; height: 800px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1);';
        } else {
          pdfContainer.innerHTML = `
            <div style="background-color: var(--color-inset); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-48); aspect-ratio: 1 / 1.414; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
              <i data-lucide="file-text" width="48" style="color: var(--color-text-muted); margin-bottom: var(--space-24);"></i>
              <h3 class="mb-16">PDF Preview</h3>
              <p class="body-large" style="color: var(--color-text-muted); max-width: 400px; margin-bottom: var(--space-32);">
                No PDF resume uploaded yet.
              </p>
            </div>
          `;
        }
      }
      
      lucide.createIcons();
    } catch (error) {
      console.error('Failed to load resumes:', error);
    }
  };

  // Execute rendering
  if (window.api) {
    renderProjects();
    renderSkills();
    renderSkillsGrouped();
    renderCertificates();
    renderResumes();
  }
});


