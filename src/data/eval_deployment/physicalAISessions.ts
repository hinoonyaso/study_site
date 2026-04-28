import type { Session } from "../../types";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "../core/v2SessionHelpers";

const bcLab = ensureCodeLabShape({
  id: "lab_behavior_cloning_policy",
  title: "Behavior Cloning Simple Policy",
  language: "python",
  theoryConnection: "min_theta mean ||pi_theta(o)-a||^2",
  starterCode: `import numpy as np

def fit_linear_policy(observations, actions):
    # TODO: append bias column to observations
    # TODO: solve least squares for W
    raise NotImplementedError

def predict(W, observation):
    # TODO: append bias and compute action
    raise NotImplementedError

if __name__ == "__main__":
    obs = np.array([[0.0], [1.0], [2.0]])
    act = np.array([[0.0], [2.0], [4.0]])
    W = fit_linear_policy(obs, act)
    print(round(float(predict(W, np.array([3.0]))), 3))`,
  solutionCode: `import numpy as np

def fit_linear_policy(observations, actions):
    X = np.column_stack([observations, np.ones((len(observations), 1))])
    W, *_ = np.linalg.lstsq(X, actions, rcond=None)
    return W

def predict(W, observation):
    x = np.append(np.asarray(observation, dtype=float), 1.0)
    return x @ W

if __name__ == "__main__":
    obs = np.array([[0.0], [1.0], [2.0]])
    act = np.array([[0.0], [2.0], [4.0]])
    W = fit_linear_policy(obs, act)
    print(round(float(predict(W, np.array([3.0]))), 3))`,
  testCode: `import numpy as np
from behavior_cloning_policy import fit_linear_policy, predict

def test_linear_demo():
    obs = np.array([[0.0], [1.0], [2.0]])
    act = np.array([[0.0], [2.0], [4.0]])
    W = fit_linear_policy(obs, act)
    assert abs(float(predict(W, np.array([3.0]))) - 6.0) < 1e-9

def test_bias_demo():
    obs = np.array([[0.0], [1.0]])
    act = np.array([[1.0], [3.0]])
    W = fit_linear_policy(obs, act)
    assert abs(float(predict(W, np.array([2.0]))) - 5.0) < 1e-9

def test_output_shape():
    W = fit_linear_policy(np.array([[0.0], [1.0]]), np.array([[0.0], [1.0]]))
    assert predict(W, np.array([0.5])).shape == (1,)`,
  expectedOutput: "6.0",
  runCommand: "python behavior_cloning_policy.py && pytest test_behavior_cloning_policy.py",
  commonBugs: ["bias 항을 빼먹어 offset action을 못 맞춤", "observation-action pair 순서를 shuffle하며 깨뜨림", "train distribution 밖 observation에서 실패를 평가하지 않음"],
  extensionTask: "demo 범위 밖 observation=5.0에서 policy가 어떻게 extrapolate하는지 시각화하고 covariate shift를 설명하라.",
});

const sim2realLab = ensureCodeLabShape({
  id: "lab_domain_randomization",
  title: "Sim2Real Domain Randomization Sweep",
  language: "python",
  theoryConnection: "train over p(phi): E_phi[L(pi, phi)]",
  starterCode: `import random

def randomized_friction_trials(n, low, high):
    # TODO: sample n friction values uniformly
    # TODO: return pass rate for policy that succeeds when 0.4 <= mu <= 0.9
    raise NotImplementedError

if __name__ == "__main__":
    random.seed(0)
    print(round(randomized_friction_trials(1000, 0.2, 1.2), 2))`,
  solutionCode: `import random

def randomized_friction_trials(n, low, high):
    if n <= 0:
        raise ValueError("n must be positive")
    passed = 0
    for _ in range(n):
        mu = random.uniform(low, high)
        if 0.4 <= mu <= 0.9:
            passed += 1
    return passed / n

if __name__ == "__main__":
    random.seed(0)
    print(round(randomized_friction_trials(1000, 0.2, 1.2), 2))`,
  testCode: `import random
import pytest
from domain_randomization import randomized_friction_trials

def test_seeded_rate():
    random.seed(0)
    assert abs(randomized_friction_trials(1000, 0.2, 1.2) - 0.49) < 0.04

def test_all_inside():
    random.seed(1)
    assert randomized_friction_trials(100, 0.5, 0.8) == 1.0

def test_invalid_n():
    with pytest.raises(ValueError):
        randomized_friction_trials(0, 0.2, 1.2)`,
  expectedOutput: "0.49",
  runCommand: "python domain_randomization.py && pytest test_domain_randomization.py",
  commonBugs: ["randomization 범위를 실제 하드웨어보다 좁게 잡음", "seed를 저장하지 않아 실험 재현이 안 됨", "성공률만 보고 실패 원인 로그를 저장하지 않음"],
  extensionTask: "friction, camera noise, actuator delay를 2D/3D sweep으로 바꿔 실패 원인 표를 작성하라.",
});

