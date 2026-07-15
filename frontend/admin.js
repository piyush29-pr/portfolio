document.addEventListener('DOMContentLoaded', async () => {
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const adminNav = document.getElementById('admin-nav');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  
  const mVisitors = document.getElementById('metric-visitors');
  const mDownloads = document.getElementById('metric-downloads');
  const mMessages = document.getElementById('metric-messages');

  // ─── CUSTOM CONFIRM (replaces window.confirm which is blocked by browsers) ─
  function showConfirm(message) {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirm-modal');
      const msg = document.getElementById('confirm-modal-msg');
      const okBtn = document.getElementById('confirm-ok-btn');
      const cancelBtn = document.getElementById('confirm-cancel-btn');
      msg.textContent = message;
      modal.style.display = 'flex';

      function cleanup(result) {
        modal.style.display = 'none';
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        resolve(result);
      }
      function onOk() { cleanup(true); }
      function onCancel() { cleanup(false); }
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
    });
  }
  
  const initDashboard = async () => {
    try {
      const data = await window.api.getAdminAnalytics();
      mVisitors.innerText = data.metrics.totalVisitors;
      mDownloads.innerText = data.metrics.totalResumeDownloads;
      mMessages.innerText = data.metrics.unreadMessages;
      loginView.style.display = 'none';
      dashboardView.style.display = 'block';
      adminNav.style.display = 'block';
      loadAdminProjects();
    } catch (e) {
      console.error('Dashboard init error:', e);
      loginView.style.display = 'block';
      dashboardView.style.display = 'none';
      adminNav.style.display = 'none';
    }
  };

  if (window.api) initDashboard();

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const loginError = document.getElementById('login-error');
      try {
        await window.api.loginAdmin({ email, password });
        loginError.style.display = 'none';
        initDashboard();
      } catch (error) {
        if (error.message === 'Failed to fetch') {
          loginError.innerHTML = 'Cannot connect to backend server.<br>Ensure <code>npm run dev</code> is running in the backend folder.';
        } else {
          loginError.textContent = error.message || 'Login failed';
        }
        loginError.style.display = 'block';
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await window.api.logoutAdmin(); } catch (err) {}
      window.location.reload();
    });
  }

  // Tab Navigation
  const tabButtons = document.querySelectorAll('.filter-btn[data-tab]');
  const adminTabs = document.querySelectorAll('.admin-tab');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.style.textDecoration = 'none';
        b.style.color = 'var(--color-text-muted)';
      });
      adminTabs.forEach(t => t.style.display = 'none');
      btn.classList.add('active');
      btn.style.textDecoration = 'underline';
      btn.style.color = 'var(--color-text)';
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).style.display = 'block';
      if (targetId === 'tab-projects') loadAdminProjects();
      if (targetId === 'tab-skills') loadAdminSkills();
      if (targetId === 'tab-certificates') loadAdminCertificates();
      if (targetId === 'tab-inbox') loadInboxMessages();
      if (targetId === 'tab-resume') loadResumeFiles();
    });
  });

  // ─── HELPER: reset form to create mode ───────────────────────────
  const resetProjectForm = () => {
    const f = document.getElementById('add-project-form');
    if (f) f.reset();
    document.getElementById('proj-id').value = '';
    document.getElementById('proj-form-title').innerText = 'Add New Project';
    document.getElementById('proj-submit-btn').innerText = 'Create Project';
    document.getElementById('proj-cancel-btn').style.display = 'none';
    document.getElementById('proj-success').style.display = 'none';
  };

  const resetSkillForm = () => {
    const f = document.getElementById('add-skill-form');
    if (f) f.reset();
    document.getElementById('skill-id').value = '';
    document.getElementById('skill-form-title').innerText = 'Add New Skill';
    document.getElementById('skill-submit-btn').innerText = 'Create Skill';
    document.getElementById('skill-cancel-btn').style.display = 'none';
    document.getElementById('skill-success').style.display = 'none';
  };

  const resetCertForm = () => {
    const f = document.getElementById('add-certificate-form');
    if (f) f.reset();
    document.getElementById('cert-id').value = '';
    document.getElementById('cert-form-title').innerText = 'Add New Certificate';
    document.getElementById('cert-submit-btn').innerText = 'Create Certificate';
    document.getElementById('cert-cancel-btn').style.display = 'none';
    document.getElementById('cert-success').style.display = 'none';
  };

  // Cancel buttons
  document.getElementById('proj-cancel-btn')?.addEventListener('click', resetProjectForm);
  document.getElementById('skill-cancel-btn')?.addEventListener('click', resetSkillForm);
  document.getElementById('cert-cancel-btn')?.addEventListener('click', resetCertForm);

  // ─── PROJECTS ────────────────────────────────────────────────────

  const loadAdminProjects = async () => {
    const tbody = document.getElementById('projects-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted)">Loading…</td></tr>';
    try {
      const projects = await window.api.getAdminProjects();
      if (!projects || projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted)">No projects yet.</td></tr>';
        return;
      }
      tbody.innerHTML = projects.map(p => `
        <tr>
          <td><strong>${escapeHtml(p.title)}</strong></td>
          <td>${escapeHtml(p.category || 'Portfolio')}</td>
          <td><span class="badge ${p.status === 'PUBLISHED' ? 'badge-filled' : ''}">${p.status}</span></td>
          <td>${p.featured ? 'Yes' : 'No'}</td>
          <td>
            <div class="flex gap-8">
              <button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px"
                data-action="edit-project" data-id="${p.id}">Edit</button>
              <button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px;color:var(--color-error);border-color:var(--color-error)"
                data-action="delete-project" data-id="${p.id}">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
      // Store project data on rows for edit
      projects.forEach(p => {
        const row = tbody.querySelector(`[data-id="${p.id}"][data-action="edit-project"]`);
        if (row) row.dataset.payload = JSON.stringify(p);
      });
    } catch (e) {
      console.error('Load projects error:', e);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-error)">Failed to load projects</td></tr>';
    }
  };

  // Event delegation on the tbody - catches all button clicks
  document.getElementById('projects-tbody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'delete-project') {
      if (!await showConfirm('Delete this project? This cannot be undone.')) return;
      btn.disabled = true;
      btn.innerText = 'Deleting…';
      try {
        await window.api.deleteProject(id);
        await loadAdminProjects();
      } catch (err) {
        console.error('Delete project error:', err);
        alert('Error deleting project: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Delete';
      }
    }

    if (action === 'edit-project') {
      const p = JSON.parse(btn.dataset.payload);
      document.getElementById('proj-id').value = p.id;
      document.getElementById('proj-title').value = p.title;
      document.getElementById('proj-summary').value = p.summary;
      document.getElementById('proj-tags').value = (p.techStack || []).join(', ');
      document.getElementById('proj-image').value = (p.images && p.images.length) ? p.images[0] : '';
      document.getElementById('proj-highlights').value = (p.highlights || []).join('\n');
      document.getElementById('proj-github').value = p.githubUrl || '';
      document.getElementById('proj-live').value = p.liveUrl || '';
      document.getElementById('proj-casestudy').value = p.caseStudyUrl || '';
      document.getElementById('proj-published').checked = p.status === 'PUBLISHED';
      document.getElementById('proj-featured').checked = !!p.featured;
      document.getElementById('proj-form-title').innerText = 'Edit Project';
      document.getElementById('proj-submit-btn').innerText = 'Update Project';
      document.getElementById('proj-cancel-btn').style.display = 'inline-block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Project form submit
  document.getElementById('add-project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('proj-id').value;
    const tagsInput = document.getElementById('proj-tags').value;
    const highlightsInput = document.getElementById('proj-highlights').value;
    const imageUrl = document.getElementById('proj-image').value;
    const githubUrl = document.getElementById('proj-github').value;
    const liveUrl = document.getElementById('proj-live').value;
    const casestudyUrl = document.getElementById('proj-casestudy').value;
    const payload = {
      title: document.getElementById('proj-title').value,
      summary: document.getElementById('proj-summary').value,
      description: document.getElementById('proj-summary').value,
      techStack: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
      highlights: highlightsInput ? highlightsInput.split('\n').map(h => h.trim()).filter(Boolean) : [],
      images: imageUrl ? [imageUrl] : [],
      githubUrl: githubUrl || undefined,
      liveUrl: liveUrl || undefined,
      caseStudyUrl: casestudyUrl || undefined,
      status: document.getElementById('proj-published').checked ? 'PUBLISHED' : 'DRAFT',
      featured: !!document.getElementById('proj-featured').checked
    };
    const btn = document.getElementById('proj-submit-btn');
    btn.disabled = true;
    btn.innerText = 'Saving…';
    try {
      if (id) {
        await window.api.updateProject(id, payload);
      } else {
        await window.api.createProject(payload);
      }
      resetProjectForm();
      btn.disabled = false;
      const ok = document.getElementById('proj-success');
      ok.style.display = 'flex';
      lucide.createIcons();
      setTimeout(() => ok.style.display = 'none', 3000);
      await loadAdminProjects();
    } catch (err) {
      alert('Error saving project: ' + err.message);
      btn.disabled = false;
      btn.innerText = id ? 'Update Project' : 'Create Project';
    }
  });

  // ─── SKILLS ──────────────────────────────────────────────────────

  const loadAdminSkills = async () => {
    const tbody = document.getElementById('skills-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted)">Loading…</td></tr>';
    try {
      const skills = await window.api.getAdminSkills();
      if (!skills || skills.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted)">No skills yet.</td></tr>';
        return;
      }
      tbody.innerHTML = skills.map(s => `
        <tr>
          <td><strong>${escapeHtml(s.name)}</strong></td>
          <td><span class="badge">${escapeHtml(s.category)}</span></td>
          <td>${s.proficiency} / 5</td>
          <td>
            <div class="flex gap-8">
              <button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px"
                data-action="edit-skill" data-id="${s.id}" data-payload='${escapeAttr(JSON.stringify(s))}'>Edit</button>
              <button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px;color:var(--color-error);border-color:var(--color-error)"
                data-action="delete-skill" data-id="${s.id}">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Load skills error:', e);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--color-error)">Failed to load skills</td></tr>';
    }
  };

  document.getElementById('skills-tbody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'delete-skill') {
      if (!await showConfirm('Delete this skill? This cannot be undone.')) return;
      btn.disabled = true;
      btn.innerText = 'Deleting…';
      try {
        await window.api.deleteSkill(id);
        await loadAdminSkills();
      } catch (err) {
        console.error('Delete skill error:', err);
        alert('Error deleting skill: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Delete';
      }
    }

    if (action === 'edit-skill') {
      const s = JSON.parse(btn.dataset.payload);
      document.getElementById('skill-id').value = s.id;
      document.getElementById('skill-name').value = s.name;
      document.getElementById('skill-category').value = s.category;
      document.getElementById('skill-proficiency').value = s.proficiency;
      document.getElementById('skill-form-title').innerText = 'Edit Skill';
      document.getElementById('skill-submit-btn').innerText = 'Update Skill';
      document.getElementById('skill-cancel-btn').style.display = 'inline-block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('add-skill-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('skill-id').value;
    const payload = {
      name: document.getElementById('skill-name').value,
      category: document.getElementById('skill-category').value,
      proficiency: parseInt(document.getElementById('skill-proficiency').value, 10)
    };
    const btn = document.getElementById('skill-submit-btn');
    btn.disabled = true;
    btn.innerText = 'Saving…';
    try {
      if (id) {
        await window.api.updateSkill(id, payload);
      } else {
        await window.api.createSkill(payload);
      }
      resetSkillForm();
      btn.disabled = false;
      const ok = document.getElementById('skill-success');
      ok.style.display = 'flex';
      lucide.createIcons();
      setTimeout(() => ok.style.display = 'none', 3000);
      await loadAdminSkills();
    } catch (err) {
      alert('Error saving skill: ' + err.message);
      btn.disabled = false;
      btn.innerText = id ? 'Update Skill' : 'Create Skill';
    }
  });

  // ─── CERTIFICATES ─────────────────────────────────────────────────

  const loadAdminCertificates = async () => {
    const tbody = document.getElementById('certificates-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted)">Loading…</td></tr>';
    try {
      const certs = await window.api.getAdminCertificates();
      if (!certs || certs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted)">No certificates yet.</td></tr>';
        return;
      }
      tbody.innerHTML = certs.map(c => `
        <tr>
          <td><strong>${escapeHtml(c.title)}</strong></td>
          <td>${escapeHtml(c.issuer)}</td>
          <td>${new Date(c.issueDate).toLocaleDateString()}</td>
          <td>
            <div class="flex gap-8">
              <button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px"
                data-action="edit-cert" data-id="${c.id}" data-payload='${escapeAttr(JSON.stringify(c))}'>Edit</button>
              <button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px;color:var(--color-error);border-color:var(--color-error)"
                data-action="delete-cert" data-id="${c.id}">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Load certs error:', e);
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--color-error)">Failed to load certificates</td></tr>';
    }
  };

  document.getElementById('certificates-tbody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'delete-cert') {
      if (!await showConfirm('Delete this certificate? This cannot be undone.')) return;
      btn.disabled = true;
      btn.innerText = 'Deleting…';
      try {
        await window.api.deleteCertificate(id);
        await loadAdminCertificates();
      } catch (err) {
        console.error('Delete cert error:', err);
        alert('Error deleting certificate: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Delete';
      }
    }

    if (action === 'edit-cert') {
      const c = JSON.parse(btn.dataset.payload);
      document.getElementById('cert-id').value = c.id;
      document.getElementById('cert-title').value = c.title;
      document.getElementById('cert-issuer').value = c.issuer;
      document.getElementById('cert-issue-date').value = new Date(c.issueDate).toISOString().split('T')[0];
      document.getElementById('cert-image').value = c.imageUrl;
      document.getElementById('cert-form-title').innerText = 'Edit Certificate';
      document.getElementById('cert-submit-btn').innerText = 'Update Certificate';
      document.getElementById('cert-cancel-btn').style.display = 'inline-block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('add-certificate-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cert-id').value;
    const dateStr = document.getElementById('cert-issue-date').value;
    const payload = {
      title: document.getElementById('cert-title').value,
      issuer: document.getElementById('cert-issuer').value,
      issueDate: new Date(dateStr).toISOString(),
      imageUrl: document.getElementById('cert-image').value
    };
    const btn = document.getElementById('cert-submit-btn');
    btn.disabled = true;
    btn.innerText = 'Saving…';
    try {
      if (id) {
        await window.api.updateCertificate(id, payload);
      } else {
        await window.api.createCertificate(payload);
      }
      resetCertForm();
      btn.disabled = false;
      const ok = document.getElementById('cert-success');
      ok.style.display = 'flex';
      lucide.createIcons();
      setTimeout(() => ok.style.display = 'none', 3000);
      await loadAdminCertificates();
    } catch (err) {
      alert('Error saving certificate: ' + err.message);
      btn.disabled = false;
      btn.innerText = id ? 'Update Certificate' : 'Create Certificate';
    }
  });

  // ─── INBOX ───────────────────────────────────────────────────────

  const loadInboxMessages = async () => {
    const tbody = document.getElementById('messages-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted)">Loading…</td></tr>';
    try {
      const messages = await window.api.getAdminMessages();
      if (!messages || messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted)">No messages found.</td></tr>';
        return;
      }
      tbody.innerHTML = messages.map(m => `
        <tr style="${m.status === 'UNREAD' ? 'background:rgba(255,255,255,0.05);font-weight:bold' : ''}">
          <td style="white-space:nowrap">${new Date(m.createdAt).toLocaleDateString()}</td>
          <td>${escapeHtml(m.name)}</td>
          <td><a href="mailto:${escapeHtml(m.email)}" style="color:var(--color-secondary)">${escapeHtml(m.email)}</a></td>
          <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis">${escapeHtml(m.message)}</td>
          <td>
            <div class="flex gap-8">
              ${m.status === 'UNREAD'
                ? `<button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px"
                    data-action="mark-read" data-id="${m.id}">Mark Read</button>`
                : `<span class="badge" style="background:transparent;margin-right:8px">Read</span>`}
              <button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px;color:var(--color-error);border-color:var(--color-error)"
                data-action="delete-message" data-id="${m.id}">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Load messages error:', e);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-error)">Failed to load messages</td></tr>';
    }
  };

  document.getElementById('messages-tbody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'mark-read') {
      btn.disabled = true;
      btn.innerText = 'Marking…';
      try {
        await window.api.markMessageRead(id);
        await loadInboxMessages();
        await initDashboard();
      } catch (e) {
        alert('Failed to mark read');
        btn.disabled = false;
        btn.innerText = 'Mark Read';
      }
    }

    if (action === 'delete-message') {
      if (!await showConfirm('Delete this message? This cannot be undone.')) return;
      btn.disabled = true;
      btn.innerText = 'Deleting…';
      try {
        await window.api.deleteMessage(id);
        await loadInboxMessages();
        await initDashboard();
      } catch (err) {
        console.error('Delete message error:', err);
        alert('Failed to delete: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Delete';
      }
    }
  });

  // ─── RESUME FILES ─────────────────────────────────────────────────

  // Track selected files for each type
  let selectedPdfFile = null;
  let selectedVideoFile = null;

  const BACKEND_UPLOADS_BASE = 'http://127.0.0.1:3000/uploads/resume';

  // Load and render resume files table
  const loadResumeFiles = async () => {
    const tbody = document.getElementById('resume-files-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted)">Loading…</td></tr>';
    try {
      const files = await window.api.getAdminResumeFiles();
      if (!files || files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted)">No resume files uploaded yet.</td></tr>';
        return;
      }
      tbody.innerHTML = files.map(f => {
        const fileUrl = `${BACKEND_UPLOADS_BASE}/${f.filename}`;
        const sizeFormatted = f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(f.size / 1024).toFixed(0)} KB`;
        const typeIcon = f.type === 'PDF'
          ? '<span style="color:var(--color-primary);font-weight:600;">📄 PDF</span>'
          : '<span style="color:var(--color-secondary);font-weight:600;">🎥 Video</span>';
        const previewLink = f.type === 'PDF'
          ? `<a href="${fileUrl}" target="_blank" style="color:var(--color-primary);font-size:12px;">View PDF</a>`
          : `<a href="${fileUrl}" target="_blank" style="color:var(--color-secondary);font-size:12px;">Play Video</a>`;
        return `
          <tr>
            <td>${typeIcon}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(f.originalName)}">${escapeHtml(f.originalName)}</td>
            <td>${sizeFormatted}</td>
            <td style="white-space:nowrap">${new Date(f.uploadedAt).toLocaleString()}</td>
            <td>${previewLink}</td>
            <td>
              <button class="btn btn-secondary action-btn" style="padding:4px 8px;font-size:12px;color:var(--color-error);border-color:var(--color-error)"
                data-action="delete-resume-file" data-id="${f.id}">Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Load resume files error:', e);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-error)">Failed to load resume files</td></tr>';
    }
  };

  // Delete resume file
  document.getElementById('resume-files-tbody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'delete-resume-file') {
      if (!await showConfirm('Delete this resume file? This cannot be undone.')) return;
      btn.disabled = true;
      btn.innerText = 'Deleting…';
      try {
        await window.api.deleteResumeFile(btn.dataset.id);
        await loadResumeFiles();
      } catch (err) {
        console.error('Delete resume file error:', err);
        alert('Error deleting file: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Delete';
      }
    }
  });

  // Upload resume file (called from onclick in HTML)
  window.uploadResumeFile = async (type) => {
    const file = type === 'PDF' ? selectedPdfFile : selectedVideoFile;
    if (!file) return;

    const uploadBtn = document.getElementById(type === 'PDF' ? 'pdf-upload-btn' : 'video-upload-btn');
    const progress = document.getElementById(type === 'PDF' ? 'pdf-upload-progress' : 'video-upload-progress');
    const successEl = document.getElementById(type === 'PDF' ? 'pdf-upload-success' : 'video-upload-success');

    uploadBtn.disabled = true;
    progress.style.display = 'block';
    successEl.style.display = 'none';

    try {
      await window.api.uploadResumeFile(file, type);
      // Reset the file input
      if (type === 'PDF') {
        selectedPdfFile = null;
        document.getElementById('pdf-file-input').value = '';
        document.getElementById('pdf-selected-name').style.display = 'none';
        document.getElementById('pdf-selected-name').textContent = '';
      } else {
        selectedVideoFile = null;
        document.getElementById('video-file-input').value = '';
        document.getElementById('video-selected-name').style.display = 'none';
        document.getElementById('video-selected-name').textContent = '';
      }
      uploadBtn.disabled = true;
      progress.style.display = 'none';
      successEl.style.display = 'flex';
      lucide.createIcons();
      setTimeout(() => successEl.style.display = 'none', 3000);
      await loadResumeFiles();
    } catch (err) {
      console.error('Upload resume file error:', err);
      alert('Upload failed: ' + err.message);
      uploadBtn.disabled = false;
      progress.style.display = 'none';
    }
  };

  // Drag-and-drop handlers exposed to window (for inline HTML handlers)
  window.handlePdfDrop = (e) => {
    e.preventDefault();
    const dropZone = document.getElementById('pdf-drop-zone');
    dropZone.style.borderColor = 'var(--color-border)';
    dropZone.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      selectedPdfFile = file;
      const nameEl = document.getElementById('pdf-selected-name');
      nameEl.textContent = `✔ ${file.name}`;
      nameEl.style.display = 'block';
      document.getElementById('pdf-upload-btn').disabled = false;
    } else {
      alert('Please drop a PDF file.');
    }
  };

  window.handlePdfSelect = (input) => {
    const file = input.files[0];
    if (file) {
      selectedPdfFile = file;
      const nameEl = document.getElementById('pdf-selected-name');
      nameEl.textContent = `✔ ${file.name}`;
      nameEl.style.display = 'block';
      document.getElementById('pdf-upload-btn').disabled = false;
    }
  };

  window.handleVideoDrop = (e) => {
    e.preventDefault();
    const dropZone = document.getElementById('video-drop-zone');
    dropZone.style.borderColor = 'var(--color-border)';
    dropZone.style.background = '';
    const file = e.dataTransfer.files[0];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (file && validVideoTypes.includes(file.type)) {
      selectedVideoFile = file;
      const nameEl = document.getElementById('video-selected-name');
      nameEl.textContent = `✔ ${file.name}`;
      nameEl.style.display = 'block';
      document.getElementById('video-upload-btn').disabled = false;
    } else {
      alert('Please drop a video file (MP4, WebM, MOV, AVI).');
    }
  };

  window.handleVideoSelect = (input) => {
    const file = input.files[0];
    if (file) {
      selectedVideoFile = file;
      const nameEl = document.getElementById('video-selected-name');
      nameEl.textContent = `✔ ${file.name}`;
      nameEl.style.display = 'block';
      document.getElementById('video-upload-btn').disabled = false;
    }
  };

  // ─── MEDIA UPLOADS (PROJECTS & CERTS) ───────────────────────────
  
  const handleMediaUpload = async (fileInputId, targetUrlInputId) => {
    const input = document.getElementById(fileInputId);
    const target = document.getElementById(targetUrlInputId);
    if (!input || !target) return;

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const originalPlaceholder = target.placeholder;
      target.placeholder = 'Uploading...';
      target.value = 'Uploading...';
      target.disabled = true;

      try {
        const data = await window.api.uploadImage(file);
        // The backend/API logic ensures this is a fully qualified URL
        target.value = data.url;
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Image upload failed: ' + err.message);
        target.value = '';
      } finally {
        target.placeholder = originalPlaceholder;
        target.disabled = false;
        // Reset the file input so the same file can be selected again if needed
        input.value = '';
      }
    });
  };

  handleMediaUpload('proj-image-file', 'proj-image');
  handleMediaUpload('cert-image-file', 'cert-image');

  // ─── UTILITIES ────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    // Safe for use in single-quoted HTML attributes (data-payload='...')
    return String(str).replace(/'/g, '&apos;').replace(/"/g, '&quot;');
  }

});
