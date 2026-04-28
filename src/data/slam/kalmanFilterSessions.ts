import type { Session } from "../../types";
import {
  ensureCodeLabShape,
  makeCoreQuizzes,
  makeEquation,
  makeVisualization,
  makeWrongTags,
  session,
  step,
} from "../core/v2SessionHelpers";

const kf1dLab = ensureCodeLabShape({
  id: "lab_kalman_filter_1d",
  title: "1D Kalman Filter: Predict + Update",
  language: "python",
  theoryConnection: "x_pred=x+u, P_pred=P+Q, K=P/(P+R), x_new=x+K(z-x), P_new=(1-K)P",
  starterCode: `import numpy as np
import matplotlib.pyplot as plt

class KalmanFilter1D:
    def __init__(self, x0, P0, Q, R):
        self.x = x0
        self.P = P0
        self.Q = Q
        self.R = R

    def predict(self, u=0.0):
        # TODO: x = x + u, P = P + Q
        raise NotImplementedError

    def update(self, z):
        # TODO: K = P / (P + R)
        # TODO: x = x + K * (z - x)
        # TODO: P = (1 - K) * P
        raise NotImplementedError

if __name__ == "__main__":
    true_positions = [float(i) for i in range(20)]
    np.random.seed(42)
    measurements = [p + np.random.normal(0, 2.0) for p in true_positions]

    kf = KalmanFilter1D(x0=0.0, P0=5.0, Q=0.1, R=4.0)
    for i, z in enumerate(measurements):
        kf.predict(u=1.0)
        kf.update(z)
        print(f"step {i:2d}: 측정={z:.2f}, 추정={kf.x:.2f}, 실제={true_positions[i]:.1f}")`,
  solutionCode: `import numpy as np
import matplotlib.pyplot as plt

class KalmanFilter1D:
    def __init__(self, x0, P0, Q, R):
        self.x = x0
        self.P = P0
        self.Q = Q
        self.R = R

    def predict(self, u=0.0):
        self.x = self.x + u
        self.P = self.P + self.Q

    def update(self, z):
        K = self.P / (self.P + self.R)
        self.x = self.x + K * (z - self.x)
        self.P = (1.0 - K) * self.P

if __name__ == "__main__":
    true_positions = [float(i) for i in range(20)]
    np.random.seed(42)
    measurements = [p + np.random.normal(0, 2.0) for p in true_positions]

    kf = KalmanFilter1D(x0=0.0, P0=5.0, Q=0.1, R=4.0)
    estimates = []
    for i, z in enumerate(measurements):
        kf.predict(u=1.0)
        kf.update(z)
        estimates.append(kf.x)
        print(f"step {i:2d}: 측정={z:.2f}, 추정={kf.x:.2f}, 실제={true_positions[i]:.1f}")

    steps = list(range(20))
    plt.figure(figsize=(10, 4))
    plt.plot(steps, true_positions, "g-", label="실제 위치", linewidth=2)
    plt.plot(steps, measurements, "rx", label="측정값", markersize=8)
    plt.plot(steps, estimates, "b-o", label="KF 추정값", markersize=4)
    plt.legend()
    plt.grid(True)
    plt.xlabel("time step")
    plt.ylabel("position")
    plt.title("1D Kalman Filter")
    plt.savefig("kalman_1d.png")
    plt.close()
    print("kalman_1d.png 저장 완료")`,
  testCode: `from kalman_filter_1d import KalmanFilter1D

def test_update_reduces_uncertainty():
    kf = KalmanFilter1D(x0=0.0, P0=5.0, Q=0.1, R=4.0)
    kf.predict()
    P_before = kf.P
    kf.update(z=1.0)
    assert kf.P < P_before

def test_predict_increases_uncertainty():
    kf = KalmanFilter1D(x0=0.0, P0=1.0, Q=0.5, R=1.0)
    P_before = kf.P
    kf.predict()
    assert kf.P > P_before

def test_kalman_gain_between_0_and_1():
    kf = KalmanFilter1D(x0=0.0, P0=1.0, Q=0.1, R=1.0)
    kf.predict()
    K = kf.P / (kf.P + kf.R)
    assert 0 < K < 1

def test_estimate_moves_toward_measurement():
    kf = KalmanFilter1D(x0=0.0, P0=1.0, Q=0.0, R=1.0)
    kf.predict()
    kf.update(z=10.0)
    assert kf.x > 0.0`,
  expectedOutput: `step  0: 측정=0.99, 추정=1.00, 실제=0.0
step  1: 측정=0.72, 추정=1.53, 실제=1.0
step  2: 측정=3.30, 추정=2.74, 실제=2.0`,
  runCommand: "python kalman_filter_1d.py && pytest test_kalman_filter_1d.py",
  commonBugs: [
    "predict에서 P를 업데이트하지 않아 불확실성이 커지지 않음",
    "칼만 게인을 P/(P+R)이 아니라 P/R로 계산함",
    "혁신을 z-x 대신 x-z로 계산해 업데이트 방향이 반대가 됨",
    "update 후 P=(1-K)P 대신 K*P로 계산함",
  ],
  extensionTask:
    "Q=0.01과 Q=10.0을 비교하는 그래프를 출력하고 어떤 설정이 측정 노이즈를 더 많이 따르는지 해석하라.",
});

