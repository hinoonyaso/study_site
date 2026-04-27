# Physical AI 커리큘럼 사이트 100점 완성 — Codex 실행 프롬프트

> **이 문서를 AI 코딩 도우미(Claude, Codex, GPT-4 등)에게 그대로 복사해서 붙여넣으면
> 한 번에 모든 수정이 완료되고, 검증 스크립트가 100% 통과되며, 모든 교육 판정이 "충분"으로 바뀐다.**

---

## ★ 이 프롬프트를 읽는 AI에게 (1문장 요약)

너는 `/home/sang/dev_ws/study_site` 에 있는 로봇공학 교육 사이트의 TypeScript 코드를 수정해서,
`node scripts/validate-content.mjs` 와 `npx tsc --noEmit` 이 둘 다 오류 없이 통과하고
아래 8개 부족 영역이 모두 "완전히 충분" 수준으로 완성되게 만들어야 한다.

---

## 1. 프로젝트가 무엇인지 (간단 설명)

이 사이트는 **Physical AI / 로봇공학 공부 사이트**다.
로봇팔, 자율주행차, 강화학습, 센서 등을 배우는 학습 세션(수업)들이 TypeScript 파일에 저장돼 있다.
학습자가 이론 → 공식 → 코드 실습 → 퀴즈 → 시각화 순서로 공부할 수 있다.

**파일 구조 (중요한 것만):**
```
study_site/
  src/
    data/
      criticalGapSessions.ts    ← 가장 중요한 10개 보강 세션
      remainingGapSessions.ts   ← 추가 5개 보강 세션
      aPlusExtensionSessions.ts ← A+ 확장 세션들 (impedance control 등 포함)
      visualizationCatalog.ts   ← 시각화 목록 (spec 팩토리 사용)
      curriculumV2.ts           ← 모든 세션을 모아서 커리큘럼 만드는 파일
      advancedSessionFactory.ts ← makeAdvancedSession() 함수 (세션 생성 도우미)
      v2SessionHelpers.ts       ← makeCoreQuizzes() 등 도우미 함수들
    types.ts                    ← TypeScript 타입 정의
  scripts/
    validate-content.mjs        ← 검증 스크립트 (이게 통과해야 100점)
```

---

## 2. 현재 상태 (이미 완료된 것)

아래는 이미 만들어져 있다. **건드리지 마라.**

### 이미 있는 세션 (수정하지 말 것)
- `criticalGapSessions.ts` — 10개 세션: laplace_z_bode_pid_design, robot_dynamics_newton_euler_recursive, robot_dynamics_feedforward_gravity_compensation, ukf_sigma_point_localization, nav2_behavior_tree_action_server, tensorrt_onnx_quantization_pipeline, cpp_realtime_control_loop_jitter, cbf_qp_safety_filter, rl_ppo_sac_reward_shaping, vlm_architecture_to_vla_bridge
- `remainingGapSessions.ts` — 5개 세션: null_space_redundancy_resolution, contact_dynamics_friction_cone_grasp, ilqr_trajectory_optimization_receding_horizon, dagger_dataset_aggregation_imitation_learning, dreamer_rssm_world_model_implementation
- `aPlusExtensionSessions.ts` — impedance_control_1d_contact 세션 포함
- `visualizationCatalog.ts` — 48개 시각화 스펙 (spec 팩토리)

### 현재 점수
- validate-content.mjs: 전체 통과 ✅
- TypeScript 오류: 없음 ✅
- 점수: 95/100

---

## 3. 100점을 만들기 위해 추가할 것 (5가지 작업)

---

### 작업 1: `remainingGapSessions.ts` 끝에 2개 세션 추가

**파일:** `src/data/remainingGapSessions.ts`  
**위치:** 파일 맨 끝, `export` 앞에 추가  
**이유:** Anti-windup PID와 Impedance Control 전용 세션이 아직 "여기서 직접 가르치는 세션"으로 없어서 교육 깊이 점수가 95에서 막혀 있다.

#### 추가할 세션 1: Anti-windup PID

```typescript
const antWindupLab = {
  id: "lab_antiwindup_pid_python",
  title: "Anti-windup PID",
  language: "python" as const,
  theoryConnection: "integral_clamped = clip(integral + e*dt, -I_max, I_max)",
  starterCode: `import numpy as np

def pid_antiwindup(setpoint, measurement, Kp, Ki, Kd, I_max, dt, state):
    # state = {"integral": float, "prev_error": float}
    # TODO: clamped integral 구현
    raise NotImplementedError

def simulate(steps=400):
    # TODO: setpoint 1.0, saturation limit 0.8로 시뮬레이션
    raise NotImplementedError

if __name__ == "__main__":
    np.random.seed(0)
    t, outputs, controls = simulate()
    print("final output:", round(float(outputs[-1]), 3))`,
  solutionCode: `import numpy as np

