// ============================================
// CYBERPET ULTRA - SCRIPT OPTIMIZADO
// TODAS LAS FUNCIONALIDADES MANTENIDAS
// ============================================

// ============================================
// VARIABLES GLOBALES
// ============================================

// Estado del robot
let energy = 100;
let foodConsumed = 0;
let currentMood = 'happy';
let isNightMode = false;
let isSleeping = false;
let sleepInterval = null;
let autoEmotionsInterval = null;

// Comida
const foods = ['🍎', '🍕', '🍔', '🍟', '🍦', '☕', '🍪', '🍜', '🍗', '🍉', '🍩', '🍞'];
let selectedFood = null;
let isDraggingFood = false;

// Juegos
let currentGame = null;
let secretNumber = 0;
const rpsOptions = ['✊', '✋', '✌️'];
let letterHuntTimer = null;
let currentGameIndex = 0;

// Voz
let currentUtterance = null;
let isSpeaking = false;
let currentAnswer = '';
let recognition = null;
let isListening = false;
let isPaused = false;
let talkInterval = null;

// Colores
let mainColor = '#0ff';
let eyesColor = '#0ff';
let mouthColor = '#ff0000';

// Radio
let isPlaying = false;


// Calendario
let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('cyberpetEvents')) || [];

// Decoraciones
let currentDecorations = [];

// Temporadas
let currentSeason = null;
let seasonIntervals = [];

// Calculadora
let currentInput = '0';
let currentOperation = '';
let storedValue = null;
let operator = null;
let resetOnNextInput = false;

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
   
    initCustomization();
    initRadio();
    initVoiceRecognition();
    initDecorationSystem();
    initDraggableWindows();
    
    // Actualizar UI
    updateStats();
    changeExpression('happy');
    updateClock();
    checkNightMode();
    
    // Eventos
    setupEventListeners();
    
    // Temporizadores
    setInterval(checkNightMode, 60000);
    setInterval(updateClock, 1000);
    setInterval(consumeEnergy, 8000);
    
    // Auto-emociones
    startAutoEmotions(15000);
    
    // Cargar datos guardados
    loadSavedDecorations();
    loadCalendarData();
    setTimeout(checkUserName, 500);
    
    // Mostrar primer juego
    showGame(0);
});

// ============================================
// CONFIGURACIÓN DE EVENTOS
// ============================================

function setupEventListeners() {
    // Botones superiores
    document.getElementById('searchBtn').addEventListener('click', toggleSearchPanel);
    document.getElementById('searchClose').addEventListener('click', closeSearchPanel);
    document.getElementById('customBtn').addEventListener('click', toggleCustomPanel);
    document.getElementById('closePanel').addEventListener('click', closeCustomPanel);
    
    // Buscador
    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendQuestion();
    });
    
    // Controles de voz
    document.getElementById('playBtn').addEventListener('click', playAnswer);
    document.getElementById('pauseBtn').addEventListener('click', pauseSpeaking);
    document.getElementById('stopBtn').addEventListener('click', stopSpeaking);
    document.getElementById('voiceCommandBtn').addEventListener('click', startVoiceCommand);
    
    // Botones de juegos
    document.querySelectorAll('.controls button').forEach(button => {
        button.addEventListener('mousedown', function() { this.classList.add('active'); });
        button.addEventListener('mouseup', function() { this.classList.remove('active'); });
        button.addEventListener('mouseleave', function() { this.classList.remove('active'); });
    });
    
    // Ayuda
    document.getElementById('helpBtn').addEventListener('click', () => {
        document.getElementById('helpModal').style.display = 'flex';
    });
    document.querySelector('.help-close').addEventListener('click', () => {
        document.getElementById('helpModal').style.display = 'none';
    });
    document.getElementById('helpModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('helpModal')) {
            document.getElementById('helpModal').style.display = 'none';
        }
    });
    
    // Cerrar autocompletado al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.input-container')) {
            hideAutocomplete();
        }
        if (isDraggingFood && e.target.className !== 'food-item') {
            stopFoodDrag();
        }
    });
    
    // Cerrar decoración si se hace clic fuera
    document.addEventListener('click', function(e) {
        if (isDraggingNewDecoration && !e.target.closest('.decor-btn')) {
            if (e.target.id !== 'decor-ghost' && !e.target.closest('.room-decoration')) {
                deactivateDragMode();
                addMessage("Modo decoración cancelado.", 'bot');
            }
        }
    });
    
    // Evento de reseteo de ventanas
    window.addEventListener('resize', () => {
        const modals = document.querySelectorAll(
            '.games-window, .custom-panel, .search-panel, .translator-window, .notes-window, .food-window'
        );
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.top = '50%';
                modal.style.left = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
            }
        });
    });
}

// ============================================
// CONSUMO DE ENERGÍA
// ============================================

function consumeEnergy() {
    if (isSleeping) return;
    energy = Math.max(0, energy - 1);
    updateStats();
    if (energy < 30 && currentMood !== 'angry' && Math.random() > 0.8) {
        changeExpression('angry');
    }
}

// ============================================
// MODO NOCTURNO
// ============================================

function checkNightMode() {
    const hour = new Date().getHours();
    isNightMode = hour > 18 || hour < 6;
    document.body.style.backgroundColor = isNightMode ? '#0a0a20' : '#000';
}

// ============================================
// AUTO-EMOCIONES
// ============================================

function startAutoEmotions(intervalMs = 15000) {
    if (autoEmotionsInterval) clearInterval(autoEmotionsInterval);
    autoEmotionsInterval = setInterval(() => {
        const emotions = ['happy', 'angry', 'surprised'];
        let newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        if (newEmotion === currentMood) {
            const idx = emotions.indexOf(currentMood);
            newEmotion = emotions[(idx + 1) % emotions.length];
        }
        changeExpression(newEmotion);
    }, intervalMs);
}

// ============================================
// EXPRESIONES Y ESTADOS
// ============================================
// ============================================
// EXPRESIONES Y ESTADOS (CON CEJAS)
// ============================================

function changeExpression(emotion) {
    const mouth = document.getElementById('mouth');
    const leftEyebrow = document.getElementById('leftEyebrow');
    const rightEyebrow = document.getElementById('rightEyebrow');
    
    if (!mouth) return;
    
    // Actualizar boca
    mouth.className = 'mouth ' + emotion;
    currentMood = emotion;
    
    // Actualizar ánimo en estadísticas
    document.getElementById('mood-status').textContent = 
        emotion === 'happy' ? 'Feliz' :
        emotion === 'angry' ? 'Enojado' :
        emotion === 'sleep' ? 'Dormido' : 'Sorprendido';

    // 👇 NUEVO: Actualizar cejas
    if (leftEyebrow && rightEyebrow) {
        // Remover todas las clases de cejas
        leftEyebrow.className = 'eyebrow';
        rightEyebrow.className = 'eyebrow';
        
        // Agregar la clase según la emoción
        leftEyebrow.classList.add(emotion);
        rightEyebrow.classList.add(emotion);
        
        // Ajustar color según estado de ánimo
        const colors = {
            happy: '#0ff',
            angry: '#ff4444',
            surprised: '#ffaa00',
            sleep: '#666'
        };
        leftEyebrow.style.background = colors[emotion] || '#0ff';
        rightEyebrow.style.background = colors[emotion] || '#0ff';
    }

    // Cambiar fondo
    document.body.classList.remove('happy-bg', 'angry-bg', 'sleep-bg', 'surprised-bg');
    if (emotion === 'happy') document.body.classList.add('happy-bg');
    else if (emotion === 'angry') document.body.classList.add('angry-bg');
    else if (emotion === 'sleep') document.body.classList.add('sleep-bg');
    else if (emotion === 'surprised') document.body.classList.add('surprised-bg');

    if (emotion === 'sleep') {
        startSleeping();
    } else {
        stopSleeping();
    }
}
// ============================================
// SUEÑO (CON CEJAS)
// ============================================

function startSleeping() {
    if (isSleeping) return;
    isSleeping = true;
    
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    const leftEyebrow = document.getElementById('leftEyebrow');
    const rightEyebrow = document.getElementById('rightEyebrow');
    
    if (leftEye) leftEye.classList.add('sleep');
    if (rightEye) rightEye.classList.add('sleep');
    if (leftEyebrow) leftEyebrow.classList.add('sleep');
    if (rightEyebrow) rightEyebrow.classList.add('sleep');
    
    if (sleepInterval) clearInterval(sleepInterval);
    sleepInterval = setInterval(() => {
        energy = Math.min(100, energy + 1);
        updateStats();
    }, 7000);
}

function stopSleeping() {
    if (!isSleeping) return;
    isSleeping = false;
    
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    const leftEyebrow = document.getElementById('leftEyebrow');
    const rightEyebrow = document.getElementById('rightEyebrow');
    
    if (leftEye) leftEye.classList.remove('sleep');
    if (rightEye) rightEye.classList.remove('sleep');
    if (leftEyebrow) leftEyebrow.classList.remove('sleep');
    if (rightEyebrow) rightEyebrow.classList.remove('sleep');
    
    // Restaurar expresión anterior
    if (currentMood) {
        changeExpression(currentMood);
    }
    
    if (sleepInterval) {
        clearInterval(sleepInterval);
        sleepInterval = null;
    }
}
// ============================================
// ESTADÍSTICAS
// ============================================

function updateStats() {
    document.getElementById('energy-level').textContent = energy + '%';
    const bar = document.getElementById('energy-bar');
    bar.style.width = energy + '%';
    bar.style.background = energy > 70 ? '#0ff' : energy > 30 ? '#ff0' : '#f00';
    
    document.body.classList.remove('low-energy', 'fainted');
    bar.classList.remove('low');
    
    if (energy > 0 && energy <= 20) {
        document.body.classList.add('low-energy');
        bar.classList.add('low');
    }
    
    if (energy === 0) {
        document.body.classList.add('fainted');
        blockActions(true);
        addMessage("⚠️ Estoy agotado… necesito dormir 😴 o comer 🍎 para recuperarme.", "bot");
    } else {
        blockActions(false);
    }
    
    document.getElementById('food-count').textContent = foodConsumed;
}

function blockActions(disable) {
    const buttonsToBlock = ['takeSelfie', 'showGamesWindow', 'showCalculatorWindow', 'showTranslatorWindow'];
    buttonsToBlock.forEach(fn => {
        const btn = Array.from(document.querySelectorAll(".controls button"))
            .find(b => b.getAttribute("onclick")?.includes(fn));
        if (btn) btn.disabled = disable;
    });
}

//Hacer que el botón 📊 funcione 
// ============================================
// TOGGLE ESTADÍSTICAS PARA MÓVIL
// ============================================

function toggleStatsPanel() {
    const statsPanel = document.getElementById('statsPanel');
    if (statsPanel) {
        statsPanel.classList.toggle('open');
        // Opcional: vibración en móviles
        if (navigator.vibrate) navigator.vibrate(10);
    }
}

// Configurar el botón y cerrar al hacer clic fuera
document.addEventListener('DOMContentLoaded', function() {
    const statsTab = document.getElementById('statsTab');
    if (statsTab) {
        statsTab.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleStatsPanel();
        });
    }
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', function(e) {
        const statsPanel = document.getElementById('statsPanel');
        const statsTab = document.getElementById('statsTab');
        if (statsPanel && statsPanel.classList.contains('open')) {
            if (!statsPanel.contains(e.target) && e.target !== statsTab && !statsTab?.contains(e.target)) {
                statsPanel.classList.remove('open');
            }
        }
    });
});



// ============================================
// SEGUIMIENTO DE OJOS
// ============================================

document.addEventListener('mousemove', (e) => {
    // Arrastre de comida
    if (isDraggingFood) {
        const foodCursor = document.getElementById('foodCursor');
        foodCursor.style.left = e.clientX + 'px';
        foodCursor.style.top = e.clientY + 'px';
        const mouth = document.getElementById('mouth');
        const mouthRect = mouth.getBoundingClientRect();
        if (e.clientX > mouthRect.left && e.clientX < mouthRect.right &&
            e.clientY > mouthRect.top && e.clientY < mouthRect.bottom) {
            feedPet(selectedFood);
            stopFoodDrag();
            return;
        }
    }
    
    // Movimiento de ojos
    if (isSleeping) return;
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');
    const screen = document.querySelector('.bmo-screen');
    if (!screen) return;
    const screenRect = screen.getBoundingClientRect();
    const eyeX = screenRect.left + (screenRect.width / 2);
    const eyeY = screenRect.top + (screenRect.height / 2) - 30;
    const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
    const distance = window.innerWidth < 768 ? 10 : 15;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    leftPupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)`;
    rightPupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)`;
});

