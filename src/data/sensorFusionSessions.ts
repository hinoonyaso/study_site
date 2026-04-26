import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const fusionLab = {
  id: "lab_gps_imu_complementary_fusion",
  title: "GPS + IMU Complementary Fusion",
  language: "python" as const,
  theoryConnection: "x = alpha*(x + imu_delta) + (1-alpha)*gps",
  starterCode: `def fuse_step(x, imu_delta, gps, alpha=0.9):
    # TODO: predict with IMU, correct with GPS
    raise NotImplementedError

if __name__ == "__main__":
    x = 0.0
    for gps in [1.2, 2.1, 2.9]:
        x = fuse_step(x, 1.0, gps, alpha=0.8)
    print(round(x, 3))`,
  solutionCode: `def fuse_step(x, imu_delta, gps, alpha=0.9):
    pred = x + imu_delta
    return alpha * pred + (1 - alpha) * gps

if __name__ == "__main__":
    x = 0.0
    for gps in [1.2, 2.1, 2.9]:
        x = fuse_step(x, 1.0, gps, alpha=0.8)
    print(round(x, 3))`,
  testCode: `from gps_imu_complementary_fusion import fuse_step

def test_alpha_zero_is_gps():
    assert fuse_step(0, 1, 5, alpha=0.0) == 5

def test_alpha_one_is_imu_prediction():
    assert fuse_step(2, 1, 100, alpha=1.0) == 3`,
  expectedOutput: "3.022",
  runCommand: "python gps_imu_complementary_fusion.py && pytest test_gps_imu_complementary_fusion.py",
  commonBugs: ["alpha 의미를 반대로 해석해 GPS/IMU 신뢰도가 뒤집힘", "GPS timestamp와 IMU prediction time을 맞추지 않음", "센서 covariance 없이 단순 평균으로만 fusion"],
  extensionTask: "alpha를 covariance ratio에서 자동 계산하도록 KF 형태로 확장하라.",
};

export const sensorFusionSessions: Session[] = [
  makeAdvancedSession({
    id: "sensor_fusion_gps_imu",
    part: "Part 4. 자율주행과 SLAM",
    title: "Sensor Fusion 기초: GPS + IMU 보정",
    prerequisites: ["kalman_filter_1d", "imu_preintegration_basic"],
    objectives: ["prediction과 correction의 역할을 구분한다.", "IMU 적분 drift와 GPS noise를 함께 해석한다.", "alpha/covariance가 센서 신뢰도를 나타내는 방식을 설명한다.", "robot_localization EKF 설정과 연결한다."],
    definition: "Sensor fusion은 서로 다른 센서의 장단점을 결합해 하나의 더 안정적인 state estimate를 만드는 과정이다.",
    whyItMatters: "GPS는 느리고 noisy하지만 절대 위치를 주고, IMU는 빠르지만 drift한다. 실제 자율주행/로봇은 이 둘을 결합해야 한다.",
    intuition: "IMU로 부드럽게 예측하고, GPS가 들어오면 너무 튀지 않게 조금씩 위치를 보정하는 방식이다.",
    equations: [
      { label: "Complementary fusion", expression: "x=\\alpha(x+\\Delta x_{imu})+(1-\\alpha)x_{gps}", terms: [["α", "prediction 신뢰도"]], explanation: "간단한 predict-correct fusion이다." },
      { label: "KF gain intuition", expression: "K=P/(P+R)", terms: [["P", "prediction uncertainty"], ["R", "measurement noise"]], explanation: "센서가 정확할수록 measurement를 더 믿는다." },
      { label: "Covariance weighting", expression: "\\hat{x}=\\frac{R_2x_1+R_1x_2}{R_1+R_2}", terms: [["R_i", "각 센서 분산"]], explanation: "분산이 작은 센서가 더 큰 weight를 갖는다." },
    ],
    derivation: [["IMU predict", "이전 estimate에 IMU delta를 더한다."], ["GPS correct", "GPS 측정과 prediction을 weighted average한다."], ["weight 해석", "alpha가 크면 IMU/model을 더 믿는다."], ["EKF 확장", "상태와 covariance를 함께 업데이트한다."]],
    handCalculation: { problem: "prediction=10, GPS=12, alpha=0.75이면 fused x는?", given: { pred: 10, gps: 12, alpha: 0.75 }, steps: ["0.75*10 + 0.25*12", "7.5+3"], answer: "10.5" },
    robotApplication: "robot_localization에서 odom, imu, gps covariance를 잘못 설정하면 EKF가 noisy GPS를 과신하거나 IMU drift를 너무 오래 믿는다.",
    lab: fusionLab,
    visualization: { id: "vis_sensor_fusion_gps_imu", title: "GPS+IMU Fusion Trajectory", equation: "x=alpha*x_pred+(1-alpha)*gps", parameters: [{ name: "alpha", symbol: "\\alpha", min: 0, max: 1, default: 0.8, description: "IMU prediction weight" }, { name: "gps_noise", symbol: "R", min: 0, max: 5, default: 1, description: "GPS noise" }], normalCase: "IMU smoothness와 GPS absolute correction이 균형을 이룬다.", failureCase: "alpha가 너무 크면 GPS correction이 늦고 drift가 남는다." },
    quiz: {
      id: "sensor_fusion",
      conceptQuestion: "GPS와 IMU를 함께 쓰는 이유는?",
      conceptAnswer: "GPS는 absolute correction을 주고 IMU는 고주파 motion prediction을 제공해 서로의 약점을 보완한다.",
      calculationQuestion: "pred=8, gps=10, alpha=0.5이면?",
      calculationAnswer: "9이다.",
      codeQuestion: "complementary fusion 한 줄은?",
      codeAnswer: "return alpha * pred + (1-alpha) * gps",
      debugQuestion: "GPS가 튈 때 estimate도 바로 튀면 무엇을 의심하는가?",
      debugAnswer: "GPS measurement noise R이 너무 작거나 alpha가 너무 낮아 GPS를 과신하는 설정을 의심한다.",
      visualQuestion: "alpha를 1에 가깝게 하면 estimate는?",
      visualAnswer: "IMU prediction을 거의 그대로 따라가 GPS correction이 약해진다.",
      robotQuestion: "robot_localization YAML에서 covariance가 중요한 이유는?",
      robotAnswer: "각 센서의 신뢰도를 covariance로 표현해 EKF gain을 결정하기 때문이다.",
      designQuestion: "sensor fusion failure monitor는 무엇을 봐야 하는가?",
      designAnswer: "timestamp, covariance, innovation 크기, sensor dropout, frame transform validity를 본다.",
    },
    wrongTagLabel: "Sensor fusion weight/covariance 오류",
    nextSessions: ["particle_filter_sir", "pose_graph_slam_basics"],
  }),
];