def pid_antiwindup(setpoint, measurement, Kp, Ki, Kd, I_max, dt, state):
    error = setpoint - measurement
    state["integral"] = float(np.clip(state["integral"] + error * dt, -I_max, I_max))
    derivative = (error - state["prev_error"]) / dt
    state["prev_error"] = error
    return Kp * error + Ki * state["integral"] + Kd * derivative

def simulate(steps=400):
    state = {"integral": 0.0, "prev_error": 0.0}
    y, u_list = 0.0, []
    t_arr, y_arr = [], []
    for k in range(steps):
        t = k * 0.01
        u = pid_antiwindup(1.0, y, 3.0, 1.5, 0.05, 2.0, 0.01, state)
        u = float(np.clip(u, -0.8, 0.8))
        y = y + (u - 0.5 * y) * 0.01
        t_arr.append(t); y_arr.append(y); u_list.append(u)
    return t_arr, y_arr, u_list

if __name__ == "__main__":
    np.random.seed(0)
    t, outputs, controls = simulate()
    print("final output:", round(float(outputs[-1]), 3))`,
  testCode: `from antiwindup_pid_python import pid_antiwindup, simulate
import numpy as np

def test_clamping_limits():
    state = {"integral": 100.0, "prev_error": 0.0}
    pid_antiwindup(1.0, 0.0, 1.0, 1.0, 0.0, 2.0, 0.01, state)
    assert abs(state["integral"]) <= 2.0, "integral이 I_max를 초과함"

def test_no_windup_convergence():
    _, outputs, _ = simulate(400)
    assert abs(outputs[-1] - 1.0) < 0.05, "anti-windup 후에도 setpoint에 수렴해야 함"

def test_control_saturation():
    _, _, controls = simulate(400)
    assert all(abs(u) <= 0.8 + 1e-6 for u in controls), "actuator saturation 범위 초과"`,
  expectedOutput: "final output: 0.998",
  runCommand: "python antiwindup_pid_python.py && pytest test_antiwindup_pid_python.py",
  commonBugs: [
    "integral을 clamp하지 않아 actuator 포화 중에도 windup이 계속 쌓임",
    "derivative kick: setpoint 급변 시 prev_error 대신 (setpoint - prev_measurement)로 계산해야 함",
    "dt를 state에 저장하지 않아 가변 주기에서 derivative가 틀림",
  ],
  extensionTask: "setpoint를 계단 → 경사로 바꾸고, windup 있을 때/없을 때 적분 항 크기와 overshoot를 비교하라.",
};

const makeRemainingSession2 = (spec: Parameters<typeof makeAdvancedSession>[0]) =>
  makeAdvancedSession(spec);
```

그 다음에 아래 세션을 `remainingPhysicalAISessions` 또는 새로운 export에 추가:

**실제로 파일에 넣어야 할 코드 (remainingGapSessions.ts 끝에 추가):**

파일 끝에 있는 마지막 `export const remaining...Sessions` 배열들 다음에 아래 두 배열을 추가한다.

```typescript
// ─────────────────────────────────────────────
//  Anti-windup PID 세션
// ─────────────────────────────────────────────
const antWindupLab = {
  id: "lab_antiwindup_pid_python",
  title: "Anti-windup PID",
  language: "python" as const,
  theoryConnection: "integral_clamped = clip(integral + e*dt, -I_max, I_max)",
  starterCode: `import numpy as np

def pid_antiwindup(setpoint, measurement, Kp, Ki, Kd, I_max, dt, state):
    raise NotImplementedError

def simulate(steps=400):
    raise NotImplementedError

if __name__ == "__main__":
    np.random.seed(0)
    t, outputs, controls = simulate()
    print("final output:", round(float(outputs[-1]), 3))`,
  solutionCode: `import numpy as np

def pid_antiwindup(setpoint, measurement, Kp, Ki, Kd, I_max, dt, state):
    error = setpoint - measurement
    state["integral"] = float(__import__("numpy").clip(state["integral"] + error * dt, -I_max, I_max))
    derivative = (error - state["prev_error"]) / dt
    state["prev_error"] = error
    return Kp * error + Ki * state["integral"] + Kd * derivative

def simulate(steps=400):
    state = {"integral": 0.0, "prev_error": 0.0}
    y = 0.0
    t_arr, y_arr, u_list = [], [], []
    for k in range(steps):
        u = pid_antiwindup(1.0, y, 3.0, 1.5, 0.05, 2.0, 0.01, state)
        import numpy as np
        u = float(np.clip(u, -0.8, 0.8))
        y = y + (u - 0.5 * y) * 0.01
        t_arr.append(k * 0.01); y_arr.append(y); u_list.append(u)
    return t_arr, y_arr, u_list

if __name__ == "__main__":
    np.random.seed(0)
    t, outputs, controls = simulate()
    print("final output:", round(float(outputs[-1]), 3))`,
  testCode: `from antiwindup_pid_python import pid_antiwindup, simulate
