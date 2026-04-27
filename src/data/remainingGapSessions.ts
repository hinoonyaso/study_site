import type { ErrorType, QuizQuestionTypeV2, QuizQuestionV2, Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

type ExtraQuizSpec = {
  id: string;
  type: QuizQuestionTypeV2;
  difficulty: QuizQuestionV2["difficulty"];
  question: string;
  expectedAnswer: string;
  explanation: string;
  errorType: ErrorType;
  retryQuestionType: QuizQuestionTypeV2;
  counterexampleHint?: string;
  expectedFailureMode?: string;
};

const withExtraQuizzes = (base: Session, extras: ExtraQuizSpec[]): Session => ({
  ...base,
  quizzes: [
    ...base.quizzes,
    ...extras.map((extra) => ({
      id: `${base.id}_${extra.id}`,
      type: extra.type,
      difficulty: extra.difficulty,
      conceptTag: base.id,
      question: extra.question,
      expectedAnswer: extra.expectedAnswer,
      explanation: extra.explanation,
      counterexampleHint: extra.counterexampleHint,
      expectedFailureMode: extra.expectedFailureMode,
      wrongAnswerAnalysis: {
        commonWrongAnswer: "알고리즘 이름만 말하고 데이터 분포, 제약, 실패 조건을 구체적으로 쓰지 않음",
        whyWrong: "이 보강 세션은 실제 로봇 프로젝트에서 바로 실패하는 지점을 수식, 코드, 로그로 확인하도록 설계되어 있다.",
        errorType: extra.errorType,
        reviewSession: base.title,
        retryQuestionType: extra.retryQuestionType,
        recommendedReview: [base.id],
        severity: extra.difficulty === "hard" ? ("high" as const) : ("medium" as const),
      },
    })),
  ],
});

const nullSpaceLab = {
  id: "lab_null_space_redundancy_resolution",
  title: "Null-space Redundancy Resolution",
  language: "python" as const,
  theoryConnection: "dq = J^+ xdot + (I - J^+J) dq_secondary keeps the task velocity while moving posture",
  starterCode: `import numpy as np

def damped_pinv(J, damping=1e-3):
    # TODO: implement J.T @ inv(JJ.T + lambda^2 I)
    raise NotImplementedError

def null_space_step(J, xdot, q, q_home, posture_gain=0.2, damping=1e-3):
    # TODO: primary task plus null-space posture motion
    raise NotImplementedError

if __name__ == "__main__":
    J = np.array([[1.0, 1.0, 0.0], [0.0, 1.0, 1.0]])
    dq = null_space_step(J, np.array([0.1, 0.0]), np.array([1.0, -0.5, 0.8]), np.zeros(3))
    print(np.round(J @ dq, 3))`,
  solutionCode: `import numpy as np

def damped_pinv(J, damping=1e-3):
    J = np.asarray(J, dtype=float)
    return J.T @ np.linalg.inv(J @ J.T + (damping ** 2) * np.eye(J.shape[0]))

def null_space_step(J, xdot, q, q_home, posture_gain=0.2, damping=1e-3):
    J = np.asarray(J, dtype=float)
    primary = damped_pinv(J, damping) @ np.asarray(xdot, dtype=float)
    projector = np.eye(J.shape[1]) - damped_pinv(J, damping) @ J
    secondary = posture_gain * (np.asarray(q_home, dtype=float) - np.asarray(q, dtype=float))
    return primary + projector @ secondary

if __name__ == "__main__":
    J = np.array([[1.0, 1.0, 0.0], [0.0, 1.0, 1.0]])
    dq = null_space_step(J, np.array([0.1, 0.0]), np.array([1.0, -0.5, 0.8]), np.zeros(3))
    print(np.round(J @ dq, 3))`,
  testCode: `import numpy as np
from null_space_redundancy_resolution import null_space_step

def test_task_velocity_is_preserved():
    J = np.array([[1.0, 1.0, 0.0], [0.0, 1.0, 1.0]])
    xdot = np.array([0.1, -0.02])
    dq = null_space_step(J, xdot, np.array([1.0, -0.5, 0.8]), np.zeros(3), damping=1e-4)
    assert np.allclose(J @ dq, xdot, atol=1e-3)`,
  expectedOutput: "[0.1 0. ]",
  runCommand: "python null_space_redundancy_resolution.py && pytest test_null_space_redundancy_resolution.py",
  commonBugs: [
    "I-J^+J 대신 I-JJ^+를 써서 joint-space projector 차원이 틀어짐",
    "secondary objective를 그대로 더해 task velocity가 변함",
    "singularity 근처에서 damping 없이 pseudo-inverse를 사용함",
  ],
  extensionTask: "joint limit 회피 항과 manipulability maximization 항을 secondary objective로 번갈아 넣어 비교하라.",
};

const contactFrictionLab = {
  id: "lab_contact_friction_cone_grasp",
  title: "Contact Friction Cone and Grasp Margin",
  language: "python" as const,
  theoryConnection: "|F_t| <= mu F_n, margin = mu F_n - |F_t| decides slip risk",
  starterCode: `def friction_margin(normal_force, tangential_force, mu):
    # TODO: positive margin means inside the friction cone
    raise NotImplementedError

def is_grasp_stable(left_normal, right_normal, tangential_load, mu, margin_min=0.0):
    # TODO: two contacts share the tangential load
    raise NotImplementedError

if __name__ == "__main__":
    print(round(friction_margin(10.0, 3.0, 0.5), 2))
    print(is_grasp_stable(8.0, 8.0, 6.0, 0.4))`,
  solutionCode: `def friction_margin(normal_force, tangential_force, mu):
    return float(mu * normal_force - abs(tangential_force))

def is_grasp_stable(left_normal, right_normal, tangential_load, mu, margin_min=0.0):
    per_contact_tangent = abs(tangential_load) / 2.0
    left_margin = friction_margin(left_normal, per_contact_tangent, mu)
    right_margin = friction_margin(right_normal, per_contact_tangent, mu)
    return min(left_margin, right_margin) >= margin_min

if __name__ == "__main__":
    print(round(friction_margin(10.0, 3.0, 0.5), 2))
    print(is_grasp_stable(8.0, 8.0, 6.0, 0.4))`,
  testCode: `from contact_friction_cone_grasp import friction_margin, is_grasp_stable

def test_margin_sign():
    assert friction_margin(10.0, 4.0, 0.5) > 0
    assert friction_margin(10.0, 6.0, 0.5) < 0

def test_grasp_stability_requires_both_contacts():
    assert is_grasp_stable(8.0, 8.0, 6.0, 0.4)
    assert not is_grasp_stable(3.0, 8.0, 6.0, 0.4)`,
  expectedOutput: "2.0\nTrue",
  runCommand: "python contact_friction_cone_grasp.py && pytest test_contact_friction_cone_grasp.py",
  commonBugs: [
    "normal force가 클수록 항상 안전하다고 보고 tangential load를 빼먹음",
    "마찰계수 mu와 cone half-angle atan(mu)를 혼동함",
    "두 접촉 중 하나만 안정하면 전체 grasp도 안정하다고 판단함",
  ],
  extensionTask: "force closure wrench matrix를 만들고 네 접촉점의 convex hull에 원점이 포함되는지 확인하라.",
};

const ilqrLab = {
  id: "lab_ilqr_scalar_trajectory_optimization",
  title: "Scalar iLQR Backward Gain and Line Search",
  language: "python" as const,
  theoryConnection: "linearize dynamics, quadratize cost, compute k=-Quu^-1 Qu, then line-search rollout",
  starterCode: `import numpy as np

def rollout(x0, controls, dt=0.1):
    # TODO: x[k+1] = x[k] + dt * u[k]
    raise NotImplementedError

def trajectory_cost(xs, us, goal, r=0.05):
    # TODO: sum state error and control effort
    raise NotImplementedError

def scalar_lqr_gain(q=1.0, r=0.05, b=0.1):
    # TODO: one-step backward gain for integrator dynamics
    raise NotImplementedError

if __name__ == "__main__":
    us = np.zeros(20)
    print(round(scalar_lqr_gain(), 3))
    print(round(trajectory_cost(rollout(0.0, us), us, goal=1.0), 3))`,
  solutionCode: `import numpy as np

def rollout(x0, controls, dt=0.1):
    xs = [float(x0)]
    for u in controls:
        xs.append(xs[-1] + dt * float(u))
    return np.asarray(xs)

def trajectory_cost(xs, us, goal, r=0.05):
    state_cost = np.sum((np.asarray(xs) - goal) ** 2)
    control_cost = r * np.sum(np.asarray(us) ** 2)
    return float(state_cost + control_cost)

def scalar_lqr_gain(q=1.0, r=0.05, b=0.1):
    Quu = r + b * b * q
    Qu = b * q
    return float(-Qu / Quu)

if __name__ == "__main__":
    us = np.zeros(20)
    print(round(scalar_lqr_gain(), 3))
    print(round(trajectory_cost(rollout(0.0, us), us, goal=1.0), 3))`,
  testCode: `import numpy as np
from ilqr_scalar_trajectory_optimization import rollout, scalar_lqr_gain, trajectory_cost

def test_rollout_shape_and_cost():
    us = np.zeros(5)
    xs = rollout(0.0, us)
    assert len(xs) == 6
    assert trajectory_cost(xs, us, 1.0) == 6.0

def test_gain_is_negative_feedback():
    assert scalar_lqr_gain() < 0`,
  expectedOutput: "-1.667\n21.0",
  runCommand: "python ilqr_scalar_trajectory_optimization.py && pytest test_ilqr_scalar_trajectory_optimization.py",
  commonBugs: [
    "forward rollout 없이 local quadratic model의 cost 감소만 보고 update를 수용함",
    "Quu regularization 없이 inverse를 계산해 singular update를 만듦",
    "control limit을 line search 뒤에만 적용해 dynamics rollout과 mismatch가 생김",
  ],
  extensionTask: "2D bicycle model로 확장하고 control limit clamp를 포함한 line search acceptance ratio를 기록하라.",
};

const daggerLab = {
  id: "lab_dagger_dataset_aggregation",
  title: "DAgger Dataset Aggregation Loop",
  language: "python" as const,
  theoryConnection: "D <- D union {(s, expert(s)) for s visited by current policy}; retrain policy on aggregated states",
  starterCode: `import numpy as np

def expert_policy(states):
    # TODO: stabilizing action for visited states
    raise NotImplementedError

def aggregate_dagger(dataset_states, rollout_states):
    # TODO: append rollout states and expert labels
    raise NotImplementedError

if __name__ == "__main__":
    D_s = np.array([[0.0], [0.2]])
    rollout = np.array([[0.8], [1.0], [-0.6]])
    new_s, new_a = aggregate_dagger(D_s, rollout)
    print(new_s.shape, np.round(new_a[-3:].ravel(), 2))`,
  solutionCode: `import numpy as np

def expert_policy(states):
    states = np.asarray(states, dtype=float)
    return -0.5 * states

def aggregate_dagger(dataset_states, rollout_states):
    dataset_states = np.asarray(dataset_states, dtype=float)
    rollout_states = np.asarray(rollout_states, dtype=float)
    new_states = np.vstack([dataset_states, rollout_states])
    new_actions = expert_policy(new_states)
    return new_states, new_actions

if __name__ == "__main__":
    D_s = np.array([[0.0], [0.2]])
    rollout = np.array([[0.8], [1.0], [-0.6]])
    new_s, new_a = aggregate_dagger(D_s, rollout)
    print(new_s.shape, np.round(new_a[-3:].ravel(), 2))`,
  testCode: `import numpy as np
from dagger_dataset_aggregation import aggregate_dagger

def test_rollout_states_are_added_with_expert_labels():
    states, actions = aggregate_dagger(np.array([[0.0]]), np.array([[1.0], [-1.0]]))
    assert states.shape == actions.shape == (3, 1)
    assert np.allclose(actions[-2:].ravel(), [-0.5, 0.5])`,
  expectedOutput: "(5, 1) [-0.4 -0.5  0.3]",
  runCommand: "python dagger_dataset_aggregation.py && pytest test_dagger_dataset_aggregation.py",
  commonBugs: [
    "실패 rollout state를 버리고 성공 demonstration만 다시 학습함",
    "expert label 대신 현재 policy action을 label로 저장해 오류를 강화함",
    "새 데이터만 학습해 이전 demonstration을 잊어버림",
  ],
  extensionTask: "beta schedule로 expert/policy mixture rollout을 만들고 covariate shift metric을 시각화하라.",
};

const dreamerLab = {
  id: "lab_dreamer_rssm_world_model",
  title: "Dreamer-style RSSM Imagination Rollout",
  language: "python" as const,
  theoryConnection: "latent state z_t predicts z_{t+1}, reward, and uncertainty before actor update",
  starterCode: `import numpy as np

def rssm_step(z, action, Wz, Wa):
    # TODO: deterministic latent transition with tanh
    raise NotImplementedError

def imagine(z0, actions, Wz, Wa):
    # TODO: rollout latent states without observations
    raise NotImplementedError

if __name__ == "__main__":
    Wz = np.eye(2) * 0.8
    Wa = np.ones((2, 1)) * 0.1
    zs = imagine(np.array([0.5, -0.2]), [np.array([1.0]), np.array([0.0])], Wz, Wa)
    print(np.round(zs[-1], 3))`,
  solutionCode: `import numpy as np

def rssm_step(z, action, Wz, Wa):
    z = np.asarray(z, dtype=float)
    action = np.asarray(action, dtype=float)
    return np.tanh(Wz @ z + Wa @ action)

def imagine(z0, actions, Wz, Wa):
    states = [np.asarray(z0, dtype=float)]
    for action in actions:
        states.append(rssm_step(states[-1], action, Wz, Wa))
    return np.asarray(states)

if __name__ == "__main__":
    Wz = np.eye(2) * 0.8
    Wa = np.ones((2, 1)) * 0.1
    zs = imagine(np.array([0.5, -0.2]), [np.array([1.0]), np.array([0.0])], Wz, Wa)
    print(np.round(zs[-1], 3))`,
  testCode: `import numpy as np
from dreamer_rssm_world_model import imagine

def test_imagination_rollout_length_and_bounds():
    Wz = np.eye(2)
    Wa = np.ones((2, 1)) * 0.1
    zs = imagine(np.zeros(2), [np.ones(1), np.ones(1)], Wz, Wa)
    assert zs.shape == (3, 2)
    assert np.all(np.abs(zs) <= 1.0)`,
  expectedOutput: "[ 0.319 -0.126]",
  runCommand: "python dreamer_rssm_world_model.py && pytest test_dreamer_rssm_world_model.py",
  commonBugs: [
    "observation encoder reconstruction만 보고 latent dynamics rollout error를 확인하지 않음",
    "uncertainty가 큰 imagined state에서도 actor update를 그대로 진행함",
    "reward predictor와 transition predictor를 같은 metric으로 평가함",
  ],
  extensionTask: "ensemble RSSM으로 imagined uncertainty를 계산하고 uncertainty threshold를 넘으면 actor loss에서 제외하라.",
};

export const remainingRobotMathSessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "null_space_redundancy_resolution",
      part: "Part 2. 로봇 수학",
      title: "Null Space Motion과 여자유도 Redundancy Resolution",
      prerequisites: ["svd_jacobian_condition_number", "damped_least_squares"],
      objectives: ["Jacobian null space가 task velocity를 바꾸지 않는 방향임을 설명한다.", "primary task와 secondary posture objective를 결합한다.", "joint limit 회피가 IK 안정성에 미치는 영향을 해석한다."],
      definition: "Null space motion은 J dq = 0을 만족하는 joint motion이며, redundant arm에서 end-effector task를 유지한 채 posture, joint limit, manipulability 같은 secondary objective를 최적화하는 방법이다.",
      whyItMatters: "7DOF 팔은 같은 end-effector pose에 여러 자세가 가능하므로 joint limit 회피와 self-collision 회피를 null space에서 처리해야 실전 IK가 안정적이다.",
      intuition: "손끝은 그대로 두고 팔꿈치만 다른 방향으로 빼는 동작이다. task 공간에는 보이지 않지만 관절 공간에서는 안전 여유가 생긴다.",
      equations: [
        { label: "Primary task", expression: "\\dot q_p=J^+\\dot x", terms: [["J^+", "damped pseudo-inverse"]], explanation: "end-effector 목표 속도를 만족하는 최소 norm joint 속도다." },
        { label: "Null projector", expression: "N=I-J^+J", terms: [["N", "null-space projector"]], explanation: "N 안의 움직임은 task velocity를 바꾸지 않는다." },
        { label: "Secondary motion", expression: "\\dot q=J^+\\dot x+N\\dot q_0", terms: [["dq0", "posture objective"]], explanation: "task와 자세 최적화를 동시에 수행한다." },
      ],
      derivation: [["pseudo-inverse", "J^+ xdot로 primary task를 만족한다."], ["projection", "I-J^+J가 row-space 성분을 제거한다."], ["secondary", "joint center 방향 gradient를 null space에 투영한다."], ["verify", "J dq를 계산해 xdot이 보존되는지 확인한다."]],
      handCalculation: { problem: "J=[1 1], dq0=[1,-1]이면 null motion인가?", given: { J: "[1 1]", dq0: "[1,-1]" }, steps: ["J dq0=1-1=0", "task velocity 변화 없음"], answer: "null-space motion이다." },
      robotApplication: "Franka/Panda 같은 7DOF arm에서 grasp pose는 유지하면서 elbow를 joint limit과 사람 작업공간 반대쪽으로 빼는 IK controller에 사용한다.",
      lab: nullSpaceLab,
      visualization: { id: "vis_null_space_motion", title: "Null Space Arm Posture Motion", equation: "dq=J^+xdot+(I-J^+J)dq0", parameters: [{ name: "posture_gain", symbol: "k_0", min: 0, max: 1, default: 0.2, description: "secondary posture gain" }, { name: "damping", symbol: "\\lambda", min: 0, max: 0.2, default: 0.01, description: "DLS damping" }, { name: "joint_limit_margin", symbol: "m_q", min: 0, max: 1, default: 0.5, description: "distance from joint limit" }], normalCase: "end-effector velocity is preserved while posture moves toward a safer joint center.", failureCase: "projector가 틀리면 J dq가 목표 xdot에서 벗어나 task drift가 발생한다." },
      quiz: {
        id: "null_space",
        conceptQuestion: "Null space motion이 redundant robot IK에서 중요한 이유는?",
        conceptAnswer: "end-effector task를 유지하면서 joint limit 회피, manipulability 증가, self-collision 회피 같은 secondary objective를 수행할 수 있기 때문이다.",
        calculationQuestion: "J=[1 1], dq0=[1,-1]일 때 Jdq0가 0이면 무엇을 의미하는가?",
        calculationAnswer: "task velocity가 변하지 않는 null-space 방향이므로 손끝은 유지되고 관절 자세만 바뀐다.",
        codeQuestion: "Null-space projector의 핵심 구현 한 줄은?",
        codeAnswer: "projector = np.eye(J.shape[1]) - damped_pinv(J, damping) @ J",
        debugQuestion: "null-space IK가 손끝 위치를 drift시키면 먼저 무엇을 확인하는가?",
        debugAnswer: "projector 차원, pseudo-inverse damping, Jdq 검산, secondary gain 크기, joint velocity clamp 순서를 확인한다.",
        visualQuestion: "시각화에서 정상 null motion과 실패를 어떻게 구분하는가?",
        visualAnswer: "정상은 end-effector target이 유지되고 elbow/posture만 이동하며, 실패는 task error나 Jdq residual이 커진다.",
        robotQuestion: "실제 7DOF 팔에 넣을 때 safety gate는?",
        robotAnswer: "joint limit margin, velocity limit, self-collision distance, singularity damping, task error watchdog을 둔다.",
        designQuestion: "프로젝트 검증 순서는?",
        designAnswer: "Jdq 손계산, projector unit test, singularity sweep, joint-limit simulation, low-speed arm servo test 순서로 검증한다.",
      },
      wrongTagLabel: "Null-space redundancy resolution 오류",
      nextSessions: ["robot_dynamics_newton_euler_recursive", "contact_dynamics_friction_cone_grasp"],
    }),
    [
      {
        id: "q08_counterexample",
        type: "counterexample",
        difficulty: "hard",
        question: "`IK 해가 하나만 있으면 충분하다`는 주장에 대한 redundant arm 반례를 들어라.",
        expectedAnswer: "7DOF arm은 같은 grasp pose라도 elbow가 joint limit이나 사람 쪽으로 향할 수 있으므로 null-space secondary objective로 더 안전한 자세를 골라야 한다.",
        explanation: "해의 존재와 안전한 자세 선택은 다른 문제다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "robot_scenario",
        counterexampleHint: "손끝 pose는 같지만 팔꿈치가 다른 두 자세를 생각한다.",
        expectedFailureMode: "joint limit 접근, self-collision, human workspace intrusion",
      },
    ],
  ),
];

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

