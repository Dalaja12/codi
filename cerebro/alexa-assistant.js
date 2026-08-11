// Alexa Botón Simple - Solo activa/desactiva micrófono
class AlexaButton {
    constructor() {
        this.isActive = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.wakeWord = "oye";
        this.button = document.getElementById('alexaBtn');
        
        // Configurar las rutas de las imágenes
        this.imagePaths = {
            normal: 'img/robot.png',
            active: 'img/microfono.png',
            speaking: 'img/globo-de-chat.png',
            processing: 'img/idea.png'
        };
        
        // Inicializar inmediatamente
        this.initialize();
    }
    
    initialize() {
        console.log('🎯 Asistente por voz inicializando...');
        
        // Configurar el botón
        if (this.button) {
            this.button.addEventListener('click', () => this.toggleMicrophone());
            this.setButtonImage('normal');
            console.log('✅ Botón configurado');
        } else {
            console.error('❌ Botón no encontrado');
            return;
        }
        
        // Configurar reconocimiento de voz
        this.setupVoiceRecognition();
        
        // Botón comienza con animación suave
        this.button.style.animation = 'pulse 2s infinite';
    }
    
    setButtonImage(state) {
        if (!this.button) return;
        
        let imagePath = this.imagePaths.normal;
        
        switch(state) {
            case 'normal':
                imagePath = this.imagePaths.normal;
                this.button.title = 'Asistente por voz';
                break;
            case 'active':
                imagePath = this.imagePaths.active;
                this.button.title = 'Asistente escuchando - Toca para desactivar';
                break;
            case 'speaking':
                imagePath = this.imagePaths.speaking;
                this.button.title = 'Asistente hablando - Toca para detener';
                break;
            case 'processing':
                imagePath = this.imagePaths.processing;
                this.button.title = 'Procesando...';
                break;
        }
        
        // Crear elemento de imagen
        const img = new Image();
        img.src = imagePath;
        img.alt = state;
        img.style.width = '24px';
        img.style.height = '24px';
        img.style.display = 'block';
        
        // Reemplazar contenido del botón
        this.button.innerHTML = '';
        this.button.appendChild(img);
        
        // Manejar error de imagen (fallback a texto)
        img.onerror = () => {
            console.warn(`⚠️ Imagen no encontrada: ${imagePath}`);
            this.button.innerHTML = this.getFallbackText(state);
        };
    }
    
    getFallbackText(state) {
        // Fallback si las imágenes no se cargan
        switch(state) {
            case 'normal': return '🤖';
            case 'active': return '🎤';
            case 'speaking': return '🗣️';
            case 'processing': return '🤔';
            default: return '🤖';
        }
    }
    
    setupVoiceRecognition() {
        // Verificar si el navegador soporta reconocimiento de voz
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('⚠️ Navegador no soporta voz');
            this.button.onclick = () => {
                alert('Tu navegador no soporta reconocimiento de voz.\nUsa Chrome o Edge en tu móvil.');
            };
            return;
        }
        
        // Crear reconocimiento
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        // Cuando empieza a escuchar
        this.recognition.onstart = () => {
            console.log('🎤 Micrófono ACTIVADO');
            this.animateMouth('listening');
        };
        
        // Cuando recibe resultado
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log('👂 Escuché:', transcript);
            