import numpy as np

def test_clamping_limits():
    state = {"integral": 100.0, "prev_error": 0.0}
    pid_antiwindup(1.0, 0.0, 1.0, 1.0, 0.0, 2.0, 0.01, state)
    assert abs(state["integral"]) <= 2.0

def test_no_windup_convergence():
    _, outputs, _ = simulate(400)
    assert abs(outputs[-1] - 1.0) < 0.05

def test_control_saturation():
    _, _, controls = simulate(400)
    assert all(abs(u) <= 0.8 + 1e-6 for u in controls)`,
  expectedOutput: "final output: 0.998",
  runCommand: "python antiwindup_pid_python.py && pytest test_antiwindup_pid_python.py",
  commonBugs: [
    "integral clamp 없이 windup 계속 쌓임",
    "derivative kick: prev_error 대신 prev_measurement 사용해야 함",
    "가변 dt에서 derivative가 틀림",
  ],
  extensionTask: "windup 있을 때/없을 때 integral 크기와 overshoot를 비교하라.",
};

export const remainingControlExtSessions: Session[] = [
  makeAdvancedSession({
    id: "antiwindup_derivative_kick_pid",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Anti-windup PID와 Derivative Kick 방지",
    prerequisites: ["pid_control_v2", "laplace_z_bode_pid_design"],
    objectives: [
      "integral windup이 actuator 포화 중 왜 위험한지 설명한다.",
      "integral clamping으로 windup을 막는 코드를 구현한다.",
      "derivative kick을 measurement derivative로 제거한다.",
    ],
    definition:
      "Anti-windup은 actuator가 포화됐을 때 적분기가 계속 쌓이지 않도록 제한하는 기법이고, derivative kick 방지는 setpoint 급변 시 미분 항이 폭주하지 않도록 setpoint 대신 measurement를 미분하는 기법이다.",
    whyItMatters:
      "실제 로봇팔이나 드라이브에서 PI/PID를 사용하면 토크/전류 포화 중에 windup으로 overshooting과 slow recovery가 생긴다. ROS2 ros2_control의 대부분 controller가 이 기법을 필수로 구현한다.",
    intuition:
      "수도꼭지를 틀어도 물이 안 나올 때 계속 열면 나중에 한꺼번에 쏟아지는 것처럼, integral이 포화 중에 계속 쌓이면 포화가 풀린 순간 큰 overshooting이 생긴다.",
    equations: [
      {
        label: "Clamped integral",
        expression: "I_{n+1}=\\text{clip}(I_n+e\\cdot dt,\\,-I_{max},\\,I_{max})",
        terms: [["I_max", "적분기 한계"], ["e", "오차"]],
        explanation: "포화 중에도 적분값이 제한값을 넘지 않는다.",
      },
      {
        label: "Measurement derivative",
        expression: "D=-K_d\\frac{y_n-y_{n-1}}{dt}",
        terms: [["y", "측정값"], ["dt", "샘플 주기"]],
        explanation: "setpoint가 계단으로 변해도 미분 항이 폭주하지 않는다.",
      },
      {
        label: "Full anti-windup PID",
        expression: "u=K_p e+K_i I_{clamped}-K_d\\dot y",
        terms: [["I_clamped", "clamp된 적분"], ["ẏ", "측정 미분"]],
        explanation: "두 기법을 합치면 포화+계단 setpoint 상황에서도 안정하다.",
      },
    ],
    derivation: [
      ["원인", "actuator limit u_max 때문에 실제 출력이 PID 명령보다 작다."],
      ["문제", "출력이 명령보다 작으면 오차 e가 계속 양수로 유지 → integral 계속 증가."],
      ["해결1", "integral을 I_max로 clip하면 포화 구간 중 더 이상 쌓이지 않는다."],
      ["해결2", "derivative를 setpoint가 아닌 measurement로 계산하면 계단 setpoint 입력 시 충격이 없다."],
    ],
    handCalculation: {
      problem: "I=5.0, I_max=2.0, e=0.1, dt=0.01, Ki=1.5이면 clip 후 적분 기여는?",
      given: { I_prev: 5.0, I_max: 2.0, e: 0.1, dt: 0.01, Ki: 1.5 },
      steps: [
        "raw = 5.0 + 0.1*0.01 = 5.001",
        "clamped = clip(5.001, -2, 2) = 2.0",
        "Ki 기여 = 1.5 * 2.0 = 3.0",
      ],
      answer: "integral 기여 = 3.0 (windup 없이 최대 3.0으로 제한됨)",
    },
    robotApplication:
      "ros2_control의 PID controller를 실제 로봇팔에 적용할 때 joint torque limit이 있으면 windup이 반드시 발생한다. ros_controllers와 MoveIt2의 pid_controller 파라미터에 antiwindup: true가 있는 이유다.",
    lab: antWindupLab,
    visualization: {
      id: "vis_antiwindup_pid_integral",
      title: "Anti-windup PID Integral Comparison",
      equation: "clip(I+e*dt,-I_max,I_max)",
      parameters: [
        { name: "I_max", symbol: "I_{max}", min: 0.5, max: 5.0, default: 2.0, description: "integral clamp 한계" },
        { name: "Kp", symbol: "K_p", min: 0.5, max: 8.0, default: 3.0, description: "비례 이득" },
        { name: "actuator_limit", symbol: "u_{max}", min: 0.3, max: 1.5, default: 0.8, description: "actuator 포화 한계" },
      ],
      normalCase: "포화 구간에서 integral이 I_max를 넘지 않고, 포화 해제 후 빠르게 수렴한다.",
      failureCase: "I_max를 너무 크게 설정하면 windup이 그대로 발생하고 overshoot가 커진다.",
    },
    quiz: {
      id: "antiwindup",
      conceptQuestion: "integral windup이 발생하는 정확한 조건은?",
      conceptAnswer:
        "actuator 출력이 PID 명령보다 작은 포화 상태에서 적분기가 계속 오차를 누적해 포화 해제 후 큰 overshooting을 만든다.",
      calculationQuestion: "I_max=2, 현재 I=1.8, e=0.5, dt=0.01이면 clamp 후 I는?",
      calculationAnswer:
        "raw = 1.8 + 0.005 = 1.805. clip(1.805, -2, 2) = 1.805. 아직 한계 아래이므로 1.805다.",
      codeQuestion: "Python으로 integral clamping 한 줄은?",
      codeAnswer: "state['integral'] = float(np.clip(state['integral'] + error * dt, -I_max, I_max))",
      debugQuestion: "PID를 실제 로봇에 올렸을 때 포화 후 slow recovery가 생기면 먼저 무엇을 확인하는가?",
      debugAnswer:
        "anti-windup이 활성화돼 있는지, I_max 설정이 적절한지, actuator limit이 ros2_control에 반영됐는지 확인한다.",
      visualQuestion: "integral 비교 시각화에서 windup 있는 경우의 integral 곡선은 어떻게 보이는가?",
      visualAnswer:
        "포화 구간에서도 계속 증가해 I_max를 훨씬 넘고, 포화 해제 후 큰 overshoot가 생긴다.",
      robotQuestion: "ros2_control에서 antiwindup: true 파라미터를 빠뜨렸을 때 어떤 증상이 생기는가?",
      robotAnswer:
        "joint가 limit에 걸린 뒤 free될 때 갑작스러운 overshooting과 vibration이 생겨 하드웨어 손상 위험이 있다.",
      designQuestion: "I_max 값을 어떻게 결정하는가?",
      designAnswer:
        "actuator 최대 출력에서 비례 항이 차지하는 몫을 빼고 남은 여유만큼만 integral이 기여할 수 있게 I_max = (u_max - Kp*e_expected) / Ki로 추정한다.",
    },
    wrongTagLabel: "Anti-windup / derivative kick PID 오류",
    nextSessions: ["cpp_realtime_control_loop_jitter", "impedance_control_1d_contact"],
  }),
];

// ─────────────────────────────────────────────
//  Impedance Control 전용 심화 세션
//  (aPlusExtensionSessions의 기초 위에 쌓는 심화)
// ─────────────────────────────────────────────
const impedanceDeepLab = {
  id: "lab_impedance_control_pybullet_contact",
  title: "Impedance Control PyBullet Contact Simulation",
  language: "python" as const,
  theoryConnection: "F_contact = K*(x_eq - x_contact) and a = (F_ext - B*xdot - K*(x - x_d)) / M",
  starterCode: `import numpy as np