export const physicalAISessions: Session[] = [
  session({
    id: "behavior_cloning_physical_ai",
    part: "Part 7. Physical AI / Embodied AI",
    title: "Behavior Cloning for Physical AI",
    level: "intermediate",
    prerequisites: ["policy", "least_squares", "object_detection_iou_nms"],
    learningObjectives: ["demonstration dataset을 observation-action pair로 정의한다.", "supervised learning으로 policy를 학습한다.", "covariate shift와 DAgger 필요성을 설명한다."],
    theory: {
      definition: "Behavior Cloning은 전문가 demonstration의 observation-action pair를 지도학습 데이터로 보고 policy pi_theta(a|o)를 학습하는 imitation learning 방법이다.",
      whyItMatters: "로봇에게 직접 reward를 설계하기 어려운 조작, 주행, pick-place 작업에서 사람/전문가 궤적을 빠르게 policy로 옮긴다.",
      intuition: "운전 선생님의 핸들 조작 기록을 보고, 비슷한 화면이 들어오면 비슷한 조작을 내도록 따라 배우는 방식이다.",
      equations: [
        makeEquation("BC objective", "\\min_\\theta \\frac{1}{N}\\sum_i ||\\pi_\\theta(o_i)-a_i||^2", [["o_i", "observation"], ["a_i", "expert action"], ["\\pi_\\theta", "학습 policy"]], "연속 action에서는 MSE supervised learning이 기본 형태다."),
        makeEquation("Stochastic policy", "\\pi_\\theta(a|o)", [["a", "action"], ["o", "observation"]], "같은 observation에서도 action 분포를 낼 수 있다."),
      ],
      derivation: [
        step("dataset 정의", "D={(o_i,a_i)} 형태로 demonstration을 저장한다."),
        step("policy 함수 선택", "linear model, MLP, CNN+MLP 등 observation 형태에 맞는 pi_theta를 둔다."),
        step("지도학습 loss", "예측 action과 expert action 차이를 평균한다."),
        step("distribution 문제", "policy가 만든 작은 실수가 expert dataset에 없는 observation으로 누적된다. 이것이 covariate shift다."),
      ],
      handCalculation: {
        problem: "1D demo가 (o,a)=(0,0),(1,2),(2,4)일 때 linear policy a=wo+b는?",
        given: { observations: "0,1,2", actions: "0,2,4" },
        steps: ["세 점은 a=2o에 정확히 놓인다.", "w=2, b=0", "o=3이면 a=6"],
        answer: "pi(o)=2o",
      },
      robotApplication: "카메라 image와 gripper pose를 observation으로, end-effector velocity를 action으로 저장해 pick-and-place 초기 policy를 학습한다.",
    },
    codeLabs: [bcLab],
    visualizations: [
      makeVisualization("vis_behavior_cloning_loss", "Behavior Cloning Loss Curve", "behavior_cloning_covariate_shift", "min mean ||pi(o)-a||^2", bcLab.id, [
        { name: "demo_count", symbol: "N", min: 5, max: 200, default: 30, description: "demonstration pair 수" },
        { name: "state_shift", symbol: "\\Delta o", min: 0, max: 5, default: 1, description: "학습 분포 밖 observation shift" },
      ], "test observation이 demo 분포 안에 있으면 action error가 작다.", "분포 밖 observation에서는 작은 오차가 누적되어 실패한다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "behavior_cloning",
      conceptTag: "behavior_cloning_covariate_shift",
      reviewSession: "Behavior Cloning",
      conceptQuestion: "Behavior Cloning은 어떤 학습 문제로 policy를 학습하는가?",
      conceptAnswer: "expert observation-action pair를 이용한 supervised learning 문제로 학습한다.",
      calculationQuestion: "MSE action error가 [1,2,1]이면 평균 loss는?",
      calculationAnswer: "(1+2+1)/3=1.333이다.",
      codeQuestion: "linear policy fitting에서 bias column이 필요한 이유는?",
      codeAnswer: "action offset이 있는 expert policy를 표현하기 위해 필요하다.",
      debugQuestion: "demo와 action 배열을 따로 shuffle하면 어떤 문제가 생기는가?",
      debugAnswer: "observation-action pair 대응이 깨져 잘못된 지도신호로 학습한다.",
      visualQuestion: "state_shift가 커질 때 loss가 커지는 이유는?",
      visualAnswer: "학습 데이터 분포 밖 observation에서 policy가 extrapolation해야 하기 때문이다.",
      robotQuestion: "BC 로봇이 한 번 삐끗한 뒤 계속 악화되는 이유는?",
      robotAnswer: "자신의 action이 만든 observation이 expert dataset에 없어 covariate shift가 누적되기 때문이다.",
      designQuestion: "DAgger를 추가한 데이터 수집 루프는 어떻게 구성하는가?",
      designAnswer: "학습 policy로 rollout하고, 방문한 observation에 expert action label을 다시 받아 dataset에 추가한다.",
    }),
    wrongAnswerTags: makeWrongTags("behavior_cloning_covariate_shift", "Behavior Cloning과 covariate shift", ["Policy", "DAgger"]),
    nextSessions: ["dagger", "reinforcement_learning_basics"],
  }),
  session({
    id: "sim2real_domain_randomization",
    part: "Part 7. Physical AI / Embodied AI",
    title: "Sim2Real and Domain Randomization",
    level: "intermediate",
    prerequisites: ["behavior_cloning_physical_ai", "real_time_loop_timing", "sensor_pipeline"],
    learningObjectives: ["domain gap의 원인을 분류한다.", "domain randomization 실험을 설계한다.", "sim 성공/real 실패 로그를 진단표로 해석한다."],
    theory: {
      definition: "Sim2Real은 simulation에서 학습/검증한 policy를 실제 로봇으로 옮기는 과정이며, domain randomization은 sim parameter를 의도적으로 흔들어 real variation에 robust하게 만드는 방법이다.",
      whyItMatters: "simulation에서 성공한 policy는 friction, camera noise, actuator delay, calibration error 때문에 실제 로봇에서 바로 실패할 수 있다.",
      intuition: "연습실 바닥, 조명, 카메라, 모터 반응을 매번 조금씩 바꿔 연습하면 실제 경기장의 차이에 덜 놀란다.",
      equations: [
        makeEquation("Domain randomized objective", "\\min_\\theta E_{\\phi\\sim p(\\phi)}[L(\\pi_\\theta,\\phi)]", [["\\phi", "sim parameter"], ["p(\\phi)", "randomization distribution"], ["L", "task loss"]], "한 sim 조건이 아니라 여러 조건 평균에서 policy를 학습한다."),
      ],
      derivation: [
        step("domain gap 목록화", "friction, mass, delay, camera noise, calibration error를 parameter로 둔다."),
        step("randomization 범위 설정", "실측 가능한 real 범위를 중심으로 min/max를 정한다."),
        step("실험 sweep", "각 parameter seed와 task success/failure reason을 저장한다."),
        step("real 진단", "sim 실패 패턴과 real 로그를 비교해 gap 원인을 좁힌다."),
      ],
      handCalculation: {
        problem: "friction randomization 범위 [0.2,1.2] 중 policy 성공 범위가 [0.4,0.9]이면 이상적 성공률은?",
        given: { random_range: "1.0 width", success_range: "0.5 width" },
        steps: ["전체 폭=1.2-0.2=1.0", "성공 폭=0.9-0.4=0.5", "균등분포 성공률=0.5/1.0"],
        answer: "50%",
      },
      robotApplication: "mobile robot navigation policy를 Gazebo에서 학습한 뒤 실제 바닥 마찰과 camera exposure 변화에 대해 randomization 범위를 재조정한다.",
    },
    codeLabs: [sim2realLab],
    visualizations: [
      makeVisualization("vis_sim2real_gap", "Sim2Real Gap Visualizer", "sim2real_domain_randomization", "E_phi[L(pi,phi)]", sim2realLab.id, [
        { name: "friction_low", symbol: "\\mu_{min}", min: 0.1, max: 0.8, default: 0.2, description: "friction randomization lower bound" },
        { name: "actuator_delay", symbol: "\\Delta t", min: 0, max: 200, default: 40, description: "actuator delay ms" },
        { name: "camera_noise", symbol: "\\sigma_I", min: 0, max: 50, default: 10, description: "image noise level" },
      ], "randomization 범위가 real variation을 덮으면 success가 유지된다.", "범위가 좁거나 delay가 커지면 sim 성공 policy가 real에서 실패한다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "sim2real",
      conceptTag: "sim2real_domain_randomization",
      reviewSession: "Sim2Real",
      conceptQuestion: "domain gap은 무엇인가?",
      conceptAnswer: "simulation의 물리/센서/시간 특성과 실제 로봇 환경 사이의 차이다.",
      calculationQuestion: "전체 randomization 폭 2.0 중 성공 폭 0.5이면 성공률 근사는?",
      calculationAnswer: "0.5/2.0=25%이다.",
      codeQuestion: "randomized trial 실험에서 seed를 저장해야 하는 이유는?",
      codeAnswer: "실패 조건을 재현하고 parameter 조합을 다시 분석하기 위해서다.",
      debugQuestion: "sim에서는 성공하지만 real에서 overshoot가 크면 어떤 gap을 의심하는가?",
      debugAnswer: "actuator delay, friction mismatch, controller frequency 차이를 의심한다.",
      visualQuestion: "actuator_delay slider가 커질 때 성공률이 떨어지는 이유는?",
      visualAnswer: "closed-loop action이 늦게 적용되어 관측-행동 루프가 불안정해지기 때문이다.",
      robotQuestion: "real camera에서만 grasp 실패가 늘면 어떤 항목을 점검하는가?",
      robotAnswer: "camera noise, exposure, calibration, camera-to-robot transform, inference latency를 점검한다.",
      designQuestion: "Sim2Real 실패 원인 진단 표의 열은?",
      designAnswer: "실패 증상, 관련 로그, 의심 parameter, sim 재현 방법, real 검증 방법, safety 조치를 둔다.",
    }),
    wrongAnswerTags: makeWrongTags("sim2real_domain_randomization", "Sim2Real gap 진단", ["Domain Randomization", "Safety Constraint"]),
    nextSessions: ["safety_constraint", "human_in_the_loop_robot_learning"],
  }),
];
