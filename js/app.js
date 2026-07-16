/**
 * ==========================================
 * APLICACIÓN PNL - Plataforma Educativa
 * Arquitectura modular con validación y accesibilidad
 * ==========================================
 */

// ==========================================
// SISTEMA CORE: Utilidades y Validación
// ==========================================

const AppUtils = {
    /**
     * Verifica si un elemento existe antes de operar sobre él
     * @param {string} id - ID del elemento (sin #)
     * @returns {Element|null}
     */
    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Elemento no encontrado: #${id}`);
        }
        return element;
    },

    /**
     * Muestra notificaciones toast al usuario
     * @param {string} message 
     * @param {'info'|'success'|'error'|'warning'} type 
     */
    notify(message, type = 'info') {
        let container = this.getElement('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 max-w-sm space-y-2';
            container.setAttribute('aria-label', 'Notificaciones');
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 translate-x-full opacity-0 ${this.getNotificationClasses(type)}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
        notification.innerHTML = `<span class="font-semibold mr-2">${icons[type] || icons.info}</span>${message}`;
        container.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        });

        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    },

    getNotificationClasses(type) {
        const classes = {
            info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200',
            success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-200',
            error: 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200',
            warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-800 dark:text-amber-200'
        };
        return classes[type] || classes.info;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// ==========================================
// SISTEMA CORE: Persistencia y Estado
// ==========================================

const AppState = {
    STORAGE_KEY: 'edu_platform_pnl',
    state: { theme: 'light', readSections: [], quizScores: {} },

    init() { this.load(); },

    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
                return true;
            }
        } catch (e) {
            console.error('Error cargando estado:', e);
            AppUtils.notify('No se pudo cargar tu progreso anterior', 'warning');
        }
        return false;
    },

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
            return true;
        } catch (e) {
            console.error('Error guardando estado:', e);
            AppUtils.notify('No se pudo guardar tu progreso', 'error');
            return false;
        }
    },

    get(key) { return this.state[key]; },

    set(key, value) { this.state[key] = value; this.save(); },

    addReadSection(sectionId) {
        if (!this.state.readSections.includes(sectionId)) {
            this.state.readSections.push(sectionId);
            this.save();
            return true;
        }
        return false;
    },

    setQuizScore(moduleId, score) {
        this.state.quizScores[moduleId] = score;
        this.save();
    }
};

// ==========================================
// SISTEMA CORE: Tema (Modo Oscuro/Claro)
// ==========================================

const ThemeManager = {
    init() { this.apply(); this.bindEvents(); },

    apply() {
        const isDark = AppState.get('theme') === 'dark' || 
            (!AppState.get('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        document.documentElement.classList.toggle('dark', isDark);
        
        const moonIcon = AppUtils.getElement('icon-moon');
        const sunIcon = AppUtils.getElement('icon-sun');
        
        if (moonIcon && sunIcon) {
            moonIcon.classList.toggle('hidden', isDark);
            sunIcon.classList.toggle('hidden', !isDark);
        }
    },

    toggle() {
        const isDark = document.documentElement.classList.contains('dark');
        AppState.set('theme', isDark ? 'light' : 'dark');
        this.apply();
        AppUtils.notify(`Tema ${isDark ? 'claro' : 'oscuro'} activado`, 'info');
    },

    bindEvents() {
        const themeToggle = AppUtils.getElement('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggle());
        }
    }
};

// ==========================================
// SISTEMA CORE: Navegación Móvil
// ==========================================

const NavigationManager = {
    sidebar: null, overlay: null, menuBtn: null,

    init() {
        this.sidebar = AppUtils.getElement('sidebar');
        this.overlay = AppUtils.getElement('overlay');
        this.menuBtn = AppUtils.getElement('menu-btn');
        if (!this.sidebar || !this.menuBtn) return;
        this.bindEvents();
    },

    isOpen() { return this.sidebar && !this.sidebar.classList.contains('-translate-x-full'); },

    toggle(forceClose = false) {
        if (!this.sidebar || !this.overlay || !this.menuBtn) return;
        const shouldOpen = forceClose ? false : !this.isOpen();
        
        this.sidebar.classList.toggle('-translate-x-full', !shouldOpen);
        this.overlay.classList.toggle('hidden', !shouldOpen);
        this.menuBtn.setAttribute('aria-expanded', shouldOpen);
        this.menuBtn.setAttribute('aria-label', shouldOpen ? 'Cerrar menú' : 'Abrir menú');
        
        if (shouldOpen) {
            const firstLink = this.sidebar.querySelector('.nav-link');
            if (firstLink) firstLink.focus();
        } else {
            this.menuBtn.focus();
        }
    },

    bindEvents() {
        this.menuBtn.addEventListener('click', () => this.toggle());
        if (this.overlay) this.overlay.addEventListener('click', () => this.toggle(true));
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.toggle(true);
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) this.toggle(true);
            });
        });
    }
};