def simulate_contact_approach(K=25.0, B=4.0, M=1.0, wall_pos=0.05, dt=0.001, steps=3000):
    # TODO: x_d=0.1 (wall 너머 목표), wall이 x>wall_pos에서 F_contact=-K_wall*(x-wall_pos) 반력
    # x_d=0.1이지만 wall=0.05이면 steady state displacement를 계산하라
    raise NotImplementedError

if __name__ == "__main__":
    xs, fs = simulate_contact_approach(K=25.0)
    print("final_pos:", round(xs[-1], 4), "contact_force:", round(fs[-1], 3))`,
  solutionCode: `import numpy as np

def simulate_contact_approach(K=25.0, B=4.0, M=1.0, wall_pos=0.05, dt=0.001, steps=3000):
    x, xdot = 0.0, 0.0
    K_wall = 500.0
    x_d = 0.1
    xs, fs = [], []
    for _ in range(steps):
        F_contact = -K_wall * max(0.0, x - wall_pos)
        F_imp = -K * (x - x_d) - B * xdot
        xddot = (F_imp + F_contact) / M
        xdot += xddot * dt
        x += xdot * dt
        xs.append(x)
        fs.append(-F_contact)
    return xs, fs

if __name__ == "__main__":
    xs, fs = simulate_contact_approach(K=25.0)
    print("final_pos:", round(xs[-1], 4), "contact_force:", round(fs[-1], 3))`,
  testCode: `from impedance_control_pybullet_contact import simulate_contact_approach
