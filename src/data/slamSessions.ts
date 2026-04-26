// ============================================================
// slamSessions.ts
// SLAM 기초 — Occupancy Grid + Log-Odds Update
// Part 4. 자율주행과 SLAM
// ============================================================
import type { Session } from "../types";
import {
  ensureCodeLabShape,
  makeCoreQuizzes,
  makeEquation,
  makeVisualization,
  makeWrongTags,
  session,
  step,
} from "./v2SessionHelpers";

// ──────────────────────────────────────────────
// [코드랩] Occupancy Grid Log-Odds 업데이트
// ──────────────────────────────────────────────
const occupancyGridLab = ensureCodeLabShape({
  id: "lab_occupancy_grid_logodds",
  title: "Occupancy Grid: Log-Odds 업데이트 구현",
  language: "python",
  theoryConnection: "l[k] = l[k-1] + log(p_z/(1-p_z)) - log(p0/(1-p0))",
  starterCode: `import numpy as np
import matplotlib.pyplot as plt

# ──── 파라미터 ────
P_OCC   = 0.7   # 레이저가 물체에서 반사될 때 occupied 확률
P_FREE  = 0.3   # 레이저가 셀을 통과할 때 occupied 확률
P_PRIOR = 0.5   # 아무 측정 없을 때 확률 (중립)

def prob_to_logodds(p):
    """확률 p를 log-odds 값으로 변환: log(p / (1-p))"""
    # TODO: return np.log(p / (1 - p))
    raise NotImplementedError

def logodds_to_prob(l):
    """log-odds l을 확률로 변환: 1 / (1 + exp(-l))"""
    # TODO: return 1.0 / (1.0 + np.exp(-l))
    raise NotImplementedError

def update_cell(log_odds, measurement):
    """
    log_odds: 현재 셀의 log-odds 값
    measurement: 'occupied' 또는 'free'
    반환: 업데이트된 log-odds 값
    수식: l_new = l_old + log(p_z/(1-p_z)) - log(p0/(1-p0))
    """
    # TODO:
    # l_prior = prob_to_logodds(P_PRIOR)
    # occupied 이면: log_odds + prob_to_logodds(P_OCC) - l_prior
    # free 이면:     log_odds + prob_to_logodds(P_FREE) - l_prior
    raise NotImplementedError

def create_grid(rows, cols):
    """모든 셀을 P_PRIOR=0.5 (log-odds=0)으로 초기화"""
    # TODO: return np.full((rows, cols), prob_to_logodds(P_PRIOR))
    raise NotImplementedError

if __name__ == "__main__":
    grid = create_grid(10, 10)
    # 셀 (5,5)에 occupied 측정 3번
    for _ in range(3):
        grid[5, 5] = update_cell(grid[5, 5], "occupied")
    # 셀 (5,6)에 free 측정 3번
    for _ in range(3):
        grid[5, 6] = update_cell(grid[5, 6], "free")
    prob_occ  = logodds_to_prob(grid[5, 5])
    prob_free = logodds_to_prob(grid[5, 6])
    print(f"(5,5) occupied 3회 후 확률: {prob_occ:.3f}")
    print(f"(5,6) free    3회 후 확률: {prob_free:.3f}")`,
  solutionCode: `import numpy as np
import matplotlib.pyplot as plt

P_OCC   = 0.7
P_FREE  = 0.3
P_PRIOR = 0.5

def prob_to_logodds(p):
    return np.log(p / (1.0 - p))

def logodds_to_prob(l):
    return 1.0 / (1.0 + np.exp(-l))

def update_cell(log_odds, measurement):
    l_prior = prob_to_logodds(P_PRIOR)
    if measurement == "occupied":
        return log_odds + prob_to_logodds(P_OCC) - l_prior
    else:
        return log_odds + prob_to_logodds(P_FREE) - l_prior

def create_grid(rows, cols):
    return np.full((rows, cols), prob_to_logodds(P_PRIOR), dtype=float)

if __name__ == "__main__":
    grid = create_grid(10, 10)
    for _ in range(3):
        grid[5, 5] = update_cell(grid[5, 5], "occupied")
    for _ in range(3):
        grid[5, 6] = update_cell(grid[5, 6], "free")
    prob_occ  = logodds_to_prob(grid[5, 5])
    prob_free = logodds_to_prob(grid[5, 6])
    print(f"(5,5) occupied 3회 후 확률: {prob_occ:.3f}")
    print(f"(5,6) free    3회 후 확률: {prob_free:.3f}")

    prob_grid = logodds_to_prob(grid)
    plt.figure(figsize=(6, 6))
    plt.imshow(prob_grid, vmin=0, vmax=1, cmap="RdYlGn_r", origin="upper")
    plt.colorbar(label="P(occupied)")
    plt.title("Occupancy Grid  (초록=free, 빨강=occupied)")
    plt.savefig("occupancy_grid.png")
    plt.close()
    print("occupancy_grid.png 저장 완료")`,
  testCode: `import numpy as np
import pytest
from occupancy_grid_logodds import (
    prob_to_logodds, logodds_to_prob, update_cell, create_grid,
    P_OCC, P_FREE, P_PRIOR,
)

def test_prob_to_logodds_half():
    """P=0.5 → log-odds=0 이어야 한다"""
    assert abs(prob_to_logodds(0.5)) < 1e-10

def test_logodds_roundtrip():
    for p in [0.1, 0.5, 0.9]:
        assert abs(logodds_to_prob(prob_to_logodds(p)) - p) < 1e-9

def test_occupied_increases_logodds():
    grid = create_grid(3, 3)
    before = grid[1, 1]
    grid[1, 1] = update_cell(grid[1, 1], "occupied")
    assert grid[1, 1] > before

def test_free_decreases_logodds():
    grid = create_grid(3, 3)
    before = grid[1, 1]
    grid[1, 1] = update_cell(grid[1, 1], "free")
    assert grid[1, 1] < before

def test_repeated_occupied_converges():
    """10번 occupied 측정 후 확률이 0.9 이상이어야 한다"""
    l = prob_to_logodds(0.5)
    for _ in range(10):
        l = update_cell(l, "occupied")
    assert logodds_to_prob(l) > 0.9

def test_grid_shape():
    grid = create_grid(5, 7)
    assert grid.shape == (5, 7)`,
  expectedOutput: "(5,5) occupied 3회 후 확률: 0.927\n(5,6) free    3회 후 확률: 0.073\noccupancy_grid.png 저장 완료",
  runCommand: "python occupancy_grid_logodds.py && pytest test_occupancy_grid_logodds.py",
  commonBugs: [
    "log(p/(1-p)) 대신 log(p)만 써서 log-odds 공식이 틀림",
    "l_prior를 빼지 않아 업데이트마다 prior가 중복 누적됨",
    "1.0 + exp(-l) 대신 1 + exp(l)을 써서 확률 변환이 반대가 됨",
    "occupied와 free 확률을 서로 바꿔 격자가 거꾸로 업데이트됨",
  ],
  extensionTask:
    "10x10 격자에서 LiDAR 레이를 시뮬레이션해 경로 위 free 셀과 끝 occupied 셀을 자동으로 업데이트하는 ray_cast 함수를 추가하라.",
});

