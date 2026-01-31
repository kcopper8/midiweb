// 계이름 연주기 - 녹음/재생 모듈

import { state, setNestedState } from './state.js';
import { playNote, playKick, playSnare, playHiHat } from './audio.js';
import { updateRecordingIndicator, renderRecordingList } from './ui.js';

// 녹음 시작
export function startRecording() {
    state.recordingIdCounter++;
    state.currentRecording = {
        id: state.recordingIdCounter,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
        notes: []
    };
    state.recordingStartTime = performance.now();
    updateRecordingIndicator(true);
}

// 음 녹음
export function recordNote(frequency, options = {}) {
    const {
        waveform = state.currentWave,
        volume = state.currentVolume,
        duration = null,  // null이면 playNote 기본값 사용
        drumType = null,  // 드럼 타입: 'kick', 'snare', 'hihat'
        isAccompaniment = false  // 반주 음은 자동 저장 타이머 트리거 안함
    } = options;

    // 시간 기반 모드: 자동 저장 타이머 리셋 (반주 음 제외)
    if (state.recordingMode === 'time' && !isAccompaniment) {
        clearTimeout(state.autoSaveTimer);
    }

    // 메트로놈이 실행 중이 아니면 녹음하지 않음
    if (!state.metronome.isRunning) {
        return;
    }

    // 녹음 중이 아니면서 반주 음이면 무시 (사용자 연주가 시작해야 반주도 녹음)
    if (!state.currentRecording && isAccompaniment) {
        return;
    }

    // 녹음 중이 아니면 무시 (메트로놈 시작 시 녹음이 시작됨)
    if (!state.currentRecording) {
        return;
    }

    const time = performance.now() - state.recordingStartTime;
    state.currentRecording.notes.push({
        frequency,
        time,
        waveform,
        volume,
        duration,
        drumType
    });

    // 시간 기반 모드: 자동 저장 타이머 설정 (반주 음 제외)
    if (state.recordingMode === 'time' && !isAccompaniment) {
        state.autoSaveTimer = setTimeout(() => {
            saveCurrentRecording();
        }, state.autoSaveDelay);
    }
}

// 현재 녹음 저장
export function saveCurrentRecording() {
    if (!state.currentRecording || state.currentRecording.notes.length === 0) {
        return;
    }

    const lastNote = state.currentRecording.notes[state.currentRecording.notes.length - 1];
    state.currentRecording.duration = (lastNote.time / 1000).toFixed(1);

    state.recordings.unshift(state.currentRecording);
    state.currentRecording = null;
    state.recordingStartTime = 0;

    updateRecordingIndicator(false);
    renderRecordingList();
}

// 새 연주 시작 (수동 모드용)
export function startNewRecording() {
    if (state.currentRecording && state.currentRecording.notes.length > 0) {
        saveCurrentRecording();
    }
    startRecording();
}

// 녹음 삭제
export function deleteRecording(id) {
    if (state.playback.currentRecordingId === id) {
        stopPlayback();
    }
    state.recordings = state.recordings.filter(r => r.id !== id);
    renderRecordingList();
}

// 재생 토글
export function togglePlayback(recordingId) {
    const recording = state.recordings.find(r => r.id === recordingId);
    if (!recording) return;

    if (state.playback.isPlaying && state.playback.currentRecordingId === recordingId) {
        if (state.playback.isPaused) {
            resumePlayback();
        } else {
            pausePlayback();
        }
    } else {
        stopPlayback();
        startPlayback(recording);
    }
}

// 재생 시작
export function startPlayback(recording, startIndex = 0, timeOffset = 0) {
    setNestedState('playback', {
        isPlaying: true,
        isPaused: false,
        currentRecordingId: recording.id,
        timeouts: [],
        playbackStartTime: performance.now(),
        timeOffset: timeOffset
    });

    const notes = recording.notes.slice(startIndex);
    const baseTime = startIndex > 0 ? recording.notes[startIndex].time : 0;

    notes.forEach((note, index) => {
        const delay = note.time - baseTime - timeOffset;
        const timeout = setTimeout(() => {
            // 드럼 타입이면 해당 드럼 재생 (재생 시에는 녹음 안함)
            if (note.drumType) {
                switch (note.drumType) {
                    case 'kick': playKick(note.volume, false); break;
                    case 'snare': playSnare(note.volume, false); break;
                    case 'hihat': playHiHat(note.volume, false); break;
                }
            } else {
                playNote(note.frequency, {
                    isPlayback: true,
                    waveform: note.waveform,
                    volume: note.volume,
                    duration: note.duration
                });
            }
            state.playback.pausedIndex = startIndex + index + 1;
            state.playback.pausedAt = note.time;

            // 마지막 음이면 재생 완료
            if (startIndex + index === recording.notes.length - 1) {
                setTimeout(() => {
                    stopPlayback();
                }, 100);
            }
        }, Math.max(0, delay));

        state.playback.timeouts.push(timeout);
    });

    renderRecordingList();
}

// 일시정지
export function pausePlayback() {
    state.playback.isPaused = true;
    state.playback.timeouts.forEach(t => clearTimeout(t));
    state.playback.timeouts = [];

    const elapsed = performance.now() - state.playback.playbackStartTime + state.playback.timeOffset;
    state.playback.pausedAt = elapsed;

    renderRecordingList();
}

// 재개
export function resumePlayback() {
    const recording = state.recordings.find(r => r.id === state.playback.currentRecordingId);
    if (!recording) return;

    let startIndex = 0;
    for (let i = 0; i < recording.notes.length; i++) {
        if (recording.notes[i].time >= state.playback.pausedAt) {
            startIndex = i;
            break;
        }
    }

    const timeOffset = state.playback.pausedAt - (startIndex > 0 ? recording.notes[startIndex].time : 0);
    startPlayback(recording, startIndex, Math.max(0, timeOffset));
}

// 정지
export function stopPlayback() {
    state.playback.timeouts.forEach(t => clearTimeout(t));
    setNestedState('playback', {
        isPlaying: false,
        isPaused: false,
        currentRecordingId: null,
        timeouts: [],
        pausedAt: 0,
        pausedIndex: 0
    });

    renderRecordingList();
}