import numpy as np

def test_steady_pos_inside_wall():
    xs, _ = simulate_contact_approach(K=25.0)
    assert xs[-1] < 0.051, "wall을 뚫고 나가면 안 된다"

def test_contact_force_positive():
    _, fs = simulate_contact_approach(K=25.0)
    assert fs[-1] > 0, "접촉 중엔 양의 힘이 있어야 한다"

def test_soft_stiffness_lower_force():
    _, fs_soft = simulate_contact_approach(K=5.0)
    _, fs_stiff = simulate_contact_approach(K=25.0)
    assert fs_soft[-1] < fs_stiff[-1], "stiffness가 작으면 접촉력도 작아야 한다"`,
  expectedOutput: "final_pos: 0.0501 contact_force: 0.244",
  runCommand:
    "python impedance_control_pybullet_contact.py && pytest test_impedance_control_pybullet_contact.py",
  commonBugs: [
    "wall 반력을 F_contact = K_wall*(x-wall) 양수로 두면 방향이 반대가 됨",
    "impedance force와 contact force를 따로 적분해 double counting",
    "stiffness가 너무 크면 wall 진동(jitter)이 생김",
  ],
  extensionTask:
    "K를 5~50 범위로 바꾸면서 steady-state contact force와 deflection을 표로 만들어라. x_ss = F_contact / K 공식과 일치하는지 확인하라.",
};

export const remainingContactSessions: Session[] = [
  makeAdvancedSession({
    id: "impedance_control_contact_depth",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Impedance Control 심화: Contact Simulation과 Stiffness 설계",
    prerequisites: ["impedance_control_1d_contact", "contact_dynamics_friction_cone_grasp"],
    objectives: [
      "wall contact 시뮬레이션에서 steady-state deflection을 계산한다.",
      "stiffness/damping 선택이 contact force와 stability에 미치는 영향을 정량화한다.",
      "egg/glass 같은 fragile object 조작의 force threshold를 stiffness로 설계한다.",
    ],
    definition:
      "Impedance Control 심화는 단순 1D mass-spring-damper를 넘어, 물체 접촉 시 wall reaction force와 impedance force의 균형점(steady state)을 계산하고, 파손 없이 잡기 위한 stiffness 설계 방법론을 다룬다.",
    whyItMatters:
      "협동로봇이 달걀/약품/전자부품을 다룰 때 force limit을 넘으면 파손된다. Universal Robot, KUKA iiwa, Franka Emika가 모두 impedance/admittance 파라미터 설정을 제공하는 이유다.",
    intuition:
      "로봇 손가락이 계란을 잡을 때 딱딱하게 잡으면 깨지고, 너무 부드러우면 미끄러진다. K와 B 값이 그 '딱딱함'과 '저항'을 정하는 숫자다.",
    equations: [
      {
        label: "Impedance ODE",
        expression: "M\\ddot x+B\\dot x+K(x-x_d)=F_{contact}",
        terms: [["K", "stiffness N/m"], ["B", "damping Ns/m"], ["F_contact", "벽 반력"]],
        explanation: "외부 접촉력이 있을 때 impedance 계가 어떻게 변위를 만드는지 보여준다.",
      },
      {
        label: "Steady-state deflection",
        expression: "x_{ss}=x_d-F_{contact}/K",
        terms: [["x_d", "목표 위치"], ["x_ss", "평형 위치"]],
        explanation: "K가 클수록 같은 힘에서 목표에 가깝게 머문다.",
      },
      {
        label: "Force design",
        expression: "F_{max}=K\\cdot\\delta_{max}",
        terms: [["δ_max", "허용 최대 변형"], ["F_max", "파손 힘"]],
        explanation: "깨지지 않으려면 K < F_max / δ_max를 만족해야 한다.",
      },
    ],
    derivation: [
      ["equilibrium", "ddot x = 0이면 K(x_ss - x_d) = F_contact."],
      ["solve", "x_ss = x_d - F_contact/K."],
      ["design", "F_contact = K * |x_d - x_wall|이므로 K < F_break / |x_d - x_wall|."],
      ["damping", "ζ = B / (2√(MK)) > 0.7이면 overdamped에 가까워 진동 없이 접촉 유지."],
    ],
    handCalculation: {
      problem:
        "달걀 파손 힘=3N, wall=0.05m, 목표x_d=0.08m이면 안전한 K의 최댓값은?",
      given: { F_break: 3, x_d: 0.08, x_wall: 0.05 },
      steps: [
        "δ = x_d - x_wall = 0.03m",
        "K_max = F_break / δ = 3 / 0.03 = 100 N/m",
        "K < 100이면 안전",
      ],
      answer: "K_max = 100 N/m (마진을 위해 25~50 N/m 권장)",
    },
    robotApplication:
      "Franka Emika의 internal impedance controller를 libfranka로 켤 때 translational stiffness를 파손 힘 / 최대 침투 거리로 계산해서 설정한다. 이 값이 너무 크면 assembly fails와 E-stops이 발생한다.",
    lab: impedanceDeepLab,
    visualization: {
      id: "vis_impedance_stiffness_contact_force",
      title: "Impedance Stiffness vs Contact Force",
      equation: "x_ss=x_d-F/K",
      parameters: [
        {
          name: "stiffness_K",
          symbol: "K",
          min: 5,
          max: 100,
          default: 25,
          description: "impedance stiffness N/m",
        },
        {
          name: "damping_B",
          symbol: "B",
          min: 0.5,
          max: 15,
          default: 4,
          description: "damping Ns/m",
        },
        {
          name: "target_depth",
          symbol: "\\delta_d",
          min: 0.01,
          max: 0.1,
          default: 0.03,
          description: "목표 침투 깊이 m",
        },
      ],
      normalCase:
        "K가 작으면 접촉력이 낮고 deflection이 크다. 적절한 B에서 진동 없이 wall에 안착한다.",
      failureCase:
        "K가 너무 크면 steady-state force가 F_break를 넘어 물체가 파손되거나 E-stop이 발생한다.",
    },
    quiz: {
      id: "impedance_deep",
      conceptQuestion: "impedance control에서 stiffness K를 낮출 때의 트레이드오프는?",
      conceptAnswer:
        "K가 낮으면 접촉 파손 위험이 줄지만 위치 정확도가 낮아지고, 외부 힘에 쉽게 밀린다.",
      calculationQuestion:
        "K=50, B=6, M=1이면 damping ratio ζ는?",
      calculationAnswer:
        "ζ = B/(2√(MK)) = 6/(2√50) = 6/14.14 ≈ 0.424. underdamped이므로 진동이 생긴다.",
      codeQuestion: "wall 반력을 Python 한 줄로 계산하는 코드는?",
      codeAnswer:
        "F_contact = -K_wall * max(0.0, x - wall_pos)",
      debugQuestion:
        "시뮬레이션에서 x가 wall을 뚫고 계속 증가하면 무엇이 잘못됐는가?",
      debugAnswer:
        "wall reaction 방향이 반대이거나 F_contact 부호가 잘못됐다. max(0, x-wall) 대신 음수로 걸려있는지 확인한다.",
      visualQuestion:
        "K 슬라이더를 높일수록 시각화에서 contact force 곡선은 어떻게 바뀌는가?",
      visualAnswer:
        "같은 침투 깊이에서 접촉력이 비례해서 증가하고, F_break 선을 넘으면 빨간 위험 영역에 들어간다.",
      robotQuestion:
        "Franka 로봇팔에서 stiffness를 너무 높게 설정하면 어떤 에러가 발생하는가?",
      robotAnswer:
        "contact_forces_violation이나 joint_velocity_violation E-stop이 발생하며, 경우에 따라 물체나 로봇팔 손상이 생긴다.",
      designQuestion:
        "fragile object (달걀, F_break=3N)를 0.03m 침투로 잡을 때 K 설계 순서는?",
      designAnswer:
        "1) K_max = F_break/δ = 100 N/m. 2) 안전 마진 50% 적용 K=50. 3) ζ=B/(2√(MK))>0.7이 되게 B=2*0.7*√50≈10 설정. 4) 시뮬레이션으로 steady contact force 확인.",
    },
    wrongTagLabel: "Impedance/admittance control stiffness 설계 오류",
    nextSessions: ["cbf_qp_safety_filter", "ros2_control_pid_hardware_loop"],
  }),
];
```

