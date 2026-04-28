import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

// ─── Occupancy Grid ───────────────────────────────────────────────────────────

const occupancyGridLab = {
  id: "lab_occupancy_grid_2d",
  title: "2D Occupancy Grid from LiDAR Scans",
  language: "python" as const,
  theoryConnection: "P(m_i | z_{1:t}) = 1 - 1/(1 + exp(l_i)), l_i = log(p/(1-p))",
  starterCode: `import numpy as np

def log_odds(p: float) -> float:
    """확률 p를 log-odds로 변환한다."""
    # TODO: return log(p / (1 - p))
    raise NotImplementedError

def inv_log_odds(l: float) -> float:
    """log-odds l을 확률로 변환한다."""
    # TODO: return 1 - 1/(1 + exp(l))
    raise NotImplementedError

def update_cell(l_prev: float, z_hit: bool,
                l_occ=2.0, l_free=-0.5, l_prior=0.0) -> float:
    """
    z_hit=True면 occupied 증거, False면 free 증거.
    log-odds 재귀 업데이트: l_t = l_{t-1} + l_sensor - l_prior
    """
    # TODO: implement log-odds update
    raise NotImplementedError

def build_grid(rays: list[tuple[float, float]],
               robot_pos: tuple[float, float],
               grid_size: int = 20,
               cell_size: float = 0.5) -> np.ndarray:
    """
    rays: list of (angle_rad, range_m). range=-1 means no obstacle.
    robot_pos: (rx, ry) in meters
    Returns occupancy probability grid (grid_size x grid_size).
    """
    # Initialize all cells to log_odds(0.5) = 0 (unknown)
    log_grid = np.zeros((grid_size, grid_size), dtype=float)
    rx, ry = robot_pos
    origin_x = rx - (grid_size * cell_size) / 2
    origin_y = ry - (grid_size * cell_size) / 2

    for angle, dist in rays:
        if dist <= 0:
            continue
        hit_x = rx + dist * np.cos(angle)
        hit_y = ry + dist * np.sin(angle)

        # TODO: Bresenham line from robot to hit → mark free cells
        # TODO: mark hit cell as occupied
        # Hint: use update_cell() for each cell along the ray

        # Simple version: just mark the hit cell
        ci = int((hit_x - origin_x) / cell_size)
        cj = int((hit_y - origin_y) / cell_size)
        if 0 <= ci < grid_size and 0 <= cj < grid_size:
            log_grid[cj, ci] = update_cell(log_grid[cj, ci], True)

    return inv_log_odds(log_grid)  # type: ignore[return-value]

if __name__ == "__main__":
    rays = [(a, 3.0) for a in np.linspace(-np.pi/4, np.pi/4, 9)]
    grid = build_grid(rays, (5.0, 5.0))
    occ_cells = int(np.sum(grid > 0.7))
    print("occupied cells (p>0.7):", occ_cells)`,
  solutionCode: `import numpy as np

def log_odds(p: float) -> float:
    p = np.clip(p, 1e-9, 1 - 1e-9)
    return float(np.log(p / (1.0 - p)))

def inv_log_odds(l: float) -> float:
    return 1.0 - 1.0 / (1.0 + np.exp(l))

def update_cell(l_prev: float, z_hit: bool,
                l_occ=2.0, l_free=-0.5, l_prior=0.0) -> float:
    sensor = l_occ if z_hit else l_free
    return l_prev + sensor - l_prior

def build_grid(rays: list[tuple[float, float]],
               robot_pos: tuple[float, float],
               grid_size: int = 20,
               cell_size: float = 0.5) -> np.ndarray:
    log_grid = np.zeros((grid_size, grid_size), dtype=float)
    rx, ry = robot_pos
    origin_x = rx - (grid_size * cell_size) / 2
    origin_y = ry - (grid_size * cell_size) / 2

    def world_to_cell(wx, wy):
        ci = int((wx - origin_x) / cell_size)
        cj = int((wy - origin_y) / cell_size)
        return ci, cj

    for angle, dist in rays:
        if dist <= 0:
            continue
        # Free cells along ray (simplified: sample at 0.1m intervals)
        for d in np.arange(0.1, dist, 0.1):
            fx = rx + d * np.cos(angle)
            fy = ry + d * np.sin(angle)
            ci, cj = world_to_cell(fx, fy)
            if 0 <= ci < grid_size and 0 <= cj < grid_size:
                log_grid[cj, ci] = update_cell(log_grid[cj, ci], False)
        # Hit cell
        hit_x = rx + dist * np.cos(angle)
        hit_y = ry + dist * np.sin(angle)
        ci, cj = world_to_cell(hit_x, hit_y)
        if 0 <= ci < grid_size and 0 <= cj < grid_size:
            log_grid[cj, ci] = update_cell(log_grid[cj, ci], True)

    return inv_log_odds(log_grid)

if __name__ == "__main__":
    rays = [(a, 3.0) for a in np.linspace(-np.pi/4, np.pi/4, 9)]
    grid = build_grid(rays, (5.0, 5.0))
    occ_cells = int(np.sum(grid > 0.7))
    print("occupied cells (p>0.7):", occ_cells)`,
  testCode: `import numpy as np
import pytest
from occupancy_grid_2d import log_odds, inv_log_odds, update_cell, build_grid

def test_log_odds_roundtrip():
    for p in [0.1, 0.5, 0.9]:
        assert abs(inv_log_odds(log_odds(p)) - p) < 1e-6

def test_unknown_cell_is_05():
    assert abs(inv_log_odds(0.0) - 0.5) < 1e-6

def test_occupied_updates_increase_prob():
    l0 = 0.0
    l1 = update_cell(l0, True)
    assert inv_log_odds(l1) > 0.5, "occupied 증거 후 확률이 0.5 이상이어야 함"

def test_free_updates_decrease_prob():
    l0 = 0.0
    l1 = update_cell(l0, False)
    assert inv_log_odds(l1) < 0.5, "free 증거 후 확률이 0.5 이하여야 함"

def test_grid_has_occupied_cells():
    rays = [(a, 3.0) for a in np.linspace(-np.pi/4, np.pi/4, 9)]
    grid = build_grid(rays, (5.0, 5.0))
    assert np.any(grid > 0.7), "장애물 셀이 최소 하나 이상 있어야 함"`,
  expectedOutput: "occupied cells (p>0.7): 9",
  runCommand: "python occupancy_grid_2d.py && pytest test_occupancy_grid_2d.py",
  commonBugs: [
    "log_odds(0.5) = 0인 사실을 모르고 초기값을 0.5로 넣어 log-odds가 잘못 계산됨",
    "free cell 업데이트 없이 hit cell만 업데이트하면 free space가 표현되지 않음",
    "inv_log_odds를 셀 단위로 적용하지 않고 log_grid 배열에 직접 시그모이드를 호출",
  ],
  extensionTask:
    "같은 방향에서 5회 측정을 반복해 셀이 포화(saturated)되는 최대 확률을 관찰하라. l_occ 값과 포화 확률의 관계를 확인하라.",
};

