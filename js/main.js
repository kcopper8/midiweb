// 계이름 연주기 - 메인 진입점

import { state } from './state.js';
import { renderNotes, renderRecordingList, playNoteByKey, releaseKey } from './ui.js';
import { saveCurrentRecording, startNewRecording } from './recording.js';
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
    bindRecordingSettingsEvents();
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

// 녹음 설정 이벤트
function bindRecordingSettingsEvents() {
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const recordingModeSelect = document.getElementById('recordingModeSelect');
    const autoSaveDelayInput = document.getElementById('autoSaveDelayInput');
    const delaySettingRow = document.getElementById('delaySettingRow');
    const newRecordingBtn = document.getElementById('newRecordingBtn');

    if (settingsToggle && settingsPanel) {
        settingsToggle.addEventListener('click', () => {
            settingsPanel.classList.toggle('open');
        });
    }

    if (recordingModeSelect) {
        recordingModeSelect.addEventListener('change', () => {
            state.recordingMode = recordingModeSelect.value;

            // 시간 기반 모드에서만 대기 시간 설정 표시
            if (delaySettingRow) {
                delaySettingRow.style.display = state.recordingMode === 'time' ? 'flex' : 'none';
            }

            // 수동 모드에서만 "새 연주" 버튼 표시
            if (newRecordingBtn) {
                newRecordingBtn.classList.toggle('visible', state.recordingMode === 'manual');
            }

            // 현재 녹음 중인 것이 있으면 저장
            if (state.currentRecording && state.currentRecording.notes.length > 0) {
                saveCurrentRecording();
            }
        });
    }

    if (autoSaveDelayInput) {
        autoSaveDelayInput.addEventListener('change', () => {
            const value = parseInt(autoSaveDelayInput.value);
            if (value >= 1 && value <= 30) {
                state.autoSaveDelay = value * 1000;
            }
        });
    }

    if (newRecordingBtn) {
        newRecordingBtn.addEventListener('click', () => {
            startNewRecording();
        });
    }
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
}