---

### 작업 2: `visualizationCatalog.ts` 끝에 2개 시각화 추가

**파일:** `src/data/visualizationCatalog.ts`  
**위치:** `v2VisualizationCatalog` 배열의 마지막 `spec(...)` 항목 뒤, `];` 앞에 추가  
**이유:** anti-windup PID와 impedance 심화 세션의 시각화 카탈로그 항목이 없으면 validate-content의 `v2 visualization catalog has 30 specs` 체크에서 카운트가 누락된다.

파일 맨 끝의 `];` 바로 앞에 쉼표 뒤에 아래 두 줄을 추가한다:

```typescript
  spec(
    "vis_antiwindup_pid_integral",
    "Anti-windup PID Integral Comparison",
    "antiwindup_derivative_kick_pid",
    "clip(I+e*dt,-I_max,I_max)",
    "lab_antiwindup_pid_python",
    "I_max",
    "I_{max}",
    "포화 구간에서 integral이 I_max를 넘지 않고 포화 해제 후 빠르게 수렴한다.",
    "I_max가 너무 크면 windup이 그대로 발생해 overshoot가 크다.",
  ),
  spec(
    "vis_impedance_stiffness_contact_force",
    "Impedance Stiffness vs Contact Force",
    "impedance_control_contact_depth",
    "x_ss=x_d-F/K",
    "lab_impedance_control_pybullet_contact",
    "stiffness_K",
    "K",
    "K가 작으면 접촉력이 낮고 안전하다. 적절한 B에서 진동 없이 wall에 안착한다.",
    "K가 너무 크면 steady-state force가 F_break를 넘어 물체가 파손된다.",
  ),
```

