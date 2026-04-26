import type { Session } from "../types";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "./v2SessionHelpers";

const ekfLab = ensureCodeLabShape({
  id: "lab_ekf_localization",
  title: "EKF Localization",
  language: "python",
  theoryConnection: "P = F P F^T + Q, K = P H^T (H P H^T + R)^-1",
  starterCode: `import numpy as np

def ekf_update(x, P, z, R):
    # Landmark at origin, measurement is range sqrt(x^2+y^2)
    # TODO: compute predicted range
    # TODO: compute observation Jacobian H
    # TODO: compute Kalman gain and update x, P
    raise NotImplementedError

if __name__ == "__main__":
    x = np.array([2.0, 0.0])
    P = np.eye(2) * 0.5
    print(np.round(ekf_update(x, P, 1.8, np.array([[0.04]]))[0], 3))`,
  solutionCode: `import numpy as np

def ekf_update(x, P, z, R):
    px, py = x
    pred = np.sqrt(px * px + py * py)
    if pred < 1e-9:
        raise ValueError("range Jacobian undefined at landmark")
    H = np.array([[px / pred, py / pred]])
    S = H @ P @ H.T + R
    K = P @ H.T @ np.linalg.inv(S)
    innovation = np.array([[z - pred]])
    x_new = x.reshape(2, 1) + K @ innovation
    P_new = (np.eye(2) - K @ H) @ P
    return x_new.ravel(), P_new

if __name__ == "__main__":
    x = np.array([2.0, 0.0])
    P = np.eye(2) * 0.5
    print(np.round(ekf_update(x, P, 1.8, np.array([[0.04]]))[0], 3))`,
  testCode: `import numpy as np
import pytest
from ekf_localization import ekf_update

def test_range_update_moves_toward_measurement():
    x_new, P_new = ekf_update(np.array([2.0, 0.0]), np.eye(2) * 0.5, 1.8, np.array([[0.04]]))
    assert x_new[0] < 2.0
    assert P_new[0, 0] < 0.5

def test_y_covariance_stays_when_h_y_zero():
    _, P_new = ekf_update(np.array([2.0, 0.0]), np.eye(2) * 0.5, 1.8, np.array([[0.04]]))
    assert abs(P_new[1, 1] - 0.5) < 1e-9

def test_zero_range_failure():
    with pytest.raises(ValueError):
        ekf_update(np.array([0.0, 0.0]), np.eye(2), 1.0, np.array([[0.1]]))`,
  expectedOutput: "[1.815 0.   ]",
  runCommand: "python ekf_localization.py && pytest test_ekf_localization.py",
  commonBugs: ["observation Jacobian H를 identity로 둠", "innovation z-h(x)의 부호를 반대로 씀", "P update에서 covariance가 줄어드는지 확인하지 않음"],
  extensionTask: "landmark 위치를 여러 개로 늘리고 각 관측 후 covariance ellipse를 그려라.",
});

