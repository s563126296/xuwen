// Sound effects utility using Web Audio API

// Incoming call ringtone (dual-tone loop)
export function playIncomingCallSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (frequency: number, duration: number, delay: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + delay + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + duration);

      oscillator.start(audioContext.currentTime + delay);
      oscillator.stop(audioContext.currentTime + delay + duration);
    };

    // Dual-tone: 800Hz + 1000Hz, loop 3 times
    for (let i = 0; i < 3; i++) {
      playTone(800, 0.2, i * 0.8);
      playTone(1000, 0.2, i * 0.8 + 0.3);
    }
  } catch (error) {
    // Silently fail - audio playback is non-critical
  }
}

// Button click sound (short click)
export function playClickSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1200;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch (error) {
    // Silently fail - audio playback is non-critical
  }
}

// Message notification sound (soft ding)
export function playMessageSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    // Silently fail - audio playback is non-critical
  }
}
