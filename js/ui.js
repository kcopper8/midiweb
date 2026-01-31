// 계이름 연주기 - UI 모듈

import { state, scales, keyboardRows } from './state.js';
import { getFrequency, getNoteInfo, getOctaveNumber, playNote, resumeAudioContext } from './audio.js';
import { recordNote, togglePlayback, stopPlayback, deleteRecording } from './recording.js';

// 녹음 인디케이터 업데이트
export function updateRecordingIndicator(isRecording) {
    const indicator = document.getElementById('recordingIndicator');
    const title = document.getElementById('recordingTitle');

    if (!indicator || !title) return;

    if (isRecording) {
        indicator.classList.add('active');
        title.textContent = '녹음 중';
    } else {
        indicator.classList.remove('active');
        title.textContent = '녹음 대기';
    }
}

// 녹음 목록 렌더링
export function renderRecordingList() {
    const list = document.getElementById('recordingList');
    if (!list) return;

    list.innerHTML = '';

    state.recordings.forEach(recording => {
        const item = document.createElement('div');
        item.className = 'recording-item';
        item.dataset.id = recording.id;

        if (state.playback.currentRecordingId === recording.id) {
            item.classList.add('playing');
        }

        const isThisPlaying = state.playback.isPlaying &&
            state.playback.currentRecordingId === recording.id;
        const playBtnIcon = isThisPlaying && !state.playback.isPaused ? '⏸' : '▶';
        const playBtnClass = isThisPlaying ? 'recording-btn playing' : 'recording-btn';

        item.innerHTML = `
            <span class="recording-info">
                ${recording.timestamp}
                <span class="recording-duration">(${recording.duration}초)</span>
            </span>
            <div class="recording-controls">
                <button class="${playBtnClass}" data-action="play" title="재생">
                    ${playBtnIcon}
                </button>
                <button class="recording-btn" data-action="stop" title="정지">■</button>
                <button class="recording-btn delete" data-action="delete" title="삭제">🗑</button>
            </div>
        `;

        // 버튼 이벤트
        item.querySelector('[data-action="play"]').addEventListener('click', () => {
            togglePlayback(recording.id);
        });
        item.querySelector('[data-action="stop"]').addEventListener('click', () => {
            stopPlayback();
        });
        item.querySelector('[data-action="delete"]').addEventListener('click', () => {
            deleteRecording(recording.id);
        });

        list.appendChild(item);
    });
}

// 건반 렌더링
export function renderNotes() {
    const container = document.getElementById('noteContainer');
    if (!container) return;

    const scale = scales[state.currentScale];

    container.innerHTML = '';

    for (let octaveIdx = 0; octaveIdx < state.currentOctaves; octaveIdx++) {
        const octaveRow = document.createElement('div');
        octaveRow.className = 'octave-row';

        // 마지막 옥타브면 마지막 음 포함, 아니면 제외
        const isLastOctave = octaveIdx === state.currentOctaves - 1;
        const notesToRender = isLastOctave ? scale.semitones : scale.semitones.slice(0, -1);

        octaveRow.style.gridTemplateColumns = `repeat(${notesToRender.length}, 1fr)`;

        // 키보드 행 선택 (아래에서 위로)
        const keyRowIndex = state.currentOctaves - 1 - octaveIdx;
        const keyRow = keyboardRows[keyRowIndex] || [];

        notesToRender.forEach((semitone, noteIdx) => {
            const noteInfo = getNoteInfo(semitone);
            const frequency = getFrequency(semitone, octaveIdx);
            const octaveNum = getOctaveNumber(semitone, octaveIdx);
            const keyHint = keyRow[noteIdx] ? keyRow[noteIdx].toUpperCase() : '';

            const button = document.createElement('button');
            button.className = 'note-button';
            button.dataset.octave = octaveIdx;
            button.dataset.noteIndex = noteIdx;
            button.innerHTML = `
                <span class="note-name">${noteInfo.name}</span>
                <span class="note-label">${noteInfo.label}${octaveNum}</span>
                ${keyHint ? `<span class="note-key">${keyHint}</span>` : ''}
            `;

            // 음 재생 및 녹음 핸들러
            const handleNotePlay = () => {
                resumeAudioContext();
                const result = playNote(frequency);
                if (!result.isPlayback) {
                    recordNote(frequency);
                }
                button.classList.add('active');
            };

            // 마우스 이벤트
            button.addEventListener('mousedown', handleNotePlay);
            button.addEventListener('mouseup', () => button.classList.remove('active'));
            button.addEventListener('mouseleave', () => button.classList.remove('active'));

            // 터치 이벤트
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleNotePlay();
            });
            button.addEventListener('touchend', () => button.classList.remove('active'));

            octaveRow.appendChild(button);
        });

        container.appendChild(octaveRow);
    }
}

// 키보드로 음 재생
export function playNoteByKey(key) {
    for (let rowIdx = 0; rowIdx < keyboardRows.length; rowIdx++) {
        const noteIdx = keyboardRows[rowIdx].indexOf(key);
        if (noteIdx !== -1 && !state.pressedKeys.has(key)) {
            state.pressedKeys.add(key);

            const octaveIdx = state.currentOctaves - 1 - rowIdx;
            if (octaveIdx >= 0 && octaveIdx < state.currentOctaves) {
                const button = document.querySelector(
                    `.note-button[data-octave="${octaveIdx}"][data-note-index="${noteIdx}"]`
                );
                if (button) {
                    resumeAudioContext();
                    const scale = scales[state.currentScale];
                    const isLastOctave = octaveIdx === state.currentOctaves - 1;
                    const notesToRender = isLastOctave ? scale.semitones : scale.semitones.slice(0, -1);
                    if (noteIdx < notesToRender.length) {
                        const frequency = getFrequency(notesToRender[noteIdx], octaveIdx);
                        const result = playNote(frequency);
                        if (!result.isPlayback) {
                            recordNote(frequency);
                        }
                        button.classList.add('active');
                    }
                }
            }
            break;
        }
    }
}

// 키보드 키 해제
export function releaseKey(key) {
    for (let rowIdx = 0; rowIdx < keyboardRows.length; rowIdx++) {
        const noteIdx = keyboardRows[rowIdx].indexOf(key);
        if (noteIdx !== -1) {
            state.pressedKeys.delete(key);
            const octaveIdx = state.currentOctaves - 1 - rowIdx;
            if (octaveIdx >= 0) {
                const button = document.querySelector(
                    `.note-button[data-octave="${octaveIdx}"][data-note-index="${noteIdx}"]`
                );
                if (button) {
                    button.classList.remove('active');
                }
            }
            break;
        }
    }
}
