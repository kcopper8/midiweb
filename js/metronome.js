// 계이름 연주기 - 메트로놈 모듈

import { state, setNestedState, drumPatterns } from './state.js';
import { playClick, resumeAudioContext, playNextChord, playKick, playSnare, playHiHat } from './audio.js';

// 드럼 패턴 재생
function playDrumStep(step) {
    if (!state.accompaniment.enabled) return;

    const pattern = drumPatterns[state.accompaniment.currentProgression];
    if (!pattern) return;

    const timeSig = state.metronome.timeSignature === 3 ? '3/4' : '4/4';
    const drums = pattern[timeSig];
    if (!drums) return;

    const volume = state.accompaniment.drumVolume;

    if (drums.kick.includes(step)) playKick(volume);
    if (drums.snare.includes(step)) playSnare(volume);
    if (drums.hihat.includes(step)) playHiHat(volume);
}

// 메트로놈 시작
export function startMetronome() {
    if (state.metronome.isRunning) return;

    resumeAudioContext();

    setNestedState('metronome', {
        isRunning: true,
        currentBeat: 0
    });

    // 반주 상태 리셋
    state.accompaniment.currentChordIndex = 0;
    state.accompaniment.currentStep = 0;

    // 16분음표 간격 계산 (1박 / 4)
    const sixteenthMs = 60000 / state.metronome.bpm / 4;
    const stepsPerMeasure = state.metronome.timeSignature * 4;

    // 즉시 첫 스텝 재생
    playClick(true);
    playNextChord();
    playDrumStep(0);
    state.accompaniment.currentStep = 1;
    state.metronome.currentBeat = 0;

    state.metronome.intervalId = setInterval(() => {
        const step = state.accompaniment.currentStep;
        const isNewBeat = step % 4 === 0;
        const beatNumber = Math.floor(step / 4);
        const isAccent = step === 0;

        // 박자 클릭 (4분음표마다)
        if (isNewBeat) {
            playClick(isAccent);
            state.metronome.currentBeat = beatNumber;
        }

        // 마디 첫 박에 코드 재생
        if (step === 0) {
            playNextChord();
        }

        // 드럼 패턴 재생
        playDrumStep(step);

        // 다음 스텝
        state.accompaniment.currentStep = (step + 1) % stepsPerMeasure;
    }, sixteenthMs);

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

    state.accompaniment.currentStep = 0;

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
