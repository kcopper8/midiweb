// 계이름 연주기 - 오디오 모듈

import { state, allNotes, chordTypes, scaleDegrees, chordProgressions } from './state.js';
import { recordNote } from './recording.js';

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
        volume = state.currentVolume,
        duration = null  // null이면 기본 0.8초
    } = options;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    if (duration && duration > 0.2) {
        // 긴 음 (반주 등): 부드러운 어택과 릴리즈
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.02);
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + duration - 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } else {
        // 짧은 음 (건반 연주): 기존 방식
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
    }

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

// 킥 드럼 재생
export function playKick(volume = 0.3, record = true) {
    if (volume <= 0) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    // 150Hz에서 시작하여 빠르게 감쇠
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    // 클릭음 추가 (어택감)
    const clickOsc = audioContext.createOscillator();
    const clickGain = audioContext.createGain();
    clickOsc.connect(clickGain);
    clickGain.connect(audioContext.destination);
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(300, audioContext.currentTime);
    clickGain.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.02);
    clickOsc.start(audioContext.currentTime);
    clickOsc.stop(audioContext.currentTime + 0.02);

    // 드럼 녹음
    if (record) {
        recordNote(0, { drumType: 'kick', volume, isAccompaniment: true });
    }
}

// 스네어 드럼 재생
export function playSnare(volume = 0.3, record = true) {
    if (volume <= 0) return;

    // 톤 성분 (삼각파)
    const toneOsc = audioContext.createOscillator();
    const toneGain = audioContext.createGain();
    toneOsc.connect(toneGain);
    toneGain.connect(audioContext.destination);
    toneOsc.type = 'triangle';
    toneOsc.frequency.setValueAtTime(200, audioContext.currentTime);
    toneGain.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
    toneGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    toneOsc.start(audioContext.currentTime);
    toneOsc.stop(audioContext.currentTime + 0.1);

    // 노이즈 성분 (화이트 노이즈)
    const bufferSize = audioContext.sampleRate * 0.1;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const noiseFilter = audioContext.createBiquadFilter();

    noise.buffer = buffer;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, audioContext.currentTime);

    noiseGain.gain.setValueAtTime(volume * 0.7, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.15);

    // 드럼 녹음
    if (record) {
        recordNote(0, { drumType: 'snare', volume, isAccompaniment: true });
    }
}

// 하이햇 재생
export function playHiHat(volume = 0.3, record = true) {
    if (volume <= 0) return;

    // 노이즈 기반 하이햇
    const bufferSize = audioContext.sampleRate * 0.05;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const bandpass = audioContext.createBiquadFilter();
    const highpass = audioContext.createBiquadFilter();

    noise.buffer = buffer;
    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    // 밴드패스로 금속성 질감
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(8000, audioContext.currentTime);
    bandpass.Q.setValueAtTime(1, audioContext.currentTime);

    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(5000, audioContext.currentTime);

    noiseGain.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + 0.05);

    // 드럼 녹음
    if (record) {
        recordNote(0, { drumType: 'hihat', volume, isAccompaniment: true });
    }
}

// 코드 재생 (화음)
export function playChord(degree, duration = 1) {
    const degreeInfo = scaleDegrees[degree];
    if (!degreeInfo) return;

    const chordIntervals = chordTypes[degreeInfo.type];
    const rootSemitone = degreeInfo.semitone;
    const chordWaveform = 'sine';
    const chordVolume = 0.15;

    // 코드 구성음 재생 (3개 음 동시)
    chordIntervals.forEach(interval => {
        const semitone = rootSemitone + interval;
        // C4 기준 (연주와 같은 옥타브)
        const frequency = 261.63 * Math.pow(2, semitone / 12);

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = chordWaveform;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // 부드러운 어택과 릴리즈
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(chordVolume, audioContext.currentTime + 0.02);
        gainNode.gain.setValueAtTime(chordVolume, audioContext.currentTime + duration - 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

        // 반주 음 녹음 (녹음 중일 때만)
        recordNote(frequency, {
            waveform: chordWaveform,
            volume: chordVolume,
            duration: duration,
            isAccompaniment: true
        });
    });
}

// 현재 프리셋에서 다음 코드 가져오기 및 재생
export function playNextChord() {
    if (!state.accompaniment.enabled) return;

    const progression = chordProgressions[state.accompaniment.currentProgression];
    if (!progression) return;

    const chords = progression.chords;
    const currentChord = chords[state.accompaniment.currentChordIndex];

    // 마디 길이 계산 (박자 * 60/BPM)
    const duration = (state.metronome.timeSignature * 60) / state.metronome.bpm;

    playChord(currentChord, duration);

    // 다음 코드로 이동
    state.accompaniment.currentChordIndex =
        (state.accompaniment.currentChordIndex + 1) % chords.length;
}
