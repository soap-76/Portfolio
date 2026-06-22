/* ============================================
   ADMIN PANEL — JavaScript
   Portfolio Editor Logic
   ============================================ */

(() => {
  'use strict';

  // ── State ──
  let data = null;

  // ── DOM Helpers ──
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') node.className = v;
      else if (k === 'innerHTML') node.innerHTML = v;
      else if (k === 'textContent') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    }
    for (const c of children) {
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    }
    return node;
  };

  // ── Toast ──
  function showToast(message, type = 'success') {
    const existing = $('.toast');
    if (existing) existing.remove();
    const icon = type === 'success' ? '✅' : '❌';
    const toast = el('div', { className: `toast ${type}`, innerHTML: `${icon} ${message}` });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  // ── Confirm Modal ──
  function confirmAction(title, text) {
    return new Promise(resolve => {
      const overlay = el('div', { className: 'modal-overlay' });
      const box = el('div', { className: 'modal-box' }, [
        el('h3', { className: 'modal-title', textContent: title }),
        el('p', { className: 'modal-text', textContent: text }),
        el('div', { className: 'modal-actions' }, [
          el('button', { className: 'btn btn-secondary btn-sm', textContent: 'Annuler', onClick: () => { overlay.remove(); resolve(false); } }),
          el('button', { className: 'btn btn-danger btn-sm', textContent: 'Supprimer', onClick: () => { overlay.remove(); resolve(true); } }),
        ]),
      ]);
      overlay.appendChild(box);
      overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
      document.body.appendChild(overlay);
    });
  }

  // ============================================
  // SIDEBAR NAVIGATION
  // ============================================
  function initNavigation() {
    const navItems = $$('.nav-item');
    const sections = $$('.editor-section');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.section;
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        sections.forEach(s => {
          s.classList.remove('active');
          if (s.id === `section-${target}`) {
            s.classList.add('active');
          }
        });
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
          $('#sidebar').classList.remove('open');
        }
      });
    });

    // Mobile toggle
    $('#sidebarToggle').addEventListener('click', () => {
      $('#sidebar').classList.toggle('open');
    });
  }

  // ============================================
  // LOAD DATA
  // ============================================
  async function loadData() {
    try {
      const resp = await fetch('data.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      data = await resp.json();
      populateAll();
      showToast('Données chargées avec succès');
    } catch (err) {
      console.error('Failed to load data.json:', err);
      showToast('Erreur lors du chargement de data.json', 'error');
    }
  }

  // ============================================
  // POPULATE ALL SECTIONS
  // ============================================
  function populateAll() {
    populatePersonal();
    populateAbout();
    populateTyping();
    populateSkills();
    populateProjects();
    populateExperience();
    populateCertifications();
    populateContact();
  }

  // ── Personal ──
  function populatePersonal() {
    const p = data.personal;
    $('#personal-firstName').value = p.firstName || '';
    $('#personal-lastName').value = p.lastName || '';
    $('#personal-title').value = p.title || '';
    $('#personal-description').value = p.description || '';
    $('#personal-email').value = p.email || '';
    $('#personal-linkedin').value = p.linkedin || '';
    $('#personal-github').value = p.github || '';
    $('#personal-badgeText').value = p.badgeText || '';
    const avail = $('#personal-available');
    avail.checked = !!p.available;
    updateAvailableLabel();
    avail.addEventListener('change', updateAvailableLabel);
  }

  function updateAvailableLabel() {
    const checked = $('#personal-available').checked;
    $('#availableLabel').textContent = checked ? 'Disponible' : 'Non disponible';
    $('#availableLabel').style.color = checked ? 'var(--accent-green)' : 'var(--text-muted)';
  }

  // ── About ──
  function populateAbout() {
    const a = data.about;
    $('#about-title').value = a.title || '';
    $('#about-photo').value = a.photo || '';
    updatePhotoPreview(a.photo || '');
    $('#about-paragraphs').value = (a.paragraphs || []).join('\n\n');

    // Stats
    const statsC = $('#statsContainer');
    statsC.innerHTML = '';
    (a.stats || []).forEach((s, i) => statsC.appendChild(createStatRow(s, i)));

    // Terminal
    const termC = $('#terminalContainer');
    termC.innerHTML = '';
    (a.terminal || []).forEach((t, i) => termC.appendChild(createTerminalRow(t, i)));
  }

  function createStatRow(stat, index) {
    const row = el('div', { className: 'dynamic-list-item', 'data-index': index });
    row.appendChild(el('input', { className: 'form-input', value: String(stat.value), placeholder: 'Valeur', 'data-field': 'value', type: 'number', style: 'max-width:80px' }));
    row.appendChild(el('input', { className: 'form-input', value: stat.suffix || '', placeholder: 'Suffixe', 'data-field': 'suffix', style: 'max-width:70px' }));
    row.appendChild(el('input', { className: 'form-input', value: stat.label || '', placeholder: 'Label', 'data-field': 'label' }));
    const removeBtn = el('button', { className: 'btn btn-icon btn-sm btn-danger', innerHTML: '✕', title: 'Supprimer' });
    removeBtn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer la statistique', 'Êtes-vous sûr de vouloir supprimer cette statistique ?')) {
        row.remove();
      }
    });
    row.appendChild(removeBtn);
    return row;
  }

  function createTerminalRow(term, index) {
    const row = el('div', { className: 'dynamic-list-item', 'data-index': index });
    row.appendChild(el('span', { textContent: '$', className: 'text-cyan font-semibold text-mono', style: 'flex-shrink:0' }));
    row.appendChild(el('input', { className: 'form-input mono', value: term.command || '', placeholder: 'commande', 'data-field': 'command', style: 'max-width:180px' }));
    row.appendChild(el('span', { textContent: '→', className: 'text-muted', style: 'flex-shrink:0' }));
    row.appendChild(el('input', { className: 'form-input mono', value: term.output || '', placeholder: 'résultat', 'data-field': 'output' }));
    const removeBtn = el('button', { className: 'btn btn-icon btn-sm btn-danger', innerHTML: '✕', title: 'Supprimer' });
    removeBtn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer la ligne', 'Supprimer cette ligne du terminal ?')) {
        row.remove();
      }
    });
    row.appendChild(removeBtn);
    return row;
  }

  // ── Typing Strings ──
  function populateTyping() {
    const container = $('#typingContainer');
    container.innerHTML = '';
    (data.typingStrings || []).forEach((str, i) => {
      container.appendChild(createTypingRow(str, i));
    });
  }

  function createTypingRow(text, index) {
    const row = el('div', { className: 'dynamic-list-item', 'data-index': index });
    row.appendChild(el('span', { className: 'drag-handle', textContent: '⠿' }));
    row.appendChild(el('input', { className: 'form-input', value: text, placeholder: 'Texte animé...' }));
    const removeBtn = el('button', { className: 'btn btn-icon btn-sm btn-danger', innerHTML: '✕', title: 'Supprimer' });
    removeBtn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer le texte', 'Supprimer ce texte animé ?')) {
        row.remove();
      }
    });
    row.appendChild(removeBtn);

    // Drag reorder
    row.draggable = true;
    row.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'move';
      row.style.opacity = '0.4';
      row.dataset.dragging = 'true';
    });
    row.addEventListener('dragend', () => {
      row.style.opacity = '1';
      delete row.dataset.dragging;
    });
    row.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const dragging = row.parentElement.querySelector('[data-dragging]');
      if (dragging && dragging !== row) {
        const rect = row.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (e.clientY < mid) {
          row.parentElement.insertBefore(dragging, row);
        } else {
          row.parentElement.insertBefore(dragging, row.nextSibling);
        }
      }
    });

    return row;
  }

  // ── Skills ──
  function populateSkills() {
    const container = $('#skillsContainer');
    container.innerHTML = '';
    (data.skills || []).forEach((cat, i) => {
      container.appendChild(createSkillCategoryCard(cat, i));
    });
  }

  function createSkillCategoryCard(category, catIndex) {
    const card = el('div', { className: 'card card-glass', 'data-cat-index': catIndex });

    const header = el('div', { className: 'card-header' });
    const titleBlock = el('div', { className: 'flex items-center gap-3', style: 'flex:1;gap:12px' });
    titleBlock.appendChild(el('input', { className: 'form-input', value: category.icon || '', placeholder: '🎯', style: 'max-width:50px;text-align:center', 'data-field': 'icon' }));
    titleBlock.appendChild(el('input', { className: 'form-input', value: category.category || '', placeholder: 'Nom de la catégorie', 'data-field': 'category' }));
    titleBlock.appendChild(el('input', { className: 'form-input mono', value: category.colorClass || '', placeholder: 'colorClass', 'data-field': 'colorClass', style: 'max-width:120px' }));
    titleBlock.appendChild(el('input', { className: 'form-input mono', value: category.barClass || '', placeholder: 'barClass', 'data-field': 'barClass', style: 'max-width:100px' }));
    header.appendChild(titleBlock);

    const addSkillBtn = el('button', { className: 'btn btn-sm btn-ghost', textContent: '＋ Skill' });
    addSkillBtn.addEventListener('click', () => {
      const itemsWrapper = card.querySelector('.skills-items');
      itemsWrapper.appendChild(createSkillItem({ name: '', percent: 50 }));
    });
    header.appendChild(addSkillBtn);
    card.appendChild(header);

    const itemsWrapper = el('div', { className: 'skills-items' });
    (category.items || []).forEach(item => {
      itemsWrapper.appendChild(createSkillItem(item));
    });
    card.appendChild(itemsWrapper);

    return card;
  }

  function createSkillItem(item) {
    const row = el('div', { className: 'skill-item' });
    const headerRow = el('div', { className: 'skill-item-header' });
    headerRow.appendChild(el('input', { className: 'form-input', value: item.name || '', placeholder: 'Nom de la compétence', 'data-field': 'name' }));

    const removeBtn = el('button', { className: 'btn btn-icon btn-sm btn-danger', innerHTML: '✕', title: 'Supprimer' });
    removeBtn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer la compétence', `Supprimer « ${item.name || 'cette compétence'} » ?`)) {
        row.remove();
      }
    });
    headerRow.appendChild(removeBtn);
    row.appendChild(headerRow);

    const rangeGroup = el('div', { className: 'range-group' });
    const slider = el('input', { className: 'range-slider', type: 'range', min: '0', max: '100', value: String(item.percent || 0), 'data-field': 'percent' });
    const valueLabel = el('span', { className: 'range-value', textContent: `${item.percent || 0}%` });
    slider.addEventListener('input', () => { valueLabel.textContent = `${slider.value}%`; });
    rangeGroup.appendChild(slider);
    rangeGroup.appendChild(valueLabel);
    row.appendChild(rangeGroup);

    return row;
  }

  // ── Projects ──
  function populateProjects() {
    const container = $('#projectsContainer');
    container.innerHTML = '';
    (data.projects || []).forEach((proj, i) => {
      container.appendChild(createProjectCard(proj, i));
    });
  }

  function createProjectCard(proj, index) {
    const card = el('div', { className: 'card card-glass', style: 'position:relative' });

    // Remove button
    const removeBtn = el('button', { className: 'remove-btn', innerHTML: '✕', title: 'Supprimer ce projet' });
    removeBtn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer le projet', `Supprimer « ${proj.title || 'ce projet'} » ?`)) {
        card.remove();
      }
    });
    card.appendChild(removeBtn);

    const header = el('div', { className: 'card-header' });
    header.appendChild(el('span', { className: 'card-title', innerHTML: `<span class="card-title-icon">🚀</span> Projet #${index + 1}` }));
    header.appendChild(el('span', { className: 'card-number', textContent: `#${index + 1}` }));
    card.appendChild(header);

    const grid = el('div', { className: 'form-grid' });

    grid.appendChild(formGroup('Titre', el('input', { className: 'form-input', value: proj.title || '', 'data-field': 'title', placeholder: 'Titre du projet' })));
    grid.appendChild(formGroup('Icône', el('input', { className: 'form-input', value: proj.icon || '', 'data-field': 'icon', placeholder: '🏗️', style: 'max-width:80px' })));
    grid.appendChild(formGroupFull('Description', el('textarea', { className: 'form-textarea', 'data-field': 'description', placeholder: 'Description du projet', textContent: proj.description || '', rows: '3' })));
    grid.appendChild(formGroup('Tags (séparés par des virgules)', el('input', { className: 'form-input', value: (proj.tags || []).join(', '), 'data-field': 'tags', placeholder: 'Cloud, AWS' })));
    grid.appendChild(formGroup('Tech Stack (séparés par des virgules)', el('input', { className: 'form-input', value: (proj.techStack || []).join(', '), 'data-field': 'techStack', placeholder: 'AWS, Terraform' })));
    grid.appendChild(formGroupFull('Gradient CSS', el('input', { className: 'form-input mono', value: proj.gradient || '', 'data-field': 'gradient', placeholder: 'linear-gradient(135deg, ...)' })));
    grid.appendChild(formGroupFull('Contexte du projet', el('textarea', { className: 'form-textarea', 'data-field': 'context', placeholder: 'Contexte du projet...', textContent: proj.context || '', rows: '3' })));
    grid.appendChild(formGroupFull('Défis techniques rencontrés', el('textarea', { className: 'form-textarea', 'data-field': 'challenges', placeholder: 'Défis techniques rencontrés...', textContent: proj.challenges || '', rows: '3' })));

    // Cover Image selector
    const coverInput = el('input', { className: 'form-input', value: proj.cover || '', 'data-field': 'cover', placeholder: 'URL de la cover...' });
    const coverFile = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    const coverPreview = el('div', { className: 'photo-preview-box', style: 'width:60px; height:60px;' });
    const updateCoverPreview = (val) => {
      if (val) {
        coverPreview.innerHTML = `<img src="${val}" alt="Cover preview" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" /><span class="photo-preview-empty" style="display:none;">Erreur</span>`;
      } else {
        coverPreview.innerHTML = `<span class="photo-preview-empty" style="font-size:0.55rem;">Aucune</span>`;
      }
    };
    updateCoverPreview(proj.cover);
    const btnChooseCover = el('button', { className: 'btn btn-sm btn-ghost', textContent: '📁 Charger', type: 'button' });
    btnChooseCover.addEventListener('click', () => coverFile.click());
    coverFile.addEventListener('change', () => {
      const file = coverFile.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        coverInput.value = e.target.result;
        updateCoverPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    });
    coverInput.addEventListener('input', () => updateCoverPreview(coverInput.value.trim()));
    const coverGroup = el('div', { className: 'form-group' });
    coverGroup.appendChild(el('label', { className: 'form-label', textContent: 'Image de Cover' }));
    coverGroup.appendChild(el('div', { className: 'photo-upload-wrapper', style: 'gap:10px' }, [
      coverPreview,
      el('div', { className: 'flex flex-col gap-2', style: 'flex:1' }, [
        coverFile,
        el('div', { className: 'flex gap-2' }, [
          btnChooseCover,
          el('button', { className: 'btn btn-sm btn-danger', textContent: '✕', type: 'button', onClick: () => { coverInput.value = ''; updateCoverPreview(''); } })
        ]),
        coverInput
      ])
    ]));

    // Diagram selector
    const diagInput = el('input', { className: 'form-input', value: proj.diagram || '', 'data-field': 'diagram', placeholder: 'URL du schéma...' });
    const diagFile = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    const diagPreview = el('div', { className: 'photo-preview-box', style: 'width:60px; height:60px;' });
    const updateDiagPreview = (val) => {
      if (val) {
        diagPreview.innerHTML = `<img src="${val}" alt="Schéma preview" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" /><span class="photo-preview-empty" style="display:none;">Erreur</span>`;
      } else {
        diagPreview.innerHTML = `<span class="photo-preview-empty" style="font-size:0.55rem;">Aucun</span>`;
      }
    };
    updateDiagPreview(proj.diagram);
    const btnChooseDiag = el('button', { className: 'btn btn-sm btn-ghost', textContent: '📁 Charger', type: 'button' });
    btnChooseDiag.addEventListener('click', () => diagFile.click());
    diagFile.addEventListener('change', () => {
      const file = diagFile.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        diagInput.value = e.target.result;
        updateDiagPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    });
    diagInput.addEventListener('input', () => updateDiagPreview(diagInput.value.trim()));
    const diagGroup = el('div', { className: 'form-group' });
    diagGroup.appendChild(el('label', { className: 'form-label', textContent: 'Schéma Réseau / Architecture' }));
    diagGroup.appendChild(el('div', { className: 'photo-upload-wrapper', style: 'gap:10px' }, [
      diagPreview,
      el('div', { className: 'flex flex-col gap-2', style: 'flex:1' }, [
        diagFile,
        el('div', { className: 'flex gap-2' }, [
          btnChooseDiag,
          el('button', { className: 'btn btn-sm btn-danger', textContent: '✕', type: 'button', onClick: () => { diagInput.value = ''; updateDiagPreview(''); } })
        ]),
        diagInput
      ])
    ]));

    grid.appendChild(coverGroup);
    grid.appendChild(diagGroup);
    card.appendChild(grid);

    // Missions
    const missionsLabel = el('label', { className: 'form-label mt-6', innerHTML: '<span class="label-icon">🎯</span> Missions menées' });
    card.appendChild(missionsLabel);

    const missionList = el('div', { className: 'task-list', 'data-list': 'missions' });
    (proj.missions || []).forEach(m => {
      missionList.appendChild(createTaskRow(m));
    });
    card.appendChild(missionList);

    const addMissionBtn = el('button', { className: 'btn btn-sm btn-ghost mt-4', textContent: '＋ Ajouter une mission' });
    addMissionBtn.addEventListener('click', () => {
      missionList.appendChild(createTaskRow(''));
    });
    card.appendChild(addMissionBtn);

    // Results
    const resultsLabel = el('label', { className: 'form-label mt-6', innerHTML: '<span class="label-icon">📊</span> Résultats obtenus' });
    card.appendChild(resultsLabel);

    const resultList = el('div', { className: 'task-list', 'data-list': 'results' });
    (proj.results || []).forEach(r => {
      resultList.appendChild(createTaskRow(r));
    });
    card.appendChild(resultList);

    const addResultBtn = el('button', { className: 'btn btn-sm btn-ghost mt-4', textContent: '＋ Ajouter un résultat' });
    addResultBtn.addEventListener('click', () => {
      resultList.appendChild(createTaskRow(''));
    });
    card.appendChild(addResultBtn);
    return card;
  }

  // ── Experience ──
  function populateExperience() {
    const container = $('#experienceContainer');
    container.innerHTML = '';
    (data.experience || []).forEach((exp, i) => {
      container.appendChild(createExperienceCard(exp, i));
    });
  }

  function createExperienceCard(exp, index) {
    const card = el('div', { className: 'card card-glass', style: 'position:relative' });

    const removeBtn = el('button', { className: 'remove-btn', innerHTML: '✕', title: 'Supprimer cette expérience' });
    removeBtn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer l\'expérience', `Supprimer « ${exp.role || 'cette expérience'} » ?`)) {
        card.remove();
      }
    });
    card.appendChild(removeBtn);

    const header = el('div', { className: 'card-header' });
    header.appendChild(el('span', { className: 'card-title', innerHTML: `<span class="card-title-icon">💼</span> Expérience #${index + 1}` }));
    card.appendChild(header);

    const grid = el('div', { className: 'form-grid' });
    grid.appendChild(formGroup('Période', el('input', { className: 'form-input', value: exp.date || '', 'data-field': 'date', placeholder: '2022 — Présent' })));
    grid.appendChild(formGroup('Localisation', el('input', { className: 'form-input', value: exp.location || '', 'data-field': 'location', placeholder: 'Paris' })));
    grid.appendChild(formGroup('Poste', el('input', { className: 'form-input', value: exp.role || '', 'data-field': 'role', placeholder: 'Ingénieur...' })));
    grid.appendChild(formGroup('Entreprise', el('input', { className: 'form-input', value: exp.company || '', 'data-field': 'company', placeholder: 'Nom de l\'entreprise' })));
    card.appendChild(grid);

    // Tasks
    const tasksLabel = el('label', { className: 'form-label mt-6', innerHTML: '<span class="label-icon">📋</span> Tâches / Missions' });
    card.appendChild(tasksLabel);

    const taskList = el('div', { className: 'task-list' });
    (exp.tasks || []).forEach(task => {
      taskList.appendChild(createTaskRow(task));
    });
    card.appendChild(taskList);

    const addTaskBtn = el('button', { className: 'btn btn-sm btn-ghost mt-4', textContent: '＋ Ajouter une tâche' });
    addTaskBtn.addEventListener('click', () => {
      taskList.appendChild(createTaskRow(''));
    });
    card.appendChild(addTaskBtn);

    return card;
  }

  function createTaskRow(taskText) {
    const row = el('div', { className: 'task-item' });
    row.appendChild(el('span', { className: 'task-bullet', textContent: '●' }));
    row.appendChild(el('input', { className: 'form-input', value: taskText, placeholder: 'Description de la tâche...' }));
    const removeBtn = el('button', { className: 'btn btn-icon btn-sm btn-danger', innerHTML: '✕' });
    removeBtn.addEventListener('click', () => row.remove());
    row.appendChild(removeBtn);
    return row;
  }

  // ── Certifications ──
  function populateCertifications() {
    const container = $('#certificationsContainer');
    container.innerHTML = '';
    (data.certifications || []).forEach((cert, i) => {
      container.appendChild(createCertCard(cert, i));
    });
  }

  function createCertCard(cert, index) {
    const card = el('div', { className: 'card card-glass', style: 'position:relative' });

    const removeBtn = el('button', { className: 'remove-btn', innerHTML: '✕', title: 'Supprimer' });
    removeBtn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer la certification', `Supprimer « ${cert.name || 'cette certification'} » ?`)) {
        card.remove();
      }
    });
    card.appendChild(removeBtn);

    const grid = el('div', { className: 'form-grid form-grid-3' });
    grid.appendChild(formGroup('Icône', el('input', { className: 'form-input', value: cert.icon || '', 'data-field': 'icon', placeholder: '🏅', style: 'max-width:60px' })));
    grid.appendChild(formGroup('Nom', el('input', { className: 'form-input', value: cert.name || '', 'data-field': 'name', placeholder: 'Nom de la certification' })));
    grid.appendChild(formGroup('Organisme', el('input', { className: 'form-input', value: cert.issuer || '', 'data-field': 'issuer', placeholder: 'Ex: AWS, Cisco...' })));
    card.appendChild(grid);

    return card;
  }

  // ── Contact ──
  function populateContact() {
    const c = data.contact;
    $('#contact-title').value = c.title || '';
    $('#contact-description').value = c.description || '';
  }

  // ============================================
  // FORM HELPERS
  // ============================================
  function formGroup(labelText, inputEl) {
    const group = el('div', { className: 'form-group' });
    group.appendChild(el('label', { className: 'form-label', textContent: labelText }));
    group.appendChild(inputEl);
    return group;
  }

  function formGroupFull(labelText, inputEl) {
    const group = el('div', { className: 'form-group full-width' });
    group.appendChild(el('label', { className: 'form-label', textContent: labelText }));
    group.appendChild(inputEl);
    return group;
  }

  // ============================================
  // ADD BUTTON HANDLERS
  // ============================================
  function initAddButtons() {
    // Add stat
    $('#addStat').addEventListener('click', () => {
      $('#statsContainer').appendChild(createStatRow({ value: 0, suffix: '', label: '' }, Date.now()));
    });

    // Add terminal line
    $('#addTerminal').addEventListener('click', () => {
      $('#terminalContainer').appendChild(createTerminalRow({ command: '', output: '' }, Date.now()));
    });

    // Add typing string
    $('#addTypingString').addEventListener('click', () => {
      $('#typingContainer').appendChild(createTypingRow('', Date.now()));
    });

    // Add project
    $('#addProject').addEventListener('click', () => {
      const count = $$('#projectsContainer .card').length;
      const newProj = { title: '', description: '', tags: [], techStack: [], icon: '📁', gradient: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.1))', cover: '', diagram: '', context: '', missions: [], results: [], challenges: '' };
      $('#projectsContainer').appendChild(createProjectCard(newProj, count));
    });

    // Add experience
    $('#addExperience').addEventListener('click', () => {
      const count = $$('#experienceContainer .card').length;
      const newExp = { date: '', role: '', company: '', location: '', tasks: [] };
      $('#experienceContainer').appendChild(createExperienceCard(newExp, count));
    });

    // Add certification
    $('#addCertification').addEventListener('click', () => {
      const newCert = { name: '', issuer: '', icon: '🏅' };
      $('#certificationsContainer').appendChild(createCertCard(newCert, Date.now()));
    });
  }

  // ============================================
  // COLLECT & EXPORT
  // ============================================
  function collectData() {
    const result = {};

    // Personal
    result.personal = {
      firstName: $('#personal-firstName').value,
      lastName: $('#personal-lastName').value,
      title: $('#personal-title').value,
      description: $('#personal-description').value,
      email: $('#personal-email').value,
      linkedin: $('#personal-linkedin').value,
      github: $('#personal-github').value,
      available: $('#personal-available').checked,
      badgeText: $('#personal-badgeText').value,
    };

    // About
    const paragraphsRaw = $('#about-paragraphs').value.trim();
    result.about = {
      title: $('#about-title').value,
      photo: $('#about-photo').value.trim(),
      paragraphs: paragraphsRaw ? paragraphsRaw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean) : [],
      stats: $$('#statsContainer .dynamic-list-item').map(row => {
        const inputs = row.querySelectorAll('input');
        return {
          value: parseInt(inputs[0].value, 10) || 0,
          suffix: inputs[1].value,
          label: inputs[2].value,
        };
      }),
      terminal: $$('#terminalContainer .dynamic-list-item').map(row => {
        const inputs = row.querySelectorAll('input');
        return {
          command: inputs[0].value,
          output: inputs[1].value,
        };
      }),
    };

    // Typing strings
    result.typingStrings = $$('#typingContainer .dynamic-list-item').map(row => {
      return row.querySelector('input.form-input').value;
    }).filter(Boolean);

    // Skills
    result.skills = $$('#skillsContainer .card').map(card => {
      const icon = card.querySelector('[data-field="icon"]').value;
      const category = card.querySelector('[data-field="category"]').value;
      const colorClass = card.querySelector('[data-field="colorClass"]').value;
      const barClass = card.querySelector('[data-field="barClass"]').value;
      const items = $$('.skill-item', card).map(si => ({
        name: si.querySelector('[data-field="name"]').value,
        percent: parseInt(si.querySelector('[data-field="percent"]').value, 10) || 0,
      }));
      return { category, icon, colorClass, barClass, items };
    });

    // Projects
    result.projects = $$('#projectsContainer .card').map(card => {
      const title = card.querySelector('[data-field="title"]').value;
      const description = card.querySelector('[data-field="description"]').value;
      const tagsRaw = card.querySelector('[data-field="tags"]').value;
      const techRaw = card.querySelector('[data-field="techStack"]').value;
      const icon = card.querySelector('[data-field="icon"]').value;
      const gradient = card.querySelector('[data-field="gradient"]').value;
      const cover = card.querySelector('[data-field="cover"]').value;
      const diagram = card.querySelector('[data-field="diagram"]').value;
      const context = card.querySelector('[data-field="context"]').value;
      const challenges = card.querySelector('[data-field="challenges"]').value;
      const missionsContainer = card.querySelector('[data-list="missions"]');
      const missions = missionsContainer ? $$('.task-item input', missionsContainer).map(inp => inp.value).filter(Boolean) : [];
      const resultsContainer = card.querySelector('[data-list="results"]');
      const results = resultsContainer ? $$('.task-item input', resultsContainer).map(inp => inp.value).filter(Boolean) : [];
      return {
        title,
        description,
        tags: tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
        techStack: techRaw ? techRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
        icon,
        gradient,
        cover,
        diagram,
        context,
        missions,
        results,
        challenges,
      };
    });

    // Experience
    result.experience = $$('#experienceContainer .card').map(card => {
      const date = card.querySelector('[data-field="date"]').value;
      const role = card.querySelector('[data-field="role"]').value;
      const company = card.querySelector('[data-field="company"]').value;
      const location = card.querySelector('[data-field="location"]').value;
      const tasks = $$('.task-item input', card).map(inp => inp.value).filter(Boolean);
      return { date, role, company, location, tasks };
    });

    // Certifications
    result.certifications = $$('#certificationsContainer .card').map(card => ({
      name: card.querySelector('[data-field="name"]').value,
      issuer: card.querySelector('[data-field="issuer"]').value,
      icon: card.querySelector('[data-field="icon"]').value,
    }));

    // Contact
    result.contact = {
      title: $('#contact-title').value,
      description: $('#contact-description').value,
    };

    return result;
  }

  function exportJSON() {
    try {
      const json = collectData();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('data.json exporté avec succès !');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Erreur lors de l\'export', 'error');
    }
  }

  // ============================================
  // PHOTO UPLOADER
  // ============================================
  function initPhotoUploader() {
    const inputPhoto = $('#about-photo');
    const inputFile = $('#about-photo-file');
    const btnChoose = $('#btnChoosePhoto');
    const btnRemove = $('#btnRemovePhoto');

    if (!inputPhoto || !inputFile) return;

    btnChoose.addEventListener('click', () => inputFile.click());

    inputFile.addEventListener('change', () => {
      const file = inputFile.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        inputPhoto.value = base64;
        updatePhotoPreview(base64);
      };
      reader.readAsDataURL(file);
    });

    inputPhoto.addEventListener('input', () => {
      updatePhotoPreview(inputPhoto.value.trim());
    });

    btnRemove.addEventListener('click', () => {
      inputPhoto.value = '';
      inputFile.value = '';
      updatePhotoPreview('');
    });
  }

  function updatePhotoPreview(value) {
    const previewBox = $('#photoPreviewBox');
    const btnRemove = $('#btnRemovePhoto');

    if (!previewBox) return;

    if (value) {
      previewBox.innerHTML = `<img src="${value}" alt="Aperçu" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                              <span class="photo-preview-empty" style="display:none;">URL invalide</span>`;
      btnRemove.style.display = 'inline-flex';
    } else {
      previewBox.innerHTML = `<span class="photo-preview-empty">Aucune image</span>`;
      btnRemove.style.display = 'none';
    }
  }

  // ============================================
  // PREVENT FORM SUBMIT
  // ============================================
  function preventFormSubmit() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
      }
    });
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    initNavigation();
    initAddButtons();
    initPhotoUploader();
    preventFormSubmit();
    $('#btnExport').addEventListener('click', exportJSON);
    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