// ==========================================
// SISTEMA CORE: Scrollspy y Progreso
// ==========================================

const ProgressManager = {
    observer: null, totalSections: 9,

    init() {
        const progressBar = AppUtils.getElement('progress-bar');
        const progressText = AppUtils.getElement('progress-text');
        if (!progressBar || !progressText) return;
        this.setupObserver();
        this.observeSections();
        this.updateDisplay();
    },

    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) this.markAsActive(entry.target.getAttribute('id'));
            });
        }, { rootMargin: '-30% 0px -60% 0px' });
    },

    observeSections() {
        document.querySelectorAll('.modulo-container').forEach(section => {
            this.observer.observe(section);
        });
    },

    markAsActive(sectionId) {
        if (!sectionId) return;
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${sectionId}`);
            if (href === `#${sectionId}`) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        AppState.addReadSection(sectionId);
        this.updateDisplay();
    },

    updateDisplay() {
        const progressBar = AppUtils.getElement('progress-bar');
        const progressText = AppUtils.getElement('progress-text');
        if (!progressBar || !progressText) return;
        const sections = AppState.get('readSections');
        const percentage = Math.round((sections.length / this.totalSections) * 100);
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
    }
};

// ==========================================
// SISTEMA CORE: Renderizado de Contenido Dinámico
// ==========================================

const ContentRenderer = {
    init() { this.processAll(); },

    processAll() {
        document.querySelectorAll('.modulo-container').forEach(container => this.process(container));
    },

    process(container) {
        if (!container) return;
        try {
            if (window.renderMathInElement) {
                window.renderMathInElement(container, {
                    delimiters: [
                        { left: '\\\\(', right: '\\\\)', display: false },
                        { left: '\\\\[', right: '\\\\]', display: true }
                    ],
                    throwOnError: false
                });
            }
            if (window.mermaid) {
                const mermaidBlocks = container.querySelectorAll('.mermaid:not([data-processed])');
                mermaidBlocks.forEach((block, index) => {
                    block.setAttribute('data-processed', 'true');
                    block.id = `mermaid-graph-${Date.now()}-${index}`;
                });
                if (mermaidBlocks.length > 0) window.mermaid.run({ nodes: mermaidBlocks });
            }
            if (window.Prism) window.Prism.highlightAllUnder(container);
        } catch (e) {
            console.error('Error procesando contenido dinámico:', e);
        }
    }
};

// ==========================================
// CONSTRUCTOR DE QUIZZES REUTILIZABLE
// ==========================================