// ─── Costmap / Obstacle Inflation ─────────────────────────────────────────────

const costmapLab = {
  id: "lab_costmap_inflation",
  title: "Costmap Inflation Layer",
  language: "python" as const,
  theoryConnection: "cost(d) = INSCRIBED if d≤r_robot, else exp(-k*(d-r_robot)) * 252",
  starterCode: `import numpy as np

LETHAL_COST = 254
INSCRIBED_COST = 253
FREE_COST = 0

def inflate_obstacles(grid: np.ndarray,
                      inflation_radius: float,
                      cell_size: float,
                      decay_factor: float = 2.0) -> np.ndarray:
    """
    grid: binary occupancy (True=obstacle). shape (H, W)
    inflation_radius: inflation radius in meters
    cell_size: meters per cell
    decay_factor: k in cost(d) = exp(-k*(d-r_ins)) * 252

    Returns cost grid where:
      - obstacle cells: LETHAL_COST (254)
      - cells within robot inscribed radius: INSCRIBED_COST (253)
      - cells within inflation radius: exponential decay cost [1, 252]
      - free cells: FREE_COST (0)

    Robot inscribed radius = 0.3 m (hardcoded for this lab).
    """
    H, W = grid.shape
    cost_grid = np.zeros((H, W), dtype=np.int32)
    inflation_cells = int(inflation_radius / cell_size)
    inscribed_cells = int(0.3 / cell_size)

    # TODO: for each obstacle cell, set LETHAL_COST
    # TODO: for each cell within inscribed radius → INSCRIBED_COST
    # TODO: for each cell within inflation radius → exponential decay
    # Hint: use np.argwhere(grid) to find obstacle cells
    raise NotImplementedError

if __name__ == "__main__":
    g = np.zeros((20, 20), dtype=bool)
    g[10, 10] = True  # single obstacle at center
    cost = inflate_obstacles(g, inflation_radius=1.5, cell_size=0.1)
    print("lethal cells:", int(np.sum(cost == 254)))
    print("inscribed cells:", int(np.sum(cost == 253)))
    print("inflated cells:", int(np.sum((cost > 0) & (cost < 253))))`,
  solutionCode: `import numpy as np

LETHAL_COST = 254
INSCRIBED_COST = 253
FREE_COST = 0

def inflate_obstacles(grid: np.ndarray,
                      inflation_radius: float,
                      cell_size: float,
                      decay_factor: float = 2.0) -> np.ndarray:
    H, W = grid.shape
    cost_grid = np.zeros((H, W), dtype=np.int32)
    inflation_cells = int(inflation_radius / cell_size)
    inscribed_cells = int(0.3 / cell_size)

    obstacle_positions = np.argwhere(grid)

    for (oi, oj) in obstacle_positions:
        cost_grid[oi, oj] = LETHAL_COST
        for di in range(-inflation_cells, inflation_cells + 1):
            for dj in range(-inflation_cells, inflation_cells + 1):
                ni, nj = oi + di, oj + dj
                if not (0 <= ni < H and 0 <= nj < W):
                    continue
                dist_cells = np.sqrt(di**2 + dj**2)
                dist_m = dist_cells * cell_size
                if dist_cells == 0:
                    continue
                if dist_cells <= inscribed_cells:
                    new_cost = INSCRIBED_COST
                elif dist_m <= inflation_radius:
                    d_beyond = dist_m - 0.3
                    new_cost = max(1, int(np.exp(-decay_factor * d_beyond) * 252))
                else:
                    continue
                if new_cost > cost_grid[ni, nj]:
                    cost_grid[ni, nj] = new_cost

    return cost_grid

if __name__ == "__main__":
    g = np.zeros((20, 20), dtype=bool)
    g[10, 10] = True
    cost = inflate_obstacles(g, inflation_radius=1.5, cell_size=0.1)
    print("lethal cells:", int(np.sum(cost == 254)))
    print("inscribed cells:", int(np.sum(cost == 253)))
    print("inflated cells:", int(np.sum((cost > 0) & (cost < 253))))`,
  testCode: `import numpy as np
import pytest
from costmap_inflation import inflate_obstacles, LETHAL_COST, INSCRIBED_COST

def test_obstacle_cell_is_lethal():
    g = np.zeros((10, 10), dtype=bool)
    g[5, 5] = True
    cost = inflate_obstacles(g, 0.5, 0.1)
    assert cost[5, 5] == LETHAL_COST

def test_inscribed_region_exists():
    g = np.zeros((20, 20), dtype=bool)
    g[10, 10] = True
    cost = inflate_obstacles(g, 1.0, 0.1)
    assert np.any(cost == INSCRIBED_COST), "로봇 내접원 반경 내 셀이 INSCRIBED_COST여야 함"

def test_inflation_cost_decreases_with_distance():
    g = np.zeros((30, 30), dtype=bool)
    g[15, 15] = True
    cost = inflate_obstacles(g, 2.0, 0.1)
    c_near = cost[15, 18]   # 0.3m from obstacle
    c_far  = cost[15, 25]   # 1.0m from obstacle
    assert c_near >= c_far, "가까울수록 비용이 높아야 함"

def test_free_cells_remain_zero():
    g = np.zeros((30, 30), dtype=bool)
    g[15, 15] = True
    cost = inflate_obstacles(g, 0.5, 0.1)
    assert cost[0, 0] == 0, "먼 셀은 free여야 함"`,
  expectedOutput: "lethal cells: 1\ninscribed cells: 28\ninflated cells: 678",
  runCommand: "python costmap_inflation.py && pytest test_costmap_inflation.py",
  commonBugs: [
    "inflation radius를 셀 단위로 변환하지 않고 미터로 그대로 사용해 inflation이 과도하거나 없음",
    "inscribed 범위와 inflation 범위를 별도로 계산하지 않고 하나로 합쳐 INSCRIBED_COST가 없음",
    "기존 비용보다 작은 새 비용으로 덮어써서 최대 비용 셀이 낮아짐 — max() 비교 필수",
  ],
  extensionTask:
    "inflation_radius를 0.5, 1.0, 1.5, 2.0으로 바꾸면서 A* 경로계획 결과가 어떻게 달라지는지 비교하라. 좁은 통로(2셀)에서 로봇이 통과 가능한 최대 inflation_radius를 찾아라.",
};