// Soporte touch para comida
document.addEventListener('touchmove', (e) => {
    if (!isDraggingFood) return;
    const touch = e.touches[0];
    const foodCursor = document.getElementById('foodCursor');
    foodCursor.style.left = touch.clientX + 'px';
    foodCursor.style.top = touch.clientY + 'px';
    const mouth = document.getElementById('mouth');
    const mouthRect = mouth.getBoundingClientRect();
    if (touch.clientX > mouthRect.left && touch.clientX < mouthRect.right &&
        touch.clientY > mouthRect.top && touch.clientY < mouthRect.bottom) {
        feedPet(selectedFood);
        stopFoodDrag();
    }
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', () => {
    if (isDraggingFood) stopFoodDrag();
});

// ============================================
// COMIDA
// ============================================

function showFoodWindow() {
    if (isSleeping) return;
    const foodGrid = document.getElementById('foodGrid');
    foodGrid.innerHTML = '';
    foods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        foodItem.textContent = food;
        foodItem.onclick = () => {
            selectedFood = food;
            closeFoodWindow();
            startFoodDrag(food);
        };
        foodGrid.appendChild(foodItem);
    });
    document.getElementById('foodWindow').style.display = 'block';
}

function closeFoodWindow() {
    document.getElementById('foodWindow').style.display = 'none';
}

function startFoodDrag(food) {
    isDraggingFood = true;
    selectedFood = food;
    const foodCursor = document.getElementById('foodCursor');
    foodCursor.textContent = food;
    foodCursor.style.display = 'block';
    document.body.style.cursor = 'none';
}

function stopFoodDrag() {
    isDraggingFood = false;
    selectedFood = null;
    document.getElementById('foodCursor').style.display = 'none';
    document.body.style.cursor = '';
}

function feedPet(food) {
    const mouth = document.getElementById('mouth');
    mouth.classList.add('eating');
    energy = Math.min(100, energy + 15);
    foodConsumed++;
    updateStats();
    if (currentMood === 'angry' && Math.random() > 0.5) {
        changeExpression('happy');
    }
    setTimeout(() => {
        mouth.classList.remove('eating');
    }, 1000);
}


// ============================================
// RELOJ
// ============================================

function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    const emojiElement = document.querySelector('.time-emoji');
    const clockContainer = document.querySelector('.cyber-clock-kids');
    
    if (!timeElement || !dateElement) return;
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeElement.innerHTML = `${hours}:${minutes} ${ampm} <span class="time-emoji">${emojiElement ? emojiElement.textContent : '🌞'}</span>`;
    
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('es-ES', options).toUpperCase();
    
    if (emojiElement) {
        const isDayTime = now.getHours() >= 6 && now.getHours() < 18;
        emojiElement.textContent = isDayTime ? '🌞' : '🌙';
    }
    
    if (clockContainer) {
        const isDayTime = now.getHours() >= 6 && now.getHours() < 18;
        if (!isDayTime) {
            clockContainer.classList.add('night-mode');
            clockContainer.style.background = 'linear-gradient(135deg, #6e45e2, #88d3ce)';
        } else {
            clockContainer.classList.remove('night-mode');
            clockContainer.style.background = 'linear-gradient(135deg, #ff9a8b, #ff6b95)';
        }
    }
}

// ============================================
// RADIO
// ============================================

function initRadio() {
    const player = document.getElementById('radio-player');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const stationSelect = document.getElementById('station-select');
    const stationName = document.getElementById('station-name');
    const volumeSlider = document.getElementById('volume-slider');
    
    if (!player || !playBtn) return;
    
    const stations = [
        { name: "Estación Hacker", url: "https://stream.zeno.fm/1m42oahahycvv" },
        { name: "Estación Retro", url: "https://stream.zeno.fm/4e68b4cw24zuv" }
    ];
    
    stationSelect.addEventListener('change', () => {
        player.src = stationSelect.value;
        stationName.textContent = stationSelect.options[stationSelect.selectedIndex].text;
        if (isPlaying) player.play();
    });
    
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            player.pause();
            playBtn.textContent = "▶";
            document.querySelector('.face')?.classList.remove('dance');
        } else {
            if (!player.src) player.src = stationSelect.value;
            player.play();
            playBtn.textContent = "⏯️";
            document.querySelector('.face')?.classList.add('dance');
        }
        isPlaying = !isPlaying;
    });
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const options = stationSelect.options;
            stationSelect.selectedIndex = (stationSelect.selectedIndex - 1 + options.length) % options.length;
            stationSelect.dispatchEvent(new Event('change'));
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const options = stationSelect.options;
            stationSelect.selectedIndex = (stationSelect.selectedIndex + 1) % options.length;
            stationSelect.dispatchEvent(new Event('change'));
        });
    }
    
    if (volumeSlider && player) {
        volumeSlider.addEventListener('input', () => {
            player.volume = parseFloat(volumeSlider.value);
        });
    }
    
    // Bailar cuando la radio suena
    player.addEventListener('play', () => {
        document.querySelector('.face')?.classList.add('dance');
    });
    player.addEventListener('pause', () => {
        document.querySelector('.face')?.classList.remove('dance');
    });
    player.addEventListener('ended', () => {
        document.querySelector('.face')?.classList.remove('dance');
    });
    
    stationName.textContent = stationSelect.options[stationSelect.selectedIndex].text;
}

function syncStartRadio() {
    const playBtn = document.getElementById('play-btn');
    const player = document.getElementById('radio-player');
    if (playBtn && player?.paused) {
        playBtn.click();
    }
}

function syncStopRadio() {
    const playBtn = document.getElementById('play-btn');
    const player = document.getElementById('radio-player');
    if (playBtn && player && !player.paused) {
        playBtn.click();
    }
}

// ============================================
// NOTAS MUSICALES
// ============================================

function createMusicNotes() {
    const face = document.querySelector('.face');
    if (!face) return;
    const notesContainer = document.createElement('div');
    notesContainer.className = 'mouth-music-notes';
    face.appendChild(notesContainer);
    const notes = ['♪', '♫', '♩', '♬', '♭', '♮', '🎵', '🎶'];
    setInterval(() => {
        if (face.classList.contains('dance') && notesContainer) {
            const note = document.createElement('div');
            note.className = 'music-note';
            note.textContent = notes[Math.floor(Math.random() * notes.length)];
            note.style.setProperty('--tx', (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random()));
            note.style.setProperty('--ty', 0.8 + Math.random() * 0.5);
            note.style.fontSize = `${24 + Math.random() * 12}px`;
            note.style.animationDuration = `${1.5 + Math.random()}s`;
            notesContainer.appendChild(note);
            setTimeout(() => note.remove(), 2000);
        }
    }, 300);
}

document.addEventListener('DOMContentLoaded', createMusicNotes);

// ============================================
// BUSCADOR
// ============================================

function toggleSearchPanel() {
    const panel = document.getElementById('searchPanel');
    if (panel.style.display === 'flex') {
        closeSearchPanel();
    } else {
        openSearchPanel();
    }
}

function openSearchPanel() {
    document.getElementById('searchPanel').style.display = 'flex';
    document.getElementById('userInput').focus();
}

function closeSearchPanel() {
    document.getElementById('searchPanel').style.display = 'none';
    stopSpeaking();
}

function sendQuestion() {
    const question = document.getElementById('userInput').value.trim();
    if (!question) return;
    addMessage(question, 'user');
    document.getElementById('userInput').value = '';
    showTypingIndicator();
    searchWeb(question);
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    document.getElementById('chatContainer').appendChild(typingDiv);
    document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    document.getElementById('chatContainer').appendChild(messageDiv);
    document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;
     if (sender === 'bot') {
        currentAnswer = text;
        document.getElementById('playBtn').disabled = false;
    }
}


// ============================================
// BÚSQUEDA WEB (CON CACHÉ)
// ============================================

const wikiCache = new Map();

async function searchWeb(query) {
    const predefinedResponse = getPredefinedResponse(query);
    if (predefinedResponse) {
        if (typeof predefinedResponse === 'object' && predefinedResponse.action) {
            addMessage(predefinedResponse.text, 'bot');
            setTimeout(() => predefinedResponse.action(), 800);
            return;
        } else {
            addMessage(predefinedResponse, 'bot');
            return;
        }
    }
    
    // Verificar caché
    if (wikiCache.has(query)) {
        addMessage(wikiCache.get(query), 'bot');
        return;
    }
    
    addMessage(`Buscando información sobre "${query}"...`, 'bot');
    
    try {
        let result = await getWikipediaSummary(query);
        if (result && result.text) {
            const msg = result.text;
            wikiCache.set(query, msg);
            addMessage(msg, 'bot');
            
            const lastMsg = document.querySelector('.bot-message:last-child');
            if (result.image && lastMsg) {
                const img = document.createElement('img');
                img.src = result.image;
                img.className = 'wiki-image';
                img.alt = `Imagen relacionada con ${query}`;
                lastMsg.appendChild(img);
            }
            
            if (lastMsg) {
                const link = document.createElement('a');
                link.href = `https://es.wikipedia.org/wiki/${encodeURIComponent(query.replace(/ /g, '_'))}`;
                link.className = 'result-link';
                link.textContent = '📖 Leer artículo completo';
                link.target = '_blank';
                lastMsg.appendChild(link);
            }
            
            document.getElementById('playBtn').disabled = false;
            return;
        }
        
        // Buscar título corregido
        const correctedTitle = await searchWikipedia(query);
        if (correctedTitle) {
            result = await getWikipediaSummary(correctedTitle);
            if (result && result.text) {
                const msg = result.text;
                wikiCache.set(query, msg);
                addMessage(msg, 'bot');
                
                const lastMsg = document.querySelector('.bot-message:last-child');
                if (result.image && lastMsg) {
                    const img = document.createElement('img');
                    img.src = result.image;
                    img.className = 'wiki-image';
                    img.alt = `Imagen relacionada con ${correctedTitle}`;
                    lastMsg.appendChild(img);
                }
                
                if (lastMsg) {
                    const link = document.createElement('a');
                    link.href = `https://es.wikipedia.org/wiki/${encodeURIComponent(correctedTitle.replace(/ /g, '_'))}`;
                    link.className = 'result-link';
                    link.textContent = '📖 Leer artículo completo';
                    link.target = '_blank';
                    lastMsg.appendChild(link);
                }
                
                document.getElementById('playBtn').disabled = false;
                return;
            }
        }
        
        addMessage("Vaya, no pude encontrar una respuesta buena. ¿Puedes preguntarlo de otra forma?", 'bot');
    } catch (error) {
        addMessage("Hubo un error al buscar. Intenta nuevamente.", 'bot');
    }
}

