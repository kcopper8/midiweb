// 계이름 연주기 - 메인 진입점

import { state } from './state.js';
import { renderNotes, playNoteByKey, releaseKey } from './ui.js';
import { toggleMetronome, setBpm, setTimeSignature, updateBpmDisplay } from './metronome.js';

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', init);

function init() {
    // 초기 렌더링
    renderNotes();

    // 이벤트 바인딩
    bindScaleEvents();
    bindOctaveEvents();
    bindWaveEvents();
    bindVolumeEvents();
    bindKeyboardEvents();
    bindMetronomeEvents();
    bindAccompanimentEvents();
}

// 스케일 선택 이벤트
function bindScaleEvents() {
    document.querySelectorAll('.control-button[data-scale]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.control-button[data-scale].active').classList.remove('active');
            button.classList.add('active');
            state.currentScale = button.dataset.scale;
            renderNotes();
        });
    });
}

// 옥타브 선택 이벤트
function bindOctaveEvents() {
    document.querySelectorAll('.control-button[data-octave]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.control-button[data-octave].active').classList.remove('active');
            button.classList.add('active');
            state.currentOctaves = parseInt(button.dataset.octave);
            renderNotes();
        });
    });
}

// 파형 선택 이벤트
function bindWaveEvents() {
    document.querySelectorAll('.control-button[data-wave]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.control-button[data-wave].active').classList.remove('active');
            button.classList.add('active');
            state.currentWave = button.dataset.wave;
        });
    });
}

// 볼륨 슬라이더 이벤트
function bindVolumeEvents() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');

    if (volumeSlider && volumeValue) {
        volumeSlider.addEventListener('input', () => {
            state.currentVolume = volumeSlider.value / 100;
            volumeValue.textContent = `${volumeSlider.value}%`;
        });
    }
}

// 키보드 이벤트
function bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        playNoteByKey(e.key.toLowerCase());
    });

    document.addEventListener('keyup', (e) => {
        releaseKey(e.key.toLowerCase());
    });
}

// 메트로놈 이벤트
function bindMetronomeEvents() {
    const metronomeToggle = document.getElementById('metronomeToggle');
    const bpmSlider = document.getElementById('bpmSlider');

    if (metronomeToggle) {
        metronomeToggle.addEventListener('click', toggleMetronome);
    }

    // 박자 선택
    document.querySelectorAll('.control-button[data-time-sig]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.control-button[data-time-sig].active').classList.remove('active');
            button.classList.add('active');
            setTimeSignature(parseInt(button.dataset.timeSig));
        });
    });

    // BPM 프리셋
    document.querySelectorAll('.bpm-preset').forEach(button => {
        button.addEventListener('click', () => {
            setBpm(parseInt(button.dataset.bpm));
        });
    });

    // BPM 슬라이더
    if (bpmSlider) {
        bpmSlider.addEventListener('input', () => {
            setBpm(parseInt(bpmSlider.value));
        });
    }

    // 초기 BPM 표시 업데이트
    updateBpmDisplay();
}

// 반주 이벤트
function bindAccompanimentEvents() {
    const accompanimentToggle = document.getElementById('accompanimentToggle');
    const progressionSelect = document.getElementById('progressionSelect');
    const drumVolumeSlider = document.getElementById('drumVolumeSlider');

    if (accompanimentToggle) {
        accompanimentToggle.addEventListener('click', () => {
            state.accompaniment.enabled = !state.accompaniment.enabled;
            accompanimentToggle.classList.toggle('active', state.accompaniment.enabled);
        });
    }

    if (progressionSelect) {
        progressionSelect.addEventListener('change', () => {
            state.accompaniment.currentProgression = progressionSelect.value;
            state.accompaniment.currentChordIndex = 0;
        });
    }

    if (drumVolumeSlider) {
        drumVolumeSlider.addEventListener('input', () => {
            state.accompaniment.drumVolume = parseInt(drumVolumeSlider.value) / 100;
        });
    }
}