export const autonomousDrivingSessions: Session[] = [
  session({
    id: "ekf_localization",
    part: "Part 4. 자율주행과 SLAM",
    title: "EKF Localization with Observation Jacobian",
    level: "advanced",
    prerequisites: ["bayes_theorem", "jacobian_from_multivariable_calculus", "eigenvalue_covariance_ellipse"],
    learningObjectives: ["비선형 range 관측 모델을 정의한다.", "EKF observation Jacobian을 유도한다.", "Kalman gain과 covariance ellipse 변화를 해석한다."],
    theory: {
      definition: "EKF는 비선형 motion/observation model을 현재 추정점 주변에서 Jacobian으로 선형화해 Kalman update를 적용하는 필터다.",
      whyItMatters: "자율주행 로봇은 odometry drift를 landmark, GPS, AprilTag, LiDAR 관측으로 계속 보정해야 한다.",
      intuition: "곡선 함수를 현재 위치 주변에서 접선으로 근사하고, 그 근사선 위에서 Gaussian update를 수행한다.",
      equations: [
        makeEquation("Observation model", "z=h(x)+v, h(x)=\\sqrt{x^2+y^2}", [["z", "range measurement"], ["v", "measurement noise"], ["h", "비선형 관측 함수"]], "landmark까지 거리 관측 예시다."),
        makeEquation("Observation Jacobian", "H=\\left[\\frac{x}{r}, \\frac{y}{r}\\right]", [["H", "관측 Jacobian"], ["r", "sqrt(x^2+y^2)"]], "현재 추정점에서 range가 state에 얼마나 민감한지 나타낸다."),
        makeEquation("EKF update", "K=PH^T(HPH^T+R)^{-1}", [["K", "Kalman gain"], ["P", "state covariance"], ["R", "measurement covariance"]], "예측과 관측을 신뢰도에 따라 섞는다."),
      ],
      derivation: [
        step("비선형 h 정의", "원점 landmark까지 range r=sqrt(x^2+y^2)를 둔다."),
        step("편미분", "r을 x,y로 편미분해 H를 얻는다.", "\\partial r/\\partial x=x/r, \\partial r/\\partial y=y/r"),
        step("innovation", "측정 z와 예측 h(x)의 차이를 계산한다.", "\\nu=z-h(x)"),
        step("Gaussian update", "K와 innovation으로 state와 covariance를 갱신한다."),
      ],
      handCalculation: {
        problem: "x=(2,0), z=1.8이면 range innovation은?",
        given: { x: 2, y: 0, z: 1.8 },
        steps: ["predicted range=sqrt(2^2+0)=2", "innovation=z-pred=1.8-2=-0.2"],
        answer: "innovation은 -0.2이므로 추정 x는 landmark 쪽으로 줄어든다.",
      },
      robotApplication: "Nav2 AMCL/EKF 파이프라인에서 odom drift가 커질 때 landmark 관측 update가 covariance를 줄이고 map->odom 관계를 안정화한다.",
    },
    codeLabs: [ekfLab],
    visualizations: [
      makeVisualization("vis_ekf_covariance", "EKF Localization with Covariance Ellipse", "ekf_observation_jacobian", "H=[x/r,y/r]", ekfLab.id, [
        { name: "measurement_noise", symbol: "R", min: 0.01, max: 1, default: 0.04, description: "range sensor variance" },
        { name: "prior_covariance", symbol: "P", min: 0.05, max: 2, default: 0.5, description: "update 전 pose covariance" },
      ], "R이 작고 H가 잘 정의되면 관측 방향 covariance가 줄어든다.", "r이 0에 가까우면 H가 정의되지 않아 update가 실패한다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "ekf",
      conceptTag: "ekf_observation_jacobian",
      reviewSession: "EKF Localization",
      conceptQuestion: "EKF에서 Jacobian이 필요한 이유는?",
      conceptAnswer: "비선형 모델을 현재 추정점 주변의 선형 모델로 근사해 Kalman update를 적용하기 위해서다.",
      calculationQuestion: "x=(3,4)인 range 관측의 H는?",
      calculationAnswer: "r=5이므로 H=[3/5,4/5]=[0.6,0.8]이다.",
      codeQuestion: "innovation은 z-h(x)와 h(x)-z 중 무엇인가?",
      codeAnswer: "관측에서 예측을 뺀 z-h(x)를 사용한다.",
      debugQuestion: "range가 0일 때 H 계산을 막아야 하는 이유는?",
      debugAnswer: "x/r, y/r에서 0으로 나누기가 발생해 Jacobian이 정의되지 않는다.",
      visualQuestion: "R slider를 줄이면 covariance ellipse가 어떻게 변하는가?",
      visualAnswer: "측정을 더 신뢰하므로 관측 가능한 방향의 covariance가 더 크게 줄어든다.",
      robotQuestion: "landmark를 한 방향에서만 계속 보면 ellipse가 납작해지는 이유는?",
      robotAnswer: "관측 방향 uncertainty는 줄지만 직교 방향은 충분히 관측되지 않기 때문이다.",
      designQuestion: "EKF 로그에 반드시 남길 값은?",
      designAnswer: "innovation, H, K, P trace/eigenvalue, R/Q, timestamp delay를 저장한다.",
    }),
    wrongAnswerTags: makeWrongTags("ekf_observation_jacobian", "EKF 관측 Jacobian", ["Jacobian from Multivariable Calculus", "Covariance Ellipse"]),
    nextSessions: ["pose_graph_slam", "loop_closure"],
  }),
];
