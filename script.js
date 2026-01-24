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

// Emotion mapping - Only 6 emotions
const emotionMap = {
    'neutral': { name: 'محايد', icon: '😐', color: '#607d8b' },
    'happy': { name: 'سعيد', icon: '😊', color: '#4caf50' },
    'laughing': { name: 'ضاحك', icon: '😂', color: '#ff9800' },
    'sad': { name: 'حزين', icon: '😢', color: '#2196f3' },
    'depressed': { name: 'مكتئب', icon: '😔', color: '#9e9e9e' },
    'angry': { name: 'غاضب', icon: '😠', color: '#f44336' }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    setupEventListeners();
});

function initializeCanvas() {
    canvas = document.getElementById('waveformCanvas');
    if (canvas) {
        canvasCtx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
}

function setupEventListeners() {
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
    
    // Display only the single emotion result without percentages
    let html = `
        <div class="emotion-result">
            <span class="emotion-icon-large">${emotion.icon}</span>
            <div class="emotion-name-large">${emotion.name}</div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
}

// Handle window resize
window.addEventListener('resize', () => {
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
});