async function getWikipediaSummary(keywords) {
    try {
        const apiUrl = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&explaintext=true&exsectionformat=plain&piprop=thumbnail&pithumbsize=300&format=json&titles=${encodeURIComponent(keywords)}&origin=*`;
        const response = await fetch(apiUrl);
        if (!response.ok) return null;
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId === "-1") return null;
        const page = pages[pageId];
        if (!page.extract) return null;
        let text = page.extract.substring(0, 1200);
        if (page.extract.length > 1200) text += '...';
        const image = page.thumbnail ? page.thumbnail.source : null;
        return { text, image };
    } catch (error) {
        return null;
    }
}

async function searchWikipedia(query) {
    try {
        const apiUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        const response = await fetch(apiUrl);
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.query.search || data.query.search.length === 0) return null;
        return data.query.search[0].title;
    } catch (error) {
        return null;
    }
}

function openWebsite(url, name) {
    window.open(url, '_blank');
    changeExpression('surprised');
    setTimeout(() => changeExpression('happy'), 2000);
}

// ============================================
// RESPUESTAS PREDEFINIDAS
// ============================================

function getPredefinedResponse(question) {
    const lowerQuestion = question.toLowerCase().trim();
    const now = new Date();
    
    if (lowerQuestion.includes("hora")) {
        return `Son las ${now.toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric' })}. ⏰`;
    }
    if (lowerQuestion.includes("dia es") || lowerQuestion.includes("fecha")) {
        return `Hoy es ${now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. 📅`;
    }
    if (lowerQuestion.includes("año")) {
        return `Estamos en el año ${now.getFullYear()}.`;
    }
    
    // Respuestas de responses.js
    if (typeof responses !== 'undefined' && responses[lowerQuestion]) {
        const response = responses[lowerQuestion];
        if (typeof response === "object" && response.action) {
            return response;
        }
        if (typeof response === "function") {
            return applyUserData(response());
        }
        return applyUserData(response);
    }
    
    // Español primaria
    if (typeof respuestasEspanolPrimaria !== "undefined") {
        if (respuestasEspanolPrimaria[lowerQuestion]) {
            return respuestasEspanolPrimaria[lowerQuestion];
        }
        for (const [key, value] of Object.entries(respuestasEspanolPrimaria)) {
            if (lowerQuestion.includes(key)) {
                return value;
            }
        }
    }
    
    // Matemáticas primaria
    if (typeof respuestasMatematicasPrimaria !== "undefined") {
        if (respuestasMatematicasPrimaria[lowerQuestion]) {
            return respuestasMatematicasPrimaria[lowerQuestion];
        }
        for (const [key, value] of Object.entries(respuestasMatematicasPrimaria)) {
            if (lowerQuestion.includes(key)) {
                return value;
            }
        }
    }
    
    return null;
}

function applyUserData(text) {
    const name = localStorage.getItem("cyberpetUserName") || "";
    return text.replace(/{{name}}/g, name).replace(/\s+/g, " ").trim();
}

// ============================================
// AUTOCOMPLETADO
// ============================================

const userInput = document.getElementById("userInput");
const autocompleteList = document.getElementById("autocompleteList");
let debounceTimer = null;

userInput.addEventListener("input", () => {
    const query = userInput.value.trim();
    if (query.length < 2) {
        autocompleteList.style.display = "none";
        return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestions(query), 300);
});

async function fetchSuggestions(query) {
    try {
        const url = `https://es.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        const suggestions = data[1];
        autocompleteList.innerHTML = "";
        if (!suggestions.length) {
            autocompleteList.style.display = "none";
            return;
        }
        suggestions.forEach(text => {
            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.textContent = text;
            div.onclick = () => {
                userInput.value = text;
                autocompleteList.style.display = "none";
                userInput.focus();
            };
            autocompleteList.appendChild(div);
        });
        autocompleteList.style.display = "block";
    } catch (err) {
        autocompleteList.style.display = "none";
    }
}

function hideAutocomplete() {
    autocompleteList.style.display = "none";
}

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        hideAutocomplete();
        sendQuestion();
    }
});

// ============================================
// VOZ (SÍNTESIS)
// ============================================

function playAnswer() {
    const lastBotMessage = document.querySelector('.bot-message:last-child');
    const textToSpeak = lastBotMessage?.textContent || currentAnswer;
    if (!textToSpeak) return;
    window.speechSynthesis.cancel();
    speak(textToSpeak);
}

function pauseSpeaking() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
        if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
            window.speechSynthesis.cancel();
        }
        isSpeaking = false;
        isPaused = false;
        document.getElementById('pauseBtn').textContent = "▶️";
        document.getElementById('playBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        return;
    }
    
    if (!window.speechSynthesis.speaking && !window.speechSynthesis.paused) return;
    if (!window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        isPaused = true;
        isSpeaking = false;
        document.getElementById('pauseBtn').textContent = "▶️";
    } else {
        window.speechSynthesis.resume();
        isPaused = false;
        isSpeaking = true;
        document.getElementById('pauseBtn').textContent = "⏯️";
    }
}

function stopSpeaking() {
    if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    isPaused = false;
    const mouth = document.getElementById('mouth');
    mouth.classList.remove('surprised');
    mouth.classList.add('happy');
    document.getElementById('playBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = "⏯️";
    if (talkInterval) {
        clearInterval(talkInterval);
        talkInterval = null;
    }
}

function removeEmojis(str) {
    return str.replace(/[\p{Extended_Pictographic}]/gu, '');
}

function speak(text) {
    stopSpeaking();
    const mouth = document.getElementById('mouth');
    mouth.classList.remove('happy', 'angry', 'sleep', 'surprised');
    const cleanText = removeEmojis(text);
    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance.lang = "es-MX";
    currentUtterance.rate = 0.85;
    currentUtterance.pitch = 0.75;
    currentUtterance.volume = 1;
    currentUtterance.onstart = () => {
        isSpeaking = true;
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
        if (talkInterval) clearInterval(talkInterval);
        talkInterval = setInterval(() => {
            mouth.classList.toggle('surprised');
        }, 200);
        isPaused = false;
    };
    currentUtterance.onend = currentUtterance.onerror = () => {
        if (talkInterval) {
            clearInterval(talkInterval);
            talkInterval = null;
        }
        mouth.classList.remove('surprised');
        mouth.classList.add('happy');
        isSpeaking = false;
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
    };
    window.speechSynthesis.speak(currentUtterance);
}

// ============================================
// VOZ (RECONOCIMIENTO) - CORREGIDO
// ============================================

function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        addMessage("Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.", 'bot');
        document.getElementById('voiceCommandBtn').disabled = true;
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    recognition.onstart = function() {
        isListening = true;
        document.getElementById('voiceCommandBtn').classList.add('listening');
        const msg = document.querySelector('.search-panel .listening-message');
        if (msg) msg.style.display = 'block';
    };
    recognition.onend = function() {
        isListening = false;
        document.getElementById('voiceCommandBtn').classList.remove('listening');
        const msg = document.querySelector('.search-panel .listening-message');
        if (msg) msg.style.display = 'none';
    };
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        setTimeout(() => processVoiceCommand(transcript), 500);
    };
    recognition.onerror = function(event) {
        addMessage("Error de voz: " + event.error, 'bot');
    };
}

// 👇 SOLO ESTA FUNCIÓN CAMBIA (eliminé el mensaje de error)
function startVoiceCommand() {
    if (isListening) {
        recognition?.stop();
        return;
    }
    try {
        recognition?.start();
    } catch (error) {
        // ❌ ELIMINADO: addMessage("Error al iniciar el micrófono", 'bot');
        // ✅ No hacemos nada, solo ignoramos el error silenciosamente
        console.log('Microfono activado'); // Opcional: solo para debug
    }
}

function processVoiceCommand(command) {
    changeExpression('surprised');
    addMessage(command, 'user');
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('feliz') || lowerCommand.includes('contento')) {
        changeExpression('happy');
        addMessage("¡Cambiando a modo feliz!", 'bot');
    } else if (lowerCommand.includes('enojado') || lowerCommand.includes('molesto')) {
        changeExpression('angry');
        addMessage("¡Grrr! Estoy enojado", 'bot');
    } else if (lowerCommand.includes('dormir') || lowerCommand.includes('descansar')) {
        changeExpression('sleep');
        addMessage("Zzzz... Buenas noches", 'bot');
    } else if (lowerCommand.includes('sorpresa') || lowerCommand.includes('sorprendido')) {
        changeExpression('surprised');
        addMessage("¡Wow! ¡Qué sorpresa!", 'bot');
    } else if (lowerCommand.includes('comer') || lowerCommand.includes('alimentar')) {
        showFoodWindow();
        addMessage("Abriendo el menú de comida...", 'bot');
    } else if (lowerCommand.includes('selfie') || lowerCommand.includes('foto')) {
        takeSelfie();
        addMessage("¡Sonríe para la foto! 📸", 'bot');
    } else if (lowerCommand.includes('buscar') || lowerCommand.includes('información')) {
        const searchQuery = command.replace(/buscar|información/gi, '').trim();
        if (searchQuery) {
            addMessage(`Buscando: "${searchQuery}"`, 'bot');
            searchWeb(searchQuery);
        } else {
            addMessage("¿Qué te gustaría que busque?", 'bot');
        }
    } else {
        searchWeb(command);
    }
    setTimeout(() => {
        if (currentMood !== 'sleep') changeExpression('happy');
    }, 3000);
}

// ============================================
// JUEGOS
// ============================================

function showGamesWindow() {
    document.getElementById('gamesWindow').style.display = 'block';
}

function closeGamesWindow() {
    document.getElementById('gamesWindow').style.display = 'none';
    document.getElementById('gameContainer').innerHTML = '';
    currentGame = null;
    stopLetterHunt();
}

const gameButtons = document.querySelectorAll('.game-slider .game-btn');

function showGame(index) {
    gameButtons.forEach(btn => btn.classList.remove('active'));
    if (gameButtons[index]) gameButtons[index].classList.add('active');
    currentGameIndex = index;
}

function prevGame() {
    const newIndex = (currentGameIndex - 1 + gameButtons.length) % gameButtons.length;
    showGame(newIndex);
}

function nextGame() {
    const newIndex = (currentGameIndex + 1) % gameButtons.length;
    showGame(newIndex);
}

function startGame(gameType) {
    const gameContainer = document.getElementById('gameContainer');
    currentGame = gameType;
    if (gameType === 'guess') {
        secretNumber = Math.floor(Math.random() * 100) + 1;
        gameContainer.innerHTML = `
            <p>Adivina el número (1-100):</p>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" id="guessInput" min="1" max="100" placeholder="1-100">
                <button onclick="checkGuess()" class="game-btn">🔍</button>
            </div>
            <p id="guessHint" style="margin-top: 10px;"></p>
        `;
        addMessage("¡Juguemos! Adivina el número entre 1 y 100.", 'bot');
    } else if (gameType === 'rps') {
        gameContainer.innerHTML = `
            <p>Elige:</p>
            <div id="rpsChoices">
                <span class="rps-choice" onclick="playRPS('✊')">✊</span>
                <span class="rps-choice" onclick="playRPS('✋')">✋</span>
                <span class="rps-choice" onclick="playRPS('✌️')">✌️</span>
            </div>
            <p id="rpsResult"></p>
        `;
        addMessage("Piedra, papel o tijera... ¡Elige rápido!", 'bot');
    }
}

function checkGuess() {
    const guess = parseInt(document.getElementById('guessInput').value);
    const hintElement = document.getElementById('guessHint');
    const mouth = document.getElementById('mouth');
    if (isNaN(guess)) {
        hintElement.textContent = "¡Escribe un número válido!";
        return;
    }
    if (guess === secretNumber) {
        hintElement.textContent = `¡Correcto! Era ${secretNumber}.`;
        mouth.classList.add('happy');
        addMessage("¡Ganaste! Soy malísimo en esto 😊", 'bot');
        currentGame = null;
    } else if (guess < secretNumber) {
        hintElement.textContent = "Más alto. ¡Intenta otra vez!";
        mouth.classList.add('surprised');
        setTimeout(() => mouth.classList.remove('surprised'), 1000);
    } else {
        hintElement.textContent = "Más bajo. ¡Sigue intentando!";
        mouth.classList.add('angry');
        setTimeout(() => mouth.classList.remove('angry'), 1000);
    }
}

function playRPS(playerChoice) {
    const botChoice = rpsOptions[Math.floor(Math.random() * 3)];
    const resultElement = document.getElementById('rpsResult');
    const mouth = document.getElementById('mouth');
    mouth.classList.add('surprised');
    resultElement.innerHTML = `Tú: ${playerChoice} vs CyberPet: ${botChoice}<br>`;
    if (playerChoice === botChoice) {
        resultElement.innerHTML += "¡Empate!";
        mouth.classList.add('happy');
    } else if (
        (playerChoice === '✊' && botChoice === '✌️') ||
        (playerChoice === '✋' && botChoice === '✊') ||
        (playerChoice === '✌️' && botChoice === '✋')
    ) {
        resultElement.innerHTML += "¡Ganaste! 😠";
        mouth.classList.add('angry');
        addMessage("¡Nooo! Haré trampa la próxima vez.", 'bot');
    } else {
        resultElement.innerHTML += "¡Perdiste! 😎";
        mouth.classList.add('happy');
        addMessage("¡Soy invencible! ¿Otra ronda?", 'bot');
    }
    setTimeout(() => {
        mouth.classList.remove('surprised', 'happy', 'angry');
        mouth.classList.add('happy');
    }, 2000);
}

// ============================================
// LETTER HUNT
// ============================================

function startLetterHunt() {
    stopLetterHunt();
    currentGame = 'letterHunt';
    const confusingLetters = ['b', 'd', 'p', 'q', 'n', 'u', 'm', 'w', 'a', 'e', 'f', 't', 'h', 's', 'z'];
    const targetLetter = confusingLetters[Math.floor(Math.random() * 8)];
    let score = 0, timeLeft = 30, targetCount = 0;
    const gridSize = 5;
    const cellSize = window.innerWidth < 600 ? '10vw' : '40px';
    
    document.getElementById('gameContainer').innerHTML = `
        <div style="text-align:center;padding:10px;max-width:90%;">
            <h3>Encuentra todas las: <span style="color: var(--main-color)">${targetLetter}</span></h3>
            <p>Tiempo: <span id="timeDisplay">${timeLeft}</span>s | Aciertos: <span id="huntScore">0</span></p>
            <div id="letterGrid" style="display:grid;grid-template-columns:repeat(${gridSize}, ${cellSize});grid-template-rows:repeat(${gridSize}, ${cellSize});gap:3px;margin:10px auto;justify-content:center;"></div>
            <button onclick="resetLetterHunt()" class="game-btn">🔄 Reiniciar</button>
        </div>
    `;
    
    const grid = document.getElementById('letterGrid');
    for (let i = 0; i < gridSize * gridSize; i++) {
        const letter = Math.random() > 0.75 ? targetLetter : confusingLetters[Math.floor(Math.random() * confusingLetters.length)];
        if (letter === targetLetter) targetCount++;
        const letterBox = document.createElement('div');
        letterBox.textContent = letter;
        letterBox.dataset.found = "false";
        Object.assign(letterBox.style, {
            cursor: 'pointer',
            fontSize: `calc(${cellSize} * 0.5)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #444',
            borderRadius: '2px',
            background: '#111',
            transition: 'all 0.2s',
            userSelect: 'none'
        });
        letterBox.onclick = () => {
            if (letter === targetLetter && letterBox.dataset.found === "false") {
                score++;
                letterBox.dataset.found = "true";
                document.getElementById('huntScore').textContent = score;
                letterBox.style.background = 'var(--main-color)';
                letterBox.style.color = '#000';
                speak(letter);
                if (score === targetCount) {
                    stopLetterHunt();
                    speak("¡Excelente! Encontraste todas las " + targetLetter);
                    setTimeout(startLetterHunt, 2000);
                }
            } else if (letter !== targetLetter) {
                letterBox.style.background = '#f00';
                setTimeout(() => letterBox.style.background = '#111', 300);
            }
        };
        grid.appendChild(letterBox);
    }
    
    letterHuntTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timeDisplay').textContent = timeLeft;
        if (timeLeft <= 0) {
            stopLetterHunt();
            speak("¡Tiempo terminado! La letra era " + targetLetter);
            grid.style.opacity = '0.6';
        }
    }, 1000);
}

