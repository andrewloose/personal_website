
// Persistent Audio Player with Intro/Outro Support
class PersistentAudioPlayer {
    constructor() {
        // Audio elements
        this.audio = new Audio();
        this.introAudio = new Audio();
        this.outroAudio = new Audio();
        
        // State variables
        this.isPlaying = false;
        this.isIntroPlaying = false;
        this.isOutroPlaying = false;
        this.currentTrack = '';
        this.currentTrackName = '';
        
        // Storage keys for localStorage
        this.STORAGE_KEYS = {
            TRACK: 'wotw_current_track',
            TRACK_NAME: 'wotw_current_track_name',
            TIME: 'wotw_current_time',
            IS_PLAYING: 'wotw_is_playing',
            VOLUME: 'wotw_volume'
        };
        
        // Initialize the player
        this.init();
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadIntroOutro();
        this.restoreState();
        this.setupFooterHiding();
    }
    
    setupElements() {
        // Get DOM elements
        this.playBtn = document.getElementById('play-btn');
        this.playIcon = document.querySelector('.play-icon');
        this.pauseIcon = document.querySelector('.pause-icon');
        this.trackSelect = document.getElementById('track-select');
        this.currentTrackEl = document.getElementById('current-track');
        this.progressBar = document.querySelector('.progress');
        this.progressContainer = document.querySelector('.progress-bar');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.statusIndicator = document.getElementById('status-indicator');
        this.player = document.getElementById('persistent-player');
        this.footer = document.querySelector('footer');
    }
    
    setupEventListeners() {
        // Play/Pause button
        this.playBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Track selection
        this.trackSelect.addEventListener('change', () => this.onTrackChange());
        
        // Progress bar clicks
        this.progressContainer.addEventListener('click', (e) => this.onProgressClick(e));
        
        // Main audio events
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('ended', () => this.onMainAudioEnded());
        this.audio.addEventListener('play', () => this.onAudioPlay());
        this.audio.addEventListener('pause', () => this.onAudioPause());
        this.audio.addEventListener('error', (e) => this.onAudioError(e));
        
        // Intro audio events
        this.introAudio.addEventListener('ended', () => this.onIntroEnded());
        this.introAudio.addEventListener('error', () => this.onIntroError());
        
        // Outro audio events
        this.outroAudio.addEventListener('ended', () => this.onOutroEnded());
        this.outroAudio.addEventListener('error', () => this.onOutroError());
        
        // Save state periodically
        setInterval(() => this.saveState(), 1000);
    }
    
    loadIntroOutro() {
        // Try to load intro - replace with your actual intro file path
        this.introAudio.src = 'audio/intro.mp3';
        this.introAudio.preload = 'auto';
        
        // Try to load outro - replace with your actual outro file path
        this.outroAudio.src = 'audio/outro.mp3';
        this.outroAudio.preload = 'auto';
        
        // Check if files exist
        this.introAudio.addEventListener('canplaythrough', () => {
            console.log('Intro audio loaded successfully');
        }, { once: true });
        
        this.outroAudio.addEventListener('canplaythrough', () => {
            console.log('Outro audio loaded successfully');
        }, { once: true });
    }
    
    restoreState() {
        const savedTrack = localStorage.getItem(this.STORAGE_KEYS.TRACK);
        const savedTrackName = localStorage.getItem(this.STORAGE_KEYS.TRACK_NAME);
        const savedTime = parseFloat(localStorage.getItem(this.STORAGE_KEYS.TIME) || '0');
        const savedIsPlaying = localStorage.getItem(this.STORAGE_KEYS.IS_PLAYING) === 'true';
        
        if (savedTrack) {
            this.currentTrack = savedTrack;
            this.currentTrackName = savedTrackName || 'Unknown Track';
            
            // Update UI
            this.trackSelect.value = savedTrack;
            this.currentTrackEl.textContent = this.currentTrackName;
            
            // Load audio
            this.audio.src = savedTrack;
            this.audio.currentTime = savedTime;
            
            // Only auto-resume if it was playing and this isn't a fresh page load
            if (savedIsPlaying && !this.isPageRefresh()) {
                this.resumePlayback();
            }
            
            this.updateStatus('Track loaded');
        }
    }
    
    isPageRefresh() {
        // Check if this is a page refresh vs navigation
        return !sessionStorage.getItem('wotw_session_active');
    }
    
    saveState() {
        if (this.currentTrack) {
            localStorage.setItem(this.STORAGE_KEYS.TRACK, this.currentTrack);
            localStorage.setItem(this.STORAGE_KEYS.TRACK_NAME, this.currentTrackName);
            localStorage.setItem(this.STORAGE_KEYS.TIME, this.audio.currentTime.toString());
            localStorage.setItem(this.STORAGE_KEYS.IS_PLAYING, this.isPlaying.toString());
        }
        
        // Mark session as active
        sessionStorage.setItem('wotw_session_active', 'true');
    }
    
    togglePlayPause() {
        if (!this.trackSelect.value && !this.currentTrack) {
            alert('Please select a track first');
            return;
        }
        
        if (this.isPlaying) {
            this.pausePlayback();
        } else {
            this.startPlayback();
        }
    }
    
    startPlayback() {
        // If no track is selected or a new track is selected
        if (!this.currentTrack || this.currentTrack !== this.trackSelect.value) {
            this.loadNewTrack();
        } else {
            // Resume existing track
            this.resumePlayback();
        }
    }
    