export const kalmanFilterSessions: Session[] = [
  session({
    id: "kalman_filter_1d",
    part: "Part 4. 자율주행과 SLAM",
    title: "Kalman Filter 완전 구현 (1D Predict + Update)",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 90,
    prerequisites: ["gaussian_mle", "calculus_derivative_chain_rule"],
    learningObjectives: [
      "predict 단계 x=x+u, P=P+Q의 의미를 설명한다.",
      "update 단계 K=P/(P+R), x=x+K(z-x), P=(1-K)P를 구현한다.",
      "칼만 게인이 측정과 모델을 섞는 비율임을 해석한다.",
      "Q와 R의 비율이 필터 추정 곡선에 미치는 영향을 설명한다.",
    ],
    theory: {
      definition:
        "칼만필터는 노이즈가 있는 측정값과 불완전한 모델을 재귀적으로 결합해 숨겨진 상태를 추정하는 알고리즘이다.",
      whyItMatters:
        "GPS, IMU, wheel odometry, joint encoder처럼 불확실한 센서를 융합하는 거의 모든 로봇 state estimation의 기본형이다.",
      intuition:
        "눈을 감고 한 걸음 걷는 predict 단계에서는 위치 불확실성이 커지고, 눈을 떠서 표식을 보는 update 단계에서는 측정값으로 추정을 보정하며 불확실성이 줄어든다.",
      equations: [
        makeEquation(
          "Predict",
          "x_{pred} = x + u, \\quad P_{pred} = P + Q",
          [
            ["x", "현재 상태 추정값"],
            ["u", "제어 입력"],
            ["P", "추정 불확실성"],
            ["Q", "프로세스 노이즈"],
          ],
          "모델로 앞으로 한 단계 예측하면 상태는 이동하고 불확실성은 증가한다.",
        ),
        makeEquation(
          "Kalman gain",
          "K = \\frac{P_{pred}}{P_{pred} + R}",
          [
            ["K", "측정값을 반영하는 비율"],
            ["R", "측정 노이즈"],
          ],
          "R이 작으면 센서를 더 믿고, P가 작으면 기존 추정을 더 믿는다.",
        ),
        makeEquation(
          "State update",
          "x_{new} = x_{pred} + K(z - x_{pred})",
          [
            ["z", "측정값"],
            ["z-x_pred", "innovation"],
          ],
          "예측과 측정의 차이를 K만큼 반영한다.",
        ),
        makeEquation(
          "Covariance update",
          "P_{new} = (1-K)P_{pred}",
          [["P_new", "측정 후 줄어든 불확실성"]],
          "측정을 반영하면 추정이 더 확실해지므로 P가 줄어든다.",
        ),
      ],
      derivation: [
        step("상태 예측", "1D 위치에서 u만큼 이동한다고 보고 x_pred=x+u로 둔다."),
        step("불확실성 예측", "모델 오차 Q가 누적되므로 P_pred=P+Q가 된다."),
        step("측정 비중 계산", "K=P_pred/(P_pred+R)로 센서와 모델의 상대 신뢰도를 계산한다."),
        step("상태와 P 갱신", "innovation z-x_pred를 반영하고 P_new=(1-K)P_pred로 줄인다."),
      ],
      handCalculation: {
        problem: "x=5.0, P=2.0, Q=0.1, R=1.0, u=0, z=5.5일 때 1번 predict+update 결과는?",
        given: { x: 5.0, P: 2.0, Q: 0.1, R: 1.0, u: 0, z: 5.5 },
        steps: [
          "Predict: x_pred=5.0, P_pred=2.1",
          "K=2.1/(2.1+1.0)=0.677",
          "x_new=5.0+0.677*(5.5-5.0)=5.339",
          "P_new=(1-0.677)*2.1=0.678",
        ],
        answer: "x_new≈5.34, P_new≈0.68",
      },
      robotApplication:
        "ROS2 robot_localization은 같은 predict/update 구조를 2D/3D 상태로 확장해 odometry, IMU, GPS를 융합한다.",
    },
    codeLabs: [kf1dLab],
    visualizations: [
      makeVisualization(
        "vis_kalman_1d",
        "1D Kalman Filter: Q/R 상호작용",
        "kalman_filter_1d",
        "K=P/(P+R), x+=K(z-x)",
        kf1dLab.id,
        [
          { name: "Q", symbol: "Q", min: 0.01, max: 5, default: 0.1, description: "프로세스 노이즈" },
          { name: "R", symbol: "R", min: 0.1, max: 10, default: 4.0, description: "측정 노이즈" },
        ],
        "Q가 작고 R이 크면 추정이 부드럽게 움직이며 측정 노이즈를 많이 거른다.",
        "Q가 크고 R이 작으면 측정값을 바로 따라가 노이즈 제거 효과가 줄어든다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "kf1d",
      conceptTag: "kalman_filter_1d",
      reviewSession: "Kalman Filter 1D",
      conceptQuestion: "칼만 게인 K가 1에 가까울 때 필터는 무엇을 더 믿는가?",
      conceptAnswer: "측정값 z를 더 믿는다. R이 작거나 P가 큰 상황에서 K가 커진다.",
      calculationQuestion: "P=3.0, R=1.0이면 K는? x_pred=5.0, z=6.0이면 x_new는?",
      calculationAnswer: "K=3/(3+1)=0.75, x_new=5.0+0.75*(6.0-5.0)=5.75이다.",
      codeQuestion: "predict 단계에서 P를 업데이트하는 Python 코드는?",
      codeAnswer: "self.P = self.P + self.Q",
      debugQuestion: "update 후 P가 줄지 않고 커진다면 어디를 먼저 확인하는가?",
      debugAnswer: "P update가 self.P = (1 - K) * self.P인지 확인한다.",
      visualQuestion: "Q를 크게 올리면 추정 곡선은 어떻게 변하는가?",
      visualAnswer: "모델을 덜 믿고 측정을 더 반영하므로 노이즈 많은 측정값을 더 빠르게 따라간다.",
      robotQuestion: "GPS R이 크고 IMU 모델 Q가 작으면 급격한 방향 전환에서 어떤 문제가 생길 수 있는가?",
      robotAnswer: "모델을 과하게 믿어 추정이 실제 움직임보다 늦게 반응할 수 있다.",
      designQuestion: "실제 로봇 로그에서 KF 튜닝을 위해 남겨야 할 값은?",
      designAnswer: "innovation, K, P, Q/R 설정, timestamp delay, 센서별 residual을 남겨야 한다.",
    }),
    wrongAnswerTags: makeWrongTags("kalman_filter_1d", "KF predict/update 단계 오류", [
      "gaussian_mle",
      "calculus_derivative_chain_rule",
    ]),
    nextSessions: ["ekf_localization"],
  }),
];