function stopLetterHunt() {
    if (letterHuntTimer) {
        clearInterval(letterHuntTimer);
        letterHuntTimer = null;
    }
}

window.resetLetterHunt = () => {
    stopLetterHunt();
    startLetterHunt();
};

// ============================================
// MEMORY GAME
// ============================================

function startMemoryGame() {
    const MemoryGame = {
        sequence: [],
        userSequence: [],
        level: 1,
        lives: 3,
        isPlaying: false,
        synth: null,
        
        init: function() {
            document.getElementById('gameContainer').innerHTML = `
                <div style="text-align: center;">
                    <h3>Nivel: <span id="memoryLevel">1</span></h3>
                    <p>Vidas: <span id="memoryLives">❤️❤️❤️</span></p>
                    <div id="memoryGrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: min(200px, 90%); margin: 20px auto;"></div>
                    <button id="memoryStartBtn" class="game-btn">Comenzar</button>
                </div>
            `;
            const colors = ['#0ff', '#f0f', '#0f0', '#ff0'];
            const grid = document.getElementById('memoryGrid');
            colors.forEach((color, i) => {
                const btn = document.createElement('button');
                btn.className = 'memory-btn';
                btn.style.cssText = `width:80px;height:80px;border-radius:50%;background:${color};border:none;cursor:pointer;margin:0 auto;`;
                btn.onclick = () => this.handleClick(i + 1);
                grid.appendChild(btn);
            });
            document.getElementById('memoryStartBtn').onclick = () => this.playSequence();
        },
        
        playSequence: function() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            document.getElementById('memoryStartBtn').disabled = true;
            if (this.userSequence.length === 0) {
                this.sequence.push(Math.floor(Math.random() * 4) + 1);
            }
            let i = 0;
            const playNext = () => {
                if (i < this.sequence.length) {
                    this.highlightButton(this.sequence[i]);
                    i++;
                    setTimeout(playNext, 1000);
                } else {
                    this.isPlaying = false;
                    this.userSequence = [];
                }
            };
            playNext();
        },
        
        highlightButton: function(num) {
            const btn = document.querySelectorAll('.memory-btn')[num - 1];
            btn.style.transform = 'scale(0.8)';
            this.playSound(num);
            setTimeout(() => { btn.style.transform = 'scale(1)'; }, 500);
        },
        
        handleClick: function(num) {
            if (this.isPlaying || this.userSequence.length >= this.sequence.length) return;
            this.highlightButton(num);
            this.userSequence.push(num);
            if (this.userSequence[this.userSequence.length - 1] !== this.sequence[this.userSequence.length - 1]) {
                this.lives--;
                document.getElementById('memoryLives').textContent = '❤️'.repeat(this.lives);
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    setTimeout(() => this.playSequence(), 1000);
                }
            } else if (this.userSequence.length === this.sequence.length) {
                this.levelUp();
            }
        },
        
        playSound: function(num) {
            if (!this.synth) {
                this.synth = new (window.AudioContext || window.webkitAudioContext)();
            }
            const freq = [261.63, 329.63, 392.00, 440.00][num - 1];
            const oscillator = this.synth.createOscillator();
            const gain = this.synth.createGain();
            oscillator.connect(gain);
            gain.connect(this.synth.destination);
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            gain.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(this.synth.currentTime + 0.3);
        },
        
        levelUp: function() {
            this.level++;
            document.getElementById('memoryLevel').textContent = this.level;
            setTimeout(() => {
                this.userSequence = [];
                this.playSequence();
            }, 1500);
        },
        
        gameOver: function() {
            alert(`¡Game Over! Alcanzaste nivel ${this.level}`);
            this.sequence = [];
            this.userSequence = [];
            this.level = 1;
            this.lives = 3;
            this.init();
        }
    };
    MemoryGame.init();
}

// ============================================
// STORY GAME
// ============================================

function startStoryGame() {
    const StoryGame = {
        stories: [
            { title: "Preparar el desayuno", steps: [{text:"Abrir el refrigerador", img:"🚪"},{text:"Sacar la leche", img:"🥛"},{text:"Verter en el cereal", img:"🥣"},{text:"Comer", img:"🍴"}] },
            { title: "Lavarse los dientes", steps: [{text:"Abrir el grifo", img:"🚰"},{text:"Mojar el cepillo", img:"🪥"},{text:"Poner pasta", img:"⬜"},{text:"Cepillarse", img:"😬"}] },
            { title: "Ir al colegio", steps: [{text:"Vestir uniforme", img:"👕"},{text:"Guardar útiles", img:"🎒"},{text:"Subir al bus", img:"🚌"},{text:"Saludar al profesor", img:"👨‍🏫"}] }
        ],
        
        init: function() {
            this.currentStory = this.stories[Math.floor(Math.random() * this.stories.length)];
            document.getElementById('gameContainer').innerHTML = `
                <div style="text-align: center;">
                    <h3>Ordena: ${this.currentStory.title}</h3>
                    <div id="storySequence" style="min-height:150px;margin:10px auto;border:1px dashed var(--main-color);border-radius:6px;padding:6px;"></div>
                    <button id="checkStoryBtn" class="game-btn">Comprobar</button>
                    <p id="storyFeedback" style="min-height:20px;margin-top:8px;"></p>
                </div>
            `;
            this.createDraggableSteps();
        },
        
        createDraggableSteps: function() {
            const sequenceContainer = document.getElementById('storySequence');
            const shuffledSteps = [...this.currentStory.steps];
            for (let i = shuffledSteps.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledSteps[i], shuffledSteps[j]] = [shuffledSteps[j], shuffledSteps[i]];
            }
            shuffledSteps.forEach((step) => {
                const stepElement = document.createElement('div');
                stepElement.dataset.originalIndex = this.currentStory.steps.indexOf(step);
                stepElement.innerHTML = `
                    <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(0,255,255,0.1);border:1px solid var(--main-color);border-radius:8px;margin:8px 0;cursor:grab;">
                        <span style="font-size:24px;">${step.img}</span>
                        <span>${step.text}</span>
                    </div>
                `;
                stepElement.draggable = true;
                stepElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', 'drag');
                    e.currentTarget.style.opacity = '0.5';
                });
                stepElement.addEventListener('dragend', (e) => {
                    e.currentTarget.style.opacity = '1';
                });
                sequenceContainer.appendChild(stepElement);
            });
            sequenceContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(sequenceContainer, e.clientY);
                const draggingElement = document.querySelector('[draggable=true][style*="opacity: 0.5"]');
                if (draggingElement) {
                    if (afterElement) {
                        sequenceContainer.insertBefore(draggingElement, afterElement);
                    } else {
                        sequenceContainer.appendChild(draggingElement);
                    }
                }
            });
            document.getElementById('checkStoryBtn').onclick = () => this.checkOrder();
        },
        
        getDragAfterElement: function(container, y) {
            const draggableElements = [...container.querySelectorAll('[draggable=true]:not([style*="opacity: 0.5"])')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        },
        
        checkOrder: function() {
            const sequenceContainer = document.getElementById('storySequence');
            const currentSteps = Array.from(sequenceContainer.children);
            const isCorrect = currentSteps.every((stepEl, currentPos) => {
                return parseInt(stepEl.dataset.originalIndex) === currentPos;
            });
            const feedback = document.getElementById('storyFeedback');
            if (isCorrect) {
                feedback.innerHTML = "✅ ¡Felicidades! Orden correcto";
                feedback.style.color = "#0f0";
                currentSteps.forEach((step, i) => {
                    setTimeout(() => {
                        step.firstChild.style.background = 'var(--main-color)';
                        step.firstChild.style.color = '#000';
                    }, i * 300);
                });
                setTimeout(() => this.init(), 2000);
            } else {
                feedback.innerHTML = "❌ Sigue intentando";
                feedback.style.color = "#f00";
            }
        }
    };
    StoryGame.init();
}

// ============================================
// SOUND GAME
// ============================================

const SoundGame = {
    words: [
        { word: "casa", missing: "ca_a" }, { word: "perro", missing: "pe__o" },
        { word: "gato", missing: "ga_o" }, { word: "árbol", missing: "ár_ol" },
        { word: "sol", missing: "s_l" }, { word: "luna", missing: "lu_a" },
        { word: "flor", missing: "fl_r" }, { word: "agua", missing: "ag_a" },
        { word: "libro", missing: "li_ro" }, { word: "mesa", missing: "me_a" }
    ],
    currentWord: null,
    score: 0,

    init: function() {
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        document.getElementById('gameContainer').innerHTML = `
            <div style="text-align: center;">
                <h3>Completa la palabra:</h3>
                <p style="font-size: 2em; letter-spacing: 5px;">${this.currentWord.missing.replace(/_/g, ' ')}</p>
                <div style="margin: 20px;">
                    <input type="text" id="soundInput" placeholder="Escribe la palabra completa" style="padding:10px;font-size:16px;text-align:center;">
                </div>
                <button id="checkBtn" class="game-btn">Comprobar</button>
                <button id="playBtnSound" class="game-btn" style="margin-left:10px;">🔊 Escuchar palabra completa</button>
                <p id="soundFeedback" style="min-height:24px;margin-top:15px;"></p>
                <p>Puntuación: <span id="soundScore">0</span></p>
            </div>
        `;
        document.getElementById('checkBtn').onclick = () => this.checkAnswer();
        document.getElementById('playBtnSound').onclick = () => this.playFullWord();
    },

    checkAnswer: function() {
        const userAnswer = document.getElementById('soundInput').value.trim().toLowerCase();
        const feedback = document.getElementById('soundFeedback');
        if (userAnswer === this.currentWord.word) {
            this.score++;
            document.getElementById('soundScore').textContent = this.score;
            feedback.innerHTML = "✅ ¡Correcto! La palabra es " + this.currentWord.word;
            feedback.style.color = "#0f0";
            const mouth = document.getElementById('mouth');
            mouth.classList.add('happy');
            setTimeout(() => mouth.classList.remove('happy'), 1000);
            setTimeout(() => { feedback.innerHTML = ""; this.init(); }, 2000);
        } else {
            feedback.innerHTML = "❌ Incorrecto. Intenta otra vez";
            feedback.style.color = "#f00";
            const mouth = document.getElementById('mouth');
            mouth.classList.add('angry');
            setTimeout(() => mouth.classList.remove('angry'), 1000);
        }
    },

    playFullWord: function() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(this.currentWord.word);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            const voices = window.speechSynthesis.getVoices();
            const spanishVoice = voices.find(voice => voice.lang.includes('es'));
            if (spanishVoice) utterance.voice = spanishVoice;
            const mouth = document.getElementById('mouth');
            mouth.classList.add('surprised');
            utterance.onend = () => { mouth.classList.remove('surprised'); };
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Tu navegador no soporta síntesis de voz.");
        }
    }
};

