import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const particleLab = {
  id: "lab_particle_filter_sir",
  title: "SIR Particle Filter 1D",
  language: "python" as const,
  theoryConnection: "predict particles, weight by likelihood, normalize, systematic resample",
  starterCode: `import numpy as np

def normalize_weights(w):
    # TODO: divide by sum, fallback to uniform if sum is zero
    raise NotImplementedError

def systematic_resample(particles, weights):
    # TODO: low-variance resampling
    raise NotImplementedError

def particle_filter_step(particles, u, z, motion_std=0.2, meas_std=0.5):
    # TODO: predict with u + noise, then weight by Gaussian likelihood p(z|x)
    raise NotImplementedError

if __name__ == "__main__":
    np.random.seed(0)
    particles = np.random.normal(0.0, 1.0, 500)
    particles, weights = particle_filter_step(particles, u=1.0, z=1.2)
    print("estimate:", round(float(np.average(particles, weights=weights)), 3))
    print("neff:", round(float(1.0 / np.sum(weights**2)), 1))`,
  solutionCode: `import numpy as np

def normalize_weights(w):
    total = float(np.sum(w))
    if total <= 1e-12:
        return np.ones_like(w) / len(w)
    return w / total

def systematic_resample(particles, weights):
    n = len(particles)
    positions = (np.arange(n) + np.random.random()) / n
    cumulative = np.cumsum(weights)
    indexes = np.searchsorted(cumulative, positions)
    return particles[indexes].copy()

def particle_filter_step(particles, u, z, motion_std=0.2, meas_std=0.5):
    particles = particles + u + np.random.normal(0.0, motion_std, len(particles))
    residual = z - particles
    weights = np.exp(-0.5 * (residual / meas_std) ** 2)
    weights = normalize_weights(weights)
    neff = 1.0 / np.sum(weights**2)
    if neff < len(particles) / 2:
        particles = systematic_resample(particles, weights)
        weights = np.ones(len(particles)) / len(particles)
    return particles, weights

if __name__ == "__main__":
    np.random.seed(0)
    particles = np.random.normal(0.0, 1.0, 500)
    particles, weights = particle_filter_step(particles, u=1.0, z=1.2)
    print("estimate:", round(float(np.average(particles, weights=weights)), 3))
    print("neff:", round(float(1.0 / np.sum(weights**2)), 1))`,
  testCode: `import numpy as np
from particle_filter_sir import normalize_weights, systematic_resample, particle_filter_step

def test_weights_sum_to_one():
    w = normalize_weights(np.array([1.0, 2.0, 3.0]))
    assert abs(w.sum() - 1.0) < 1e-12

def test_systematic_resample_length():
    np.random.seed(0)
    p = np.array([0.0, 1.0, 2.0])
    w = np.array([0.0, 0.0, 1.0])
    out = systematic_resample(p, w)
    assert len(out) == 3 and np.all(out == 2.0)

def test_particle_step_moves_toward_measurement():
    np.random.seed(1)
    p = np.random.normal(0, 1, 1000)
    p2, w = particle_filter_step(p, 1.0, 1.2)
    assert 0.7 < np.average(p2, weights=w) < 1.5`,
  expectedOutput: "estimate: 1.157\nneff: 299.3",
  runCommand: "python particle_filter_sir.py && pytest test_particle_filter_sir.py",
  commonBugs: [
    "weight normalization을 빼먹어 평균 계산이 틀어짐",
    "resampling 후 weights를 uniform으로 초기화하지 않음",
    "measurement likelihood의 부호 또는 분산 제곱을 잘못 씀",
  ],
  extensionTask: "두 개의 landmark range 측정을 추가해 2D AMCL toy example로 확장하라.",
};

