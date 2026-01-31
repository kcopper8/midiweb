// 계이름 연주기 - 메트로놈 모듈

import { state, setNestedState } from './state.js';
import { playClick, resumeAudioContext } from './audio.js';

// 메트로놈 시작
export function startMetronome() {
    if (state.metronome.isRunning) return;

    resumeAudioContext();

    setNestedState('metronome', {
        isRunning: true,
        currentBeat: 0
    });

    const intervalMs = 60000 / state.metronome.bpm;

    // 즉시 첫 박 재생
    playClick(true);
    state.metronome.currentBeat = 1;

    state.metronome.intervalId = setInterval(() => {
        const isAccent = state.metronome.currentBeat === 0;
        playClick(isAccent);

        state.metronome.currentBeat =
            (state.metronome.currentBeat + 1) % state.metronome.timeSignature;
    }, intervalMs);

    updateMetronomeButton();
}

// 메트로놈 정지
export function stopMetronome() {
    if (!state.metronome.isRunning) return;

    if (state.metronome.intervalId) {
        clearInterval(state.metronome.intervalId);
    }

    setNestedState('metronome', {
        isRunning: false,
        intervalId: null,
        currentBeat: 0
    });

    updateMetronomeButton();
}

// 메트로놈 토글
export function toggleMetronome() {
    if (state.metronome.isRunning) {
        stopMetronome();
    } else {
        startMetronome();
    }
}

// BPM 변경
export function setBpm(bpm) {
    const newBpm = Math.max(40, Math.min(200, bpm));
    state.metronome.bpm = newBpm;

    // 실행 중이면 재시작
    if (state.metronome.isRunning) {
        stopMetronome();
        startMetronome();
    }

    updateBpmDisplay();
}

// 박자 변경
export function setTimeSignature(beats) {
    state.metronome.timeSignature = beats;
    state.metronome.currentBeat = 0;

    // 실행 중이면 재시작
    if (state.metronome.isRunning) {
        stopMetronome();
        startMetronome();
    }
}

// 메트로놈 버튼 업데이트
export function updateMetronomeButton() {
    const btn = document.getElementById('metronomeToggle');
    if (!btn) return;

    if (state.metronome.isRunning) {
        btn.textContent = '⏹';
        btn.classList.add('active');
    } else {
        btn.textContent = '▶';
        btn.classList.remove('active');
    }
}

// BPM 표시 업데이트
export function updateBpmDisplay() {
    const slider = document.getElementById('bpmSlider');
    const value = document.getElementById('bpmValue');

    if (slider) slider.value = state.metronome.bpm;
    if (value) value.textContent = `${state.metronome.bpm} BPM`;

    // 프리셋 버튼 활성화 상태 업데이트
    document.querySelectorAll('.bpm-preset').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.bpm) === state.metronome.bpm);
    });
}