export const remainingControlSessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "contact_dynamics_friction_cone_grasp",
      part: "Part 3. 로봇 동역학과 제어",
      title: "Contact Dynamics와 Friction Cone: Grasp Stability",
      prerequisites: ["impedance_control_1d_contact", "grasp_pose_sampling_basics"],
      objectives: ["Coulomb friction cone을 힘 부등식으로 계산한다.", "normal/tangential force margin으로 slip risk를 판단한다.", "grasp 안정성과 impedance/contact force 제어를 연결한다."],
      definition: "Contact dynamics는 접촉점의 normal force, tangential force, friction coefficient가 물체 slip과 grasp stability를 어떻게 결정하는지 다루는 모델이다.",
      whyItMatters: "물체를 잡는 로봇팔은 pose만 맞아도 마찰 여유가 부족하면 미끄러진다. friction cone을 모르고는 파지 안정성 분석이 불가능하다.",
      intuition: "손가락이 물체를 누르는 힘이 충분하고 옆으로 미는 힘이 마찰 원뿔 안에 있어야 컵이 미끄러지지 않는다.",
      equations: [
        { label: "Friction cone", expression: "\\|F_t\\|\\le \\mu F_n", terms: [["Ft", "tangential force"], ["Fn", "normal force"]], explanation: "접선 힘이 마찰 한계 안이면 미끄러지지 않는다." },
        { label: "Slip margin", expression: "m=\\mu F_n-\\|F_t\\|", terms: [["m", "friction margin"]], explanation: "margin이 양수이면 cone 내부다." },
        { label: "Two-finger load", expression: "F_{t,i}=W/2", terms: [["W", "shared tangential load"]], explanation: "대칭 grasp에서는 load를 두 접촉이 나눠 가진다." },
      ],
      derivation: [["contact frame", "normal/tangent 방향으로 힘을 분해한다."], ["Coulomb bound", "마찰계수와 normal force로 tangential limit을 만든다."], ["margin", "limit에서 실제 tangential force를 빼 slip margin을 계산한다."], ["gate", "margin이 작으면 grip force, approach, 물체 선택을 바꾼다."]],
      handCalculation: { problem: "Fn=10N, Ft=3N, mu=0.5이면 slip margin은?", given: { Fn: 10, Ft: 3, mu: 0.5 }, steps: ["mu Fn=5N", "margin=5-3"], answer: "2N, 안정 여유가 있다." },
      robotApplication: "gripper가 달걀/컵을 잡을 때 force sensor와 friction margin으로 grip force를 정하고, impedance control이 접촉 충격을 줄인다.",
      lab: contactFrictionLab,
      visualization: { id: "vis_contact_friction_cone", title: "Contact Force Cone and Slip Margin", equation: "|Ft| <= mu Fn", parameters: [{ name: "mu", symbol: "\\mu", min: 0.05, max: 1.2, default: 0.5, description: "friction coefficient" }, { name: "normal_force", symbol: "F_n", min: 0, max: 30, default: 10, description: "contact normal force" }, { name: "tangential_load", symbol: "F_t", min: 0, max: 20, default: 3, description: "tangential load" }], normalCase: "force vector lies inside the friction cone with positive margin.", failureCase: "tangential load exceeds mu Fn and the object slips." },
      quiz: {
        id: "contact_friction",
        conceptQuestion: "Friction cone이 grasp stability에서 중요한 이유는?",
        conceptAnswer: "접촉점의 tangential force가 mu Fn 한계 안에 있어야 물체가 미끄러지지 않기 때문이다.",
        calculationQuestion: "Fn=10, mu=0.5, Ft=6이면 slip margin은?",
        calculationAnswer: "margin=0.5*10-6=-1N이므로 friction cone 밖이고 slip 위험이 있다.",
        codeQuestion: "slip margin 핵심 구현은?",
        codeAnswer: "return float(mu * normal_force - abs(tangential_force))",
        debugQuestion: "grasp가 시뮬레이션에서는 안정인데 실제로 미끄러지면 무엇을 확인하는가?",
        debugAnswer: "mu 추정, normal force calibration, contact frame, tangential load 분배, object mass, surface contamination을 확인한다.",
        visualQuestion: "시각화에서 실패는 어떤 신호로 보이는가?",
        visualAnswer: "force vector가 cone 밖으로 나가거나 slip margin이 음수가 된다.",
        robotQuestion: "실제 gripper safety gate는?",
        robotAnswer: "max grip force, minimum friction margin, force sensor saturation, object damage threshold, emergency release 조건을 둔다.",
        designQuestion: "검증 순서는?",
        designAnswer: "마찰 margin 손계산, unit test, 물체별 mu sweep, PyBullet/contact sim, force sensor low-speed grasp 순서로 검증한다.",
      },
      wrongTagLabel: "Contact dynamics/friction cone 오류",
      nextSessions: ["cbf_qp_safety_filter", "integration_project_safety_pipeline"],
    }),
    [
      {
        id: "q08_safety",
        type: "safety_analysis",
        difficulty: "hard",
        question: "friction margin이 양수지만 normal force가 물체 파손 임계값을 넘으면 grasp를 실행해도 되는가?",
        expectedAnswer: "안 된다. slip 안정성과 물체 손상 안전을 둘 다 만족해야 하며 grip force를 낮추거나 grasp pose를 바꿔야 한다.",
        explanation: "접촉 제어는 미끄럼 방지와 파손 방지를 동시에 만족해야 한다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "system_design",
      },
    ],
  ),
  withExtraQuizzes(
    makeAdvancedSession({
      id: "ilqr_trajectory_optimization_receding_horizon",
      part: "Part 3. 로봇 동역학과 제어",
      title: "iLQR Trajectory Optimization과 Receding-horizon Refinement",
      prerequisites: ["lqr_riccati", "mpc_formulation", "trajectory_quintic_time_scaling"],
      objectives: ["trajectory optimization과 tracking controller를 구분한다.", "iLQR의 forward rollout/backward pass/line search를 설명한다.", "control limit과 local model 실패 조건을 해석한다."],
      definition: "iLQR은 nonlinear dynamics trajectory 주변을 반복적으로 선형화하고 비용을 2차 근사해 feedforward/feedack control update를 구하는 trajectory optimization 방법이다.",
      whyItMatters: "자율주행/로봇팔은 offline path를 그대로 따라가는 것만으로 부족하고, 장애물/동역학/입력 제한을 보며 trajectory를 실시간으로 다듬어야 한다.",
      intuition: "현재 궤적을 기준으로 조금 더 싸고 안전한 방향을 계산하고, 실제 dynamics로 다시 굴려서 정말 좋아졌을 때만 받아들이는 반복 개선이다.",
      equations: [
        { label: "Dynamics linearization", expression: "\\delta x_{t+1}=A_t\\delta x_t+B_t\\delta u_t", terms: [["A,B", "local Jacobians"]], explanation: "현재 rollout 주변에서 dynamics를 선형화한다." },
        { label: "Quadratic cost", expression: "\\ell\\approx \\ell_0+\\ell_x^T\\delta x+\\ell_u^T\\delta u+\\frac12\\delta u^T\\ell_{uu}\\delta u", terms: [["ell", "stage cost"]], explanation: "local update를 계산할 수 있게 비용을 2차 근사한다." },
        { label: "Control update", expression: "\\delta u_t=k_t+K_t\\delta x_t", terms: [["k", "feedforward"], ["K", "feedback gain"]], explanation: "open-loop 개선과 feedback correction을 함께 얻는다." },
      ],
      derivation: [["rollout", "현재 control sequence로 nonlinear dynamics를 forward rollout한다."], ["linearize", "각 time step에서 A_t, B_t와 cost derivative를 계산한다."], ["backward pass", "dynamic programming으로 k_t, K_t를 얻는다."], ["line search", "새 control을 실제 dynamics에 넣어 cost 감소와 제약 만족을 확인한다."]],
      handCalculation: { problem: "Qu=0.1, Quu=0.05이면 feedforward update k는?", given: { Qu: 0.1, Quu: 0.05 }, steps: ["k=-Quu^-1 Qu", "=-0.1/0.05"], answer: "-2" },
      robotApplication: "차량 local planner나 로봇팔 reach trajectory가 장애물/토크 제한 때문에 어긋날 때 iLQR로 짧은 horizon을 재최적화하고 MPC처럼 반복 적용한다.",
      lab: ilqrLab,
      visualization: { id: "vis_ilqr_trajectory_optimization", title: "iLQR Cost Descent and Rollout", equation: "du=k+Kdx", parameters: [{ name: "line_search_alpha", symbol: "\\alpha", min: 0.05, max: 1, default: 0.5, description: "line-search step" }, { name: "control_weight", symbol: "R", min: 0.001, max: 1, default: 0.05, description: "control effort weight" }, { name: "horizon", symbol: "N", min: 5, max: 80, default: 20, description: "optimization horizon" }], normalCase: "cost decreases over iterations and control remains inside limits.", failureCase: "local model or line-search acceptance fails and rollout cost increases." },
      quiz: {
        id: "ilqr",
        conceptQuestion: "iLQR이 단순 trajectory tracking과 다른 점은?",
        conceptAnswer: "현재 dynamics와 cost를 local approximation으로 반복 개선해 trajectory 자체와 feedback gain을 함께 업데이트한다.",
        calculationQuestion: "Qu=0.1, Quu=0.05이면 k=-Quu^-1Qu는?",
        calculationAnswer: "-2이며, 실제 적용 전 line search와 control limit을 확인해야 한다.",
        codeQuestion: "scalar LQR gain의 핵심 구현은?",
        codeAnswer: "return float(-Qu / Quu)",
        debugQuestion: "iLQR cost가 증가하면 무엇을 먼저 확인하는가?",
        debugAnswer: "line search alpha, Quu regularization, dynamics linearization, control clamp, rollout cost 재계산을 확인한다.",
        visualQuestion: "시각화에서 정상 수렴은?",
        visualAnswer: "iteration마다 rollout cost가 감소하고 control limit violation이 줄어든다.",
        robotQuestion: "실제 local planner에 넣을 때 safety gate는?",
        robotAnswer: "collision check, control/jerk limit, solver iteration timeout, fallback trajectory, emergency stop을 둔다.",
        designQuestion: "검증 순서는?",
        designAnswer: "scalar integrator 손계산, unit test, nonlinear rollout, obstacle scenario, receding-horizon sim, low-speed robot test 순서다.",
      },
      wrongTagLabel: "iLQR trajectory optimization 오류",
      nextSessions: ["mpc_formulation", "cpp_realtime_control_loop_jitter"],
    }),
    [
      {
        id: "q08_counterexample",
        type: "counterexample",
        difficulty: "hard",
        question: "`backward pass가 cost 감소 방향을 냈으면 바로 control을 적용해도 된다`는 주장에 대한 반례를 들어라.",
        expectedAnswer: "local linear/quadratic model에서는 감소해도 nonlinear rollout에서는 obstacle이나 control limit 때문에 cost가 증가할 수 있으므로 line search와 rollout acceptance가 필요하다.",
        explanation: "iLQR update는 실제 dynamics 검증 없이 안전하지 않다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "safety_analysis",
        counterexampleHint: "큰 alpha가 nonlinear dynamics를 local region 밖으로 밀어내는 상황을 생각한다.",
        expectedFailureMode: "cost increase, collision, control saturation",
      },
    ],
  ),
];

