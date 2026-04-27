# Physical AI Study Lab

ROS 2 Humble + Ubuntu 22.04 기준의 Physical AI 학습 PDF를 바탕으로 만든 개인 학습 SPA입니다.

## 구성

- PDF의 13개 큰 섹션을 커리큘럼 모듈로 구성
- 이론, C++/Python 실습, 시험/퀴즈, 브라우저 시각화 탭 제공
- 로봇팔 FK/IK, differential drive odometry, A*, Pure Pursuit, Kalman Filter, confusion matrix, latency, parameter sweep 시각화
- 진행도, 퀴즈 최고점, 체크리스트를 브라우저 `localStorage`에 저장

## PDF 대비 구현 범위

- 공통 선수지식, 로봇팔, 자율주행, AI, 프롬프트/컨텍스트/하네스, JetRover/시뮬레이터 분리, 추천 스택, 주간 루틴, 최소 체크리스트, 실무형 10축 판정 기준을 학습 카드로 반영
- ROS 2/C++/Python 코드는 사이트 안에서 컴파일하지 않고, 예제 코드와 파라미터 표, 확장 과제로 제공
- 핵심 알고리즘 동작은 TypeScript 기반 브라우저 시각화로 확인

## 1차 보완 완료 항목

- 공식 링크 모음을 클릭 가능한 자료 카드로 제공
- 모든 C++/Python 실습에 입력 파라미터 표 표시
- 로봇팔 시각화에 workspace 샘플링, Jacobian determinant, singularity 경고, 말단 속도 방향 표시 추가
- 프롬프트/컨텍스트/하네스 섹션에 retrieval/eval flow 시각화 추가

## v2 전문 학습 확장

- 모든 섹션을 상세 이론 단원으로 승격: 전문 요약, 핵심 공식, 유도 과정, 계산 예제, 흔한 실수, 공식 출처 포함
- 시험 문제를 객관식 중심에서 수치 자동채점, 공식 빈칸, 유도 단계, 코드 추적 문제로 확장
- C++/Python 실습을 CodeMirror 에디터 기반 타이핑 실습으로 변경하고 localStorage에 코드 저장
- 실제 컴파일 대신 핵심 토큰/구조 검사와 브라우저 시뮬레이션으로 학습 결과 확인
- `npm run validate:content`로 콘텐츠 구조 검증 가능

## v3 이론·수식·시험 보강

- 모든 상세 이론 단원에 직관, 가정, 증명/유도, 공학적 의미, 구현 연결 블록 추가
- 시험 문제를 섹션당 최소 6개 이상으로 확장하고 난이도/힌트/배점 표시
- 공학용 수식 입력 도구막대와 수식 미리보기 추가
- `theta`, `θ`, `lambda`, `λ` 등 대표 표현 차이를 일부 허용하는 공식 채점 정규화 추가
- 검증 스크립트가 v3 이론 필드, 전문 문제 유형, 수식 입력 UI 존재 여부를 확인

## v4 전문 목차·그래프·코드 실행 보강

- 19개 큰 섹션을 62개 마이크로 세션으로 세분화해 모듈 > 세션 그룹 > 세부 세션 형태로 탐색
- 모든 세션을 이론 2개 이상, 시험 10문항 이상, 수식/증명/개념 그래프 1개 이상 포함하도록 자동 검증
- 이론 탭에 rotation basis, Gaussian/KF, gradient descent, covariance ellipse, trajectory, A* cost, confusion matrix, retrieval/state graph 추가
- 코드 실습 탭에 Web Worker 기반 JS 알고리즘 실행 패널 추가: 실행 로그, return JSON 표, 숫자 그래프 확인
- C++/Python은 계속 타이핑/구조검사/모범답안 중심으로 두고, 같은 공식의 JS 실행으로 결과값을 즉시 검산
- `npm run validate:content`가 실제 생성된 커리큘럼을 로드해 세션 수, 문제 수, 수식/증명/그래프/실행 실습 필드를 검사

## v5 안정화·콘텐츠 확장

