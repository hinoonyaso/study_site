import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const imuLab = {
  id: "lab_imu_dead_reckoning_bias",
  title: "IMU Dead Reckoning with Bias",
  language: "python" as const,
  theoryConnection: "v += (a_meas - bias)dt, p += vdt; gyro/accel bias causes drift",
  starterCode: `import numpy as np

def integrate_accel(accel_meas, dt, bias=0.0):
    # TODO: integrate acceleration to velocity and position
    raise NotImplementedError

if __name__ == "__main__":
    dt = 0.01
    acc = np.ones(1000) * 0.05
    p_raw, v_raw = integrate_accel(acc, dt, bias=0.0)
    p_corr, v_corr = integrate_accel(acc, dt, bias=0.05)
    print(round(p_raw[-1], 3), round(p_corr[-1], 3))`,
  solutionCode: `import numpy as np

def integrate_accel(accel_meas, dt, bias=0.0):
    v = 0.0
    p = 0.0
    ps, vs = [], []
    for a in accel_meas:
        v += (float(a) - bias) * dt
        p += v * dt
        vs.append(v)
        ps.append(p)
    return np.array(ps), np.array(vs)

if __name__ == "__main__":
    dt = 0.01
    acc = np.ones(1000) * 0.05
    p_raw, v_raw = integrate_accel(acc, dt, bias=0.0)
    p_corr, v_corr = integrate_accel(acc, dt, bias=0.05)
    print(round(p_raw[-1], 3), round(p_corr[-1], 3))`,
  testCode: `import numpy as np
from imu_dead_reckoning_bias import integrate_accel

def test_zero_accel_stays_zero():
    p, v = integrate_accel(np.zeros(100), 0.01)
    assert abs(p[-1]) < 1e-12 and abs(v[-1]) < 1e-12

def test_bias_correction_reduces_drift():
    acc = np.ones(1000) * 0.05
    p_raw, _ = integrate_accel(acc, 0.01, bias=0.0)
    p_corr, _ = integrate_accel(acc, 0.01, bias=0.05)
    assert abs(p_corr[-1]) < abs(p_raw[-1])`,
  expectedOutput: "2.503 0.0",
  runCommand: "python imu_dead_reckoning_bias.py && pytest test_imu_dead_reckoning_bias.py",
  commonBugs: ["bias를 빼지 않고 더함", "position update에서 최신 velocity와 이전 velocity convention을 섞음", "dt를 두 번 곱하거나 빼먹음"],
  extensionTask: "gyro yaw bias를 추가해 2D dead reckoning path가 어떻게 휘는지 시각화하라.",
};

export const imuPreintegrationSessions: Session[] = [
  makeAdvancedSession({
    id: "imu_preintegration_basic",
    part: "Part 4. 자율주행과 SLAM",
    title: "IMU Preintegration 기초: Bias와 Drift",
    prerequisites: ["ode_euler_rk4", "kalman_filter_1d"],
    objectives: ["가속도 적분으로 velocity/position을 계산한다.", "bias가 시간에 따라 drift를 만드는 이유를 설명한다.", "IMU와 odometry/GPS fusion이 필요한 이유를 이해한다.", "VIO/robot_localization 파라미터와 연결한다."],
    definition: "IMU preintegration은 높은 주파수의 IMU 측정을 keyframe 사이 상대 이동량으로 적분해 최적화나 필터에 넣는 기법이다. 기초적으로는 acceleration과 gyro를 dt로 누적한다.",
    whyItMatters: "IMU는 빠르지만 bias 때문에 단독 위치추정이 빠르게 drift한다. Visual-Inertial Odometry, EKF sensor fusion, robot_localization은 이 drift를 다른 센서로 보정한다.",
    intuition: "아주 작은 가속도계 오차도 계속 더하면 속도 오차가 되고, 다시 위치 오차로 커진다.",
    equations: [
      { label: "Velocity integration", expression: "v_{k+1}=v_k+(a_m-b_a)\\Delta t", terms: [["a_m", "measured acceleration"], ["b_a", "accelerometer bias"]], explanation: "bias를 제거하지 않으면 velocity가 선형으로 drift한다." },
      { label: "Position integration", expression: "p_{k+1}=p_k+v_{k+1}\\Delta t", terms: [["p", "position"], ["v", "velocity"]], explanation: "velocity drift가 position drift로 누적된다." },
      { label: "Gyro integration", expression: "R_{k+1}=R_k\\exp((\\omega_m-b_g)\\Delta t)", terms: [["b_g", "gyro bias"]], explanation: "orientation drift는 gravity compensation까지 망친다." },
    ],
    derivation: [["bias 제거", "센서 측정에서 bias estimate를 뺀다."], ["속도 적분", "보정 acceleration을 dt만큼 누적한다."], ["위치 적분", "velocity를 다시 dt만큼 누적한다."], ["fusion 연결", "GPS/vision/odom 관측으로 bias와 pose를 같이 보정한다."]],
    handCalculation: { problem: "accel bias 0.05m/s^2를 10초 동안 보정하지 않으면 velocity 오차는?", given: { bias: 0.05, time: 10 }, steps: ["dv=bias*T", "dv=0.05*10=0.5m/s"], answer: "0.5m/s velocity drift" },
    robotApplication: "빠른 mobile robot에서 wheel odometry가 미끄러질 때 IMU yaw rate를 fusion하지만, gyro bias를 추정하지 않으면 회전 pose가 천천히 틀어진다.",
    lab: imuLab,
    visualization: { id: "vis_imu_bias_drift", title: "IMU Bias Drift 시뮬레이션", equation: "v+=(a-b)dt, p+=vdt", parameters: [{ name: "bias", symbol: "b_a", min: -0.2, max: 0.2, default: 0.05, description: "가속도 bias" }, { name: "duration", symbol: "T", min: 1, max: 30, default: 10, description: "적분 시간" }], normalCase: "bias를 정확히 빼면 position drift가 크게 줄어든다.", failureCase: "작은 bias도 긴 시간 적분하면 위치 오차가 제곱 시간으로 커진다." },
    quiz: {
      id: "imu_preint",
      conceptQuestion: "IMU 단독 위치추정이 오래 버티기 어려운 이유는?",
      conceptAnswer: "bias와 noise가 속도와 위치 적분에서 계속 누적되어 drift가 커지기 때문이다.",
      calculationQuestion: "bias=0.1m/s^2, T=5s면 velocity drift는?",
      calculationAnswer: "0.1*5=0.5m/s이다.",
      codeQuestion: "bias 보정 acceleration 한 줄은?",
      codeAnswer: "a = a_meas - bias",
      debugQuestion: "정지 IMU인데 위치가 계속 증가하면 무엇을 의심하는가?",
      debugAnswer: "accelerometer bias, gravity 제거 오류, dt 단위 오류를 의심한다.",
      visualQuestion: "duration을 늘리면 drift curve는 어떻게 변하는가?",
      visualAnswer: "velocity는 선형, position은 대략 제곱 시간으로 증가한다.",
      robotQuestion: "robot_localization에서 IMU yaw가 천천히 틀어지면 어떤 파라미터를 보는가?",
      robotAnswer: "gyro bias/noise covariance와 yaw fusion 설정, differential/relative mode를 확인한다.",
      designQuestion: "VIO에서 IMU와 camera를 함께 쓰는 이유는?",
      designAnswer: "IMU는 고속 motion을 제공하고 camera는 drift를 landmark 관측으로 보정한다.",
    },
    wrongTagLabel: "IMU bias/drift 적분 오류",
    nextSessions: ["sensor_fusion_gps_imu", "pose_graph_slam_basics"],
  }),
];