function startSoundGame() {
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = SoundGame.init;
    }
    SoundGame.init();
}

// ============================================
// CALCULADORA
// ============================================

function showCalculatorWindow() {
    document.getElementById('calculatorWindow').style.display = 'block';
    resetCalculator();
    changeExpression('surprised');
}

function closeCalculatorWindow() {
    document.getElementById('calculatorWindow').style.display = 'none';
    changeExpression('happy');
}

function updateCalcDisplays() {
    document.getElementById('operationDisplay').textContent = currentOperation;
    document.getElementById('resultDisplay').textContent = currentInput;
}

function appendToCalc(num) {
    if (resetOnNextInput) {
        resetCalculator();
        resetOnNextInput = false;
    }
    if (currentInput === '0' || currentInput === '-0') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    if (operator) {
        currentOperation = `${storedValue} ${operator} ${currentInput}`;
    }
    updateCalcDisplays();
}

function setOperator(op) {
    if (operator !== null && !resetOnNextInput) {
        calculate();
    }
    storedValue = parseFloat(currentInput);
    operator = op;
    currentOperation = `${currentInput} ${operator}`;
    currentInput = '0';
    resetOnNextInput = false;
    updateCalcDisplays();
}

function calculate() {
    if (operator === null) return;
    const currentValue = parseFloat(currentInput);
    let result;
    switch (operator) {
        case '+': result = storedValue + currentValue; break;
        case '-': result = storedValue - currentValue; break;
        case '*': result = storedValue * currentValue; break;
        case '/': result = storedValue / currentValue; break;
        default: return;
    }
    currentOperation = `${storedValue} ${operator} ${currentValue} =`;
    currentInput = String(result);
    operator = null;
    resetOnNextInput = true;
    updateCalcDisplays();
    if (result < 0) changeExpression('angry');
    else if (result % 1 !== 0) changeExpression('surprised');
    else changeExpression('happy');
}

function clearCalc() { resetCalculator(); }
function backspace() {
    if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    if (operator) {
        currentOperation = `${storedValue} ${operator} ${currentInput}`;
    }
    updateCalcDisplays();
}

function resetCalculator() {
    currentInput = '0';
    currentOperation = '';
    storedValue = null;
    operator = null;
    resetOnNextInput = false;
    updateCalcDisplays();
}

// ============================================
// NOTAS
// ============================================


// ============================================
// VARIABLES DE ESTADO
// ============================================

let formatState = {
    bold: false,
    italic: false,
    underline: false,
    highlightColor: null,
    textColor: '#000000'
};

// ============================================
// FUNCIONES PRINCIPALES DE NOTAS
// ============================================

function showNotesWindow() {
    const notesWindow = document.getElementById('notesWindow');
    if (notesWindow) {
        notesWindow.style.display = 'flex';
        if (typeof changeExpression === 'function') {
            changeExpression('happy');
        }
        setTimeout(() => {
            const notesContent = document.getElementById('notesContent');
            if (notesContent) notesContent.focus();
        }, 100);
    }
}

function closeNotesWindow() {
    const notesWindow = document.getElementById('notesWindow');
    if (notesWindow) {
        notesWindow.style.display = 'none';
    }
}

// ============================================
// FUNCIONES DE FORMATO TOGGLE
// ============================================

function toggleBold() {
    formatState.bold = !formatState.bold;
    updateFormatButtons();
    applyFormatToCursor('bold', formatState.bold);
}

function toggleItalic() {
    formatState.italic = !formatState.italic;
    updateFormatButtons();
    applyFormatToCursor('italic', formatState.italic);
}

function toggleUnderline() {
    formatState.underline = !formatState.underline;
    updateFormatButtons();
    applyFormatToCursor('underline', formatState.underline);
}

function toggleHighlight() {
    const highlightPicker = document.getElementById('highlightColorPicker');
    if (!highlightPicker) return;
    
    // Si ya está activo, desactivarlo
    if (formatState.highlightColor) {
        formatState.highlightColor = null;
    } else {
        // Activar con el color seleccionado
        formatState.highlightColor = highlightPicker.value || '#FFFF00';
        // Aplicar a la selección actual si existe
        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== '') {
            applyHighlightToSelection(selection.getRangeAt(0), formatState.highlightColor);
        }
    }
    updateFormatButtons();
    applyHighlightToCursor();
}

// ============================================
// APLICAR FORMATO AL CURSOR
// ============================================

function applyFormatToCursor(command, active) {
    const content = document.getElementById('notesContent');
    if (!content) return;
    
    content.focus();
    
    if (active) {
        try {
            document.execCommand(command, false, null);
        } catch(e) {
            console.warn('Error aplicando formato:', e);
        }
    }
}

function applyHighlightToCursor() {
    const content = document.getElementById('notesContent');
    if (!content) return;
    
    content.focus();
    
    if (formatState.highlightColor) {
        try {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('hiliteColor', false, formatState.highlightColor);
        } catch(e) {
            console.warn('Error aplicando resaltado:', e);
        }
    }
}

// ============================================
// APLICAR FORMATOS AL ESCRIBIR
// ============================================

function applyActiveFormatsToNewText() {
    const content = document.getElementById('notesContent');
    if (!content) return;
    
    // Aplicar formatos activos al escribir
    if (formatState.bold) {
        try { document.execCommand('bold', false, null); } catch(e) {}
    }
    if (formatState.italic) {
        try { document.execCommand('italic', false, null); } catch(e) {}
    }
    if (formatState.underline) {
        try { document.execCommand('underline', false, null); } catch(e) {}
    }
    if (formatState.highlightColor) {
        try {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('hiliteColor', false, formatState.highlightColor);
        } catch(e) {}
    }
    if (formatState.textColor) {
        try {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('foreColor', false, formatState.textColor);
        } catch(e) {}
    }
}

// ============================================
// ACTUALIZAR BOTONES VISUALMENTE
// ============================================

function updateFormatButtons() {
    // Negrita
    const boldBtn = document.getElementById('boldBtn');
    if (boldBtn) {
        if (formatState.bold) {
            boldBtn.style.background = '#4CAF50';
            boldBtn.style.color = 'white';
            boldBtn.style.border = '2px solid #45a049';
            boldBtn.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        } else {
            boldBtn.style.background = '';
            boldBtn.style.color = '';
            boldBtn.style.border = '2px solid #ccc';
            boldBtn.style.boxShadow = 'none';
        }
    }
    
    // Cursiva
    const italicBtn = document.getElementById('italicBtn');
    if (italicBtn) {
        if (formatState.italic) {
            italicBtn.style.background = '#4CAF50';
            italicBtn.style.color = 'white';
            italicBtn.style.border = '2px solid #45a049';
            italicBtn.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        } else {
            italicBtn.style.background = '';
            italicBtn.style.color = '';
            italicBtn.style.border = '2px solid #ccc';
            italicBtn.style.boxShadow = 'none';
        }
    }
    
    // Subrayado
    const underlineBtn = document.getElementById('underlineBtn');
    if (underlineBtn) {
        if (formatState.underline) {
            underlineBtn.style.background = '#4CAF50';
            underlineBtn.style.color = 'white';
            underlineBtn.style.border = '2px solid #45a049';
            underlineBtn.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
        } else {
            underlineBtn.style.background = '';
            underlineBtn.style.color = '';
            underlineBtn.style.border = '2px solid #ccc';
            underlineBtn.style.boxShadow = 'none';
        }
    }
    
    // Resaltado - Muestra el color seleccionado en el botón
    const highlightBtn = document.getElementById('highlightBtn');
    if (highlightBtn) {
        if (formatState.highlightColor) {
            highlightBtn.style.background = formatState.highlightColor;
            highlightBtn.style.color = getContrastColor(formatState.highlightColor);
            highlightBtn.style.border = `2px solid ${formatState.highlightColor}`;
            highlightBtn.style.boxShadow = `0 0 15px ${formatState.highlightColor}40`;
            // Cambiar el ícono para indicar que está activo
            highlightBtn.innerHTML = '✅ Resaltar';
        } else {
            highlightBtn.style.background = '';
            highlightBtn.style.color = '';
            highlightBtn.style.border = '2px solid #ccc';
            highlightBtn.style.boxShadow = 'none';
            highlightBtn.innerHTML = '🖍️ Resaltar';
        }
    }
    
    // Actualizar el color del picker para que coincida con el estado
    const highlightPicker = document.getElementById('highlightColorPicker');
    if (highlightPicker && formatState.highlightColor) {
        highlightPicker.value = formatState.highlightColor;
    }
}

function getContrastColor(hexColor) {
    if (!hexColor) return '#000000';
    // Convertir hex a RGB
    let r, g, b;
    if (hexColor.startsWith('#')) {
        r = parseInt(hexColor.slice(1, 3), 16);
        g = parseInt(hexColor.slice(3, 5), 16);
        b = parseInt(hexColor.slice(5, 7), 16);
    } else {
        return '#000000';
    }
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

// ============================================
// FUNCIONES DE FORMATO (COMPATIBILIDAD)
// ============================================

function formatText(command) {
    const content = document.getElementById('notesContent');
    if (!content) return;
    
    content.focus();
    
    try {
        document.execCommand(command, false, null);
    } catch(e) {
        console.warn('Error en formatText:', e);
    }
}

// ============================================
// APLICAR COLOR DE TEXTO
// ============================================

function applyTextColor(color) {
    const content = document.getElementById('notesContent');
    if (!content) return;
    
    formatState.textColor = color;
    content.focus();
    
    try {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, color);
    } catch(e) {
        console.warn('Error aplicando color:', e);
    }
    
    // Actualizar el color del picker
    const textColorPicker = document.getElementById('textColor');
    if (textColorPicker) {
        textColorPicker.value = color;
        textColorPicker.style.borderColor = color;
    }
}

// ============================================
// RESALTADO MANUAL
// ============================================

function applyHighlightToSelection(range, color) {
    try {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('hiliteColor', false, color);
    } catch(e) {
        try {
            const span = document.createElement('span');
            span.style.backgroundColor = color;
            span.style.padding = '2px 4px';
            span.style.borderRadius = '3px';
            range.surroundContents(span);
        } catch(err) {
            console.warn('Error aplicando resaltado manual:', err);
        }
    }
}

// ============================================
// GUARDAR COMO WORD
// ============================================