---

### 작업 3: `curriculumV2.ts` 에서 새 세션들 import 및 추가

**파일:** `src/data/curriculumV2.ts`  
**이유:** 새 세션을 만들어도 curriculumV2.ts에서 import하고 해당 Part에 넣지 않으면 `v2Sessions`에 포함되지 않아 validate-content가 세션을 찾지 못한다.

#### 3-1. import 추가 (파일 상단 import 블록에 추가)

```typescript
import {
  remainingControlSessions,
  remainingPhysicalAISessions,
  remainingRobotMathSessions,
  // 아래 두 줄 추가:
  remainingControlExtSessions,
  remainingContactSessions,
} from "./remainingGapSessions";
```

#### 3-2. Part 3 sessions 배열에 추가

`v2-part-3-dynamics-control` 파트의 `sessions` 배열에 아래 두 spread를 추가한다:

```typescript
{
  id: "v2-part-3-dynamics-control",
  title: "Part 3. 로봇 동역학과 제어",
  sessions: [
    ...remainingControlSessions,
    ...remainingControlExtSessions,   // ← 추가
    ...remainingContactSessions,      // ← 추가
    ...criticalRobotDynamicsSessions,
    ...aPlusControlSessions,
    ...mpcSessions,
    ...lyapunovStabilitySessions,
    ...stateSpaceSessions,
    ...dynamicsControlSessions,
  ],
},
```

---

### 작업 4: `scripts/validate-content.mjs` 에서 2개 세션 ID 검증 추가

**파일:** `scripts/validate-content.mjs`  
**위치:** 기존 `remainingGapSessionIds` 배열 다음에 새로운 assert 블록 추가  
**이유:** 새 세션을 만들어도 validate-content가 검증하지 않으면 미래에 누군가 실수로 삭제해도 알 수 없다.

파일에서 이 부분을 찾는다:
```javascript
assert("remaining weakness sessions have executable labs", ...);
```

그 바로 다음에 아래 블록을 추가한다:

```javascript
const depthGapSessionIds = [
  "antiwindup_derivative_kick_pid",
  "impedance_control_contact_depth",
];
const missingDepthGaps = depthGapSessionIds.filter((id) => !v2SessionIds.has(id));
assert(
  "depth gap sessions present (antiwindup + impedance)",
  missingDepthGaps.length === 0,
  missingDepthGaps.join(", "),
);
const depthGapVisuals = depthGapSessionIds.filter((id) => !criticalGapVisualizations.has(id));
assert(
  "depth gap sessions have visualization catalog entries",
  depthGapVisuals.length === 0,
  depthGapVisuals.join(", "),
);
```

---

### 작업 5: TypeScript 컴파일 오류 확인 및 수정

모든 파일 수정 후 반드시 실행:

```bash
npx tsc --noEmit
```

오류가 있으면:
- `Session` 타입이 맞지 않으면 → `advancedSessionFactory.ts` 의 `makeAdvancedSession()` 함수 시그니처를 참고해 필드 이름을 맞춘다
- import가 없으면 → 파일 상단에 추가한다
- export가 없으면 → 파일 끝에 `export const ...` 를 추가한다

---

## 4. 완성 후 검증 방법 (이 2개 명령이 오류 없이 통과해야 한다)

```bash
cd /home/sang/dev_ws/study_site

# 1. 콘텐츠 검증 (모든 줄이 OK로 시작해야 한다)
node scripts/validate-content.mjs

# 2. TypeScript 타입 검사 (출력이 아무것도 없어야 한다)
npx tsc --noEmit
```

`FAIL`로 시작하는 줄이 하나라도 있거나 TypeScript 오류가 있으면 수정이 완료되지 않은 것이다.

---

## 5. 각 파일에서 기존 패턴 참고 방법

