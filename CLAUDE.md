# 계이름 연주기 프로젝트

Web Audio API를 사용한 브라우저 기반 음악 연주 도구입니다.

## 프로젝트 규칙

- 기능 변경 시 SPEC.md도 함께 업데이트할 것
- 커밋 메시지는 한국어로 작성
- Git 설정은 global이 아닌 local로 저장
- 사용자와의 대화는 한국어로 진행

## 주요 파일

| 파일 | 설명 |
|------|------|
| index.html | HTML 마크업 |
| css/styles.css | 스타일시트 |
| js/*.js | JavaScript 모듈 (state, audio, recording, metronome, ui, main) |
| SPEC.md | 기능 스펙 문서 (스펙 ID 포함) |
| TEST-COVERAGE.md | 스펙-테스트 매핑 매트릭스 |
| CLAUDE.md | Claude 세션 간 컨텍스트 유지용 |

## 스펙-테스트 관리

스펙과 E2E 테스트를 연결하여 관리합니다.

### 스펙 ID 체계

SPEC.md의 각 기능에 고유 ID가 부여되어 있습니다:
- `{#PLAY}`, `{#SCALE}`, `{#WAVE}`, `{#VOLUME}` - 음 재생 관련
- `{#UI}`, `{#INPUT}`, `{#LABEL}` - UI/입력 관련
- `{#REC}` - 녹음/재생
- `{#METRO}` - 메트로놈

### 테스트 작성 규칙

테스트명에 스펙 ID를 접두어로 포함합니다:
```javascript
test('[SPEC-ID] 테스트 설명', async ({ page }) => { ... });
```

### 문서 동기화

기능 변경 시 다음 문서를 함께 업데이트:
1. **SPEC.md** - 기능 명세 수정/추가
2. **테스트 파일** - 테스트 추가/수정 (스펙 ID 포함)
3. **TEST-COVERAGE.md** - 매핑 테이블 업데이트

### 테스트 실행

```bash
npx playwright test                    # 전체 테스트
npx playwright test --grep "METRO"     # 특정 스펙 ID 필터링
```

## 참고

- 기능 명세 및 향후 계획: SPEC.md
- 테스트 커버리지 현황: TEST-COVERAGE.md