function saveAsWord() {
    const content = document.getElementById('notesContent');
    if (!content) return;
    
    const contentHtml = content.innerHTML;
    const html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <title>Tareas CyberPet</title>
            <style>
                body { 
                    font-family: 'Comic Neue', Arial, sans-serif; 
                    padding: 20px;
                    background: white;
                    color: black;
                }
                span[style*="background-color"] {
                    padding: 2px 4px;
                    border-radius: 3px;
                }
            </style>
        </head>
        <body>${contentHtml}</body>
        </html>
    `;
    
    try {
        const blob = new Blob(['\ufeff', html], { 
            type: 'application/msword' 
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Tareas-CyberPet-${new Date().toLocaleDateString()}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        
        if (typeof changeExpression === 'function') {
            changeExpression('surprised');
            setTimeout(() => changeExpression('happy'), 1000);
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Hubo un error al guardar el archivo. Intenta nuevamente.');
    }
}

// ============================================
// LIMPIAR FORMATO
// ============================================

function clearFormatting() {
    const content = document.getElementById('notesContent');
    if (!content) return;
    
    content.focus();
    
    try {
        document.execCommand('removeFormat', false, null);
    } catch(e) {
        console.warn('Error limpiando formato:', e);
    }
}

function resetAllFormats() {
    formatState.bold = false;
    formatState.italic = false;
    formatState.underline = false;
    formatState.highlightColor = null;
    updateFormatButtons();
    
    const content = document.getElementById('notesContent');
    if (content) {
        content.focus();
        try {
            document.execCommand('selectAll', false, null);
            document.execCommand('removeFormat', false, null);
            window.getSelection().removeAllRanges();
        } catch(e) {}
    }
}

// ============================================
// INICIALIZAR EVENTOS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar selectores de color
    const highlightPicker = document.getElementById('highlightColorPicker');
    if (highlightPicker) {
        highlightPicker.addEventListener('input', function(e) {
            // Si el resaltado está activo, actualizar el color en tiempo real
            if (formatState.highlightColor) {
                formatState.highlightColor = this.value;
                updateFormatButtons();
                // Aplicar a la selección si existe
                const selection = window.getSelection();
                if (selection && selection.toString().trim() !== '') {
                    applyHighlightToSelection(selection.getRangeAt(0), this.value);
                }
            }
        });
        
        // También actualizar cuando se cambia el color
        highlightPicker.addEventListener('change', function(e) {
            if (formatState.highlightColor) {
                formatState.highlightColor = this.value;
                updateFormatButtons();
            }
        });
    }
    
    const textColorPicker = document.getElementById('textColor');
    if (textColorPicker) {
        textColorPicker.addEventListener('input', function(e) {
            applyTextColor(this.value);
        });
    }
    
    // Detectar escritura para aplicar formatos activos
    const notesContent = document.getElementById('notesContent');
    if (notesContent) {
        notesContent.addEventListener('input', function() {
            // Aplicar formatos activos al texto nuevo
            if (formatState.bold || formatState.italic || formatState.underline || 
                formatState.highlightColor || formatState.textColor !== '#000000') {
                setTimeout(applyActiveFormatsToNewText, 10);
            }
        });
    }
    
    // Actualizar botones al cargar
    setTimeout(updateFormatButtons, 100);
});


// ============================================
// TRADUCTOR
// ============================================

function showTranslatorWindow() {
    document.getElementById('translatorWindow').style.display = 'block';
    document.getElementById('sourceText').focus();
}

function closeTranslatorWindow() {
    document.getElementById('translatorWindow').style.display = 'none';
}

function swapLanguages() {
    const source = document.getElementById('sourceLanguage');
    const target = document.getElementById('targetLanguage');
    const temp = source.value;
    source.value = target.value;
    target.value = temp;
}

async function translateText() {
    const sourceText = document.getElementById('sourceText').value.trim();
    const sourceLang = document.getElementById('sourceLanguage').value;
    const targetLang = document.getElementById('targetLanguage').value;
    const resultDiv = document.getElementById('translationResult');
    if (!sourceText) {
        resultDiv.textContent = "Por favor escribe algo para traducir";
        return;
    }
    resultDiv.innerHTML = '<div class="loading-spinner"></div> Traduciendo...';
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(sourceText)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && Array.isArray(data[0])) {
            resultDiv.textContent = data[0].map(item => item[0]).join('');
            const mouth = document.getElementById('mouth');
            mouth.classList.add('happy');
            setTimeout(() => mouth.classList.remove('happy'), 1000);
        } else {
            resultDiv.textContent = "Error al traducir";
        }
    } catch (error) {
        resultDiv.textContent = "Error al traducir. Intenta nuevamente.";
        const mouth = document.getElementById('mouth');
        mouth.classList.add('angry');
        setTimeout(() => mouth.classList.remove('angry'), 1000);
    }
}

// ============================================
// VENTANAS ARRASTRABLES
// ============================================

function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = elmnt.querySelector('.window-header, .notes-window-header, .food-window-header, .games-window-header, .search-header, .custom-panel h4, .calculator-window-header, .translator-window-header, .calendar-window-header') || elmnt;
    header.style.cursor = 'move';
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        if (isInteractiveElement(e.target)) return;
        e.preventDefault();
        const rect = elmnt.getBoundingClientRect();
        elmnt.style.transform = 'none';
        elmnt.style.top = rect.top + 'px';
        elmnt.style.left = rect.left + 'px';
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        bringWindowToFront(elmnt);
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        let newLeft = elmnt.offsetLeft - pos1;
        let newTop = elmnt.offsetTop - pos2;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = elmnt.offsetWidth;
        const h = elmnt.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, vw - w));
        newTop = Math.max(0, Math.min(newTop, vh - h));
        elmnt.style.left = newLeft + 'px';
        elmnt.style.top = newTop + 'px';
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function isInteractiveElement(element) {
    return element.isContentEditable || 
           ['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'].includes(element.tagName) ||
           element.closest('[contenteditable="true"], .notes-content, .notes-toolbar');
}

function bringWindowToFront(windowElement) {
    let maxZ = 1000;
    document.querySelectorAll('.window-draggable, .food-window, .games-window, .notes-window, .search-panel, .custom-panel, .calculator-window, .translator-window').forEach(win => {
        const z = parseInt(win.style.zIndex || 0);
        if (z > maxZ) maxZ = z;
    });
    windowElement.style.zIndex = maxZ + 1;
}

function initDraggableWindows() {
    const draggableWindows = ['foodWindow', 'gamesWindow', 'searchPanel', 'customPanel', 'calculatorWindow', 'notesWindow', 'translatorWindow', 'calendarWindow','tvWindow'];
    draggableWindows.forEach(id => {
        const windowElement = document.getElementById(id);
        if (windowElement) {
            makeDraggable(windowElement);
            if (id === 'notesWindow') {
                const notesContent = document.getElementById('notesContent');
                if (notesContent) notesContent.contentEditable = true;
            }
        }
    });
}

// ============================================
// PERSONALIZACIÓN
// ============================================

function initCustomization() {
    loadColors();
    updateAllColors();
}

function toggleCustomPanel() {
    const panel = document.getElementById('customPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function closeCustomPanel() {
    document.getElementById('customPanel').style.display = 'none';
}

function loadColors() {
    if (localStorage.getItem('cyberPetMainColor')) {
        mainColor = localStorage.getItem('cyberPetMainColor');
    }
    if (localStorage.getItem('cyberPetEyesColor')) {
        eyesColor = localStorage.getItem('cyberPetEyesColor');
    }
    if (localStorage.getItem('cyberPetMouthColor')) {
        mouthColor = localStorage.getItem('cyberPetMouthColor');
    }
}

function changeMainColor(color) {
    mainColor = color;
    localStorage.setItem('cyberPetMainColor', color);
    updateMainColor();
}

function resetMainColor() { changeMainColor('#0ff'); }

function changeEyesColor(color) {
    eyesColor = color;
    localStorage.setItem('cyberPetEyesColor', color);
    updateEyesColor();
}

function resetEyesColor() { changeEyesColor('#0ff'); }

function changeMouthColor(color) {
    mouthColor = color;
    localStorage.setItem('cyberPetMouthColor', color);
    updateMouthColor();
}

function resetMouthColor() { changeMouthColor('#ff0000'); }

function updateAllColors() {
    updateMainColor();
    updateEyesColor();
    updateMouthColor();
}

function updateMainColor() {
    document.documentElement.style.setProperty('--main-color', mainColor);
    document.querySelectorAll('button, .stats-panel, .food-window, .search-panel, .custom-panel').forEach(element => {
        element.style.borderColor = mainColor;
        if (element.tagName === 'BUTTON') {
            element.style.color = mainColor;
        }
        if (element.classList.contains('custom-panel')) {
            element.style.boxShadow = `0 0 15px ${mainColor}`;
        }
    });
}

function updateEyesColor() {
    document.querySelectorAll('.eye').forEach(eye => {
        eye.style.background = eyesColor;
        eye.style.boxShadow = `0 0 20px ${eyesColor}`;
    });
}

function updateMouthColor() {
    const mouth = document.getElementById('mouth');
    if (mouth) {
        mouth.style.background = mouthColor;
        mouth.style.boxShadow = `0 0 15px ${mouthColor}`;
    }
}

// ============================================
// TEMPORADAS
// ============================================
// FUNCIÓN PRINCIPAL PARA ACTIVAR TEMPORADA
function activateSeason(season) {
    deactivateAllSeasons();
    document.querySelectorAll('.season-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    currentSeason = season;
    
    switch(season) {
        case 'christmas': activateChristmas(); break;
        case 'halloween': activateHalloween(); break;
        case 'valentine': activateValentine(); break;
        case 'easter': activateEaster(); break;
        case 'summer': activateSummer(); break;
    }
}

// DESACTIVAR TODAS LAS TEMPORADAS
function deactivateAllSeasons() {
    seasonIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
    });
    seasonIntervals = [];
    document.querySelectorAll('.season-element').forEach(el => el.remove());
    document.querySelectorAll('.season-btn').forEach(btn => btn.classList.remove('active'));
    currentSeason = null;
}

// FUNCIONES DE CREACIÓN DE ELEMENTOS (MANTENER LAS EXISTENTES)
function createFallingElement(emoji, color, size, duration, animation, glowColor) {
    const element = document.createElement('div');
    element.className = 'season-element';
    element.textContent = emoji;
    element.style.cssText = `
        top: -50px;
        left: ${Math.random() * 100}vw;
        color: ${color};
        font-size: ${size}px;
        animation: ${animation} ${duration}s linear infinite;
        text-shadow: 0 0 8px ${glowColor || color}, 0 0 16px ${glowColor || color};
        z-index: -1;
        opacity: ${0.7 + Math.random() * 0.3};
        pointer-events: none;
        user-select: none;
    `;
    document.body.appendChild(element);
    setTimeout(() => {
        if (element.parentNode) element.remove();
    }, duration * 1000);
}

function createFloatingElement(emoji, color, size, duration, animation) {
    const element = document.createElement('div');
    element.className = 'season-element';
    element.textContent = emoji;
    element.style.cssText = `
        top: ${Math.random() * 100}vh;
        left: ${Math.random() * 100}vw;
        color: ${color};
        font-size: ${size}px;
        animation: ${animation} ${duration}s infinite;
        text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        z-index: -1;
        opacity: 0.9;
        pointer-events: none;
        user-select: none;
    `;
    document.body.appendChild(element);
    setTimeout(() => {
        if (element.parentNode) element.remove();
    }, duration * 1000);
}

function createFlyingElement(emoji, color, size, duration, animation) {
    const element = document.createElement('div');
    element.className = 'season-element';
    element.textContent = emoji;
    element.style.cssText = `
        top: ${Math.random() * 100}vh;
        left: -50px;
        color: ${color};
        font-size: ${size}px;
        animation: ${animation} ${duration}s infinite;
        text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        z-index: -1;
        opacity: 0.8;
        pointer-events: none;
        user-select: none;
    `;
    document.body.appendChild(element);
    setTimeout(() => {
        if (element.parentNode) element.remove();
    }, duration * 1000);
}

// === TEMPORADA DE NAVIDAD ===
function activateChristmas() {
    seasonIntervals.push(setInterval(() => 
        createFallingElement('❄', '#ffffff', 14, 10, 'fall-rotate', 'cyan'), 500
    ));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('🎄', '#00ff00', 24, 12, 'fall-rotate', '#00ff00'), 2000
    ));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('⭐', '#ffff00', 20, 11, 'fall-rotate', '#ffff00'), 2500
    ));
}

// === TEMPORADA DE HALLOWEEN ===
function activateHalloween() {
    seasonIntervals.push(setInterval(() => 
        createFallingElement('🎃', '#ff6600', 28, 10, 'fall-rotate', 'orange'), 600
    ));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('👻', '#ffffff', 24, 12, 'fall-rotate', 'white'), 800
    ));
    seasonIntervals.push(setInterval(() => 
        createFlyingElement('🦇', '#663399', 18, 10, 'float-gentle'), 1500
    ));
}

// === TEMPORADA DE SAN VALENTÍN ===
function activateValentine() {
    seasonIntervals.push(setInterval(() => 
        createFallingElement('💕', '#ff3388', 18, 8, 'fall-rotate', 'hotpink'), 400
    ));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('💖', '#ff66a3', 22, 10, 'fall-rotate', 'pink'), 700
    ));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('🌹', '#ff0066', 26, 12, 'fall-rotate', 'red'), 1500
    ));
}

// === TEMPORADA DE PASCUA ===
function activateEaster() {
    const colors = ['#ff9999', '#99ff99', '#9999ff', '#ff99ff', '#ffff99'];
    seasonIntervals.push(setInterval(() => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        createFallingElement('🥚', randomColor, 20, 8, 'fall-rotate', randomColor);
    }, 500));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('🐰', '#ffffff', 24, 10, 'bounce-fall', 'white'), 1500
    ));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('🐤', '#ffff00', 22, 9, 'fall-rotate', 'yellow'), 1200
    ));
}

// === TEMPORADA DE VERANO ===
function activateSummer() {
    seasonIntervals.push(setInterval(() => 
        createFallingElement('💧', '#0099ff', 18, 6, 'fall-fast', 'lightblue'), 300
    ));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('🐚', '#ffcc99', 20, 9, 'fall-rotate', 'peachpuff'), 600
    ));
    seasonIntervals.push(setInterval(() => 
        createFallingElement('🌟', '#ffff99', 22, 10, 'fall-rotate', 'lightyellow'), 800
    ));
    seasonIntervals.push(setInterval(() => {
        const colors = ['#ff99cc', '#99ff99', '#9999ff'];
        createFallingElement('🍦', colors[Math.floor(Math.random() * colors.length)], 26, 11, 'fall-rotate', colors[Math.floor(Math.random() * colors.length)]);
    }, 1500));
    seasonIntervals.push(setInterval(() => 
        createFloatingElement('☀️', '#ffff00', 30, 16, 'spin-slow'), 3000
    ));
}

// DETECCIÓN AUTOMÁTICA DE TEMPORADA
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    if ((month === 12 && day >= 15) || (month === 1 && day <= 6)) {
        activateSeason('christmas');
    } else if (month === 10 && day >= 20) {
        activateSeason('halloween');
    } else if (month === 2 && day >= 10 && day <= 15) {
        activateSeason('valentine');
    } else if (month === 3 || month === 4) {
        activateSeason('easter');
    } else if (month >= 6 && month <= 8) {
        activateSeason('summer');
    }
});

// ============================================
// DECORACIONES
// ============================================

let selectedDecorationType = null;
let selectedDecorationImage = null;
let isDraggingNewDecoration = false;
let ghostDecoration = null;

function initDecorationSystem() {
    loadSavedDecorations();
    document.querySelectorAll('.decor-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemType = this.getAttribute('data-item');
            const itemImage = this.getAttribute('data-img');
            selectDecoration(itemType, itemImage);
        });
    });
}

function selectDecoration(type, imageSrc) {
    selectedDecorationType = type;
    selectedDecorationImage = imageSrc;
    document.getElementById('customPanel').style.display = 'none';
    document.body.style.cursor = `url('${imageSrc}') 25 25, auto`;
    activateDragMode();
    addMessage(`¡Listo! Ahora arrastra ${type} a donde quieras colocarlo.`, 'bot');
}

function activateDragMode() {
    isDraggingNewDecoration = true;
    createGhostDecoration(100, 100);
    document.addEventListener('mousemove', dragNewDecoration);
    document.addEventListener('mouseup', placeNewDecoration);
    document.addEventListener('touchmove', dragNewDecorationTouch);
    document.addEventListener('touchend', placeNewDecorationTouch);
}

function createGhostDecoration(x, y) {
    if (ghostDecoration) ghostDecoration.remove();
    ghostDecoration = document.createElement('img');
    ghostDecoration.id = 'decor-ghost';
    ghostDecoration.className = 'room-decoration ghost';
    ghostDecoration.src = selectedDecorationImage;
    ghostDecoration.setAttribute('data-type', selectedDecorationType);
    ghostDecoration.style.left = (x - 50) + 'px';
    ghostDecoration.style.top = (y - 50) + 'px';
    ghostDecoration.style.opacity = '0.7';
    ghostDecoration.style.pointerEvents = 'none';
    document.body.appendChild(ghostDecoration);
}

function dragNewDecoration(e) {
    if (!isDraggingNewDecoration || !ghostDecoration) return;
    ghostDecoration.style.left = (e.clientX - 50) + 'px';
    ghostDecoration.style.top = (e.clientY - 50) + 'px';
}

function dragNewDecorationTouch(e) {
    if (!isDraggingNewDecoration || !ghostDecoration) return;
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        ghostDecoration.style.left = (touch.clientX - 50) + 'px';
        ghostDecoration.style.top = (touch.clientY - 50) + 'px';
    }
}

function placeNewDecoration(e) {
    if (!isDraggingNewDecoration) return;
    createPermanentDecoration(e.clientX, e.clientY);
    deactivateDragMode();
}

function placeNewDecorationTouch(e) {
    if (!isDraggingNewDecoration) return;
    e.preventDefault();
    if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        createPermanentDecoration(touch.clientX, touch.clientY);
    }
    deactivateDragMode();
}

function createPermanentDecoration(x, y) {
    const decoration = document.createElement('img');
    const id = `decor-${selectedDecorationType}-${Date.now()}`;
    decoration.id = id;
    decoration.className = 'room-decoration';
    decoration.src = selectedDecorationImage;
    decoration.setAttribute('data-type', selectedDecorationType);
    decoration.setAttribute('data-id', id);
    const finalX = Math.max(0, x - 50);
    const finalY = Math.max(0, y - 50);
    decoration.style.left = `${finalX}px`;
    decoration.style.top = `${finalY}px`;
    makeDecorationDraggable(decoration);
    document.body.appendChild(decoration);
    currentDecorations.push({ id, type: selectedDecorationType, image: selectedDecorationImage, x: finalX, y: finalY });
    saveDecorations();
    addMessage(`¡${selectedDecorationType} colocado! Puedes moverlo cuando quieras.`, 'bot');
}

function deactivateDragMode() {
    isDraggingNewDecoration = false;
    selectedDecorationType = null;
    selectedDecorationImage = null;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', dragNewDecoration);
    document.removeEventListener('mouseup', placeNewDecoration);
    document.removeEventListener('touchmove', dragNewDecorationTouch);
    document.removeEventListener('touchend', placeNewDecorationTouch);
    if (ghostDecoration) {
        ghostDecoration.remove();
        ghostDecoration = null;
    }
}

function makeDecorationDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    element.onmousedown = dragMouseDown;
    element.ontouchstart = dragTouchStart;
    
    function dragMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        startDrag(e.clientX, e.clientY);
    }
    
    function dragTouchStart(e) {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    }
    
    function startDrag(x, y) {
        isDragging = true;
        bringDecorationToFront(element);
        element.classList.add('dragging');
        pos3 = x;
        pos4 = y;
        document.onmousemove = elementDrag;
        document.ontouchmove = elementDragTouch;
        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
    }
    
    function elementDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        updatePosition(e.clientX, e.clientY);
    }
    
    function elementDragTouch(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
    }
    
    function updatePosition(x, y) {
        pos1 = pos3 - x;
        pos2 = pos4 - y;
        pos3 = x;
        pos4 = y;
        const newX = element.offsetLeft - pos1;
        const newY = element.offsetTop - pos2;
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        element.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        element.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    }
    
    function closeDragElement() {
        isDragging = false;
        element.classList.remove('dragging');
        updateDecorationPosition(element);
        document.onmousemove = null;
        document.ontouchmove = null;
        document.onmouseup = null;
        document.ontouchend = null;
    }
}

function bringDecorationToFront(element) {
    const allDecorations = document.querySelectorAll('.room-decoration:not(.ghost)');
    let maxZ = 1;
    allDecorations.forEach(decor => {
        const z = parseInt(decor.style.zIndex || 1);
        if (z > maxZ) maxZ = z;
    });
    element.style.zIndex = maxZ + 1;
}

function updateDecorationPosition(element) {
    const id = element.getAttribute('data-id');
    const index = currentDecorations.findIndex(decor => decor.id === id);
    if (index !== -1) {
        currentDecorations[index].x = parseInt(element.style.left);
        currentDecorations[index].y = parseInt(element.style.top);
        saveDecorations();
    }
}

function saveDecorations() {
    localStorage.setItem('cyberpetRoomDecorations', JSON.stringify(currentDecorations));
}

function loadSavedDecorations() {
    const saved = localStorage.getItem('cyberpetRoomDecorations');
    if (saved) {
        try {
            currentDecorations = JSON.parse(saved);
            currentDecorations.forEach(decor => {
                if (decor.id && decor.type && decor.image && decor.x !== undefined && decor.y !== undefined) {
                    const decoration = document.createElement('img');
                    decoration.id = decor.id;
                    decoration.className = 'room-decoration';
                    decoration.src = decor.image;
                    decoration.setAttribute('data-type', decor.type);
                    decoration.setAttribute('data-id', decor.id);
                    decoration.style.left = decor.x + 'px';
                    decoration.style.top = decor.y + 'px';
                    makeDecorationDraggable(decoration);
                    document.body.appendChild(decoration);
                }
            });
        } catch (error) {
            currentDecorations = [];
        }
    }
}

function clearAllDecorations() {
    document.querySelectorAll('.room-decoration').forEach(decor => {
        if (!decor.classList.contains('ghost')) decor.remove();
    });
    currentDecorations = [];
    localStorage.removeItem('cyberpetRoomDecorations');
    addMessage("¡Todas las decoraciones han sido eliminadas!", 'bot');
}

// ============================================
// CALENDARIO
// ============================================


function showCalendarWindow() {
    const calendarWindow = document.getElementById('calendarWindow');
    if (!calendarWindow) return;
    
    calendarWindow.style.display = 'block';
    bringWindowToFront(calendarWindow);
    
    // Cargar eventos guardados
    loadCalendarData();
    
    // Generar calendario y actualizar eventos
    generateCalendar();
    updateEventsList();
    changeExpression('surprised');
    
    // Establecer fecha actual en el input
    const eventDateInput = document.getElementById('eventDateInput');
    if (eventDateInput) {
        eventDateInput.value = getTodayDateStr();
    }
}

function closeCalendarWindow() {
    const calendarWindow = document.getElementById('calendarWindow');
    if (!calendarWindow) return;
    
    calendarWindow.style.display = 'none';
    calendarWindow.style.top = '50%';
    calendarWindow.style.left = '50%';
    calendarWindow.style.transform = 'translate(-50%, -50%)';
    changeExpression('happy');
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearElement = document.getElementById('currentMonthYear');
    
    if (!calendarGrid || !monthYearElement) return;
    
    calendarGrid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    
    // Días de la semana
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayHeaders.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day-header';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = prevMonthLastDay - i;
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del mes actual
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    for (let i = 1; i <= lastDayDate; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        // Marcar día actual
        if (i === todayDate && month === todayMonth && year === todayYear) {
            dayElement.classList.add('today');
        }
        
        // Marcar días con eventos
        if (hasEventsOnDate(dateStr)) {
            dayElement.classList.add('has-events');
        }
        
        // Evento click para seleccionar día
        dayElement.onclick = function() {
            selectDate(i);
        };
        
        dayElement.title = `Eventos del ${i}/${month + 1}/${year}`;
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del mes siguiente para completar la cuadrícula
    const totalCells = 42;
    const daysInGrid = firstDayIndex + lastDayDate;
    const nextDays = totalCells - daysInGrid;
    for (let i = 1; i <= nextDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = i;
        calendarGrid.appendChild(dayElement);
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar();
    updateEventsList();
    
    const mouth = document.getElementById('mouth');
    if (mouth) {
        mouth.classList.add('surprised');
        setTimeout(() => mouth.classList.remove('surprised'), 500);
    }
}

function selectDate(day) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Actualizar el input de fecha
    const eventDateInput = document.getElementById('eventDateInput');
    if (eventDateInput) {
        eventDateInput.value = dateStr;
    }
    
    // Actualizar la lista de eventos
    updateEventsList(dateStr);
    
    // Resaltar el día seleccionado
    document.querySelectorAll('.calendar-day').forEach(el => {
        el.classList.remove('selected');
        if (parseInt(el.textContent) === day && !el.classList.contains('other-month')) {
            el.classList.add('selected');
        }
    });
    
    // Feedback visual
    const mouth = document.getElementById('mouth');
    if (mouth) {
        mouth.classList.add('surprised');
        setTimeout(() => mouth.classList.remove('surprised'), 500);
    }
}

function hasEventsOnDate(dateStr) {
    if (!events || events.length === 0) return false;
    return events.some(event => event.date === dateStr);
}

function updateEventsList(dateStr = null) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    const selectedDate = dateStr || document.getElementById('eventDateInput')?.value || getTodayDateStr();
    
    // Filtrar eventos de la fecha seleccionada
    const dayEvents = events.filter(event => event.date === selectedDate);
    
    if (dayEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">📭 No hay eventos para esta fecha</div>';
        return;
    }
    
    eventsList.innerHTML = '';
    dayEvents.forEach((event) => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
            <span class="event-text">${event.text}</span>
            <button class="delete-event" onclick="deleteEvent('${event.id}')" title="Eliminar evento">✖</button>
        `;
        eventsList.appendChild(eventElement);
    });
}