            // Buscar "oye" en lo que dijo
            if (transcript.includes(this.wakeWord)) {
                console.log('✅ "Oye" detectada');
                this.processCommand(transcript);
            } else {
                // Si no dijo "oye", ignorar
                console.log('❌ No dijo "Oye"');
                this.resetToListening();
            }
        };
        
        // Si hay error
        this.recognition.onerror = (event) => {
            console.log('⚠️ Error micrófono:', event.error);
            
            if (event.error === 'not-allowed') {
                this.showMessage('🎤 Permitir micrófono', 'error');
                setTimeout(() => {
                    alert('Por favor, permite el acceso al micrófono para usar el asistente.');
                }, 500);
            }
            
            this.resetButton();
        };
        
        // Cuando termina de escuchar
        this.recognition.onend = () => {
            console.log('🔇 Micrófono DESACTIVADO');
            
            // Solo reiniciar si sigue activo y no está hablando
            if (this.isActive && !this.isSpeaking) {
                setTimeout(() => {
                    if (this.isActive && !this.isSpeaking) {
                        this.startListening();
                    }
                }, 1000);
            }
        };
        
        console.log('✅ Reconocimiento de voz listo');
    }
    
    toggleMicrophone() {
        console.log('🔄 Botón presionado - Estado actual:', this.isActive);
        
        if (this.isSpeaking) {
            // Si está hablando, detenerlo
            this.stopSpeaking();
            return;
        }
        
        if (!this.isActive) {
            // ACTIVAR micrófono
            this.activateMicrophone();
        } else {
            // DESACTIVAR micrófono
            this.deactivateMicrophone();
        }
    }
    
    activateMicrophone() {
        this.isActive = true;
        
        // Cambiar imagen a modo escucha
        this.setButtonImage('active');
        this.button.classList.add('active');
        this.button.style.animation = 'pulse 0.5s infinite';
        
        // MOSTRAR MENSAJE - Escuchando
        this.showMessage('Escuchando... Di "Oye"', 'listening');
        
        console.log('🚀 Asistente ACTIVADO');
        
        // Iniciar escucha
        setTimeout(() => {
            this.startListening();
        }, 300);
    }
    
    deactivateMicrophone() {
        this.isActive = false;
        
        // Cambiar imagen a modo inactivo
        this.setButtonImage('normal');
        this.button.classList.remove('active');
        this.button.style.animation = 'pulse 2s infinite';
        
        // OCULTAR MENSAJE
        this.showMessage('');
        
        // Detener reconocimiento
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('Error deteniendo:', e);
            }
        }
        
        console.log('⏸️ Asistente DESACTIVADO');
        
        // Restaurar boca
        this.animateMouth('normal');
    }
    
    startListening() {
        if (!this.recognition || !this.isActive || this.isSpeaking) {
            return;
        }
        
        try {
            console.log('▶️ Iniciando escucha...');
            this.recognition.start();
        } catch (error) {
            console.error('❌ Error al iniciar:', error);
            
            // Reintentar en 2 segundos
            if (this.isActive) {
                setTimeout(() => this.startListening(), 2000);
            }
        }
    }
    
    processCommand(transcript) {
        // Extraer comando después de "oye"
        const wakeIndex = transcript.indexOf(this.wakeWord);
        let command = transcript.substring(wakeIndex + this.wakeWord.length).trim();
        command = command.replace(/[.,!?]/g, '').trim();
        
        console.log('📝 Comando:', command);
        
        // Comandos para detener
        if (this.isStopCommand(command)) {
            console.log('🛑 Comando DETENER');
            this.stopSpeaking();
            this.resetToListening();
            return;
        }
        
        // Si solo dijo "oye"
        if (!command) {
            this.showMessage('💬 ¿Sí? ¿En qué puedo ayudarte?', 'info');
            this.speak("¿Sí? ¿En qué puedo ayudarte?");
            return;
        }
        
        // Buscar respuesta
        this.findResponse(command);
    }
    
    isStopCommand(command) {
        const stopWords = ['para', 'detente', 'cállate', 'callate', 'silencio', 'basta', 'alto'];
        return stopWords.some(word => command.includes(word));
    }
    
    findResponse(query) {
        console.log('Buscando respuesta para:', query);
        
        // Cambiar imagen a modo procesando
        this.setButtonImage('processing');
        this.button.style.animation = 'none';
        
        // MOSTRAR MENSAJE - Pensando
        this.showMessage('🧠 Pensando...', 'thinking');
        
        // 1. Buscar en respuestas predefinidas (responses.js)
        if (typeof getPredefinedResponse === 'function') {
            const response = getPredefinedResponse(query);
            if (response) {
                console.log('✅ Respuesta predefinida encontrada');
                
                // Verificar si es una ACCIÓN (abrir página)
                if (typeof response === 'object' && response.action) {
                    // Es una acción - hablar y ejecutar
                    const actionText = response.text || 'Ejecutando acción...';
                    console.log('🚀 Ejecutando acción:', response.action);
                    
                    // MOSTRAR MENSAJE - Ejecutando acción
                    this.showMessage(`⚡ ${actionText}`, 'processing');
                    
                    // Hablar el mensaje
                    this.speak(actionText);
                    
                    // Ejecutar la acción después de hablar
                    setTimeout(() => {
                        response.action();
                    }, 1000);
                    
                    return;
                }
                
                // Es una respuesta de texto normal
                const responseText = typeof response === 'object' ? response.text : response;
                
                // MOSTRAR MENSAJE - Respondiendo
                this.showMessage('💬 Respondiendo...', 'speaking');
                
                this.speak(responseText);
                return;
            }
        }
        
        // 2. Buscar en web (Wikipedia)
        if (typeof searchWeb === 'function') {
            console.log('🌐 Buscando en web...');
            
            // MOSTRAR MENSAJE - Buscando
            this.showMessage('Buscando en Wikipedia...', 'searching');
            
            this.searchWebAndSpeak(query);
            return;
        }
        
        // 3. Respuesta por defecto
        this.showMessage('🤔 No sé cómo ayudarte', 'error');
        this.speak(`Entendí "${query}", pero aún estoy aprendiendo.`);
    }
    
    searchWebAndSpeak(query) {
        // Guardar función original
        const originalAddMessage = window.addMessage;
        let responseCaptured = false;
        
        // MOSTRAR MENSAJE - Buscando
        this.showMessage(' Buscando información...', 'searching');
        
        // Interceptar mensajes
        window.addMessage = (text, sender) => {
            if (sender === 'bot' && !responseCaptured) {
                // Limpiar texto - Solo quitar emojis (números se mantienen)
                const cleanText = this.removeEmojis(text);
                
                // Filtrar mensajes del sistema
                if (cleanText.length > 20 && 
                    !cleanText.includes('Buscando') && 
                    !cleanText.includes('Cargando')) {
                    
                    responseCaptured = true;
                    console.log('✅ Respuesta web encontrada');
                    
                    // MOSTRAR MENSAJE - Respondiendo
                    this.showMessage('💬 Respondiendo...', 'speaking');
                    
                    // Hablar la respuesta
                    this.speak(cleanText);
                    
                    // Restaurar función original
                    window.addMessage = originalAddMessage;
                }
            }
            
            // Pasar a original si existe
            if (originalAddMessage && !responseCaptured) {
                originalAddMessage(text, sender);
            }
        };
        
        // Ejecutar búsqueda
        try {
            searchWeb(query);
            
            // Timeout por si no responde
            setTimeout(() => {
                if (!responseCaptured) {
                    window.addMessage = originalAddMessage;
                    this.showMessage('❌ No encontré información', 'error');
                    this.speak("No encontré información sobre eso.");
                }
            }, 7000);
            
        } catch (error) {
            window.addMessage = originalAddMessage;
            this.showMessage('❌ Error al buscar', 'error');
            this.speak("Hubo un error al buscar.");
        }
    }
    
    removeEmojis(str) {
        // Solo quita emojis, mantiene todo lo demás (números, símbolos, letras)
        return str.replace(/[\p{Extended_Pictographic}]/gu, '');
    }
    
    speak(text) {
        console.log('🗣️ Hablando:', text.substring(0, 50) + '...');
        
        if (!window.speechSynthesis) {
            console.error('❌ No puede hablar');
            this.resetToListening();
            return;
        }
        
        // Detener cualquier habla anterior
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        // Cambiar estados
        this.isSpeaking = true;
        this.setButtonImage('speaking');
        this.button.classList.add('speaking');
        this.button.style.animation = 'pulse 0.3s infinite';
        
        // MOSTRAR MENSAJE - Hablando
        this.showMessage('🗣️ Hablando...', 'speaking');
        
        // Animar boca
        this.animateMouth('speaking');
        this.startMouthAnimation();
        
        // Detener micrófono mientras habla
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
        
        // Quitar solo emojis (números se mantienen)
        const cleanText = this.removeEmojis(text);
        
        // Crear habla con tu configuración
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "es-MX";
        utterance.rate = 0.85;
        utterance.pitch = 0.75;
        utterance.volume = 1;
        
        // Cuando empieza a hablar
        utterance.onstart = () => {
            console.log('▶️ Empezó a hablar');
        };
        
        // Cuando termina de hablar
        utterance.onend = () => {
            console.log('✅ Terminó de hablar');
            this.finishSpeaking();
        };
        
        // Si hay error
        utterance.onerror = () => {
            console.error('❌ Error al hablar');
            this.finishSpeaking();
        };
        
        // Hablar
        window.speechSynthesis.speak(utterance);
    }
    
    finishSpeaking() {
        // Terminar habla
        this.isSpeaking = false;
        this.stopMouthAnimation();
        
        // MOSTRAR MENSAJE - Volviendo a escuchar
        if (this.isActive) {
            this.showMessage(' Escuchando... Di "Oye" ', 'listening');
        }
        
        // Si el asistente sigue activo, volver a escuchar
        if (this.isActive) {
            this.resetToListening();
        } else {
            // Si no está activa, resetear botón
            this.resetButton();
        }
    }
    
    stopSpeaking() {
        // Detener habla si está hablando
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        this.isSpeaking = false;
        this.stopMouthAnimation();
        
        console.log('⏹️ Habla detenida');
        
        // Si el asistente sigue activo, volver a escuchar
        if (this.isActive) {
            this.resetToListening();
        } else {
            this.resetButton();
        }
    }
    
    resetToListening() {
        // Volver a modo escucha
        this.setButtonImage('active');
        this.button.classList.remove('speaking');
        this.button.classList.add('active');
        this.button.style.animation = 'pulse 0.5s infinite';
        
        // MOSTRAR MENSAJE - Escuchando
        this.showMessage(' Escuchando... Di "Oye" ', 'listening');
        
        this.animateMouth('listening');
        
        // Reiniciar escucha después de un momento
        setTimeout(() => {
            if (this.isActive && !this.isSpeaking) {
                this.startListening();
            }
        }, 1000);
    }
    
    resetButton() {
        // Botón a estado normal
        this.setButtonImage('normal');
        this.button.classList.remove('active', 'speaking');
        this.button.style.animation = 'pulse 2s infinite';
        
        this.animateMouth('normal');
        this.showMessage('');
    }
    
    animateMouth(state) {
        const mouth = document.getElementById('mouth');
        if (!mouth) return;
        
        // Remover todas las clases de animación
        mouth.classList.remove('listening', 'speaking', 'happy', 'angry', 'sleep', 'surprised');
        
        // Añadir clase según estado
        if (state === 'listening') {
            mouth.classList.add('surprised');
        } else if (state === 'speaking') {
            mouth.classList.add('happy');
        } else {
            mouth.classList.add('happy');
        }
    }
    
    startMouthAnimation() {
        const mouth = document.getElementById('mouth');
        if (!mouth) return;
        
        // Animación de boca hablando
        this.mouthInterval = setInterval(() => {
            mouth.classList.toggle('surprised');
        }, 200);
    }
    
    stopMouthAnimation() {
        const mouth = document.getElementById('mouth');
        if (mouth) {
            mouth.classList.remove('surprised');
            mouth.classList.add('happy');
        }
        
        if (this.mouthInterval) {
            clearInterval(this.mouthInterval);
        }
    }
    
    showMessage(text, type = 'info') {
        // Mostrar mensaje con estilo según tipo
        const container = document.getElementById('alexaStatusContainer');
        if (!container) return;
        
        if (!text) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
        }
        
        // Emojis según tipo
        const emojis = {
            listening: '🎤',
            speaking: '🗣️',
            processing: '⚡',
            thinking: '🧠',
            searching: '🔍',
            info: '💡',
            success: '✅',
            error: '❌'
        };
        
        const emoji = emojis[type] || '💡';
        
        // Colores según tipo
        const colors = {
            listening: '#ff3366',
            speaking: '#00cc66',
            processing: '#ff6600',
            thinking: '#9966ff',
            searching: '#00ccff',
            info: '#0ff',
            success: '#00ff00',
            error: '#ff4444'
        };
        
        const color = colors[type] || '#0ff';
        
        container.innerHTML = `
            <div style="
                color: ${color};
                text-align: center;
                padding: 8px 14px;
                background: rgba(0,0,0,0.7);
                border-radius: 10px;
                border: 1px solid ${color}40;
                font-size: 14px;
                font-weight: 500;
                animation: fadeInStatus 0.3s ease;
                backdrop-filter: blur(5px);
                box-shadow: 0 0 20px ${color}20;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <span style="font-size: 18px;">${emoji}</span>
                <span>${text}</span>
            </div>
        `;
        container.style.display = 'block';
    }
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Página cargada - Iniciando Asistente por voz');
    
    setTimeout(() => {
        try {
            window.alexaButton = new AlexaButton();
            console.log('✅ Asistente listo para usar');
        } catch (error) {
            console.error('❌ Error iniciando asistente:', error);
            
            // Fallback simple
            const btn = document.getElementById('alexaBtn');
            if (btn) {
                btn.onclick = () => {
                    alert('El asistente no está disponible.\nPrueba actualizando tu navegador.');
                };
            }
        }
    }, 1000);
});

