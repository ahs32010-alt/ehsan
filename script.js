// Voice Selection and Emotion Analysis

let currentAudio = null;
let audioContext;
let analyser;
let dataArray;
let canvas;
let canvasCtx;
let animationFrame;

// Audio files configuration
const audioFiles = {
    'neutral': { file: 'audio/audio1.mp3', name: 'محايد', icon: '😐' },
    'happy': { file: 'audio/audio2.mp3', name: 'سعيد', icon: '😊' },
    'laughing': { file: 'audio/audio3.mp3', name: 'ضاحك', icon: '😂' },
    'sad': { file: 'audio/audio4.mp3', name: 'حزين', icon: '😢' },
    'depressed': { file: 'audio/audio5.mp3', name: 'مكتئب', icon: '😔' },
    'angry': { file: 'audio/audio6.mp3', name: 'غاضب', icon: '😠' }
};

let currentEmotion = null;

// Recording variables
let mediaRecorderSelf = null;
let audioChunksSelf = [];
let isRecordingSelf = false;
let audioContextSelf = null;
let analyserSelf = null;
let dataArraySelf = null;
let canvasSelf = null;
let canvasCtxSelf = null;
let animationFrameSelf = null;

// Emotion mapping - Only 6 emotions with tone details
const emotionMap = {
    'neutral': { 
        name: 'محايد', 
        icon: '😐', 
        color: '#607d8b',
        details: [
            'نبرة ثابتة، بدون ارتفاع أو انخفاض ملحوظ، وتيرة الكلام طبيعية.',
            'خلو الصوت من الاهتزاز أو الرعشة، حدة منخفضة، توقفات منتظمة.'
        ]
    },
    'happy': { 
        name: 'سعيد', 
        icon: '😊', 
        color: '#4caf50',
        details: [
            'نبرة مرتفعة قليلاً، حركات طفيفة في النبرة تدل على الحماس، كلام أسرع قليلًا.',
            'ابتسامة مسموعة في الصوت، ارتفاع النغمة في بعض الكلمات، إيقاع متسارع.'
        ]
    },
    'laughing': { 
        name: 'ضاحك', 
        icon: '😂', 
        color: '#ff9800',
        details: [
            'أصوات الضحك واضحة، تكرار أصوات قصيرة، غالبًا مع توقفات قصيرة بين الضحكات.',
            'اهتزاز عالي في النبرة، نبرة متقطعة، أحيانًا مدّ في الأحرف.'
        ]
    },
    'sad': { 
        name: 'حزين', 
        icon: '😢', 
        color: '#2196f3',
        details: [
            'نبرة منخفضة وثقيلة، كلام أبطأ، حروف مطولة أو ممدودة.',
            'انخفاض التون، خفوت الصوت، تنفس واضح بين الكلمات.'
        ]
    },
    'depressed': { 
        name: 'مكتئب', 
        icon: '😔', 
        color: '#9e9e9e',
        details: [
            'مشابه للحزن، لكن أعمق، بطئ أكثر، طاقة الصوت منخفضة جدًا.',
            'نبرة monotone (مستوية جدًا)، صعوبة في التعبير عن المشاعر الإيجابية، أحيانًا رعشة بسيطة في الصوت.'
        ]
    },
    'angry': { 
        name: 'غاضب', 
        icon: '😠', 
        color: '#f44336',
        details: [
            'نبرة عالية أو مرتفعة بشكل مفاجئ، كلام سريع وحاد أحيانًا، توقفات قصيرة وغليظة.',
            'تصاعد النبرة في بعض الكلمات، اهتزاز واضح في الصوت، قوة ضغط على الحروف.'
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    initializeSelfCanvas();
    setupEventListeners();
    hidePageLoader();
});

// Hide page loader after 1.5 seconds
function hidePageLoader() {
    const loader = document.getElementById('pageLoader');
    const body = document.body;
    
    if (loader) {
        body.classList.add('loading');
        
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
                body.classList.remove('loading');
            }, 500);
        }, 1500);
    }
}