function addEvent() {
    const eventText = document.getElementById('newEventInput');
    const eventDate = document.getElementById('eventDateInput');
    
    if (!eventText || !eventDate) return;
    
    const text = eventText.value.trim();
    const date = eventDate.value;
    
    if (!text) {
        speak("Por favor, escribe un evento");
        eventText.focus();
        return;
    }
    
    if (!date) {
        speak("Por favor, selecciona una fecha");
        return;
    }
    
    // Verificar que no haya un evento duplicado en la misma fecha
    const existingEvent = events.find(e => e.text === text && e.date === date);
    if (existingEvent) {
        speak("Ya existe este evento en esta fecha");
        return;
    }
    
    // Crear nuevo evento con ID único
    const newEvent = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        text: text,
        date: date
    };
    
    events.push(newEvent);
    saveCalendarData();
    
    // Limpiar input
    eventText.value = '';
    
    // Actualizar vistas
    generateCalendar();
    updateEventsList(date);
    
    // Feedback
    const mouth = document.getElementById('mouth');
    if (mouth) {
        mouth.classList.add('happy');
        setTimeout(() => mouth.classList.remove('happy'), 500);
    }
    
    speak(`Evento agregado: ${text}`);
}

function deleteEvent(eventId) {
    // Buscar el evento para saber su fecha
    const eventToDelete = events.find(event => event.id == eventId);
    if (!eventToDelete) return;
    
    const eventDate = eventToDelete.date;
    
    // Eliminar el evento
    events = events.filter(event => event.id != eventId);
    saveCalendarData();
    
    // Actualizar vistas
    generateCalendar();
    updateEventsList(eventDate);
    
    // Feedback
    const mouth = document.getElementById('mouth');
    if (mouth) {
        mouth.classList.add('surprised');
        setTimeout(() => mouth.classList.remove('surprised'), 500);
    }
    
    speak("Evento eliminado");
}