// Estilos mínimos para el botón
if (!document.querySelector('#alexa-button-styles')) {
    const style = document.createElement('style');
    style.id = 'alexa-button-styles';
    style.textContent = `
        /* Animaciones básicas */
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse-fast {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        @keyframes fadeInStatus {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Estados del botón */
        #alexaBtn {
            transition: all 0.3s;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent !important;
            border: none;
        }
        
        #alexaBtn img {
            transition: transform 0.3s;
        }
        
        #alexaBtn.active {
            background: #ff3366 !important;
            box-shadow: 0 0 15px #ff3366 !important;
            animation: pulse-fast 0.5s infinite !important;
            border-radius: 50% !important;
        }
        
        #alexaBtn.speaking {
            background: #00cc66 !important;
            box-shadow: 0 0 15px #00cc66 !important;
            animation: pulse-fast 0.3s infinite !important;
            border-radius: 50% !important;
        }
        
        /* Feedback táctil */
        #alexaBtn:active {
            transform: scale(0.95);
        }
        
        #alexaBtn:active img {
            transform: scale(0.9);
        }
        
        #alexaStatusContainer {
            margin-top: 4px;
        }
        
        /* Para móviles */
        @media (max-width: 768px) {
            #alexaBtn {
                min-width: 50px !important;
                min-height: 50px !important;
            }
            
            #alexaBtn img {
                width: 28px !important;
                height: 28px !important;
            }
        }
    `;
    document.head.appendChild(style);
}