- KaTeX 수식 렌더링을 공식 박스뿐 아니라 시험 문항, 힌트, 해설, 이론 설명, 오답 노트까지 확장
- 다크 모드 토글, 전체 커리큘럼 검색, 모바일 접이식 목차, 빈 시각화 탭의 MiniGraph 대체 화면 보강
- 복습 카드, 학습 통계, 메모, 포모도로, JSON 내보내기/불러오기, 오답 노트 자동 기록을 `localStorage` 기반으로 연결
- 모든 마이크로 세션에 실전 시나리오 문제, ROS 2 명령어 치트시트, 선수 관계 기반 개념 연결 맵 추가
- `Ctrl+Enter`는 시험 채점 또는 JS 실행, `1~4`는 탭 전환, `j/k`는 이전/다음 세션 이동

## v6 교과서형 이론 보강

- 모든 마이크로 세션 앞에 과목별 전공 교재식 본문을 추가해 정의, 직관, 변수, 원리, 수식, 유도, 증명, 계산 예제, 구현 연결을 한 흐름으로 학습
- 시험 풀이 브릿지를 추가해 문제 문장을 변수와 공식으로 바꾸는 순서, 단위/frame 점검, 계산 결과 해석, 실무 로그 진단까지 연결
- 선형대수/좌표계, Jacobian/IK, 로봇팔 운동학, 모바일 로봇, AI metric/배포, LLM 하네스, 실시간성/안전성 분야별로 서로 다른 설명 템플릿 적용
- `npm run validate:content`가 모든 세션의 교재형 이론, 시험 브릿지, 여러 계산 예제, 다중 공식, 충분한 본문 분량을 검사

## v7 공식자료 기반 교과서화

- 사용자가 제공한 공식 링크를 `Source Catalog`로 정리해 ROS 2, 로봇팔, Nav2/SLAM, 센서/비전, AI 배포, LLM 하네스, 시뮬레이터, 고급제어, JetRover, 기초수학 자료실로 제공
- 마이크로 세션을 100개 이상으로 확장하고 기초수학, ROS 2, 로봇팔, 자율주행, AI/센서, 시스템/평가 필터로 탐색
- 모든 세션에 공식자료 읽기 순서, 세션 source id, 검색 가능한 자료 카드, 다중 C++/Python 코드 예제 추가
- JS 실행 실습을 homogeneous transform, SVD/DLS, 2D EKF, occupancy log-odds, Stanley, PID, LQR, MPC, camera projection, convolution, ONNX shape, tf latency, rosbag metric까지 확장

## v8 Physical AI 검증 보고서 반영

- 보고서의 TOP 위험 공백을 독립 v2 세션으로 추가: Newton-Euler, feedforward gravity compensation, Laplace/z-domain/Bode, PPO/SAC, CBF-QP, UKF, Nav2 BT/Action, TensorRT/ONNX, VLM→VLA, C++ 1kHz jitter
- 각 보강 세션에 이론, 유도, 손계산, Python/C++ 코드랩, 실패 상황 시각화 스펙, 안전/통합/반례형 퀴즈를 연결
- `validate-content.mjs`가 critical-gap 세션 존재, 고급 퀴즈 유형, C++/Python 실습, 시각화 카탈로그 커버리지를 강제

## v9 B+ → A- 약점 폐쇄

- 남은 공백을 독립 v2 세션으로 추가: DAgger, Contact dynamics/Friction cone, iLQR trajectory optimization, Dreamer/RSSM world model, Null-space redundancy resolution
- `criticalGapSessions.ts`의 7종 기본 퀴즈 답변을 세션별 전용 답변으로 교체해 템플릿 암기형 약점을 제거
- 시각화 카탈로그를 48개, 각 3개 파라미터와 3개 해석 질문으로 확장하고 v2 시각화 스펙 카드에 실제 슬라이더 기반 인터랙션 추가
- `validate-content.mjs`가 남은 약점 세션, 세션별 quiz specificity, multi-parameter visualization, interactive spec renderer를 자동 검증

## 실행

```bash
npm install
npm run dev -- --port 5173
```

브라우저에서 `http://localhost:5173/`로 접속합니다.
이미 해당 포트가 사용 중이면 Vite가 `5174`, `5175`처럼 다음 포트를 안내합니다.
현재 개발 서버 확인 URL은 `http://localhost:5178/`입니다.

## 빌드 확인

```bash
npm run build
```

## 콘텐츠 검사

```bash
npm run validate:content
```