function initializeCanvas() {
    canvas = document.getElementById('waveformCanvas');
    if (canvas) {
        canvasCtx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
}

function initializeSelfCanvas() {
    canvasSelf = document.getElementById('waveformCanvasSimple');
    if (canvasSelf) {
        canvasCtxSelf = canvasSelf.getContext('2d');
        // Set canvas size
        const container = document.getElementById('waveformContainerSimple');
        if (container) {
            canvasSelf.width = container.offsetWidth || 600;
            canvasSelf.height = container.offsetHeight || 120;
        } else {
            canvasSelf.width = 600;
            canvasSelf.height = 120;
        }
    }
}

function setupEventListeners() {
    // Setup hamburger menu
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
                hamburgerMenu.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Setup dropdown change listener
    const audioSelect = document.getElementById('audioSelect');
    if (audioSelect) {
        audioSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            if (selectedOption.value) {
                const emotion = selectedOption.value;
                const file = selectedOption.getAttribute('data-file');
                selectAudio(emotion, file);
            } else {
                // Reset if no selection
                document.getElementById('audioPlayer').style.display = 'none';
                document.getElementById('analysisResult').innerHTML = '<div class="result-placeholder"><p>اختر صوتاً من القائمة لعرض تحليل المشاعر</p></div>';
            }
        });
    }
    
    // Setup audio ended event listener
    const audioElement = document.getElementById('audioElement');
    if (audioElement) {
        audioElement.addEventListener('ended', () => {
            // Analyze emotion after audio finishes
            if (currentEmotion) {
                analyzeEmotion(currentEmotion);
            }
        });
    }
    
    // Setup self recording buttons
    const recordSelfBtn = document.getElementById('recordSelfBtn');
    const stopSelfBtn = document.getElementById('stopSelfBtn');
    
    if (recordSelfBtn) {
        recordSelfBtn.addEventListener('click', startSelfRecording);
    }
    
    if (stopSelfBtn) {
        stopSelfBtn.addEventListener('click', stopSelfRecording);
    }
}

function selectAudio(emotion, filename) {
    // Store current emotion
    currentEmotion = emotion;
    
    // Get audio file path
    const audioPath = audioFiles[emotion]?.file || `audio/${filename}`;
    
    // Show audio player
    const audioElement = document.getElementById('audioElement');
    const audioPlayer = document.getElementById('audioPlayer');
    const resultDiv = document.getElementById('analysisResult');
    
    if (audioElement) {
        audioElement.src = audioPath;
        audioPlayer.style.display = 'block';
        
        // Reset analysis result
        if (resultDiv) {
            resultDiv.innerHTML = '<div class="result-placeholder"><p>⏳ جاري تشغيل الصوت... سيظهر التحليل بعد انتهاء التشغيل</p></div>';
        }
        
        // Play audio
        audioElement.play().catch(err => {
            console.error('Error playing audio:', err);
            alert('حدث خطأ في تشغيل الصوت. تأكد من وجود الملف في مجلد audio/');
            if (resultDiv) {
                resultDiv.innerHTML = '<div class="result-placeholder"><p>❌ حدث خطأ في تشغيل الصوت</p></div>';
            }
        });
    }
}

function startWaveformVisualization(audioElement) {
    // Waveform visualization removed - can be added back if needed
    // For now, we'll just play the audio
}

async function analyzeEmotion(emotion) {
    const resultDiv = document.getElementById('analysisResult');
    if (!resultDiv) return;
    
    // Show loading
    resultDiv.innerHTML = '<div class="result-placeholder"><p>⏳ جاري التحليل...</p></div>';
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get the expected emotion data
        const expectedEmotion = emotion;
        const emotionData = generateEmotionAnalysis(expectedEmotion);
        
        displayEmotionResult(emotionData);
    } catch (error) {
        console.error('Error analyzing emotion:', error);
        resultDiv.innerHTML = '<div class="result-placeholder"><p>❌ حدث خطأ في التحليل. يرجى المحاولة مرة أخرى.</p></div>';
    }
}