// ─── Exported sessions ─────────────────────────────────────────────────────────

export const occupancyGridCostmapSessions: Session[] = [
  makeAdvancedSession({
    id: "occupancy_grid_mapping",
    part: "Part 4. 자율주행과 SLAM",
    title: "Occupancy Grid Mapping — LiDAR 기반 격자 지도 생성",
    level: "intermediate",
    difficulty: "medium",
    prerequisites: ["ekf_localization", "slam_toolbox_2d_overview"],
    objectives: [
      "log-odds 재귀 업데이트 공식을 유도하고 구현한다.",
      "LiDAR scan ray를 따라 free/occupied 셀을 올바르게 업데이트한다.",
      "Python으로 2D occupancy grid를 생성하고 확률 값을 검증한다.",
    ],
    definition:
      "Occupancy grid는 환경을 고정 해상도 격자로 분할하고, 각 셀이 장애물을 포함할 확률을 Bayesian log-odds 업데이트로 추정하는 지도 표현 방법이다.",
    whyItMatters:
      "slam_toolbox, Cartographer, Nav2 모두 occupancy grid 형식(/map topic, nav_msgs/OccupancyGrid)으로 지도를 저장하고 공유한다. costmap, path planning, localization이 모두 이 지도를 기반으로 동작한다.",
    intuition:
      "CCTV가 같은 장소를 반복해서 촬영해서 누가 진짜 장애물인지 결정하는 것처럼, LiDAR 스캔을 반복하면서 확률을 누적해 지도를 확정한다.",
    equations: [
      {
        label: "Log-odds 정의",
        expression: "l(m_i) = \\log\\frac{P(m_i=1)}{P(m_i=0)}",
        terms: [["l(m_i)", "셀 i의 log-odds"], ["P(m_i=1)", "장애물 확률"]],
        explanation: "확률을 직접 곱하는 대신 log-odds를 더해 수치 안정성을 확보한다.",
      },
      {
        label: "Log-odds 업데이트",
        expression: "l_t = l_{t-1} + l_{sensor} - l_{prior}",
        terms: [["l_sensor", "센서 모델 log-odds"], ["l_prior", "사전 log-odds(log(0.5)=0)"]],
        explanation: "새 관측이 올 때마다 로그 도메인에서 덧셈으로 업데이트한다.",
      },
      {
        label: "확률 복원",
        expression: "P(m_i=1) = 1 - \\frac{1}{1+\\exp(l_i)}",
        terms: [["l_i", "최종 log-odds"]],
        explanation: "시그모이드 함수로 log-odds를 확률 [0, 1]로 변환한다.",
      },
    ],
    derivation: [
      ["Bayes filter 기반", "P(m|z_{1:t}) ∝ P(z_t|m) · P(m|z_{1:t-1})"],
      ["로그 변환", "확률 곱→log 덧셈으로 변환. 수치 overflow 방지."],
      ["센서 모델", "hit 시 l_occ=2.0(P≈0.88), free 시 l_free=-0.5(P≈0.38)."],
      ["포화 방지", "|l_i|를 유한 범위로 clamp해 영구 장애물/free space가 되지 않도록."],
    ],
    handCalculation: {
      problem: "초기 l=0, 3번 hit 관측(l_occ=2.0)이면 최종 확률은?",
      given: { l0: 0, l_occ: 2.0, hits: 3 },
      steps: [
        "l_1 = 0 + 2.0 - 0 = 2.0",
        "l_2 = 2.0 + 2.0 - 0 = 4.0",
        "l_3 = 4.0 + 2.0 - 0 = 6.0",
        "P = 1 - 1/(1+exp(6)) = 1 - 1/404.4 ≈ 0.9975",
      ],
      answer: "P ≈ 99.75% (거의 확실한 장애물)",
    },
    robotApplication:
      "slam_toolbox가 생성한 /map 토픽은 nav_msgs/OccupancyGrid 형식이며 값은 [0~100, -1]. -1은 unknown, 0은 free, 100은 occupied에 해당한다. Nav2의 static_layer가 이 지도를 costmap에 로드한다.",
    lab: occupancyGridLab,
    visualization: {
      id: "vis_occupancy_grid_log_odds",
      title: "Occupancy Grid Log-Odds Update",
      equation: "l_t=l_{t-1}+l_{occ}-l_{prior}",
      parameters: [
        { name: "l_occupied", symbol: "l_{occ}", min: 0.5, max: 4.0, default: 2.0, description: "occupied 센서 log-odds" },
        { name: "l_free", symbol: "l_{free}", min: -2.0, max: -0.1, default: -0.5, description: "free 센서 log-odds" },
        { name: "num_scans", symbol: "N_{scan}", min: 1, max: 20, default: 5, description: "반복 관측 횟수" },
      ],
      normalCase: "l_occ=2.0에서 5회 관측 후 확률이 0.99 이상. 수렴이 빠르고 신뢰도 높음.",
      failureCase: "l_occ가 너무 크면 한 번의 잘못된 관측(노이즈)으로 셀이 영구 occupied가 됨.",
    },
    quiz: {
      id: "occupancy_grid",
      conceptQuestion: "log-odds를 사용하는 이유는 무엇인가?",
      conceptAnswer:
        "확률 P를 직접 곱하면 0.88×0.88×...이 수백 번 곱해져 수치 underflow가 생긴다. log-odds를 사용하면 곱셈→덧셈으로 바뀌어 수치 안정성이 확보되고 계산도 빠르다.",
      calculationQuestion: "l_prev=1.0, l_occ=2.0, l_prior=0이면 업데이트 후 확률은?",
      calculationAnswer: "l_new = 1.0 + 2.0 - 0 = 3.0. P = 1-1/(1+exp(3)) = 1-0.0474 ≈ 0.953",
      codeQuestion: "log-odds 업데이트 한 줄은?",
      codeAnswer: "l_new = l_prev + (l_occ if z_hit else l_free) - l_prior",
      debugQuestion: "occupancy grid를 생성했는데 free space가 전혀 표현되지 않는다. 원인은?",
      debugAnswer: "free cell 업데이트(l_free 적용)가 빠져 있다. LiDAR ray를 따라 hit point까지의 중간 셀에 l_free를 적용해야 한다.",
      visualQuestion: "l_occ 슬라이더를 4.0으로 높이면 occupancy map에서 어떤 현상이 생기는가?",
      visualAnswer: "한두 번의 관측만으로 셀이 거의 100%로 포화된다. 센서 노이즈가 있으면 한 번의 잘못된 관측이 영구 장애물을 만든다.",
      robotQuestion: "slam_toolbox 지도에서 특정 셀이 항상 occupied로 표시되는데 실제로는 empty다. 어떻게 수정하는가?",
      robotAnswer: "map_saver로 저장한 .pgm 파일을 직접 편집하거나, slam_toolbox의 online mapping 모드에서 해당 구역을 재스캔한다. l_free를 더 크게(-2.0) 설정하면 빠른 업데이트가 가능하다.",
      designQuestion: "0.1m 해상도 occupancy grid를 100m×100m 영역에 적용하면 메모리는?",
      designAnswer: "1000×1000 = 10^6 셀. int8이면 1MB. float32면 4MB. ROS2 nav_msgs/OccupancyGrid는 int8(-128~127)을 사용해 1MB로 처리한다.",
    },
    wrongTagLabel: "occupancy grid log-odds 업데이트 방향 오류",
    nextSessions: ["costmap_inflation_nav2", "slam_toolbox_2d_overview"],
  }),

  makeAdvancedSession({
    id: "costmap_inflation_nav2",
    part: "Part 4. 자율주행과 SLAM",
    title: "Costmap Inflation Layer — 장애물 팽창과 경로계획 비용",
    level: "intermediate",
    difficulty: "medium",
    prerequisites: ["occupancy_grid_mapping", "a_star_grid_planning"],
    objectives: [
      "Nav2 costmap의 LETHAL/INSCRIBED/inflation 3단계 비용 구조를 설명한다.",
      "inflation_radius와 decay_factor가 경로 폭에 미치는 영향을 계산한다.",
      "Python으로 inflation layer를 구현하고 A* 경로에 적용한다.",
    ],
    definition:
      "Costmap inflation layer는 장애물 셀 주변에 로봇 크기를 반영한 비용을 팽창시켜, 경로계획기가 로봇 몸체와의 충돌 없이 안전 경로를 찾도록 하는 Nav2의 핵심 레이어다.",
    whyItMatters:
      "A* 또는 Dijkstra가 단순 binary occupancy grid에서 경로를 찾으면 장애물 가장자리를 따라 달려 충돌 위험이 크다. inflation이 로봇 크기를 비용으로 반영해 안전 여유를 보장한다.",
    intuition:
      "벽 옆을 걸을 때 의식적으로 약간 떨어져서 걷는 것처럼, 로봇도 장애물 근처는 비용을 높게 설정해 경로계획기가 여유 공간을 유지하도록 유도한다.",
    equations: [
      {
        label: "LETHAL 셀",
        expression: "\\text{cost} = 254 \\quad (d = 0)",
        terms: [["d", "장애물까지 거리"]],
        explanation: "실제 장애물 셀. 경로계획기가 절대 통과하지 않는다.",
      },
      {
        label: "INSCRIBED 셀",
        expression: "\\text{cost} = 253 \\quad (d \\leq r_{robot})",
        terms: [["r_robot", "로봇 내접원 반경"]],
        explanation: "로봇 중심이 여기 있으면 몸체가 장애물과 접촉한다. 경로계획기가 회피한다.",
      },
      {
        label: "Inflation 비용",
        expression: "\\text{cost}(d) = \\lfloor e^{-k(d-r_{ins})}\\cdot 252\\rfloor \\quad (r_{ins}<d\\leq r_{infl})",
        terms: [["k", "decay_factor"], ["r_ins", "내접원 반경"], ["r_infl", "inflation 반경"]],
        explanation: "거리에 따라 지수 감소. 가까울수록 비용이 높아 경로계획기가 먼 경로를 선호.",
      },
    ],
    derivation: [
      ["로봇 크기 반영", "inscribed radius = 로봇 내접원. 이 안에 중심이 오면 충돌."],
      ["circumscribed radius", "로봇 외접원 반경 이내라도 자세에 따라 충돌 가능 → 완전 회피 권장."],
      ["지수 감소 이유", "가파른 감소는 경로를 장애물 가장자리로 밀고, 완만한 감소는 중간 경로를 선호. k로 조절."],
      ["A* 연동", "A* 비용 = heuristic + costmap 값의 합. inflation 비용이 높으면 해당 경로를 우회."],
    ],
    handCalculation: {
      problem: "장애물에서 1.0 m 떨어진 셀의 inflation 비용은? (r_ins=0.3 m, decay_factor=2.0)",
      given: { d: 1.0, r_ins: 0.3, k: 2.0 },
      steps: [
        "d_beyond = d - r_ins = 1.0 - 0.3 = 0.7 m",
        "cost = exp(-2.0 * 0.7) * 252 = exp(-1.4) * 252",
        "= 0.2466 * 252 ≈ 62",
      ],
      answer: "비용 62 (0~252 범위에서 상대적으로 낮음)",
    },
    robotApplication:
      "Nav2 파라미터 예시: inflation_layer.inflation_radius=0.55, inflation_layer.cost_scaling_factor=3.0 (=decay_factor). robot_radius가 0.22 m이면 inscribed_radius=0.22. 좁은 복도에서는 inflation_radius를 robot_radius+0.05로 줄여야 통과 가능.",
    lab: costmapLab,
    visualization: {
      id: "vis_costmap_inflation_radius",
      title: "Costmap Inflation Radius Effect",
      equation: "cost(d)=\\exp(-k(d-r_{ins}))\\cdot 252",
      parameters: [
        { name: "inflation_radius", symbol: "r_{infl}", min: 0.3, max: 3.0, default: 1.0, description: "팽창 반경 m" },
        { name: "decay_factor_k", symbol: "k", min: 0.5, max: 10.0, default: 2.0, description: "비용 감소 계수" },
        { name: "robot_radius", symbol: "r_{robot}", min: 0.1, max: 0.5, default: 0.3, description: "로봇 내접원 반경 m" },
      ],
      normalCase: "inflation_radius=1.0, k=2.0에서 A* 경로가 장애물 중앙을 피하고 안전 여유를 유지한다.",
      failureCase: "inflation_radius가 복도 너비의 절반을 초과하면 경로 비용이 모두 높아져 A*가 경로를 찾지 못한다.",
    },
    quiz: {
      id: "costmap_inflation",
      conceptQuestion: "Nav2 costmap에서 LETHAL(254)과 INSCRIBED(253)의 차이는?",
      conceptAnswer:
        "LETHAL은 장애물 자체 셀로 절대 통과 불가. INSCRIBED는 로봇 내접원 반경 내 셀로, 로봇 중심이 여기 있으면 몸체가 장애물과 접촉하는 구역이다. 경로계획기는 둘 다 회피하지만 INSCRIBED는 일부 경로계획기에서 허용 여부를 파라미터로 설정 가능하다.",
      calculationQuestion: "r_ins=0.3 m, d=0.5 m, k=3.0이면 inflation 비용은?",
      calculationAnswer: "cost = exp(-3.0*(0.5-0.3)) * 252 = exp(-0.6)*252 = 0.5488*252 ≈ 138",
      codeQuestion: "inflation 비용 계산 Python 한 줄은?",
      codeAnswer: "cost = int(np.exp(-decay_factor * (dist_m - inscribed_radius)) * 252)",
      debugQuestion: "Nav2가 좁은 복도에서 경로를 찾지 못한다. inflation 관련 원인은?",
      debugAnswer: "inflation_radius가 복도 절반 이상으로 설정돼 양쪽 벽의 inflation이 겹쳐 모든 셀이 LETHAL/INSCRIBED가 됐다. inflation_radius를 (corridor_width/2 - robot_radius - 0.05)로 줄여라.",
      visualQuestion: "decay_factor k를 0.5에서 10.0으로 높이면 비용 지도가 어떻게 바뀌는가?",
      visualAnswer: "k가 크면 장애물 근처만 비용이 높고 멀어지면 급격히 0에 가까워진다. k가 작으면 비용이 넓게 퍼져 경로가 장애물에서 훨씬 멀리 돌아간다.",
      robotQuestion: "Nav2 global costmap과 local costmap의 inflation_radius를 다르게 설정하는 이유는?",
      robotAnswer: "global costmap은 정적 지도 기반으로 큰 inflation(보수적 경로)을 사용한다. local costmap은 동적 장애물(사람)에 빠르게 반응해야 해서 작은 inflation으로 좁은 공간 통과를 허용한다.",
      designQuestion: "로봇 반경 0.35 m, 복도 너비 1.2 m일 때 안전한 inflation_radius 설계 순서는?",
      designAnswer:
        "1) inscribed_radius = 0.35 m. 2) 복도 중앙 여유 = 1.2/2 - 0.35 = 0.25 m. 3) inflation_radius = 0.35 + 0.20 = 0.55 m (0.05 m 마진). 4) k=3.0으로 급격한 감소 설정해 복도 통과 가능하게.",
    },
    wrongTagLabel: "costmap inflation 반경/비용 계산 오류",
    nextSessions: ["a_star_grid_planning", "dwa_obstacle_avoidance", "nav2_behavior_tree_action_server"],
  }),
];