export const particleFilterSessions: Session[] = [
  makeAdvancedSession({
    id: "particle_filter_sir",
    part: "Part 4. 자율주행과 SLAM",
    title: "Particle Filter SIR와 AMCL 기초",
    prerequisites: ["kalman_filter_1d", "slam_occupancy_grid"],
    objectives: [
      "particle set으로 비선형/non-Gaussian belief를 표현한다.",
      "motion update, measurement likelihood, weight normalization을 구현한다.",
      "effective sample size와 resampling 조건을 계산한다.",
      "AMCL의 particle 수와 laser model 파라미터를 해석한다.",
    ],
    definition: "Particle Filter는 확률분포를 N개의 샘플과 weight로 근사하는 순차 Monte Carlo 추정법이다. SIR은 sampling, importance weighting, resampling을 반복한다.",
    whyItMatters: "AMCL은 ROS2 Nav2에서 많이 쓰이는 Monte Carlo localization이다. KF/EKF가 Gaussian 하나로 belief를 표현하는 반면 PF는 다봉분포와 납작한 지도 ambiguity를 다룰 수 있다.",
    intuition: "로봇 위치 후보를 수백 개 점으로 뿌려두고, 센서와 잘 맞는 후보는 살아남고 안 맞는 후보는 사라지게 하는 방식이다.",
    equations: [
      { label: "Importance weight", expression: "w_i \\propto p(z_t|x_t^{(i)})", terms: [["w_i", "i번째 particle weight"], ["z_t", "측정값"]], explanation: "센서 측정과 잘 맞는 particle일수록 weight가 커진다." },
      { label: "Normalization", expression: "\\bar{w}_i=\\frac{w_i}{\\sum_j w_j}", terms: [["w_i", "raw likelihood"], ["\\bar{w}_i", "정규화 weight"]], explanation: "모든 weight 합이 1이 되게 만든다." },
      { label: "Effective sample size", expression: "N_{eff}=\\frac{1}{\\sum_i \\bar{w}_i^2}", terms: [["N_eff", "실제로 살아있는 particle 수"]], explanation: "너무 작으면 resampling으로 degeneracy를 줄인다." },
    ],
    derivation: [
      ["Predict", "각 particle에 제어 입력 u와 motion noise를 더한다."],
      ["Update", "측정 z와 particle 위치의 residual로 likelihood를 계산한다."],
      ["Normalize", "weight 합이 1이 되도록 나눈다."],
      ["Resample", "N_eff가 낮으면 높은 weight particle을 더 많이 복제한다."],
    ],
    handCalculation: {
      problem: "weights=[0.1,0.2,0.7]일 때 N_eff는?",
      given: { weights: "[0.1,0.2,0.7]" },
      steps: ["sum(w^2)=0.01+0.04+0.49=0.54", "N_eff=1/0.54=1.85"],
      answer: "N_eff≈1.85로 particle 3개 중 2개 이하만 실효적이다.",
    },
    robotApplication: "Nav2 AMCL에서 max_particles가 너무 작으면 kidnapped robot이나 대칭 복도에서 belief가 한쪽으로 빨리 붕괴한다. laser_model_type과 update_min_d/a가 PF 성능을 좌우한다.",
    lab: particleLab,
    visualization: {
      id: "vis_particle_filter_sir",
      title: "Particle Filter 분포와 Resampling",
      equation: "w_i proportional p(z|x_i), N_eff=1/sum(w_i^2)",
      parameters: [
        { name: "num_particles", symbol: "N", min: 50, max: 2000, default: 500, description: "particle 개수" },
        { name: "meas_std", symbol: "\\sigma_z", min: 0.1, max: 2, default: 0.5, description: "측정 노이즈 표준편차" },
      ],
      normalCase: "측정이 반복되면 particle들이 실제 위치 근처로 모인다.",
      failureCase: "N이 너무 작거나 resampling을 빼면 particle deprivation이 발생한다.",
    },
    quiz: {
      id: "pf_sir",
      conceptQuestion: "Particle Filter가 EKF보다 유리한 상황은?",
      conceptAnswer: "belief가 non-Gaussian이거나 여러 위치 후보가 동시에 가능한 상황이다.",
      calculationQuestion: "정규화 전 weight=[2,3,5]이면 정규화 weight는?",
      calculationAnswer: "합이 10이므로 [0.2,0.3,0.5]이다.",
      codeQuestion: "N_eff를 계산하는 Python 한 줄은?",
      codeAnswer: "neff = 1.0 / np.sum(weights**2)",
      debugQuestion: "resampling 후 estimate가 한 점에 고정된다. 무엇을 의심하는가?",
      debugAnswer: "motion noise가 너무 작거나 resampling을 너무 자주 수행해 particle deprivation이 생긴 것이다.",
      visualQuestion: "meas_std를 크게 하면 particle 분포가 어떻게 변하는가?",
      visualAnswer: "측정을 덜 신뢰하므로 weight 차이가 작고 분포가 넓게 남는다.",
      robotQuestion: "AMCL에서 대칭 복도 양쪽에 particle cloud가 남는 것은 오류인가?",
      robotAnswer: "아니다. 센서가 두 위치를 구분하지 못하면 다봉 belief가 자연스럽다. 추가 이동과 관측으로 하나가 사라진다.",
      designQuestion: "Nav2 AMCL의 max_particles를 늘릴 때 trade-off는?",
      designAnswer: "위치추정 robustness는 좋아지지만 CPU와 latency가 증가한다.",
    },
    wrongTagLabel: "Particle Filter weight/resampling 오류",
    nextSessions: ["pose_graph_slam_basics", "sensor_fusion_gps_imu"],
  }),
];