function generateEmotionAnalysis(primaryEmotion) {
    // Return only the primary emotion (no percentages)
    return {
        primary: primaryEmotion
    };
}

function displayEmotionResult(emotionData) {
    const resultDiv = document.getElementById('analysisResult');
    const emotion = emotionMap[emotionData.primary];
    
    // Display emotion result with tone details
    let html = `
        <div class="emotion-result">
            <div class="emotion-header">
                <span class="emotion-icon-large">${emotion.icon}</span>
                <div class="emotion-name-large">${emotion.name}</div>
                <div class="emotion-english">${emotionData.primary === 'neutral' ? 'Neutral' : emotionData.primary === 'happy' ? 'Happy' : emotionData.primary === 'laughing' ? 'Laughing' : emotionData.primary === 'sad' ? 'Sad' : emotionData.primary === 'depressed' ? 'Depressed' : 'Angry'}</div>
            </div>
            <div class="emotion-details">
                <h4 class="details-title">تفاصيل النبرة:</h4>
                <div class="details-list">
                    ${emotion.details.map(detail => `<p class="detail-item">${detail}</p>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
}

// Self Recording Functions
async function startSelfRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorderSelf = new MediaRecorder(stream);
        audioChunksSelf = [];

        mediaRecorderSelf.ondataavailable = (event) => {
            audioChunksSelf.push(event.data);
        };

        mediaRecorderSelf.onstop = async () => {
            const audioBlob = new Blob(audioChunksSelf, { type: 'audio/wav' });
            
            // Analyze the recorded audio
            await analyzeSelfRecording(audioBlob);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderSelf.start();
        isRecordingSelf = true;

        // Update UI
        document.getElementById('recordSelfBtn').disabled = true;
        document.getElementById('stopSelfBtn').disabled = false;
        
        const statusEl = document.getElementById('recordStatusSimple');
        if (statusEl) {
            statusEl.innerHTML = '<p>🔴 جاري التسجيل...</p>';
            statusEl.style.color = '#f44336';
        }
        
        // Show waveform and start visualization
        const waveformContainer = document.getElementById('waveformContainerSimple');
        if (waveformContainer) {
            waveformContainer.style.display = 'block';
            // Small delay to ensure container is visible before initializing canvas
            setTimeout(() => {
                startSelfWaveformVisualization(stream);
            }, 100);
        } else {
            startSelfWaveformVisualization(stream);
        }
        
        // Hide result
        document.getElementById('recordResultSimple').style.display = 'none';

    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('حدث خطأ في الوصول إلى الميكروفون. يرجى التحقق من الصلاحيات.');
    }
}

function stopSelfRecording() {
    if (mediaRecorderSelf && isRecordingSelf) {
        mediaRecorderSelf.stop();
        isRecordingSelf = false;

        // Stop waveform visualization
        if (animationFrameSelf) {
            cancelAnimationFrame(animationFrameSelf);
        }
        
        // Hide waveform
        const waveformContainer = document.getElementById('waveformContainerSimple');
        if (waveformContainer) {
            waveformContainer.style.display = 'none';
        }

        // Update UI
        document.getElementById('recordSelfBtn').disabled = false;
        document.getElementById('stopSelfBtn').disabled = true;
        
        const statusEl = document.getElementById('recordStatusSimple');
        if (statusEl) {
            statusEl.innerHTML = '<p>⏳ جاري التحليل...</p>';
            statusEl.style.color = '#ff9800';
        }
    }
}