    pausePlayback() {
        this.audio.pause();
        this.introAudio.pause();
        this.outroAudio.pause();
        this.isPlaying = false;
        this.isIntroPlaying = false;
        this.isOutroPlaying = false;
        this.updatePlayPauseUI();
        this.updateStatus('Paused');
    }
    
    loadNewTrack() {
        const selectedOption = this.trackSelect.options[this.trackSelect.selectedIndex];
        if (!selectedOption || !selectedOption.value) return;
        
        this.currentTrack = selectedOption.value;
        this.currentTrackName = selectedOption.text;
        this.currentTrackEl.textContent = this.currentTrackName;
        
        // Stop any current playback
        this.pausePlayback();
        
        // Reset audio time
        this.audio.currentTime = 0;
        
        // Play with intro if available
        this.playWithIntro();
    }
    
    resumePlayback() {
        if (this.currentTrack && this.audio.src) {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayPauseUI();
                    this.updateStatus('Playing');
                })
                .catch(e => {
                    console.error('Resume playback failed:', e);
                    this.updateStatus('Playback failed');
                });
        }
    }
    
    playWithIntro() {
        // Check if intro is available
        if (this.introAudio.src && !this.introAudio.error) {
            this.updateStatus('Playing intro...');
            this.introAudio.currentTime = 0;
            this.isIntroPlaying = true;
            
            this.introAudio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayPauseUI();
                })
                .catch(e => {
                    console.warn('Intro playback failed, playing main audio:', e);
                    this.playMainAudio();
                });
        } else {
            // No intro, play main audio directly
            this.playMainAudio();
        }
    }
    
    playMainAudio() {
        this.audio.src = this.currentTrack;
        
        // Set start time from data attribute
        const selectedOption = this.trackSelect.options[this.trackSelect.selectedIndex];
        const startTime = selectedOption ? parseFloat(selectedOption.dataset.startTime || '0') : 0;
        
        this.audio.addEventListener('canplaythrough', () => {
            this.audio.currentTime = startTime;
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.isIntroPlaying = false;
                    this.updatePlayPauseUI();
                    this.updateStatus('Playing');
                })
                .catch(e => {
                    console.error('Main audio playback failed:', e);
                    this.updateStatus('Playback failed');
                });
        }, { once: true });
    }
    
    playOutro() {
        if (this.outroAudio.src && !this.outroAudio.error) {
            this.updateStatus('Playing outro...');
            this.outroAudio.currentTime = 0;
            this.isOutroPlaying = true;
            
            this.outroAudio.play()
                .catch(e => {
                    console.warn('Outro playback failed:', e);
                    this.onOutroEnded();
                });
        } else {
            // No outro, just end
            this.onOutroEnded();
        }
    }
    
    onTrackChange() {
        if (this.trackSelect.value) {
            this.loadNewTrack();
        } else {
            this.pausePlayback();
            this.currentTrackEl.textContent = 'No track selected';
            this.updateStatus('Ready');
        }
    }
    
    onProgressClick(e) {
        if (this.audio.duration) {
            const clickPercent = e.offsetX / this.progressContainer.clientWidth;
            this.audio.currentTime = clickPercent * this.audio.duration;
        }
    }
    
    onTimeUpdate() {
        if (this.audio.duration) {
            const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.style.width = `${progressPercent}%`;
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    onMetadataLoaded() {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
    }
    
    onMainAudioEnded() {
        this.isPlaying = false;
        this.updatePlayPauseUI();
        this.playOutro();
    }
    
    onAudioPlay() {
        this.isPlaying = true;
        this.updatePlayPauseUI();
    }
    
    onAudioPause() {
        if (!this.isIntroPlaying && !this.isOutroPlaying) {
            this.isPlaying = false;
            this.updatePlayPauseUI();
        }
    }
    
    onAudioError(e) {
        console.error('Audio error:', e);
        this.updateStatus('Audio error');
        this.isPlaying = false;
        this.updatePlayPauseUI();
    }
    
    onIntroEnded() {
        this.isIntroPlaying = false;
        this.updateStatus('Intro finished, playing main audio...');
        this.playMainAudio();
    }
    
    onIntroError() {
        console.warn('Intro audio error, playing main audio directly');
        this.playMainAudio();
    }
    
    onOutroEnded() {
        this.isOutroPlaying = false;
        this.isPlaying = false;
        this.updatePlayPauseUI();
        this.updateStatus('Finished');
    }
    
    onOutroError() {
        console.warn('Outro audio error');
        this.onOutroEnded();
    }
    
    updatePlayPauseUI() {
        if (this.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'inline';
        } else {
            this.playIcon.style.display = 'inline';
            this.pauseIcon.style.display = 'none';
        }
    }
    
    updateStatus(message) {
        this.statusIndicator.textContent = message;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    setupFooterHiding() {
        window.addEventListener('scroll', () => {
            if (this.footer) {
                const footerRect = this.footer.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const playerHeight = this.player.offsetHeight;
                
                if (footerRect.top < windowHeight - playerHeight/2) {
                    this.player.classList.add('hide-player');
                } else {
                    this.player.classList.remove('hide-player');
                }
            }
        });
    }
}

// Initialize the player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PersistentAudioPlayer();
});