// ──────────────────────────────────────────────
// [세션 정의]
// ──────────────────────────────────────────────
export const slamSessions: Session[] = [
  session({
    id: "slam_occupancy_grid",
    part: "Part 4. 자율주행과 SLAM",
    title: "SLAM 기초: Occupancy Grid와 Log-Odds 업데이트",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 75,
    prerequisites: ["path_planning_astar", "kalman_filter_1d"],
    learningObjectives: [
      "Occupancy Grid에서 각 셀이 무엇을 의미하는지 설명한다.",
      "Log-odds 변환으로 확률 Bayes 업데이트를 O(1)에 구현한다.",
      "LiDAR 측정에 따라 free/occupied 셀을 올바르게 분류한다.",
      "slam_toolbox의 occ_thresh/free_thresh 파라미터와 P_OCC/P_FREE를 연결한다.",
    ],
    theory: {
      definition:
        "Occupancy Grid는 환경을 균일한 격자로 분할하고 각 셀이 장애물로 채워져 있을 확률 P(occupied)를 저장하는 지도 표현이다. SLAM에서 로봇이 이동하며 받은 센서 데이터로 이 격자를 반복 업데이트한다.",
      whyItMatters:
        "Nav2 navigation stack은 costmap이라는 Occupancy Grid를 기반으로 경로를 계획한다. LiDAR 데이터가 격자에 어떻게 반영되는지 모르면 slam_toolbox 파라미터를 올바르게 튜닝할 수 없다.",
      intuition:
        "격자를 '모르는 땅'(회색, 50%), '빈 땅'(흰색, 낮은 확률), '막힌 땅'(검정, 높은 확률)으로 색칠한다. 레이저가 어떤 칸을 지나치면 그 칸은 흰색으로 옅어지고, 레이저가 어떤 칸에서 튕겨오면 그 칸은 검정으로 어두워진다.",
      equations: [
        makeEquation(
          "Log-odds 표현",
          "l(x) = \\log\\frac{P(x=\\text{occ})}{P(x=\\text{free})}",
          [
            ["P(x=occ)", "셀이 occupied일 확률"],
            ["P(x=free)", "셀이 free일 확률 = 1 - P(occ)"],
          ],
          "확률 0은 -∞, 확률 1은 +∞, 확률 0.5는 0에 해당한다.",
        ),
        makeEquation(
          "Bayes 업데이트 (log-odds)",
          "l_t = l_{t-1} + \\log\\frac{p(z|\\text{occ})}{p(z|\\text{free})} - \\log\\frac{p_0}{1-p_0}",
          [
            ["z", "센서 측정값"],
            ["p0", "사전 확률 (prior = 0.5)"],
          ],
          "log-odds끼리 더하고 빼서 Bayes 업데이트를 O(1)으로 수행한다.",
        ),
        makeEquation(
          "확률 ↔ log-odds 변환",
          "p = \\frac{1}{1+e^{-l}}, \\quad l = \\log\\frac{p}{1-p}",
          [
            ["p", "확률 [0,1]"],
            ["l", "log-odds (-∞~+∞)"],
          ],
          "시각화할 때만 logodds_to_prob으로 변환하고, 업데이트는 log-odds에서 한다.",
        ),
      ],
      derivation: [
        step("격자 초기화", "모든 셀을 P_PRIOR=0.5 → log-odds=0으로 초기화한다."),
        step("occupied 측정", "레이저가 셀에서 반사됨 → P_OCC=0.7 → log-odds 증가분을 더한다."),
        step("free 측정", "레이저가 셀을 통과함 → P_FREE=0.3 → log-odds 감소분을 더한다."),
        step("prior 보정", "매 업데이트마다 prior항을 빼서 중복 누적을 막는다."),
        step("시각화", "logodds_to_prob()로 변환 후 0~1 확률 격자를 색상으로 표시한다."),
        step(
          "Nav2 연결",
          "slam_toolbox가 이 격자를 /map 토픽으로 publish하면 Nav2 costmap_2d가 읽어서 경로 계획에 사용한다.",
        ),
      ],
      handCalculation: {
        problem:
          "P_OCC=0.7, P_PRIOR=0.5일 때 초기화된 셀에 occupied 측정 1번 후 log-odds와 확률은?",
        given: { P_OCC: 0.7, P_PRIOR: 0.5 },
        steps: [
          "l_prior = log(0.5/0.5) = 0",
          "l_occ   = log(0.7/0.3) ≈ 0.847",
          "l_update = 0 + 0.847 - 0 = 0.847",
          "p = 1/(1+e^{-0.847}) ≈ 0.70",
        ],
        answer: "log-odds: 0.847, 확률: 0.70 (P_OCC와 일치해야 함)",
      },
      robotApplication:
        "slam_toolbox에서 occ_thresh=0.65, free_thresh=0.35는 P_OCC와 P_FREE와 같은 개념이다. map_update_interval을 줄이면 격자가 더 자주 업데이트되지만 연산 부담이 커진다. ros2 topic echo /map으로 OccupancyGrid 메시지를 확인할 수 있다.",
    },
    codeLabs: [occupancyGridLab],
    visualizations: [
      makeVisualization(
        "vis_occupancy_grid",
        "Occupancy Grid 실시간 업데이트",
        "slam_occupancy_grid",
        "l_t = l_{t-1} + log(p_occ/p_free) - log(p0/(1-p0))",
        occupancyGridLab.id,
        [
          {
            name: "p_occ",
            symbol: "P_{occ}",
            min: 0.51,
            max: 0.99,
            default: 0.7,
            description: "occupied 측정 확률 (높을수록 격자가 빠르게 검어짐)",
          },
          {
            name: "p_free",
            symbol: "P_{free}",
            min: 0.01,
            max: 0.49,
            default: 0.3,
            description: "free 측정 확률 (낮을수록 격자가 빠르게 밝아짐)",
          },
          {
            name: "num_updates",
            symbol: "N",
            min: 1,
            max: 20,
            default: 5,
            description: "측정 횟수",
          },
        ],
        "P_OCC=0.7로 5번 측정하면 셀 확률이 0.96 이상으로 수렴한다.",
        "P_OCC가 0.51에 가까울수록 업데이트가 느리고 불확실성이 오래 남는다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "slam_occupancy_grid",
      conceptTag: "slam_occupancy_grid",
      reviewSession: "SLAM Occupancy Grid",
      conceptQuestion: "Log-odds 값이 0이면 그 셀의 상태는?",
      conceptAnswer: "P(occupied)=0.5로 completely unknown (모르는 상태)이다.",
      calculationQuestion:
        "P_OCC=0.7, P_PRIOR=0.5이면 occupied 1번 업데이트의 log-odds 증가분은?",
      calculationAnswer: "log(0.7/0.3) - log(0.5/0.5) = 0.847 - 0 = 0.847이다.",
      codeQuestion: "logodds_to_prob 변환 Python 코드 한 줄은?",
      codeAnswer: "return 1.0 / (1.0 + np.exp(-l))",
      debugQuestion: "l_prior를 빼지 않으면 어떤 문제가 생기는가?",
      debugAnswer:
        "매 측정마다 prior 항이 중복 누적되어 업데이트 속도가 비정상적으로 빨라지고 확률이 왜곡된다.",
      visualQuestion: "P_OCC 슬라이더를 0.99로 올리면 occupied 셀이 어떻게 변하는가?",
      visualAnswer:
        "log-odds 증가분이 매우 커져 1~2번 측정만으로도 확률이 0.99에 가까워진다.",
      robotQuestion:
        "slam_toolbox 지도에서 회색 영역이 너무 많이 남아있다면 무엇을 조정하는가?",
      robotAnswer:
        "map_update_interval을 줄이거나 로봇 주행 속도를 낮춰 LiDAR 스캔 밀도를 높인다.",
      designQuestion: "Occupancy Grid resolution을 0.05m → 0.01m로 줄이면 어떤 장단점이 있는가?",
      designAnswer:
        "더 세밀한 장애물 표현이 가능하지만 메모리와 연산량이 (5배)^2=25배 증가한다.",
    }),
    wrongAnswerTags: makeWrongTags("slam_occupancy_grid", "Occupancy Grid Log-Odds 오류", [
      "path_planning_astar",
      "kalman_filter_1d",
    ]),
    nextSessions: ["ekf_localization", "particle_filter_basics", "ros2_tf2_transform"],
  }),
];