function startSelfWaveformVisualization(stream) {
    // Reinitialize canvas to ensure proper size
    initializeSelfCanvas();
    
    if (!canvasSelf || !canvasCtxSelf) {
        console.error('Canvas not initialized');
        return;
    }
    
    try {
        audioContextSelf = new (window.AudioContext || window.webkitAudioContext)();
        analyserSelf = audioContextSelf.createAnalyser();
        const source = audioContextSelf.createMediaStreamSource(stream);
        source.connect(analyserSelf);
        
        analyserSelf.fftSize = 2048;
        analyserSelf.smoothingTimeConstant = 0.8;
        const bufferLength = analyserSelf.frequencyBinCount;
        dataArraySelf = new Uint8Array(bufferLength);
        
        function draw() {
            if (!isRecordingSelf || !canvasSelf || !canvasCtxSelf) {
                if (animationFrameSelf) {
                    cancelAnimationFrame(animationFrameSelf);
                }
                return;
            }
            
            animationFrameSelf = requestAnimationFrame(draw);
            
            // Get frequency data for bars visualization
            analyserSelf.getByteFrequencyData(dataArraySelf);
            
            // Clear canvas with fade effect
            canvasCtxSelf.fillStyle = 'rgba(0, 0, 0, 0.1)';
            canvasCtxSelf.fillRect(0, 0, canvasSelf.width, canvasSelf.height);
            
            // Draw waveform as bars going up and down
            const barCount = 60; // Number of bars to display
            const barWidth = canvasSelf.width / barCount;
            const centerY = canvasSelf.height / 2;
            
            for (let i = 0; i < barCount; i++) {
                const dataIndex = Math.floor((i / barCount) * bufferLength);
                const barHeight = (dataArraySelf[dataIndex] / 255) * (canvasSelf.height * 0.8);
                
                // Create gradient for each bar
                const gradient = canvasCtxSelf.createLinearGradient(
                    i * barWidth, 
                    centerY - barHeight, 
                    i * barWidth, 
                    centerY + barHeight
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.3, '#e0b0ff');
                gradient.addColorStop(0.6, '#9d4edd');
                gradient.addColorStop(1, '#6a1b9a');
                
                canvasCtxSelf.fillStyle = gradient;
                
                // Draw bar from center going up and down
                const x = i * barWidth;
                const y = centerY - barHeight / 2;
                canvasCtxSelf.fillRect(x, y, barWidth - 2, barHeight);
            }
        }
        
        draw();
    } catch (error) {
        console.error('Error setting up waveform:', error);
    }
}

async function analyzeSelfRecording(audioBlob) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock analysis - randomly select one of the 6 emotions
        const emotions = ['neutral', 'happy', 'laughing', 'sad', 'depressed', 'angry'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const emotion = emotionMap[randomEmotion];
        
        // Display result with details
        const resultDiv = document.getElementById('recordResultSimple');
        const iconEl = document.getElementById('simpleEmotionIcon');
        const nameEl = document.getElementById('simpleEmotionName');
        const englishEl = document.getElementById('simpleEmotionEnglish');
        const detailsListEl = document.getElementById('simpleDetailsList');
        
        if (resultDiv && iconEl && nameEl && englishEl && detailsListEl) {
            iconEl.textContent = emotion.icon;
            nameEl.textContent = emotion.name;
            
            // Set English name
            const englishNames = {
                'neutral': 'Neutral',
                'happy': 'Happy',
                'laughing': 'Laughing',
                'sad': 'Sad',
                'depressed': 'Depressed',
                'angry': 'Angry'
            };
            englishEl.textContent = englishNames[randomEmotion];
            
            // Display details
            detailsListEl.innerHTML = emotion.details.map(detail => 
                `<p class="simple-detail-item">${detail}</p>`
            ).join('');
            
            resultDiv.style.display = 'block';
        }
        
        // Update status
        const statusEl = document.getElementById('recordStatusSimple');
        if (statusEl) {
            statusEl.innerHTML = '<p>✓ تم التحليل</p>';
            statusEl.style.color = '#4caf50';
        }
        
    } catch (error) {
        console.error('Error analyzing recording:', error);
        const statusEl = document.getElementById('recordStatusSimple');
        if (statusEl) {
            statusEl.innerHTML = '<p>❌ حدث خطأ في التحليل</p>';
            statusEl.style.color = '#f44336';
        }
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    if (canvasSelf) {
        const container = document.getElementById('waveformContainerSimple');
        if (container && container.offsetWidth > 0) {
            canvasSelf.width = container.offsetWidth;
            canvasSelf.height = container.offsetHeight || 120;
        }
    }
});