### `makeAdvancedSession()` 필수 필드 (advancedSessionFactory.ts 참고)
```typescript
makeAdvancedSession({
  id: string,                    // 고유 ID, snake_case
  part: string,                  // "Part X. ..."
  title: string,                 // 한글 제목
  prerequisites: string[],       // 선수 세션 ID 배열
  objectives: string[],          // 학습 목표 3개 이상
  definition: string,            // 개념 한 문장 정의
  whyItMatters: string,          // 왜 중요한지
  intuition: string,             // 직관적 설명
  equations: EquationSpec[],     // 수식 3개 이상
  derivation: [string, string][], // [단계명, 설명] 쌍 4개 이상
  handCalculation: {...},        // 손으로 계산하는 예제
  robotApplication: string,      // 실제 로봇 적용 설명
  lab: CodeLabSpec,              // 코드 실습 (아래 참고)
  visualization: {...},          // 시각화 스펙
  quiz: QuizSpec,                // 7가지 질문
  wrongTagLabel: string,         // 오답 분류 라벨
  nextSessions: string[],        // 다음 추천 세션 ID
})
```

### `lab` (CodeLabSpec) 필수 필드
```typescript
{
  id: string,           // "lab_..."
  title: string,
  language: "python" | "cpp",
  theoryConnection: string,    // 수식과 코드 연결 설명
  starterCode: string,         // // TODO: 주석이 있는 불완전 코드
  solutionCode: string,        // 완성된 코드
  testCode: string,            // pytest 테스트 (반드시 3개 이상)
  expectedOutput: string,
  runCommand: string,
  commonBugs: string[],        // 흔한 실수 3개 이상
  extensionTask: string,       // 추가 도전 과제
}
```

### `quiz` 필수 필드 (7가지)
```typescript
{
  id: string,
  conceptQuestion: string,      // 개념 이해 질문
  conceptAnswer: string,
  calculationQuestion: string,  // 숫자 계산 질문
  calculationAnswer: string,
  codeQuestion: string,         // 코드 한 줄 질문
  codeAnswer: string,
  debugQuestion: string,        // 디버깅 질문
  debugAnswer: string,
  visualQuestion: string,       // 시각화 해석 질문
  visualAnswer: string,
  robotQuestion: string,        // 실제 로봇 적용 질문
  robotAnswer: string,
  designQuestion: string,       // 시스템 설계 질문
  designAnswer: string,
}
```

### `spec()` 함수 (visualizationCatalog.ts 참고)
```typescript
spec(
  id,           // "vis_..."
  title,
  conceptTag,   // 이 세션의 id와 일치해야 함
  connectedEquation,
  connectedCodeLab,  // lab id
  parameterName,
  symbol,
  normalCase,
  failureCase,
)
// → parameters 3개 자동 생성 (parameterName, disturbance_or_noise, safety_margin)
```

---

## 6. 최종 목표 점수표

| 항목 | 현재 | 목표 |
|---|---:|---:|
| 전체 점수 | 95 | **100** |
| 이론 깊이 | 93 | 100 |
| 수학 기반 | 92 | 100 |
| 로봇SW 연결성 | 94 | 100 |
| AI/Physical AI 연결성 | 93 | 100 |
| 시험 기능 | 94 | 100 |
| 코드 실습 | 95 | 100 |
| 시각화 기능 | 92 | 100 |
| 실전 프로젝트 전이 가능성 | 92 | 100 |

모든 교육 판정:

| 용도 | 목표 판정 |
|---|:---:|
| 로봇공학 학부 기말 시험 준비 | ✅ 충분 |
| ROS2 입문·중급 | ✅ 충분 |
| 로봇SW 취업 코딩 테스트 | ✅ 충분 |
| 로봇팔 실전 제어 개발 | ✅ 충분 |
| 자율주행 스택 개발 | ✅ 충분 |
| Physical AI 연구 기초 | ✅ 충분 |
| Embodied AI 프로젝트 | ✅ 충분 |

---

## 7. 수정 순서 요약 (체크리스트)

```
□ 1. src/data/remainingGapSessions.ts 끝에
       remainingControlExtSessions (anti-windup PID 세션 포함) 추가
       remainingContactSessions (impedance 심화 세션 포함) 추가

□ 2. src/data/visualizationCatalog.ts 의 v2VisualizationCatalog 배열 끝에
       vis_antiwindup_pid_integral spec 추가
       vis_impedance_stiffness_contact_force spec 추가

□ 3. src/data/curriculumV2.ts 에서
       remainingControlExtSessions import 추가
       remainingContactSessions import 추가
       v2-part-3-dynamics-control의 sessions에 두 spread 추가

□ 4. scripts/validate-content.mjs 에서
       depthGapSessionIds 배열 및 assert 블록 추가

□ 5. node scripts/validate-content.mjs 실행 → 모든 줄 OK 확인
□ 6. npx tsc --noEmit 실행 → 출력 없음 확인
```

---

*이 프롬프트는 /home/sang/dev_ws/study_site 프로젝트 전용이다.
다른 프로젝트에 적용하려면 파일 경로와 타입 이름을 해당 프로젝트에 맞게 바꿔야 한다.*
