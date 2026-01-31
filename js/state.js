// 계이름 연주기 - 중앙 상태 관리

// 음 정의 (반음 단위)
export const allNotes = [
    { name: '도', label: 'C', semitone: 0 },
    { name: '도#', label: 'C#', semitone: 1 },
    { name: '레', label: 'D', semitone: 2 },
    { name: '레#', label: 'D#', semitone: 3 },
    { name: '미', label: 'E', semitone: 4 },
    { name: '파', label: 'F', semitone: 5 },
    { name: '파#', label: 'F#', semitone: 6 },
    { name: '솔', label: 'G', semitone: 7 },
    { name: '솔#', label: 'G#', semitone: 8 },
    { name: '라', label: 'A', semitone: 9 },
    { name: '라#', label: 'A#', semitone: 10 },
    { name: '시', label: 'B', semitone: 11 },
    { name: '도', label: 'C', semitone: 12 }
];

// 스케일 정의 (반음 간격)
export const scales = {
    major: {
        name: 'Major (장조)',
        semitones: [0, 2, 4, 5, 7, 9, 11, 12]
    },
    minor: {
        name: 'Minor (단조)',
        semitones: [0, 2, 3, 5, 7, 8, 10, 12]
    },
    pentatonic: {
        name: 'Pentatonic (5음계)',
        semitones: [0, 2, 4, 7, 9, 12]
    },
    blues: {
        name: 'Blues',
        semitones: [0, 3, 5, 6, 7, 10, 12]
    },
    chromatic: {
        name: 'Chromatic (반음계)',
        semitones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    dorian: {
        name: 'Dorian',
        semitones: [0, 2, 3, 5, 7, 9, 10, 12]
    }
};

// 키보드 매핑 (3행: 상단, 중단, 하단)
export const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\\'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"]
];

// 코드 타입 (루트 기준 반음 간격)
export const chordTypes = {
    major: [0, 4, 7],      // 장3화음
    minor: [0, 3, 7],      // 단3화음
};

// 스케일 디그리 -> 반음 오프셋 + 코드 타입
export const scaleDegrees = {
    'I':   { semitone: 0, type: 'major' },
    'ii':  { semitone: 2, type: 'minor' },
    'iii': { semitone: 4, type: 'minor' },
    'IV':  { semitone: 5, type: 'major' },
    'V':   { semitone: 7, type: 'major' },
    'vi':  { semitone: 9, type: 'minor' },
    'VII': { semitone: 11, type: 'major' },
    // 단조용
    'i':   { semitone: 0, type: 'minor' },
    'III': { semitone: 3, type: 'major' },
    'VI':  { semitone: 8, type: 'major' },
};

// 코드 진행 프리셋
export const chordProgressions = {
    pop:     { name: 'Pop', chords: ['I', 'V', 'vi', 'IV'] },
    classic: { name: 'Classic', chords: ['I', 'IV', 'V', 'I'] },
    sad:     { name: 'Sad', chords: ['i', 'VI', 'III', 'VII'] },
    jazz:    { name: 'Jazz', chords: ['ii', 'V', 'I', 'I'] },
    fifties: { name: '50s', chords: ['I', 'vi', 'IV', 'V'] },
    blues:   { name: 'Blues (12bar)', chords: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'] },
};

// 드럼 패턴 프리셋 (16분음표 기준, 0-15 = 1마디)
// 4/4 박자: 16스텝, 3/4 박자: 12스텝
export const drumPatterns = {
    pop: {
        name: 'Pop',
        '4/4': { kick: [0, 8], snare: [4, 12], hihat: [2, 4, 6, 8, 10, 12, 14] },
        '3/4': { kick: [0], snare: [4, 8], hihat: [2, 4, 6, 8, 10] }
    },
    classic: {
        name: 'Classic',
        '4/4': { kick: [0], snare: [8], hihat: [0, 4, 8, 12] },
        '3/4': { kick: [0], snare: [4], hihat: [0, 4, 8] }
    },
    sad: {
        name: 'Sad',
        '4/4': { kick: [0, 10], snare: [4, 12], hihat: [0, 2, 4, 6, 8, 10, 12, 14] },
        '3/4': { kick: [0], snare: [4], hihat: [0, 2, 4, 6, 8, 10] }
    },
    jazz: {
        name: 'Jazz',
        '4/4': { kick: [0, 6], snare: [4, 12], hihat: [0, 3, 6, 8, 11, 14] },  // 스윙 느낌
        '3/4': { kick: [0], snare: [4], hihat: [0, 3, 6, 9] }
    },
    fifties: {
        name: '50s',
        '4/4': { kick: [0, 4, 8, 12], snare: [4, 12], hihat: [2, 4, 6, 8, 10, 12, 14] },
        '3/4': { kick: [0, 4, 8], snare: [4, 8], hihat: [2, 4, 6, 8, 10] }
    },
    blues: {
        name: 'Blues',
        '4/4': { kick: [0, 9], snare: [4, 12], hihat: [0, 3, 6, 8, 11, 14] },  // 셔플
        '3/4': { kick: [0], snare: [4], hihat: [0, 3, 6, 9] }
    }
};

// 앱 상태
export const state = {
    // 연주 설정
    currentScale: 'major',
    currentWave: 'sine',
    currentVolume: 0.5,
    currentOctaves: 1,

    // 녹음 관련
    recordings: [],
    currentRecording: null,
    recordingStartTime: 0,
    recordingIdCounter: 0,

    // 재생 관련
    playback: {
        isPlaying: false,
        isPaused: false,
        currentRecordingId: null,
        timeouts: [],
        pausedAt: 0,
        pausedIndex: 0,
        playbackStartTime: 0,
        timeOffset: 0
    },

    // 메트로놈 관련
    metronome: {
        isRunning: false,
        bpm: 100,
        timeSignature: 4,
        currentBeat: 0,
        intervalId: null
    },

    // 반주 관련
    accompaniment: {
        enabled: false,
        currentProgression: 'pop',
        currentChordIndex: 0,
        drumVolume: 0.3,
        currentStep: 0
    },

    // 키보드 상태
    pressedKeys: new Set()
};

// 상태 변경 함수
export function setState(updates) {
    Object.assign(state, updates);
}

// 중첩 상태 변경 함수
export function setNestedState(key, updates) {
    Object.assign(state[key], updates);
}