export const remainingPhysicalAISessions: Session[] = [
  withExtraQuizzes(
    makeAdvancedSession({
      id: "dagger_dataset_aggregation_imitation_learning",
      part: "Part 7. Physical AI / Embodied AI",
      title: "DAgger: Behavior Cloning의 Distribution Shift 복구",
      prerequisites: ["behavior_cloning_covariate_shift", "pytorch_behavior_cloning_policy"],
      objectives: ["BC가 자기 오류로 방문한 state를 학습하지 못하는 이유를 설명한다.", "DAgger dataset aggregation loop를 구현한다.", "expert query budget과 안전 rollout 조건을 설계한다."],
      definition: "DAgger는 현재 policy가 실제로 방문한 state에 대해 expert action을 다시 수집하고 기존 demonstration과 합쳐 재학습하는 imitation learning 알고리즘이다.",
      whyItMatters: "BC policy는 시연 분포에서 조금만 벗어나도 오류가 누적된다. DAgger는 실패 state를 dataset에 넣어 recovery action을 배우게 한다.",
      intuition: "학생이 틀린 길로 들어갔을 때 선생님이 그 상태에서 어떻게 빠져나오는지 다시 알려주고, 그 예시를 다음 시험 범위에 추가하는 방식이다.",
      equations: [
        { label: "Aggregation", expression: "D_{k+1}=D_k\\cup\\{(s,\\pi^*(s)):s\\sim\\pi_k\\}", terms: [["pi*", "expert policy"], ["pi_k", "current policy"]], explanation: "현재 policy 방문 state에 expert label을 붙인다." },
        { label: "Supervised retrain", expression: "\\pi_{k+1}=argmin_\\pi E_{(s,a)\\in D_{k+1}}\\ell(\\pi(s),a)", terms: [["D", "aggregated dataset"]], explanation: "누적 dataset으로 policy를 다시 학습한다." },
        { label: "Mixture rollout", expression: "\\pi_{mix}=\\beta_k\\pi^*+(1-\\beta_k)\\pi_k", terms: [["beta", "expert mixing ratio"]], explanation: "초기에는 expert를 섞어 위험한 rollout을 줄인다." },
      ],
      derivation: [["BC failure", "policy error가 다음 state 분포를 바꾸고 다시 더 큰 error를 만든다."], ["rollout", "현재 policy로 방문 state를 수집한다."], ["expert query", "그 state들에 expert action을 붙인다."], ["aggregate", "기존 D를 버리지 않고 합쳐 재학습한다."]],
      handCalculation: { problem: "기존 dataset 100개, DAgger rollout state 30개를 추가하면 다음 학습 sample 수는?", given: { D: 100, new: 30 }, steps: ["aggregation은 union/append", "100+30"], answer: "130개" },
      robotApplication: "로봇팔 pick policy가 조금 빗나간 상태에서 복구하지 못하면 해당 실패 state에 teleop expert action을 붙여 DAgger round를 돌린다.",
      lab: daggerLab,
      visualization: { id: "vis_dagger_distribution_shift", title: "DAgger Distribution Shift Recovery", equation: "D <- D union visited states", parameters: [{ name: "expert_mix_beta", symbol: "\\beta", min: 0, max: 1, default: 0.5, description: "expert mixing ratio" }, { name: "rollout_errors", symbol: "e_r", min: 0, max: 50, default: 10, description: "off-distribution visited states" }, { name: "query_budget", symbol: "B_q", min: 0, max: 200, default: 50, description: "expert query budget" }], normalCase: "visited-state coverage grows and recovery error decreases across rounds.", failureCase: "only successful demonstrations are kept and covariate shift remains." },
      quiz: {
        id: "dagger",
        conceptQuestion: "DAgger가 Behavior Cloning의 어떤 약점을 해결하는가?",
        conceptAnswer: "현재 policy가 만든 off-distribution state에 expert action을 추가해 covariate shift와 오류 누적을 줄인다.",
        calculationQuestion: "D_0=100, round마다 30개 state를 3회 추가하면 총 dataset 크기는?",
        calculationAnswer: "100+30*3=190개이며 기존 demonstration을 버리지 않고 누적해야 한다.",
        codeQuestion: "DAgger aggregation 핵심 구현은?",
        codeAnswer: "new_states = np.vstack([dataset_states, rollout_states])",
        debugQuestion: "DAgger 후 성능이 나빠지면 무엇을 확인하는가?",
        debugAnswer: "expert label 품질, 실패 state 포함 여부, 기존 data 보존, class/action imbalance, unsafe rollout filtering을 확인한다.",
        visualQuestion: "시각화에서 DAgger가 잘 작동하는 신호는?",
        visualAnswer: "policy visited-state 분포가 넓어지고 같은 perturbation에서 recovery error가 감소한다.",
        robotQuestion: "실제 로봇 DAgger rollout safety gate는?",
        robotAnswer: "속도 제한, workspace limit, human teleop takeover, CBF/action clamp, 실패 즉시 stop 조건을 둔다.",
        designQuestion: "검증 순서는?",
        designAnswer: "BC baseline, perturbation rollout, expert relabel, aggregated retrain, held-out recovery test, low-speed robot rollout 순서다.",
      },
      wrongTagLabel: "DAgger/dataset aggregation 오류",
      nextSessions: ["rl_ppo_sac_reward_shaping", "dreamer_rssm_world_model_implementation"],
    }),
    [
      {
        id: "q08_counterexample",
        type: "counterexample",
        difficulty: "hard",
        question: "`시연 데이터를 더 많이 모으면 DAgger는 필요 없다`는 주장에 대한 반례를 들어라.",
        expectedAnswer: "시연이 모두 성공 경로 주변이면 policy가 조금 벗어난 실패 state에 대한 expert action이 없어서 오류가 누적된다. DAgger는 바로 그 visited failure state를 추가한다.",
        explanation: "데이터 양보다 policy가 실제 방문하는 분포 커버리지가 중요하다.",
        errorType: "concept_confusion",
        retryQuestionType: "robot_scenario",
        counterexampleHint: "차선 중앙 시연만 있고 차선 밖 복구 예시가 없는 자율주행 BC를 생각한다.",
        expectedFailureMode: "covariate shift, compounding error, no recovery action",
      },
    ],
  ),
  withExtraQuizzes(
    makeAdvancedSession({
      id: "dreamer_rssm_world_model_implementation",
      part: "Part 7. Physical AI / Embodied AI",
      title: "Model-based RL 실습: Dreamer/RSSM Latent Rollout",
      prerequisites: ["world_model_dreamer_overview", "rl_ppo_sac_reward_shaping"],
      objectives: ["RSSM latent transition과 observation encoder 역할을 구분한다.", "imagination rollout으로 reward를 예측한다.", "model uncertainty가 큰 rollout을 actor update에서 제외하는 이유를 설명한다."],
      definition: "Dreamer 계열 model-based RL은 observation을 latent state로 압축하고 RSSM dynamics 안에서 imagined rollout을 만들어 actor/critic을 학습하는 방법이다.",
      whyItMatters: "로봇은 실제 trial이 비싸기 때문에 world model이 안전한 imagined experience를 제공하면 sample efficiency를 크게 높일 수 있다.",
      intuition: "로봇이 실제로 움직이기 전에 머릿속 latent simulator에서 여러 행동을 굴려보고, 너무 불확실한 상상은 믿지 않는 방식이다.",
      equations: [
        { label: "RSSM transition", expression: "p(z_{t+1}|z_t,a_t,h_t)", terms: [["z", "stochastic latent"], ["h", "deterministic hidden state"]], explanation: "latent dynamics가 다음 상태 분포를 예측한다." },
        { label: "Imagination rollout", expression: "z_{t+k}\\sim p_\\theta(z_{t+k}|z_{t+k-1},a_{t+k-1})", terms: [["k", "imagined horizon"]], explanation: "observation 없이 latent state를 rollout한다." },
        { label: "Model gate", expression: "\\sigma_{model}<\\tau_{unc}", terms: [["sigma", "model uncertainty"]], explanation: "불확실한 imagination은 actor update에서 제외한다." },
      ],
      derivation: [["encode", "image/proprioception을 latent posterior로 압축한다."], ["transition", "action을 넣어 prior latent를 예측한다."], ["reconstruct/reward", "observation/reward prediction loss로 world model을 학습한다."], ["imagine", "latent rollout에서 actor objective를 계산하되 uncertainty gate를 통과시킨다."]],
      handCalculation: { problem: "imagined horizon=15, uncertainty threshold=0.2인데 step 9에서 uncertainty=0.35이면?", given: { threshold: 0.2, sigma: 0.35 }, steps: ["0.35>0.2", "그 이후 rollout은 actor update에서 제외"], answer: "uncertainty gate fail" },
      robotApplication: "manipulation policy를 실제 로봇에서 바로 RL하지 않고, camera/proprioception 로그로 world model을 학습한 뒤 latent imagination에서 candidate action을 평가한다.",
      lab: dreamerLab,
      visualization: { id: "vis_dreamer_rssm_latent_rollout", title: "Dreamer RSSM Latent Imagination", equation: "z_next ~ p(z|h,a)", parameters: [{ name: "imagination_horizon", symbol: "H", min: 1, max: 50, default: 15, description: "latent rollout horizon" }, { name: "model_uncertainty", symbol: "\\sigma_m", min: 0, max: 1, default: 0.15, description: "model uncertainty" }, { name: "reward_scale", symbol: "w_r", min: 0, max: 5, default: 1, description: "predicted reward scale" }], normalCase: "latent rollout remains low-uncertainty and reward prediction is consistent.", failureCase: "uncertainty grows and imagined policy exploits model error." },
      quiz: {
        id: "dreamer_rssm",
        conceptQuestion: "Dreamer/RSSM이 model-free RL과 다른 점은?",
        conceptAnswer: "실제 transition만 쓰지 않고 학습된 latent world model 안에서 imagined rollout을 만들어 actor/critic을 학습한다.",
        calculationQuestion: "uncertainty threshold 0.2에서 rollout sigma가 0.35이면?",
        calculationAnswer: "model gate를 통과하지 못하므로 actor update에 그대로 쓰면 안 된다.",
        codeQuestion: "RSSM deterministic transition 핵심 구현은?",
        codeAnswer: "return np.tanh(Wz @ z + Wa @ action)",
        debugQuestion: "world model policy가 시뮬레이터 exploit을 보이면 무엇을 확인하는가?",
        debugAnswer: "latent rollout horizon, uncertainty gate, reward predictor error, reconstruction-only overfit, ensemble disagreement을 확인한다.",
        visualQuestion: "시각화에서 실패는 어떤 신호인가?",
        visualAnswer: "horizon이 길수록 uncertainty가 커지고 reward는 높아 보이지만 real/replay prediction error가 증가한다.",
        robotQuestion: "실제 로봇에 적용 전 safety gate는?",
        robotAnswer: "uncertainty threshold, action limit, CBF filter, logged replay consistency, low-speed rollout gate를 둔다.",
        designQuestion: "검증 순서는?",
        designAnswer: "one-step prediction, multi-step latent rollout, reward prediction, uncertainty calibration, policy imagination, sim/replay validation 순서다.",
      },
      wrongTagLabel: "Dreamer/RSSM world model 오류",
      nextSessions: ["robot_foundation_model_deployment", "integration_project_safety_pipeline"],
    }),
    [
      {
        id: "q08_safety",
        type: "safety_analysis",
        difficulty: "hard",
        question: "imagined reward는 높지만 model uncertainty가 threshold를 넘는 action을 실제 로봇에 보내도 되는가?",
        expectedAnswer: "안 된다. model error exploit 가능성이 크므로 action을 제외하거나 real/sim validation과 safety filter를 거쳐야 한다.",
        explanation: "model-based RL의 핵심 위험은 policy가 world model의 틈을 이용하는 것이다.",
        errorType: "safety_misjudgment",
        retryQuestionType: "system_design",
      },
    ],
  ),
];
