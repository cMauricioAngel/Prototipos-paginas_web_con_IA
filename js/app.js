    
        // ==========================================
        // SISTEMA CORE: Persistencia y Estado
        // ==========================================
        const STORAGE_KEY = 'edu_platform_pnl';
        let appState = {
            theme: 'light',
            readSections: [],
            quizScores: {}
        };

        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                appState = JSON.parse(savedState);
            }
        } catch (e) {
            console.error("Error al cargar el estado", e);
        }

        function saveState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
            } catch (e) {
                console.error("Error al guardar el estado", e);
            }
        }

        // ==========================================
        // SISTEMA CORE: Modo Oscuro
        // ==========================================
        function applyTheme() {
            const isDark = appState.theme === 'dark' || (!('theme' in appState) && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', isDark);
            document.getElementById('icon-moon').classList.toggle('hidden', isDark);
            document.getElementById('icon-sun').classList.toggle('hidden', !isDark);
        }

        document.getElementById('theme-toggle').addEventListener('click', () => {
            appState.theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            applyTheme();
            saveState();
        });
        applyTheme();

        // ==========================================
        // SISTEMA CORE: Navegación Móvil
        // ==========================================
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        const menuBtn = document.getElementById('menu-btn');

        function toggleSidebar(forceClose = false) {
            const isOpen = !sidebar.classList.contains('-translate-x-full');
            const shouldOpen = forceClose ? false : !isOpen;
            sidebar.classList.toggle('-translate-x-full', !shouldOpen);
            overlay.classList.toggle('hidden', !shouldOpen);
            menuBtn.setAttribute('aria-expanded', shouldOpen);
        }

        menuBtn.addEventListener('click', () => toggleSidebar());
        overlay.addEventListener('click', () => toggleSidebar(true));

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) toggleSidebar(true);
            });
        });

        // ==========================================
        // SISTEMA CORE: Scrollspy y Progreso
        // ==========================================
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.modulo-container');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');

        function updateProgress(sectionId) {
            if (!sectionId) return;
            const cleanId = sectionId.replace('#', '');
            if (!appState.readSections.includes(cleanId)) {
                appState.readSections.push(cleanId);
                saveState();
            }
            const totalSections = 9; // Mod 0, 1, 2, 3, 4, 5, 6, 7, 8
            const progress = (appState.readSections.length / totalSections) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                    updateProgress(id);
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        sections.forEach(section => observer.observe(section));

        // ==========================================
        // SISTEMA CORE: Renderizado Perezoso
        // ==========================================
        window.processDynamicContent = function(container) {
            try {
                if (window.renderMathInElement) {
                    renderMathInElement(container, {
                        delimiters: [
                            {left: '\\(', right: '\\)', display: false},
                            {left: '\\[', right: '\\]', display: true}
                        ],
                        throwOnError: false
                    });
                }
                if (window.mermaid) {
                    const mermaidBlocks = container.querySelectorAll('.mermaid');
                    mermaidBlocks.forEach((block, index) => {
                        if (!block.getAttribute('data-processed')) {
                            block.setAttribute('data-processed', 'true');
                            const id = `mermaid-graph-${Date.now()}-${index}`;
                            block.id = id;
                        }
                    });
                    window.mermaid.run({ nodes: mermaidBlocks });
                }
                if (window.Prism) {
                    window.Prism.highlightAllUnder(container);
                }
            } catch (e) {
                console.error("Error procesando contenido dinámico:", e);
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            const initialProgress = (appState.readSections.length / 9) * 100;
            progressBar.style.width = `${initialProgress}%`;
            progressText.textContent = `${Math.round(initialProgress)}%`;
        });
        
        // ==========================================
        // SCRIPTS MÓDULO 1
        // ==========================================
        (function() {
            'use strict';
            try {
                const mod1Container = document.getElementById('modulo-1');
                if (window.processDynamicContent) window.processDynamicContent(mod1Container);

                const labEmocion = document.getElementById('lab-emocion');
                const labCreencia = document.getElementById('lab-creencia');
                const labVak = document.getElementById('lab-vak');
                const labOutput = document.getElementById('lab-output');

                function updateLab() {
                    const emocion = labEmocion.value;
                    const creencia = labCreencia.value;
                    const vak = labVak.value;
                    let visualText = "", auditivoText = "", kinestesicoText = "", conclusion = "";

                    if (emocion === 'ansioso' && creencia === 'amenaza') {
                        visualText = "Ves cómo te mira de reojo y desvía la mirada rápidamente.";
                        auditivoText = "Escuchas el eco de sus pasos como si estuviera huyendo de ti.";
                        kinestesicoText = "Sientes un nudo en el estómago y tensión en los hombros.";
                        conclusion = "Interpretación: 'Está enfadado conmigo, he hecho algo mal.'";
                    } else if (emocion === 'relajado' && creencia === 'oportunidad') {
                        visualText = "Ves que mira su teléfono absorto mientras camina.";
                        auditivoText = "Apenas registras el sonido de su caminar.";
                        kinestesicoText = "Sientes ligereza en tu paso, sin alteración.";
                        conclusion = "Interpretación: 'Está distraído. Le saludaré luego.'";
                    } else if (emocion === 'irritado' && creencia === 'juicio') {
                        visualText = "Ves su postura arrogante, levantando la barbilla para ignorarte.";
                        auditivoText = "Escuchas un suspiro de desdén en el aire.";
                        kinestesicoText = "Sientes calor en la cara y puños cerrados.";
                        conclusion = "Interpretación: 'Se cree mejor que yo, qué arrogante.'";
                    } else {
                        visualText = "Notas su expresión facial neutra y su mirada al frente.";
                        auditivoText = "Escuchas el ambiente normal de la oficina de fondo.";
                        kinestesicoText = "Sientes una breve pausa en tu respiración.";
                        conclusion = "Interpretación: 'Tal vez no me vio. Es ambiguo.'";
                    }

                    let finalText = "";
                    if (vak === 'visual') finalText = visualText + " " + conclusion;
                    if (vak === 'auditivo') finalText = auditivoText + " " + conclusion;
                    if (vak === 'kinestesico') finalText = kinestesicoText + " " + conclusion;

                    labOutput.innerHTML = `<p>${finalText}</p><p class="mt-2 text-xs italic text-[var(--text-muted)]">*Este es un ejemplo de cómo tus filtros construyen la realidad, no de la realidad en sí.</p>`;
                }

                [labEmocion, labCreencia, labVak].forEach(el => el.addEventListener('change', updateLab));
                updateLab();

                const quizData1 = [
                    { q: "¿Qué significa el axioma 'El mapa no es el territorio'?", options: ["Que los mapas físicos son imprecisos.", "Que nuestra representación interna no es la realidad objetiva misma.", "Que debemos viajar para conocer el mundo.", "Que el lenguaje es más real que la materia."], correct: 1, feedback: "Nuestra representación (mapa) es una edición filtrada de la realidad objetiva (territorio)." },
                    { q: "¿Quiénes son los cofundadores de la PNL?", options: ["Milton Erickson y Virginia Satir", "Robert Dilts y Judith DeLozier", "Richard Bandler y John Grinder", "Paul Watzlawick y Gregory Bateson"], correct: 2, feedback: "Bandler y Grinder la fundaron en UC Santa Cruz entre 1972 y 1975." },
                    { q: "En el axioma 'El significado de la comunicación es la respuesta que obtienes', si el receptor no entiende, la responsabilidad primaria recae en:", options: ["El receptor, por no prestar atención.", "El emisor, por no codificar el mensaje en el mapa del receptor.", "El canal de comunicación.", "Ninguna, la comunicación es azarosa."], correct: 1, feedback: "La PNL enfatiza la responsabilidad del emisor para calibrar y ajustar su comunicación." },
                    { q: "¿Qué disciplina aportó el concepto de 'Estructura Profunda vs Superficial'?", options: ["La Cibernética de Bateson", "La Semántica General de Korzybski", "La Gramática Transformacional de Chomsky", "La Terapia Gestalt de Perls"], correct: 2, feedback: "Chomsky postuló que lo que decimos (superficial) es una transformación de un significado más rico (profundo)." },
                    { q: "Las 'Presuposiciones' de la PNL deben entenderse como:", options: ["Leyes neurobiológicas comprobadas", "Verdades absolutas universales", "Hipótesis operativas que, al asumirlas, generan flexibilidad", "Técnicas de manipulación coercitiva"], correct: 2, feedback: "No son leyes científicas, sino axiomas pragmáticos para enmarcar la intervención." },
                    { q: "¿Cuál de los siguientes NO fue uno de los tres 'magos' modelados originalmente?", options: ["Fritz Perls", "Milton Erickson", "Carl Rogers", "Virginia Satir"], correct: 2, feedback: "Carl Rogers no fue uno de los modelados inicialmente; los tres fueron Perls, Satir y Erickson." },
                    { q: "El 'Modelado' en PNL se define como:", options: ["Imitar la ropa y postura de un exitoso.", "El proceso de extraer y replicar la estructura subjetiva de la excelencia.", "Analizar la infancia del paciente.", "Aplicar hipnosis profunda para borrar hábitos."], correct: 1, feedback: "Es el método nuclear: descubrir cómo un experto organiza su neurología, lenguaje y programas internos." },
                    { q: "La 'Ley de la Variedad Requerida' se asocia con:", options: ["La rigidez del terapeuta", "La inhibición del paciente", "La flexibilidad conductual y de comunicación", "El uso de la mente consciente analítica"], correct: 2, feedback: "En un sistema interactivo, quien tiene más opciones de respuesta tiene el control de la dinámica." }
                ];

                const quizContainer1 = document.getElementById('quiz-container-1');
                const scoreDisplay1 = document.getElementById('quiz-score-1');
                let score1 = 0;
                let answered1 = new Array(quizData1.length).fill(false);

                quizData1.forEach((item, index) => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'p-4 rounded border border-[var(--border-color)] bg-[var(--bg-main)]';
                    qDiv.innerHTML = `
                        <p class="font-semibold mb-3 text-[var(--text-main)]">${index + 1}. ${item.q}</p>
                        <div class="space-y-2" id="q1-opts-${index}">
                            ${item.options.map((opt, i) => `<button class="quiz-btn-1 w-full text-left p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)] transition-colors" data-q="${index}" data-opt="${i}">${opt}</button>`).join('')}
                        </div>
                        <div id="q1-feedback-${index}" class="mt-2 text-sm hidden"></div>
                    `;
                    quizContainer1.appendChild(qDiv);
                });

                document.querySelectorAll('.quiz-btn-1').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const qIdx = parseInt(this.dataset.q);
                        const optIdx = parseInt(this.dataset.opt);
                        if (answered1[qIdx]) return;
                        answered1[qIdx] = true;
                        const buttons = document.querySelectorAll(`#q1-opts-${qIdx} button`);
                        const feedbackDiv = document.getElementById(`q1-feedback-${qIdx}`);
                        const isCorrect = optIdx === quizData1[qIdx].correct;
                        buttons.forEach((b, i) => {
                            b.disabled = true;
                            if (i === quizData1[qIdx].correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300');
                            else if (i === optIdx && !isCorrect) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500', 'text-red-700', 'dark:text-red-300');
                            else b.classList.add('opacity-50');
                        });
                        feedbackDiv.classList.remove('hidden');
                        if (isCorrect) {
                            score1++;
                            feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Correcto.</span> <span class="text-[var(--text-muted)]">${quizData1[qIdx].feedback}</span>`;
                        } else {
                            feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗ Incorrecto.</span> <span class="text-[var(--text-muted)]">${quizData1[qIdx].feedback}</span>`;
                        }
                        scoreDisplay1.textContent = `${score1}/${quizData1.length}`;
                        if (window.appState) { window.appState.quizScores['mod1'] = score1; if (window.saveState) window.saveState(); }
                    });
                });
            } catch (e) { console.error("Error Mod 1:", e); }
        })();

        // ==========================================
        // SCRIPTS MÓDULO 2
        // ==========================================
        (function() {
            'use strict';
            try {
                const mod2Container = document.getElementById('modulo-2');
                if (window.processDynamicContent) window.processDynamicContent(mod2Container);

                const dictionaries = {
                    V: ['veo', 'ver', 'mirar', 'mira', 'claro', 'oscuro', 'brillante', 'imagen', 'enfocar', 'enfoque', 'perspectiva', 'color', 'neblinoso', 'apariencia', 'ilustra', 'panorama', 'visible', 'dibujo', 'imaginar', 'imagino'],
                    A: ['escucho', 'escuchar', 'oigo', 'oye', 'sonido', 'ruido', 'tono', 'resuena', 'resonar', 'dime', 'hablar', 'hablo', 'voz', 'agudo', 'sordo', 'grita', 'ritmo', 'armonía', 'armónico', 'cantar'],
                    K: ['siento', 'sentir', 'sensación', 'tocar', 'toco', 'pesado', 'ligero', 'frío', 'calor', 'tensión', 'relajado', 'duro', 'suave', 'áspero', 'fluido', 'sólido', 'presión', 'ahogo', 'nudo', 'cuerpo'],
                    Ad: ['pienso', 'pensar', 'entiendo', 'lógico', 'ilógico', 'sentido', 'proceso', 'aprendo', 'experiencia', 'concepto', 'razón', 'analizo', 'deduzco', 'concluyo', 'sé', 'saber']
                };

                function normalize(word) { return word.toLowerCase().replace(/[.,;:!?"'()]/g, ''); }

                document.getElementById('vak-analyze-btn').addEventListener('click', function() {
                    const text = document.getElementById('vak-input').value;
                    const words = text.split(/\s+/).map(normalize);
                    let counts = { V: 0, A: 0, K: 0, Ad: 0 };
                    let total = 0;
                    words.forEach(word => {
                        for (const key in dictionaries) {
                            if (dictionaries[key].includes(word) || dictionaries[key].includes(word.slice(0,-1))) {
                                counts[key]++;
                                total++;
                                break;
                            }
                        }
                    });
                    let pcts = { V: 0, A: 0, K: 0, Ad: 0 };
                    if (total > 0) {
                        pcts.V = Math.round((counts.V / total) * 100);
                        pcts.A = Math.round((counts.A / total) * 100);
                        pcts.K = Math.round((counts.K / total) * 100);
                        pcts.Ad = Math.round((counts.Ad / total) * 100);
                        const diff = 100 - (pcts.V + pcts.A + pcts.K + pcts.Ad);
                        const maxKey = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                        pcts[maxKey] += diff;
                    }
                    document.getElementById('vak-v-pct').textContent = `${pcts.V}%`;
                    document.getElementById('vak-a-pct').textContent = `${pcts.A}%`;
                    document.getElementById('vak-k-pct').textContent = `${pcts.K}%`;
                    document.getElementById('vak-ad-pct').textContent = `${pcts.Ad}%`;
                    document.getElementById('vak-v-bar').style.width = `${pcts.V}%`;
                    document.getElementById('vak-a-bar').style.width = `${pcts.A}%`;
                    document.getElementById('vak-k-bar').style.width = `${pcts.K}%`;
                    document.getElementById('vak-ad-bar').style.width = `${pcts.Ad}%`;
                    const resultEl = document.getElementById('vak-result');
                    if (total === 0) {
                        resultEl.innerHTML = `<span class="text-red-500">No se detectaron predicados VAK claros. Intenta con más texto.</span>`;
                    } else {
                        const max = Object.keys(pcts).reduce((a, b) => pcts[a] > pcts[b] ? a : b);
                        const names = { V: 'Visual', A: 'Auditivo', K: 'Kinestésico', Ad: 'Auditivo Digital' };
                        resultEl.innerHTML = `Predominio: <span class="text-primary-600 dark:text-accent-400 font-bold">${names[max]}</span>. Total de predicados detectados: ${total}.`;
                    }
                });

                const quizData2 = [
                    { q: "Cuando un cliente dice: 'La situación se ve oscura y nebulosa', ¿qué sistema representacional está revelando?", options: ["Auditivo", "Visual", "Kinestésico", "Auditivo Digital"], correct: 1, feedback: "'Ve', 'oscura' y 'nebulosa' son predicados visuales." },
                    { q: "En el modelo clásico de claves de acceso ocular (persona diestra), ¿hacia dónde miran normalmente para acceder a una emoción o sensación?", options: ["Arriba a la derecha", "Medio a la izquierda", "Abajo a la derecha", "Abajo a la izquierda"], correct: 2, feedback: "Abajo a la derecha indica acceso kinestésico (K)." },
                    { q: "¿Qué es una sinestesia en PNL?", options: ["Una alucinación auditiva", "El solapamiento automático entre sistemas representacionales (ej. ver una imagen genera una emoción)", "Un tipo de movimiento ocular cruzado", "Una técnica de hipnosis profunda"], correct: 1, feedback: "Es el puente automático entre canales (V -> K, A -> V, etc.)." },
                    { q: "Las submodalidades analógicas se caracterizan por:", options: ["Ser de encendido/apagado (binarias)", "Variar en un continuo (ej. volumen, brillo)", "Ser siempre de tipo auditivo", "No poder ser modificadas conscientemente"], correct: 1, feedback: "Las analógicas varían gradualmente, a diferencia de las digitales (asociado/disociado)." },
                    { q: "¿Qué es un 'Driver' o Submodalidad Crítica?", options: ["Una submodalidad que causa amnesia", "Una submodalidad que, al cambiar, arrastra y modifica el resto de la experiencia", "El tono de voz del terapeuta", "La creencia central del cliente"], correct: 1, feedback: "Cambiar el driver (como el brillo o la distancia) cambia toda la reacción emocional." },
                    { q: "El 'Auditivo Digital' (Ad) se refiere a:", options: ["La música interna", "Las sensaciones viscerales", "El diálogo interno y la racionalización", "Las imágenes construidas"], correct: 2, feedback: "Es el lenguaje interno, hablar con uno mismo sin necesariamente un tono emocional." },
                    { q: "¿Qué técnica consiste en tomar las submodalidades de un estado de recurso y aplicarlas a un estado limitante?", options: ["Anclaje", "Mapeo cruzado (Mapping across)", "Reencuadre", "Pacing y leading"], correct: 1, feedback: "El mapeo cruzado transfiere la estructura submodal de una experiencia a otra." },
                    { q: "Fisiológicamente, una persona predominantemente kinestésica en un momento dado tiende a tener:", options: ["Respiración alta y rápida, voz aguda", "Respiración profunda y abdominal, voz lenta y grave", "Postura rígida y hombros tensos", "Movimientos oculares muy rápidos laterales"], correct: 1, feedback: "El kinestésico respira profundo, habla lento y tiene postura relajada." },
                    { q: "Un error típico al usar claves de acceso ocular es:", options: ["Asumir que es un polígrafo infalible de mentiras", "Usarlas para entender el canal de procesamiento", "Observar al paciente", "Considerar que puede variar en zurdos"], correct: 0, feedback: "La construcción visual (arriba derecha) no es sinónimo de mentira, sino de imaginar algo nuevo." },
                    { q: "Si un paciente mira 'Abajo a la izquierda' (modelo clásico diestro), probablemente está:", options: ["Recordando una imagen", "Construyendo un sonido", "Teniendo un diálogo interno (Ad)", "Sintiendo una emoción fuerte"], correct: 2, feedback: "Abajo a la izquierda corresponde al diálogo interno / Auditivo Digital." }
                ];

                const quizContainer2 = document.getElementById('quiz-container-2');
                const scoreDisplay2 = document.getElementById('quiz-score-2');
                let score2 = 0;
                let answered2 = new Array(quizData2.length).fill(false);

                quizData2.forEach((item, index) => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'p-4 rounded border border-[var(--border-color)] bg-[var(--bg-main)]';
                    qDiv.innerHTML = `
                        <p class="font-semibold mb-3 text-[var(--text-main)]">${index + 1}. ${item.q}</p>
                        <div class="space-y-2" id="q2-opts-${index}">
                            ${item.options.map((opt, i) => `<button class="quiz-btn-2 w-full text-left p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)] transition-colors" data-q="${index}" data-opt="${i}">${opt}</button>`).join('')}
                        </div>
                        <div id="q2-feedback-${index}" class="mt-2 text-sm hidden"></div>
                    `;
                    quizContainer2.appendChild(qDiv);
                });

                document.querySelectorAll('.quiz-btn-2').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const qIdx = parseInt(this.dataset.q);
                        const optIdx = parseInt(this.dataset.opt);
                        if (answered2[qIdx]) return;
                        answered2[qIdx] = true;
                        const buttons = document.querySelectorAll(`#q2-opts-${qIdx} button`);
                        const feedbackDiv = document.getElementById(`q2-feedback-${qIdx}`);
                        const isCorrect = optIdx === quizData2[qIdx].correct;
                        buttons.forEach((b, i) => {
                            b.disabled = true;
                            if (i === quizData2[qIdx].correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300');
                            else if (i === optIdx && !isCorrect) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500', 'text-red-700', 'dark:text-red-300');
                            else b.classList.add('opacity-50');
                        });
                        feedbackDiv.classList.remove('hidden');
                        if (isCorrect) {
                            score2++;
                            feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Correcto.</span> <span class="text-[var(--text-muted)]">${quizData2[qIdx].feedback}</span>`;
                        } else {
                            feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗ Incorrecto.</span> <span class="text-[var(--text-muted)]">${quizData2[qIdx].feedback}</span>`;
                        }
                        scoreDisplay2.textContent = `${score2}/${quizData2.length}`;
                        if (window.appState) { window.appState.quizScores['mod2'] = score2; if (window.saveState) window.saveState(); }
                    });
                });
            } catch (e) { console.error("Error Mod 2:", e); }
        })();

        // ==========================================
        // SCRIPTS MÓDULO 3
        // ==========================================
        (function() {
            'use strict';
            try {
                const mod3Container = document.getElementById('modulo-3');
                if (window.processDynamicContent) window.processDynamicContent(mod3Container);

                // Lab 3: Meta-Modelo Trainer
                const metaData = [
                    { frase: "Me haces enfadar cuando llegas tarde.", patron: "Causa-Efecto", challenges: ["¿Quién te enfada?", "¿Cómo específicamente mi conducta causa tu enfado?", "¿Por qué te enfadas?"], correct: 1 },
                    { frase: "Sé que estás pensando en irte de la empresa.", patron: "Lectura de Mente", challenges: ["¿Cómo sabes lo que pienso?", "¿Cuándo te dije eso?", "¿Por qué quieres irte?"], correct: 0 },
                    { frase: "Nadie valora mi esfuerzo en este proyecto.", patron: "Cuantificador Universal", challenges: ["¿Absolutamente nadie?", "¿Qué esfuerzo hiciste?", "¿Por qué no te valoran?"], correct: 0 },
                    { frase: "Es mejor hacerlo de esta manera.", patron: "Comparativo", challenges: ["¿Mejor que qué?", "¿Por qué es mejor?", "¿Quién lo dijo?"], correct: 0 },
                    { frase: "La falta de comunicación rompió el equipo.", patron: "Nominalización", challenges: ["¿Quién no se está comunicando con quién y cómo?", "¿Qué se rompió?", "¿Cuándo pasó?"], correct: 0 }
                ];

                let currentMetaIdx = 0;
                let metaScore = 0;
                const fraseEl = document.getElementById('meta-frase');
                const optsPatronEl = document.getElementById('meta-opts-patron');
                const optsChallengeEl = document.getElementById('meta-opts-challenge');
                const step2El = document.getElementById('meta-step-2');
                const feedbackEl = document.getElementById('meta-feedback');
                const nextBtn = document.getElementById('meta-next');

                function loadMetaQuestion() {
                    if (currentMetaIdx >= metaData.length) {
                        fraseEl.textContent = "¡Has completado el entrenamiento!";
                        optsPatronEl.innerHTML = `<p class="text-emerald-500 font-bold">Puntuación final: ${metaScore}/${metaData.length}</p>`;
                        step2El.classList.add('hidden');
                        nextBtn.classList.add('hidden');
                        return;
                    }
                    const item = metaData[currentMetaIdx];
                    fraseEl.textContent = `"${item.frase}"`;
                    feedbackEl.classList.add('hidden');
                    nextBtn.classList.add('hidden');
                    step2El.classList.add('hidden');

                    // Shuffle patrones for options
                    const allPatrones = ["Causa-Efecto", "Lectura de Mente", "Cuantificador Universal", "Comparativo", "Nominalización"];
                    const shuffled = allPatrones.sort(() => 0.5 - Math.random()).slice(0, 3);
                    if (!shuffled.includes(item.patron)) shuffled[0] = item.patron;
                    shuffled.sort(() => 0.5 - Math.random());

                    optsPatronEl.innerHTML = '';
                    shuffled.forEach(p => {
                        const btn = document.createElement('button');
                        btn.className = 'meta-patron-btn p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)] transition-colors';
                        btn.textContent = p;
                        btn.onclick = () => handlePatronSelect(p, item.patron);
                        optsPatronEl.appendChild(btn);
                    });
                }

                function handlePatronSelect(selected, correct) {
                    const buttons = document.querySelectorAll('.meta-patron-btn');
                    buttons.forEach(b => b.disabled = true);
                    
                    if (selected === correct) {
                        document.querySelector(`.meta-patron-btn:not([disabled])`)?.classList.remove('bg-emerald-100');
                        buttons.forEach(b => {
                            if (b.textContent === correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500');
                            else b.classList.add('opacity-50');
                        });
                        step2El.classList.remove('hidden');
                        loadChallengeOptions(correct);
                    } else {
                        buttons.forEach(b => {
                            if (b.textContent === selected) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500');
                            else if (b.textContent === correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500');
                            else b.classList.add('opacity-50');
                        });
                        showFeedback(false, "Patrón incorrecto. Intenta identificar la estructura universal (Omisión, Generalización o Distorsión) primero.");
                        nextBtn.classList.remove('hidden');
                    }
                }

                function loadChallengeOptions(patron) {
                    const item = metaData[currentMetaIdx];
                    optsChallengeEl.innerHTML = '';
                    item.challenges.forEach((c, i) => {
                        const btn = document.createElement('button');
                        btn.className = 'meta-challenge-btn p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)] transition-colors text-left';
                        btn.textContent = c;
                        btn.onclick = () => handleChallengeSelect(i, item.correct);
                        optsChallengeEl.appendChild(btn);
                    });
                }

                function handleChallengeSelect(selected, correct) {
                    const buttons = document.querySelectorAll('.meta-challenge-btn');
                    buttons.forEach(b => b.disabled = true);
                    const isCorrect = selected === correct;
                    
                    buttons.forEach((b, i) => {
                        if (i === correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500');
                        else if (i === selected) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500');
                        else b.classList.add('opacity-50');
                    });

                    if (isCorrect) metaScore++;
                    showFeedback(isCorrect, isCorrect ? "¡Correcto! Has recuperado la información borrada o distorsionada." : "Challenge incorrecto. Revisa la estructura del Meta-Modelo.");
                    nextBtn.classList.remove('hidden');
                }

                function showFeedback(success, msg) {
                    feedbackEl.classList.remove('hidden');
                    feedbackEl.className = `mt-4 p-3 rounded text-sm ${success ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`;
                    feedbackEl.innerHTML = `<strong>${success ? '✓' : '✗'}</strong> ${msg}`;
                }

                nextBtn.onclick = () => {
                    currentMetaIdx++;
                    loadMetaQuestion();
                };
                
                loadMetaQuestion();

                // Quiz 3
                const quizData3 = [
                    { q: "'Nadie me valora' es un ejemplo de:", options: ["Cuantificador Universal", "Omisión", "Lectura de mente"], correct: 0, feedback: "'Nadie' generaliza a toda la humanidad. Challenge: '¿Absolutamente nadie?'" },
                    { q: "¿Cuál es el challenge para 'Me haces enfadar'?", options: ["¿Quién te enfada?", "¿Cómo específicamente mi conducta causa tu enfado?", "¿Por qué te enfadas?"], correct: 1, feedback: "Rompe la distorsión de Causa-Efecto." },
                    { q: "'Depresión' en PNL se trata como:", options: ["Un trastorno químico", "Una nominalización", "Un cuantificador"], correct: 1, feedback: "Es un proceso (deprimirse) congelado en el tiempo." },
                    { q: "'Si no me sonríes, estás enfadado conmigo' es:", options: ["Equivalencia Compleja", "Juicio", "Borrado"], correct: 0, feedback: "Asume que A significa B. Challenge: '¿Cómo significa no sonreír estar enfadado?'" },
                    { q: "El propósito del Meta-Modelo es:", options: ["Hipnotizar", "Recuperar experiencia borrada", "Vender"], correct: 1, feedback: "Busca reconectar la estructura superficial con la profunda." },
                    { q: "'Debo trabajar más' contiene:", options: ["Operador Modal de Necesidad", "Posibilidad", "Omisión"], correct: 0, feedback: "Challenge: '¿Qué pasaría si no trabajas más?'" },
                    { q: "'Es mejor hacerlo así' es un patrón de:", options: ["Comparativo", "Universal", "Causa-Efecto"], correct: 0, feedback: "Falta el referente. Challenge: '¿Mejor que qué?'" },
                    { q: "'Sé que estás pensando en irte' es:", options: ["Lectura de mente", "Presuposición", "Nominalización"], correct: 0, feedback: "Asume saber el estado interno del otro." },
                    { q: "El Meta-Modelo se basa en la gramática de:", options: ["Chomsky", "Skinner", "Pavlov"], correct: 0, feedback: "Gramática Transformacional." },
                    { q: "'Mi jefe me pone nervioso' viola la metáfora de:", options: ["Causa-Efecto", "Recurso", "Mapa"], correct: 0, feedback: "Asume que el jefe causa directamente el estado interno." },
                    { q: "Disparar muchas preguntas del Meta-Modelo sin rapport se llama:", options: ["Ametrallamiento", "Pacing", "Leading"], correct: 0, feedback: "Se percibe como un interrogatorio agresivo." },
                    { q: "La estructura superficial es:", options: ["El significado profundo", "Lo que decimos", "La intención"], correct: 1, feedback: "Es la versión reducida y transformada que sale por nuestra boca." }
                ];

                const quizContainer3 = document.getElementById('quiz-container-3');
                const scoreDisplay3 = document.getElementById('quiz-score-3');
                let score3 = 0;
                let answered3 = new Array(quizData3.length).fill(false);

                quizData3.forEach((item, index) => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'p-4 rounded border border-[var(--border-color)] bg-[var(--bg-main)]';
                    qDiv.innerHTML = `
                        <p class="font-semibold mb-3 text-[var(--text-main)]">${index + 1}. ${item.q}</p>
                        <div class="space-y-2" id="q3-opts-${index}">
                            ${item.options.map((opt, i) => `<button class="quiz-btn-3 w-full text-left p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)] transition-colors" data-q="${index}" data-opt="${i}">${opt}</button>`).join('')}
                        </div>
                        <div id="q3-feedback-${index}" class="mt-2 text-sm hidden"></div>
                    `;
                    quizContainer3.appendChild(qDiv);
                });

                document.querySelectorAll('.quiz-btn-3').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const qIdx = parseInt(this.dataset.q);
                        const optIdx = parseInt(this.dataset.opt);
                        if (answered3[qIdx]) return;
                        answered3[qIdx] = true;
                        const buttons = document.querySelectorAll(`#q3-opts-${qIdx} button`);
                        const feedbackDiv = document.getElementById(`q3-feedback-${qIdx}`);
                        const isCorrect = optIdx === quizData3[qIdx].correct;
                        buttons.forEach((b, i) => {
                            b.disabled = true;
                            if (i === quizData3[qIdx].correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300');
                            else if (i === optIdx && !isCorrect) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500', 'text-red-700', 'dark:text-red-300');
                            else b.classList.add('opacity-50');
                        });
                        feedbackDiv.classList.remove('hidden');
                        if (isCorrect) {
                            score3++;
                            feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Correcto.</span> <span class="text-[var(--text-muted)]">${quizData3[qIdx].feedback}</span>`;
                        } else {
                            feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗ Incorrecto.</span> <span class="text-[var(--text-muted)]">${quizData3[qIdx].feedback}</span>`;
                        }
                        scoreDisplay3.textContent = `${score3}/${quizData3.length}`;
                        if (window.appState) { window.appState.quizScores['mod3'] = score3; if (window.saveState) window.saveState(); }
                    });
                });
            } catch (e) { console.error("Error Mod 3:", e); }
        })();
        // ==========================================
        // SCRIPTS MÓDULO 4
        // ==========================================
        (function() {
            'use strict';
            try {
                const mod4Container = document.getElementById('modulo-4');
                if (window.processDynamicContent) window.processDynamicContent(mod4Container);

                // Lab 4: Metaforizador
                const metaProblema = document.getElementById('meta-problema');
                const metaDominio = document.getElementById('meta-dominio');
                const metaRecurso = document.getElementById('meta-recurso');
                const metaOutput = document.getElementById('meta-output');

                function updateMetaforizador() {
                    const p = metaProblema.value;
                    const d = metaDominio.value;
                    const r = metaRecurso.value;
                    metaOutput.innerHTML = `Había una vez ${d} que sentía ${p}. Parecía que no podría seguir adelante, pero entonces descubrió que dentro de sí misma tenía el poder de ${r}. Y así como ${d} puede encontrar su camino, tú también puedes <strong>*permitirte ${r}*</strong> ahora mismo, sabiendo que los recursos ya están en ti.`;
                }
                [metaProblema, metaDominio, metaRecurso].forEach(el => el.addEventListener('change', updateMetaforizador));
                updateMetaforizador();

                // Quiz 4
                const quizData4 = [
                    { q: "El Modelo Milton busca:", options: ["Especificidad", "Vaguedad", "Confrontación"], correct: 1, feedback: "Usa la vaguedad para inducir trance." },
                    { q: "'¿Quieres entrar en trance ahora o en un minuto?' es un:", options: ["Doble vínculo", "Comando incrustado", "Tag question"], correct: 0, feedback: "Ilusión de elección." },
                    { q: "'El hombre vio a la mujer con el telescopio' es ambigüedad:", options: ["Fonológica", "Sintáctica", "Puntuación"], correct: 1, feedback: "Función gramatical incierta." },
                    { q: "Marcar un comando incrustado implica:", options: ["Gritar", "Cambiar tono o ritmo", "Preguntar"], correct: 1, feedback: "El cambio de tono lo señala al inconsciente." },
                    { q: "'No pienses en relajarte' usa el patrón de:", options: ["Negación", "Ambigüedad", "Lectura de mente"], correct: 0, feedback: "La negación obliga al cerebro a representar lo negado." },
                    { q: "El isomorfismo en metáforas significa:", options: ["Que la historia es idéntica", "Que la estructura relacional coincide", "Que usa los mismos nombres"], correct: 1, feedback: "El vehículo y el tenor comparten estructura." },
                    { q: "'La comprensión puede llegar' usa:", options: ["Índice referencial falta", "Nominalización", "Universal"], correct: 1, feedback: "'Comprensión' es un proceso congelado." },
                    { q: "'Puedes sentirte cómodo, ¿verdad?' es:", options: ["Tag question", "Doble vínculo", "Presuposición"], correct: 0, feedback: "Busca validación al final de la frase." },
                    { q: "El Modelo Milton se extrajo de:", options: ["Perls", "Erickson", "Satir"], correct: 1, feedback: "Milton Erickson." },
                    { q: "El trance hipnótico en PNL se define como:", options: ["Pérdida de consciencia", "Estado de focalización atencional interna", "Dormir"], correct: 1, feedback: "No es inconsciencia, es focalización." }
                ];
                const quizContainer4 = document.getElementById('quiz-container-4');
                const scoreDisplay4 = document.getElementById('quiz-score-4');
                let score4 = 0;
                let answered4 = new Array(quizData4.length).fill(false);

                quizData4.forEach((item, index) => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'p-4 rounded border border-[var(--border-color)] bg-[var(--bg-main)]';
                    qDiv.innerHTML = `<p class="font-semibold mb-3 text-[var(--text-main)]">${index + 1}. ${item.q}</p><div class="space-y-2" id="q4-opts-${index}">${item.options.map((opt, i) => `<button class="quiz-btn-4 w-full text-left p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)]" data-q="${index}" data-opt="${i}">${opt}</button>`).join('')}</div><div id="q4-feedback-${index}" class="mt-2 text-sm hidden"></div>`;
                    quizContainer4.appendChild(qDiv);
                });
                document.querySelectorAll('.quiz-btn-4').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const qIdx = parseInt(this.dataset.q); const optIdx = parseInt(this.dataset.opt);
                        if (answered4[qIdx]) return; answered4[qIdx] = true;
                        const buttons = document.querySelectorAll(`#q4-opts-${qIdx} button`);
                        const feedbackDiv = document.getElementById(`q4-feedback-${qIdx}`);
                        const isCorrect = optIdx === quizData4[qIdx].correct;
                        buttons.forEach((b, i) => { b.disabled = true; if (i === quizData4[qIdx].correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500'); else if (i === optIdx && !isCorrect) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500'); else b.classList.add('opacity-50'); });
                        feedbackDiv.classList.remove('hidden');
                        if (isCorrect) { score4++; feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓</span> <span class="text-[var(--text-muted)]">${quizData4[qIdx].feedback}</span>`; } else { feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗</span> <span class="text-[var(--text-muted)]">${quizData4[qIdx].feedback}</span>`; }
                        scoreDisplay4.textContent = `${score4}/${quizData4.length}`;
                        if (window.appState) { window.appState.quizScores['mod4'] = score4; if (window.saveState) window.saveState(); }
                    });
                });
            } catch (e) { console.error("Error Mod 4:", e); }
        })();

        // ==========================================
        // SCRIPTS MÓDULO 5
        // ==========================================
        (function() {
            'use strict';
            try {
                const mod5Container = document.getElementById('modulo-5');
                if (window.processDynamicContent) window.processDynamicContent(mod5Container);

                // Lab 5: Colapso de Anclas
                let recursoNivel = 0, limiteNivel = 0;
                const btnRecurso = document.getElementById('colapsar-recurso');
                const btnLimite = document.getElementById('colapsar-limite');
                const btnDisparar = document.getElementById('colapsar-disparar');
                const visColapso = document.getElementById('colapso-visual');

                function checkDisparar() {
                    btnDisparar.disabled = !(recursoNivel > 0 && limiteNivel > 0);
                }

                btnRecurso.addEventListener('click', () => {
                    recursoNivel = Math.min(100, recursoNivel + 25);
                    document.getElementById('nivel-recurso').textContent = recursoNivel + '%';
                    checkDisparar();
                });

                btnLimite.addEventListener('click', () => {
                    limiteNivel = Math.min(100, limiteNivel + 25);
                    document.getElementById('nivel-limite').textContent = limiteNivel + '%';
                    checkDisparar();
                });

                btnDisparar.addEventListener('click', () => {
                    btnRecurso.disabled = true; btnLimite.disabled = true; btnDisparar.disabled = true;
                    if (recursoNivel >= limiteNivel) {
                        visColapso.className = "w-48 h-48 rounded-full bg-emerald-500 flex items-center justify-center text-center text-white font-bold p-4 transition-all duration-700";
                        visColapso.textContent = "¡Recurso Integra Límite! (Éxito)";
                    } else {
                        visColapso.className = "w-48 h-48 rounded-full bg-red-500 flex items-center justify-center text-center text-white font-bold p-4 transition-all duration-700";
                        visColapso.textContent = "El Límite domina. Refuerza el Recurso. (Fallo)";
                    }
                    setTimeout(() => {
                        recursoNivel = 0; limiteNivel = 0;
                        document.getElementById('nivel-recurso').textContent = '0%';
                        document.getElementById('nivel-limite').textContent = '0%';
                        btnRecurso.disabled = false; btnLimite.disabled = false;
                        visColapso.className = "w-48 h-48 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-center text-xs font-bold p-4 transition-all duration-700";
                        visColapso.textContent = "Esperando carga...";
                    }, 4000);
                });

                // Quiz 5
                const quizData5 = [
                    { q: "El anclaje se basa en el condicionamiento de:", options: ["Pavlov", "Skinner", "Bandura"], correct: 0, feedback: "Condicionamiento clásico (estímulo-respuesta)." },
                    { q: "El timing ideal para aplicar un ancla es:", options: ["Al inicio del estado", "En el pico", "Al final"], correct: 1, feedback: "Justo en el pico de intensidad." },
                    { q: "Acumular varios recursos en un mismo ancla se llama:", options: ["Colapso", "Stacking", "Mapeo"], correct: 1, feedback: "Stacking o apilado." },
                    { q: "Disparar un ancla limitante y una de recurso simultáneamente se llama:", options: ["Cambio de historia", "Colapso de anclas", "Swish"], correct: 1, feedback: "Colapso de anclas." },
                    { q: "Un ancla debe ser:", options: ["Común y corriente", "Única y replicable", "Difícil de reproducir"], correct: 1, feedback: "Única para no saturarse y replicable para usarla." },
                    { q: "¿Qué es 'romper estado'?", options: ["Terminar la sesión", "Distraer al cliente para sacarlo del estado", "Quitar el ancla"], correct: 1, feedback: "Cambio de foco atencional brusco." },
                    { q: "El Círculo de Excelencia es un ancla:", options: ["Visual", "Auditiva", "Espacial/Kinestésica"], correct: 2, feedback: "Usa el espacio y el cuerpo." },
                    { q: "Si aplicas el ancla cuando la emoción baja, anclas:", options: ["El recurso", "La transición de bajada", "Nada"], correct: 1, feedback: "Error común de timing." },
                    { q: "Modificar la emoción de un recuerdo pasado con un recurso se llama:", options: ["Cambio de Historia", "Reencuadre", "Swish"], correct: 0, feedback: "Cambio de historia personal." },
                    { q: "Para que un colapso funcione, el recurso debe ser:", options: ["Menos intenso", "Igual de intenso", "Más intenso"], correct: 2, feedback: "El recurso debe superar al límite." }
                ];
                const quizContainer5 = document.getElementById('quiz-container-5');
                const scoreDisplay5 = document.getElementById('quiz-score-5');
                let score5 = 0; let answered5 = new Array(quizData5.length).fill(false);

                quizData5.forEach((item, index) => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'p-4 rounded border border-[var(--border-color)] bg-[var(--bg-main)]';
                    qDiv.innerHTML = `<p class="font-semibold mb-3 text-[var(--text-main)]">${index + 1}. ${item.q}</p><div class="space-y-2" id="q5-opts-${index}">${item.options.map((opt, i) => `<button class="quiz-btn-5 w-full text-left p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)]" data-q="${index}" data-opt="${i}">${opt}</button>`).join('')}</div><div id="q5-feedback-${index}" class="mt-2 text-sm hidden"></div>`;
                    quizContainer5.appendChild(qDiv);
                });
                document.querySelectorAll('.quiz-btn-5').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const qIdx = parseInt(this.dataset.q); const optIdx = parseInt(this.dataset.opt);
                        if (answered5[qIdx]) return; answered5[qIdx] = true;
                        const buttons = document.querySelectorAll(`#q5-opts-${qIdx} button`);
                        const feedbackDiv = document.getElementById(`q5-feedback-${qIdx}`);
                        const isCorrect = optIdx === quizData5[qIdx].correct;
                        buttons.forEach((b, i) => { b.disabled = true; if (i === quizData5[qIdx].correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500'); else if (i === optIdx && !isCorrect) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500'); else b.classList.add('opacity-50'); });
                        feedbackDiv.classList.remove('hidden');
                        if (isCorrect) { score5++; feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓</span> <span class="text-[var(--text-muted)]">${quizData5[qIdx].feedback}</span>`; } else { feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗</span> <span class="text-[var(--text-muted)]">${quizData5[qIdx].feedback}</span>`; }
                        scoreDisplay5.textContent = `${score5}/${quizData5.length}`;
                        if (window.appState) { window.appState.quizScores['mod5'] = score5; if (window.saveState) window.saveState(); }
                    });
                });
            } catch (e) { console.error("Error Mod 5:", e); }
        })();

        // ==========================================
        // SCRIPTS MÓDULO 6
        // ==========================================
        (function() {
            'use strict';
            try {
                const mod6Container = document.getElementById('modulo-6');
                if (window.processDynamicContent) window.processDynamicContent(mod6Container);

                // Lab 6: Niveles Neurológicos
                const nivelesData = [
                    { frase: "No soy capaz de hacer esto.", nivel: "Identidad", opts: ["Entorno", "Comportamiento", "Capacidad", "Creencias", "Identidad"] },
                    { frase: "Aquí en la oficina me siento agobiado.", nivel: "Entorno", opts: ["Entorno", "Comportamiento", "Capacidad", "Creencias", "Identidad"] },
                    { frase: "Creo que el esfuerzo no vale la pena.", nivel: "Creencias", opts: ["Entorno", "Comportamiento", "Capacidad", "Creencias", "Identidad"] },
                    { frase: "Grito cuando me llevan la contraria.", nivel: "Comportamiento", opts: ["Entorno", "Comportamiento", "Capacidad", "Creencias", "Identidad"] },
                    { frase: "Sé comunicarme en público.", nivel: "Capacidad", opts: ["Entorno", "Comportamiento", "Capacidad", "Creencias", "Identidad"] }
                ];
                let currentNivelIdx = 0;
                const fraseEl = document.getElementById('nivel-frase');
                const optsEl = document.getElementById('nivel-opts');
                const feedbackEl = document.getElementById('nivel-feedback');
                const nextBtn = document.getElementById('nivel-next');

                function loadNivelQ() {
                    if (currentNivelIdx >= nivelesData.length) {
                        fraseEl.textContent = "¡Diagnóstico completado!";
                        optsEl.innerHTML = '';
                        nextBtn.classList.add('hidden');
                        return;
                    }
                    const item = nivelesData[currentNivelIdx];
                    fraseEl.textContent = `"${item.frase}"`;
                    feedbackEl.classList.add('hidden'); nextBtn.classList.add('hidden');
                    optsEl.innerHTML = '';
                    item.opts.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.className = 'nivel-btn p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)]';
                        btn.textContent = opt;
                        btn.onclick = () => handleNivelSelect(opt, item.nivel);
                        optsEl.appendChild(btn);
                    });
                }
                function handleNivelSelect(selected, correct) {
                    const buttons = document.querySelectorAll('.nivel-btn');
                    buttons.forEach(b => b.disabled = true);
                    const isCorrect = selected === correct;
                    buttons.forEach(b => {
                        if (b.textContent === correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500');
                        else if (b.textContent === selected) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500');
                        else b.classList.add('opacity-50');
                    });
                    feedbackEl.classList.remove('hidden');
                    feedbackEl.className = `mt-2 text-sm ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`;
                    feedbackEl.textContent = isCorrect ? "¡Correcto!" : `Incorrecto. El nivel es: ${correct}.`;
                    nextBtn.classList.remove('hidden');
                }
                nextBtn.onclick = () => { currentNivelIdx++; loadNivelQ(); };
                loadNivelQ();

                // Quiz 6
                const quizData6 = [
                    { q: "¿Qué significa la 'T' en TOTE?", options: ["Think", "Test", "Time"], correct: 1, feedback: "Test (evaluación)." },
                    { q: "El nivel que responde a '¿Por qué?' es:", options: ["Comportamiento", "Creencias", "Entorno"], correct: 1, feedback: "Creencias y Valores dan el motivo." },
                    { q: "'Soy un fracasado' es nivel:", options: ["Identidad", "Capacidad", "Comportamiento"], correct: 0, feedback: "Ataca al 'Quién soy'." },
                    { q: "Un cambio en Identidad afecta a los niveles:", options: ["Superiores", "Inferiores", "Ninguno"], correct: 1, feedback: "Los inferiores (creencias, capacidad, etc.)." },
                    { q: "El Sleight of Mouth sirve para:", options: ["Instalar anclas", "Desarmar creencias", "Mejorar el rapport"], correct: 1, feedback: "Patrones de reencuadre de creencias." },
                    { q: "El modelo TOTE fue creado por:", options: ["Dilts", "Miller, Galanter y Pribram", "Bandler"], correct: 1, feedback: "Modelo cognitivo de los 60s." },
                    { q: "En el TOTE, 'Operate' sirve para:", options: ["Salir", "Reducir la diferencia entre estados", "Evaluar"], correct: 1, feedback: "Operación para alcanzar la meta." },
                    { q: "'No sé hablar en público' mezcla niveles de:", options: ["Identidad y Entorno", "Capacidad e Identidad", "Comportamiento y Valores"], correct: 1, feedback: "Confunde 'saber hacer' con 'ser'." },
                    { q: "El nivel más alto de Dilts es:", options: ["Identidad", "Espiritual/Trascendencia", "Creencias"], correct: 1, feedback: "El sistema mayor, 'Para quién más'." },
                    { q: "'Aplicarse a sí mismo' es un patrón de:", options: ["Meta-Modelo", "Sleight of Mouth", "Milton"], correct: 1, feedback: "Devuelve la creencia al emisor." },
                    { q: "Si un cliente dice 'Aquí no puedo', interviene en el nivel de:", options: ["Entorno", "Identidad", "Capacidad"], correct: 0, feedback: "'Aquí' = Entorno." },
                    { q: "Las estrategias en PNL se representan como:", options: ["Secuencias de letras (Ve, Ai, Ki)", "Mapas conceptuales", "Árboles"], correct: 0, feedback: "Notación VAK con e/i (externo/interno)." }
                ];
                const quizContainer6 = document.getElementById('quiz-container-6');
                const scoreDisplay6 = document.getElementById('quiz-score-6');
                let score6 = 0; let answered6 = new Array(quizData6.length).fill(false);

                quizData6.forEach((item, index) => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'p-4 rounded border border-[var(--border-color)] bg-[var(--bg-main)]';
                    qDiv.innerHTML = `<p class="font-semibold mb-3 text-[var(--text-main)]">${index + 1}. ${item.q}</p><div class="space-y-2" id="q6-opts-${index}">${item.options.map((opt, i) => `<button class="quiz-btn-6 w-full text-left p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)]" data-q="${index}" data-opt="${i}">${opt}</button>`).join('')}</div><div id="q6-feedback-${index}" class="mt-2 text-sm hidden"></div>`;
                    quizContainer6.appendChild(qDiv);
                });
                document.querySelectorAll('.quiz-btn-6').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const qIdx = parseInt(this.dataset.q); const optIdx = parseInt(this.dataset.opt);
                        if (answered6[qIdx]) return; answered6[qIdx] = true;
                        const buttons = document.querySelectorAll(`#q6-opts-${qIdx} button`);
                        const feedbackDiv = document.getElementById(`q6-feedback-${qIdx}`);
                        const isCorrect = optIdx === quizData6[qIdx].correct;
                        buttons.forEach((b, i) => { b.disabled = true; if (i === quizData6[qIdx].correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500'); else if (i === optIdx && !isCorrect) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500'); else b.classList.add('opacity-50'); });
                        feedbackDiv.classList.remove('hidden');
                        if (isCorrect) { score6++; feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓</span> <span class="text-[var(--text-muted)]">${quizData6[qIdx].feedback}</span>`; } else { feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗</span> <span class="text-[var(--text-muted)]">${quizData6[qIdx].feedback}</span>`; }
                        scoreDisplay6.textContent = `${score6}/${quizData6.length}`;
                        if (window.appState) { window.appState.quizScores['mod6'] = score6; if (window.saveState) window.saveState(); }
                    });
                });
            } catch (e) { console.error("Error Mod 6:", e); }
        })();
                // ==========================================
        // SCRIPTS MÓDULO 7
        // ==========================================
        (function() {
            'use strict';
            try {
                const mod7Container = document.getElementById('modulo-7');
                if (window.processDynamicContent) window.processDynamicContent(mod7Container);

                // Lab 7: Posiciones Perceptuales
                document.getElementById('pos-integrar').addEventListener('click', function() {
                    const p1 = document.getElementById('pos-1').value.trim();
                    const p2 = document.getElementById('pos-2').value.trim();
                    const p3 = document.getElementById('pos-3').value.trim();
                    const p4 = document.getElementById('pos-4').value.trim();
                    const resultEl = document.getElementById('pos-result');
                    
                    if (!p1 || !p2 || !p3 || !p4) {
                        resultEl.classList.remove('hidden');
                        resultEl.className = "mt-4 p-4 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm";
                        resultEl.textContent = "Por favor, completa las 4 posiciones para integrar.";
                        return;
                    }
                    resultEl.classList.remove('hidden');
                    resultEl.className = "mt-4 p-4 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm";
                    resultEl.innerHTML = `<strong>Síntesis Integrativa (Meta-Mirror):</strong><br> Reconoces tu verdad ("${p1}"), empatizas con el otro ("${p2}"), observas con objetividad ("${p3}"), y atiendes al sistema ("${p4}"). Esta amplitud de perspectiva te otorga flexibilidad conductual para resolver el conflicto.`;
                });

                // Quiz 7
                const quizData7 = [
                    { q: "Igualar la postura de alguien se llama:", options: ["Leading", "Matching", "Calibrando"], correct: 1, feedback: "Matching o Mirroring." },
                    { q: "Ver la situación desde fuera, viéndote a ti y al otro, es:", options: ["1ª Posición", "2ª Posición", "3ª Posición"], correct: 2, feedback: "3ª Posición (Observador)." },
                    { q: "Mover el dedo al ritmo de la respiración del otro es:", options: ["Cross-over matching", "Pacing", "Mirroring"], correct: 0, feedback: "Cross-over matching (canal cruzado)." },
                    { q: "Antes de guiar (Lead), debes:", options: ["Calibrar", "Acompasar (Pace)", "Romper estado"], correct: 1, feedback: "Sin pacing no hay leading efectivo." },
                    { q: "La 2ª posición perceptual desarrolla:", options: ["El análisis lógico", "La empatía", "El ego"], correct: 1, feedback: "Ponerte en los zapatos del otro." },
                    { q: "'Su rostro se puso rojo' es:", options: ["Interpretación", "Calibración", "Alucinación"], correct: 1, feedback: "Es observable y objetivo." },
                    { q: "'Está enfadado' es:", options: ["Calibración", "Interpretación", "Rapport"], correct: 1, feedback: "Es una atribución interna, no observable." },
                    { q: "El rapport se basa en la idea de:", options: ["Dominación", "Afinidad y confianza", "Manipulación"], correct: 1, feedback: "Confianza inconsciente." },
                    { q: "Intentar calmar a alguien sin validar antes su enfado suele generar:", options: ["Rapport", "Resistencia", "Trance"], correct: 1, feedback: "Falta de pacing." },
                    { q: "La 4ª posición perceptual se centra en:", options: ["El 'Yo'", "El 'Tú'", "El 'Nosotros'/Sistema"], correct: 2, feedback: "Visión sistémica." }
                ];
                const quizContainer7 = document.getElementById('quiz-container-7');
                const scoreDisplay7 = document.getElementById('quiz-score-7');
                let score7 = 0; let answered7 = new Array(quizData7.length).fill(false);

                quizData7.forEach((item, index) => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'p-4 rounded border border-[var(--border-color)] bg-[var(--bg-main)]';
                    qDiv.innerHTML = `<p class="font-semibold mb-3 text-[var(--text-main)]">${index + 1}. ${item.q}</p><div class="space-y-2" id="q7-opts-${index}">${item.options.map((opt, i) => `<button class="quiz-btn-7 w-full text-left p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)]" data-q="${index}" data-opt="${i}">${opt}</button>`).join('')}</div><div id="q7-feedback-${index}" class="mt-2 text-sm hidden"></div>`;
                    quizContainer7.appendChild(qDiv);
                });
                document.querySelectorAll('.quiz-btn-7').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const qIdx = parseInt(this.dataset.q); const optIdx = parseInt(this.dataset.opt);
                        if (answered7[qIdx]) return; answered7[qIdx] = true;
                        const buttons = document.querySelectorAll(`#q7-opts-${qIdx} button`);
                        const feedbackDiv = document.getElementById(`q7-feedback-${qIdx}`);
                        const isCorrect = optIdx === quizData7[qIdx].correct;
                        buttons.forEach((b, i) => { b.disabled = true; if (i === quizData7[qIdx].correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500'); else if (i === optIdx && !isCorrect) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500'); else b.classList.add('opacity-50'); });
                        feedbackDiv.classList.remove('hidden');
                        if (isCorrect) { score7++; feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓</span> <span class="text-[var(--text-muted)]">${quizData7[qIdx].feedback}</span>`; } else { feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗</span> <span class="text-[var(--text-muted)]">${quizData7[qIdx].feedback}</span>`; }
                        scoreDisplay7.textContent = `${score7}/${quizData7.length}`;
                        if (window.appState) { window.appState.quizScores['mod7'] = score7; if (window.saveState) window.saveState(); }
                    });
                });
            } catch (e) { console.error("Error Mod 7:", e); }
        })();

        // ==========================================
        // SCRIPTS MÓDULO 8
        // ==========================================
        (function() {
            'use strict';
            try {
                const mod8Container = document.getElementById('modulo-8');
                if (window.processDynamicContent) window.processDynamicContent(mod8Container);

                // Lab 8: Time Line Explorer
                const tlVisual = document.getElementById('tl-visual');
                document.getElementById('tl-in-time').addEventListener('click', () => {
                    tlVisual.innerHTML = `<div class="flex flex-col items-center"><div class="text-xs mb-2 text-[var(--text-muted)]">Futuro</div><div class="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold my-2">TÚ</div><div class="text-xs mt-2 text-[var(--text-muted)]">Pasado</div><p class="mt-4 text-xs italic max-w-md">Estás *dentro* del tiempo. El pasado está detrás (no lo ves a menos que te des la vuelta) y el futuro delante. Muy emocional y asociado.</p></div>`;
                });
                document.getElementById('tl-through-time').addEventListener('click', () => {
                    tlVisual.innerHTML = `<div class="w-full flex justify-between items-center px-8 relative"><div class="text-xs text-[var(--text-muted)]">Pasado</div><div class="flex-1 h-1 bg-accent-500 mx-2 relative"><div class="absolute w-4 h-4 rounded-full bg-accent-500 -top-1.5 left-1/2 -ml-2 border-2 border-white dark:border-slate-900"></div></div><div class="text-xs text-[var(--text-muted)]">Futuro</div><p class="absolute -bottom-12 left-1/2 -ml-32 text-xs italic max-w-xs">Ves toda la línea frente a ti. Disociado, ideal para planificar.</p></div>`;
                });

                // Quiz 8
                const quizData8 = [
                    { q: "Si tu pasado está detrás y tu futuro delante, eres:", options: ["Through Time", "In Time", "Disociado"], correct: 1, feedback: "In Time (asociado)." },
                    { q: "Ver el tiempo como una línea frente a ti es:", options: ["In Time", "Through Time", "1ª Posición"], correct: 1, feedback: "Through Time (disociado)." },
                    { q: "El Swish Pattern se usa para:", options: ["Crear fobias", "Romper patrones automáticos", "Inducir trance"], correct: 1, feedback: "Interrumpe la secuencia submodal." },
                    { q: "En el Swish, la imagen del yo deseado debe ser:", options: ["Asociada", "Disociada", "En blanco y negro"], correct: 1, feedback: "Disociada para que atraiga hacia ella." },
                    { q: "La Fast Phobia Cure usa:", options: ["Doble asociación", "Doble disociación", "Hipnosis profunda"], correct: 1, feedback: "Viéndose a sí mismo viéndose a sí mismo." },
                    { q: "Antes de hacer un cambio, la PNL exige revisar:", options: ["El precio", "La ecología", "El pago"], correct: 1, feedback: "Test de ecología sistémica." },
                    { q: "Una línea 'Through Time' es mejor para:", options: ["Vivir el presente", "Planificar", "Sentir emociones"], correct: 1, feedback: "Permite ver el panorama completo." },
                    { q: "Morderse las uñas y aplicar Swish requiere que la imagen inicial sea:", options: ["El yo deseado", "El disparador (mano a la boca)", "Un espacio vacío"], correct: 1, feedback: "El estímulo que dispara el hábito." },
                    { q: "En la Fast Phobia, el paciente se ve a sí mismo viendo una película de sí mismo. Esto es:", options: ["1ª posición", "3ª posición", "Doble disociación"], correct: 2, feedback: "Dos niveles de distancia." },
                    { q: "En ventas, usar el rapport y predicados del cliente es una aplicación:", options: ["Clínica", "Organizacional", "Educativa"], correct: 1, feedback: "Ventas y negociación." },
                    { q: "El test ecológico responde a la pregunta:", options: ["¿Cuánto cuesta?", "¿Cómo afectará este cambio al resto de mi vida?", "¿Quién es el terapeuta?"], correct: 1, feedback: "Impacto sistémico." },
                    { q: "El rebobinado rápido (rewind) en la Fast Phobia utiliza:", options: ["Submodalidades auditivas", "Submodalidades visuales y velocidad", "Anclas kinestésicas"], correct: 1, feedback: "Distorsiona el tiempo visual." }
                ];
                const quizContainer8 = document.getElementById('quiz-container-8');
                const scoreDisplay8 = document.getElementById('quiz-score-8');
                let score8 = 0; let answered8 = new Array(quizData8.length).fill(false);

                quizData8.forEach((item, index) => {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'p-4 rounded border border-[var(--border-color)] bg-[var(--bg-main)]';
                    qDiv.innerHTML = `<p class="font-semibold mb-3 text-[var(--text-main)]">${index + 1}. ${item.q}</p><div class="space-y-2" id="q8-opts-${index}">${item.options.map((opt, i) => `<button class="quiz-btn-8 w-full text-left p-2 rounded text-sm bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-[var(--border-color)]" data-q="${index}" data-opt="${i}">${opt}</button>`).join('')}</div><div id="q8-feedback-${index}" class="mt-2 text-sm hidden"></div>`;
                    quizContainer8.appendChild(qDiv);
                });
                document.querySelectorAll('.quiz-btn-8').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const qIdx = parseInt(this.dataset.q); const optIdx = parseInt(this.dataset.opt);
                        if (answered8[qIdx]) return; answered8[qIdx] = true;
                        const buttons = document.querySelectorAll(`#q8-opts-${qIdx} button`);
                        const feedbackDiv = document.getElementById(`q8-feedback-${qIdx}`);
                        const isCorrect = optIdx === quizData8[qIdx].correct;
                        buttons.forEach((b, i) => { b.disabled = true; if (i === quizData8[qIdx].correct) b.classList.add('bg-emerald-100', 'dark:bg-emerald-900/50', 'border-emerald-500'); else if (i === optIdx && !isCorrect) b.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500'); else b.classList.add('opacity-50'); });
                        feedbackDiv.classList.remove('hidden');
                        if (isCorrect) { score8++; feedbackDiv.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓</span> <span class="text-[var(--text-muted)]">${quizData8[qIdx].feedback}</span>`; } else { feedbackDiv.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">✗</span> <span class="text-[var(--text-muted)]">${quizData8[qIdx].feedback}</span>`; }
                        scoreDisplay8.textContent = `${score8}/${quizData8.length}`;
                        if (window.appState) { window.appState.quizScores['mod8'] = score8; if (window.saveState) window.saveState(); }
                    });
                });
            } catch (e) { console.error("Error Mod 8:", e); }
        })();
    