function saveCalendarData() {
    try {
        localStorage.setItem('cyberpetEvents', JSON.stringify(events));
        
        const mouth = document.getElementById('mouth');
        if (mouth) {
            mouth.classList.add('happy');
            setTimeout(() => mouth.classList.remove('happy'), 1000);
        }
    } catch (e) {
        console.warn('Error guardando calendario:', e);
    }
}

function loadCalendarData() {
    const saved = localStorage.getItem('cyberpetEvents');
    if (saved) {
        try {
            events = JSON.parse(saved);
            // Asegurar que cada evento tenga ID
            events = events.filter(e => e && e.text && e.date);
            events.forEach(e => {
                if (!e.id) {
                    e.id = Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                }
            });
        } catch (e) {
            events = [];
        }
    } else {
        // Eventos de ejemplo
        const today = getTodayDateStr();
        events = [
            { id: '1_' + Date.now(), text: '🎂 Cumpleaños de CyberPet', date: today },
            { id: '2_' + Date.now(), text: '📚 Día de lectura', date: today }
        ];
        saveCalendarData();
    }
}

function clearAllEvents() {
    if (events.length === 0) {
        speak("No hay eventos para eliminar");
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los eventos del calendario?')) {
        events = [];
        saveCalendarData();
        generateCalendar();
        updateEventsList();
        speak("Todos los eventos han sido eliminados");
    }
}

function getTodayDateStr() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Inicializar calendario al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const eventDateInput = document.getElementById('eventDateInput');
    if (eventDateInput) {
        eventDateInput.value = getTodayDateStr();
    }
    loadCalendarData();
});


// ============================================
// TV ANTIGUA
// ============================================


const tvChannelsData = [
    { id: 0, name: "Dibujos", number: "1", videos: ["FsgpgWXD9eg", "JHa91zIbxjc", "1N4nqgW80XQ"], currentVideo: 0 },
    { id: 1, name: "Música", number: "2", videos: ["P2EaDD2G0G0", "FiZyM1ld-XU", "oD5E8Uc6Suw"], currentVideo: 0 },
    { id: 2, name: "Documental", number: "3", videos: ["XOd4Q6aGqyU", "aI_rbKHIPRc", "8vzTyP1v-_8"], currentVideo: 0 },
    { id: 3, name: "Comedia", number: "4", videos: ["FRB7w2SnTjc", "koBsCwzhzv8", "yUskbJhRA2A"], currentVideo: 0 }
];

let currentChannel = 0;
let isTVOn = false;
let isTVPlaying = false;
let isAudioMuted = false;

function showTVWindow() {
    const tvWindow = document.getElementById('tvWindow');
    if (!tvWindow) return;
    
    tvWindow.style.display = 'block';
    bringWindowToFront(tvWindow);
    updateTVChannelDisplay();
    updateTVButtonStates();
    changeExpression('surprised');
    speak("¡CyberPet TV lista!");
}

function closeTVWindow() {
    const tvWindow = document.getElementById('tvWindow');
    if (!tvWindow) return;
    
    if (isTVOn) {
        turnOffTV();
    }
    
    tvWindow.style.display = 'none';
    tvWindow.style.top = '50%';
    tvWindow.style.left = '50%';
    tvWindow.style.transform = 'translate(-50%, -50%)';
    changeExpression('happy');
}

function updateTVChannelDisplay() {
    const channelNumber = document.getElementById('currentChannelNumber');
    const channelName = document.getElementById('currentChannelName');
    
    if (channelNumber && channelName) {
        const currentChannelData = tvChannelsData[currentChannel];
        if (currentChannelData) {
            channelNumber.textContent = currentChannelData.number;
            channelName.textContent = currentChannelData.name;
        }
    }
}

function updateTVButtonStates() {
    const powerBtn = document.querySelector('.power-btn');
    const audioBtn = document.querySelector('.audio-btn');
    
    if (powerBtn) {
        powerBtn.className = `tv-btn power-btn ${isTVOn ? 'on' : 'off'}`;
        powerBtn.innerHTML = '⏻';
    }
    
    if (audioBtn) {
        audioBtn.innerHTML = isAudioMuted ? '🔇' : '🔈';
        audioBtn.className = `tv-btn audio-btn ${isAudioMuted ? 'muted' : ''}`;
    }
}

function turnOnTV() {
    if (isTVOn) return;
    
    const tvScreen = document.getElementById('tvScreen');
    const tvOffMessage = document.getElementById('tvOffMessage');
    const youtubeIframe = document.getElementById('youtubeIframe');
    const tvBanner = document.getElementById('tvBanner');
    
    if (tvScreen) tvScreen.classList.add('power-on');
    if (tvOffMessage) tvOffMessage.style.display = 'none';
    if (youtubeIframe) {
        youtubeIframe.style.display = 'block';
        loadTVVideo();
    }
    if (tvBanner) tvBanner.style.display = 'block';
    
    isTVOn = true;
    isTVPlaying = true;
    
    updateTVButtonStates();
    changeExpression('surprised');
    speak("¡TV encendida! Canal " + tvChannelsData[currentChannel].number);
    
    setTimeout(() => {
        if (tvScreen) tvScreen.classList.remove('power-on');
    }, 2000);
}

function turnOffTV() {
    if (!isTVOn) return;
    
    const tvOffMessage = document.getElementById('tvOffMessage');
    const youtubeIframe = document.getElementById('youtubeIframe');
    const tvBanner = document.getElementById('tvBanner');
    
    if (tvOffMessage) tvOffMessage.style.display = 'flex';
    if (youtubeIframe) {
        youtubeIframe.style.display = 'none';
        youtubeIframe.src = '';
    }
    if (tvBanner) tvBanner.style.display = 'none';
    
    isTVOn = false;
    isTVPlaying = false;
    
    updateTVButtonStates();
    speak("TV apagada");
}

function toggleTVPower() {
    if (isTVOn) {
        turnOffTV();
    } else {
        turnOnTV();
    }
}

function loadTVVideo() {
    if (!isTVOn) return;
    
    const currentChannelData = tvChannelsData[currentChannel];
    if (!currentChannelData) return;
    
    const currentVideoId = currentChannelData.videos[currentChannelData.currentVideo];
    if (!currentVideoId) return;
    
    const youtubeIframe = document.getElementById('youtubeIframe');
    if (!youtubeIframe) return;
    
    let src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`;
    if (isAudioMuted) src += '&mute=1';
    
    youtubeIframe.src = src;
    isTVPlaying = true;
}

function previousTVVideo() {
    if (!isTVOn) {
        speak("Primero enciende la TV");
        return;
    }
    
    const channel = tvChannelsData[currentChannel];
    if (!channel) return;
    
    channel.currentVideo = (channel.currentVideo - 1 + channel.videos.length) % channel.videos.length;
    loadTVVideo();
    speak("Video anterior");
}

function nextTVVideo() {
    if (!isTVOn) {
        speak("Primero enciende la TV");
        return;
    }
    
    const channel = tvChannelsData[currentChannel];
    if (!channel) return;
    
    channel.currentVideo = (channel.currentVideo + 1) % channel.videos.length;
    loadTVVideo();
    speak("Siguiente video");
}

function playPauseTV() {
    if (!isTVOn) {
        speak("Primero enciende la TV");
        return;
    }
    
    isTVPlaying = !isTVPlaying;
    
    if (isTVPlaying) {
        loadTVVideo();
        speak("Reproduciendo");
    } else {
        const youtubeIframe = document.getElementById('youtubeIframe');
        if (youtubeIframe) {
            const currentChannelData = tvChannelsData[currentChannel];
            const currentVideoId = currentChannelData.videos[currentChannelData.currentVideo];
            let src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=0&rel=0&modestbranding=1`;
            if (isAudioMuted) src += '&mute=1';
            youtubeIframe.src = src;
        }
        speak("Pausado");
    }
}

function previousTVChannel() {
    if (!isTVOn) {
        speak("Primero enciende la TV");
        return;
    }
    
    currentChannel = (currentChannel - 1 + tvChannelsData.length) % tvChannelsData.length;
    tvChannelsData[currentChannel].currentVideo = 0;
    updateTVChannelDisplay();
    loadTVVideo();
    speak(`Canal ${tvChannelsData[currentChannel].number}: ${tvChannelsData[currentChannel].name}`);
}

function nextTVChannel() {
    if (!isTVOn) {
        speak("Primero enciende la TV");
        return;
    }
    
    currentChannel = (currentChannel + 1) % tvChannelsData.length;
    tvChannelsData[currentChannel].currentVideo = 0;
    updateTVChannelDisplay();
    loadTVVideo();
    speak(`Canal ${tvChannelsData[currentChannel].number}: ${tvChannelsData[currentChannel].name}`);
}

function toggleTVAudio() {
    if (!isTVOn) {
        speak("Primero enciende la TV");
        return;
    }
    
    isAudioMuted = !isAudioMuted;
    updateTVButtonStates();
    loadTVVideo();
    speak(isAudioMuted ? "Audio silenciado" : "Audio activado");
}
// ============================================
// USUARIO
// ============================================

function checkUserName() {
    const userName = localStorage.getItem("cyberpetUserName");
    if (!userName) {
        showNamePrompt();
    } else {
        showWelcomeBack(userName);
    }
}

function showNamePrompt() {
    const notification = document.createElement('div');
    notification.className = 'cyber-notification';
    notification.innerHTML = `
        <h3>🤖 Hola, soy <span>CyberPet</span></h3>
        <p>¿Cuál es tu nombre?</p>
        <input type="text" id="userNameInput" placeholder="Escribe tu nombre..." />
        <button onclick="saveUserName()">✨ Guardar</button>
    `;
    document.body.appendChild(notification);
}

function saveUserName() {
    const input = document.getElementById("userNameInput");
    const name = input.value.trim();
    if (!name) return;
    localStorage.setItem("cyberpetUserName", name);
    const notif = document.querySelector('.cyber-notification');
    if (notif) notif.remove();
    setTimeout(() => showWelcomeBack(name), 500);
}

function showWelcomeBack(name) {
    const phrases = [
        `¡Me da mucho gusto verte, <b>${name}</b>! 😊`,
        `Hola <b>${name}</b>, estaba esperando jugar contigo 🎮`,
        `¡Hey <b>${name}</b>! ¿Qué aventura haremos hoy? 🚀`
    ];
    const notification = document.createElement('div');
    notification.className = 'cyber-notification';
    notification.innerHTML = `<h3>🤖 CyberPet</h3><p>${phrases[Math.floor(Math.random() * phrases.length)]}</p>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 800);
    }, 4000);
}

// ============================================
// SELFIE
// ============================================

function takeSelfie() {
    changeExpression('happy');
    addMessage("📸 ¡Sonríe!", 'bot');
    document.body.classList.add('camera-flash');
    setTimeout(() => {
        document.body.classList.remove('camera-flash');
        setTimeout(() => {
            if (typeof html2canvas !== 'undefined') {
                html2canvas(document.body, {
                    scale: 2,
                    backgroundColor: null,
                    useCORS: true,
                    windowWidth: document.documentElement.scrollWidth,
                    windowHeight: document.documentElement.scrollHeight
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `CyberPet-Selfie-${Date.now()}.png`;
                    link.click();
                    addMessage("📷 ¡Selfie guardada!", 'bot');
                });
            }
        }, 50);
    }, 200);
}

// ============================================
// ALEXA BUTTON
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const alexaBtn = document.getElementById('alexaBtn');
    if (alexaBtn) {
        alexaBtn.addEventListener('click', function() {
            if (window.recognition && !isListening) {
                startVoiceCommand();
            } else if (isListening) {
                recognition?.stop();
            } 
        });
    }
});
