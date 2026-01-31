// 계이름 연주기 - 오디오 모듈

import { state, allNotes } from './state.js';

// AudioContext 인스턴스
export const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// AudioContext 재개 (사용자 상호작용 필요)
export function resumeAudioContext() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// 주파수 계산
export function getFrequency(semitone, octaveOffset = 0) {
    const totalSemitones = semitone + (octaveOffset * 12);
    return 261.63 * Math.pow(2, totalSemitones / 12);  // C4 = 261.63Hz
}

// 음 정보 가져오기
export function getNoteInfo(semitone) {
    const normalizedSemitone = semitone % 12;
    return allNotes.find(note => note.semitone === normalizedSemitone) || allNotes[0];
}

// 옥타브 번호 계산
export function getOctaveNumber(semitone, octaveOffset) {
    return 4 + octaveOffset + Math.floor(semitone / 12);
}

// 음 재생
export function playNote(frequency, options = {}) {
    const {
        isPlayback = false,
        waveform = state.currentWave,
        volume = state.currentVolume
    } = options;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);

    return { isPlayback };
}

// 메트로놈 클릭음 재생
export function playClick(isAccent) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(isAccent ? 1000 : 800, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}