const QuizBuilder = {
    build(containerId, scoreId, moduleId, questions) {
        const container = AppUtils.getElement(containerId);
        const scoreDisplay = AppUtils.getElement(scoreId);
        if (!container || !scoreDisplay) return;

        let score = 0;
        const answered = new Array(questions.length).fill(false);

        questions.forEach((item, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800';
            qDiv.innerHTML = `
                <p class="font-semibold mb-3" id="${containerId}-q${index}-label">${index + 1}. ${item.q}</p>
                <div class="space-y-2" role="group" aria-labelledby="${containerId}-q${index}-label">
                    ${item.options.map((opt, i) => `
                        <button class="quiz-btn w-full text-left p-3 rounded text-sm bg-gray-50 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-gray-200 dark:border-gray-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                                data-q="${index}" data-opt="${i}" aria-label="Opción ${i + 1}: ${opt}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div class="feedback mt-3 p-3 rounded text-sm hidden" role="status" aria-live="polite"></div>
            `;
            container.appendChild(qDiv);
        });

        container.querySelectorAll('.quiz-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const qIdx = parseInt(this.dataset.q);
                const optIdx = parseInt(this.dataset.opt);
                if (answered[qIdx]) return;
                answered[qIdx] = true;

                const buttons = container.querySelectorAll(`[data-q="${qIdx}"]`);
                const feedbackDiv = this.parentElement.nextElementSibling;
                const isCorrect = optIdx === questions[qIdx].correct;

                buttons.forEach((b, i) => {
                    b.disabled = true;
                    b.classList.add('cursor-not-allowed');
                    if (i === questions[qIdx].correct) {
                        b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300');
                    } else if (i === optIdx && !isCorrect) {
                        b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500', 'text-red-700', 'dark:text-red-300');
                    } else {
                        b.classList.add('opacity-50');
                    }
                });

                feedbackDiv.classList.remove('hidden');
                if (isCorrect) {
                    score++;
                    feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Correcto.</span> <span class="text-gray-600 dark:text-gray-400">${questions[qIdx].feedback}</span>`;
                    AppUtils.notify('¡Respuesta correcta!', 'success');
                } else {
                    feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗ Incorrecto.</span> <span class="text-gray-600 dark:text-gray-400">${questions[qIdx].feedback}</span>`;
                    AppUtils.notify('Respuesta incorrecta. ¡Sigue intentándolo!', 'info');
                }

                scoreDisplay.textContent = `${score}/${questions.length}`;
                AppState.setQuizScore(moduleId, score);
            });
        });
    }
};

// ==========================================
// MÓDULO 1: Laboratorio Mapa vs Territorio
// ==========================================

const Module1 = {
    init() {
        const container = AppUtils.getElement('modulo-1');
        if (!container) return;
        ContentRenderer.process(container);
        this.setupLab();
        this.setupQuiz();
    },

    setupLab() {
        const emocion = AppUtils.getElement('lab-emocion');
        const creencia = AppUtils.getElement('lab-creencia');
        const vak = AppUtils.getElement('lab-vak');
        const output = AppUtils.getElement('lab-output');
        if (!emocion || !creencia || !vak || !output) return;

        const scenarios = {
            'ansioso-amenaza': {
                visual: "Ves cómo te mira de reojo y desvía la mirada rápidamente.",
                auditivo: "Escuchas el eco de sus pasos como si estuviera huyendo de ti.",
                kinestesico: "Sientes un nudo en el estómago y tensión en los hombros.",
                conclusion: "Interpretación: 'Está enfadado conmigo, he hecho algo mal.'"
            },
            'relajado-oportunidad': {
                visual: "Ves que mira su teléfono absorto mientras camina.",
                auditivo: "Apenas registras el sonido de su caminar.",
                kinestesico: "Sientes ligereza en tu paso, sin alteración.",
                conclusion: "Interpretación: 'Está distraído. Le saludaré luego.'"
            },
            'irritado-juicio': {
                visual: "Ves su postura arrogante, levantando la barbilla para ignorarte.",
                auditivo: "Escuchas un suspiro de desdén en el aire.",
                kinestesico: "Sientes calor en la cara y puños cerrados.",
                conclusion: "Interpretación: 'Se cree mejor que yo, qué arrogante.'"
            }
        };

        const updateLab = () => {
            const key = `${emocion.value}-${creencia.value}`;
            const scenario = scenarios[key] || {
                visual: "Notas su expresión facial neutra y su mirada al frente.",
                auditivo: "Escuchas el ambiente normal de la oficina de fondo.",
                kinestesico: "Sientes una breve pausa en tu respiración.",
                conclusion: "Interpretación: 'Tal vez no me vio. Es ambiguo.'"
            };
            const text = scenario[vak.value] + " " + scenario.conclusion;
            output.innerHTML = `<p>${text}</p><p class="mt-2 text-xs italic text-gray-500 dark:text-gray-400">*Este es un ejemplo de cómo tus filtros construyen la realidad.</p>`;
        };

        [emocion, creencia, vak].forEach(el => el.addEventListener('change', updateLab));
        updateLab();
    },

    setupQuiz() {
        const quizData = [
            { q: "¿Qué significa el axioma 'El mapa no es el territorio'?", options: ["Que los mapas físicos son imprecisos.", "Que nuestra representación interna no es la realidad objetiva misma.", "Que debemos viajar para conocer el mundo.", "Que el lenguaje es más real que la materia."], correct: 1, feedback: "Nuestra representación (mapa) es una edición filtrada de la realidad objetiva (territorio)." },
            { q: "¿Quiénes son los cofundadores de la PNL?", options: ["Milton Erickson y Virginia Satir", "Robert Dilts y Judith DeLozier", "Richard Bandler y John Grinder", "Paul Watzlawick y Gregory Bateson"], correct: 2, feedback: "Bandler y Grinder la fundaron en UC Santa Cruz entre 1972 y 1975." },
            { q: "En el axioma 'El significado de la comunicación es la respuesta que obtienes', si el receptor no entiende, la responsabilidad primaria recae en:", options: ["El receptor, por no prestar atención.", "El emisor, por no codificar el mensaje en el mapa del receptor.", "El canal de comunicación.", "Ninguna, la comunicación es azarosa."], correct: 1, feedback: "La PNL enfatiza la responsabilidad del emisor para calibrar y ajustar su comunicación." },
            { q: "¿Qué disciplina aportó el concepto de 'Estructura Profunda vs Superficial'?", options: ["La Cibernética de Bateson", "La Semántica General de Korzybski", "La Gramática Transformacional de Chomsky", "La Terapia Gestalt de Perls"], correct: 2, feedback: "Chomsky postuló que lo que decimos (superficial) es una transformación de un significado más rico (profundo)." },
            { q: "Las 'Presuposiciones' de la PNL deben entenderse como:", options: ["Leyes neurobiológicas comprobadas", "Verdades absolutas universales", "Hipótesis operativas que, al asumirlas, generan flexibilidad", "Técnicas de manipulación coercitiva"], correct: 2, feedback: "No son leyes científicas, sino axiomas pragmáticos para enmarcar la intervención." },
            { q: "¿Cuál de los siguientes NO fue uno de los tres 'magos' modelados originalmente?", options: ["Fritz Perls", "Milton Erickson", "Carl Rogers", "Virginia Satir"], correct: 2, feedback: "Carl Rogers no fue uno de los modelados inicialmente." },
            { q: "El 'Modelado' en PNL se define como:", options: ["Imitar la ropa y postura de un exitoso.", "El proceso de extraer y replicar la estructura subjetiva de la excelencia.", "Analizar la infancia del paciente.", "Aplicar hipnosis profunda para borrar hábitos."], correct: 1, feedback: "Es el método nuclear: descubrir cómo un experto organiza su neurología, lenguaje y programas internos." },
            { q: "La 'Ley de la Variedad Requerida' se asocia con:", options: ["La rigidez del terapeuta", "La inhibición del paciente", "La flexibilidad conductual y de comunicación", "El uso de la mente consciente analítica"], correct: 2, feedback: "En un sistema interactivo, quien tiene más opciones de respuesta tiene el control." }
        ];
        QuizBuilder.build('quiz-container-1', 'quiz-score-1', 'mod1', quizData);
    }
};

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    AppState.init();
    ThemeManager.init();
    NavigationManager.init();
    ProgressManager.init();
    ContentRenderer.init();
    Module1.init();
    AppUtils.notify('Plataforma cargada correctamente', 'success');
});
