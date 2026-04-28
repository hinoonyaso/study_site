import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

// ─── Bicycle Model ───────────────────────────────────────────────────────────

const bicycleLab = {
  id: "lab_bicycle_model_kinematics",
  title: "Bicycle Model Kinematics",
  language: "python" as const,
  theoryConnection: "dx=v*cos(θ), dy=v*sin(θ), dθ=v*tan(δ)/L",
  starterCode: `import numpy as np

def bicycle_step(state, v, delta, L, dt):
    """
    state = [x, y, theta]  (rear axle center)
    v: longitudinal speed (m/s)
    delta: front steering angle (rad)
    L: wheelbase (m)
    dt: time step (s)
    Returns new state [x, y, theta]
    """
    # TODO: implement kinematic bicycle model equations
    raise NotImplementedError

def simulate(v=2.0, delta=0.2, L=2.5, dt=0.05, steps=100):
    state = np.array([0.0, 0.0, 0.0])
    trajectory = [state.copy()]
    for _ in range(steps):
        state = bicycle_step(state, v, delta, L, dt)
        trajectory.append(state.copy())
    return np.array(trajectory)

if __name__ == "__main__":
    traj = simulate()
    print("final x:", round(traj[-1, 0], 3))
    print("final y:", round(traj[-1, 1], 3))
    print("final theta:", round(traj[-1, 2], 3))`,
  solutionCode: `import numpy as np

def bicycle_step(state, v, delta, L, dt):
    x, y, theta = state
    dx = v * np.cos(theta)
    dy = v * np.sin(theta)
    dtheta = v * np.tan(delta) / L
    return np.array([x + dx * dt, y + dy * dt, theta + dtheta * dt])

def simulate(v=2.0, delta=0.2, L=2.5, dt=0.05, steps=100):
    state = np.array([0.0, 0.0, 0.0])
    trajectory = [state.copy()]
    for _ in range(steps):
        state = bicycle_step(state, v, delta, L, dt)
        trajectory.append(state.copy())
    return np.array(trajectory)

if __name__ == "__main__":
    traj = simulate()
    print("final x:", round(traj[-1, 0], 3))
    print("final y:", round(traj[-1, 1], 3))
    print("final theta:", round(traj[-1, 2], 3))`,
  testCode: `import numpy as np
import pytest
from bicycle_model_kinematics import bicycle_step, simulate

def test_zero_steering_goes_straight():
    s0 = np.array([0.0, 0.0, 0.0])
    s1 = bicycle_step(s0, 1.0, 0.0, 2.5, 0.1)
    assert abs(s1[1]) < 1e-9, "y는 0이어야 함 (직진)"
    assert abs(s1[0] - 0.1) < 1e-9, "x는 v*dt = 0.1이어야 함"

def test_positive_steering_turns_left():
    traj = simulate(v=1.0, delta=0.3, steps=50)
    assert traj[-1, 1] > 0, "양의 조향각이면 y가 증가해야 함"

def test_turning_radius():
    # R = L/tan(delta) 이면 원운동
    L, delta = 2.5, np.pi / 6
    R_expected = L / np.tan(delta)
    traj = simulate(v=1.0, delta=delta, L=L, dt=0.01, steps=628)
    # 한 바퀴 돌면 원점 근처로 돌아와야 함
    dist_from_start = np.linalg.norm(traj[-1, :2] - traj[0, :2])
    assert dist_from_start < 1.0, f"원운동 후 시작점 근처여야 함, 거리={dist_from_start:.2f}"`,
  expectedOutput: "final x: 7.607\nfinal y: 6.914\nfinal theta: 1.600",
  runCommand: "python bicycle_model_kinematics.py && pytest test_bicycle_model_kinematics.py",
  commonBugs: [
    "steering angle δ를 도(degree)로 넣어서 tan(δ)가 잘못 계산됨 — 반드시 라디안 변환",
    "dθ = v*tan(δ)/L 식에서 L(wheelbase)을 분모에 빠뜨림",
    "dt를 곱하지 않아 한 스텝에 전체 이동량이 반영됨",
  ],
  extensionTask:
    "delta를 -0.3 → 0.3으로 사인파로 바꾸고, 차량이 S자 곡선을 그리는지 x-y 플롯으로 확인하라.",
};

// ─── Stanley Controller ──────────────────────────────────────────────────────

const stanleyLab = {
  id: "lab_stanley_controller",
  title: "Stanley Lateral Controller",
  language: "python" as const,
  theoryConnection: "δ = ψ_e + arctan(k*e_cte / v)",
  starterCode: `import numpy as np

def stanley_steering(psi_e, e_cte, v, k=1.0, v_min=0.5):
    """
    psi_e: heading error (rad), positive = path is to the left of heading
    e_cte: cross-track error (m), positive = vehicle is right of path
    v: current speed (m/s)
    k: gain
    v_min: softening constant (prevent div-by-zero at low speed)
    Returns steering angle delta (rad)
    """
    # TODO: Stanley formula: delta = psi_e + arctan(k * e_cte / max(v, v_min))
    raise NotImplementedError

def simulate_straight_path(steps=200, dt=0.05):
    """Vehicle starts 0.5m right of a straight horizontal path."""
    # state: [x, y, theta]; path: y=0, heading=0
    state = np.array([0.0, 0.5, 0.05])  # slight heading error too
    L, v = 2.5, 3.0
    trajectory = [state.copy()]
    for _ in range(steps):
        e_cte = state[1]          # lateral distance from y=0 path
        psi_e = state[2]          # heading error (path heading=0)
        delta = stanley_steering(psi_e, e_cte, v)
        dx = v * np.cos(state[2])
        dy = v * np.sin(state[2])
        dtheta = v * np.tan(delta) / L
        state = state + np.array([dx, dy, dtheta]) * dt
        trajectory.append(state.copy())
    return np.array(trajectory)

if __name__ == "__main__":
    traj = simulate_straight_path()
    print("final CTE:", round(traj[-1, 1], 4))`,
  solutionCode: `import numpy as np

def stanley_steering(psi_e, e_cte, v, k=1.0, v_min=0.5):
    return psi_e + np.arctan(k * e_cte / max(v, v_min))

def simulate_straight_path(steps=200, dt=0.05):
    state = np.array([0.0, 0.5, 0.05])
    L, v = 2.5, 3.0
    trajectory = [state.copy()]
    for _ in range(steps):
        e_cte = state[1]
        psi_e = state[2]
        delta = stanley_steering(psi_e, e_cte, v)
        dx = v * np.cos(state[2])
        dy = v * np.sin(state[2])
        dtheta = v * np.tan(delta) / L
        state = state + np.array([dx, dy, dtheta]) * dt
        trajectory.append(state.copy())
    return np.array(trajectory)

if __name__ == "__main__":
    traj = simulate_straight_path()
    print("final CTE:", round(traj[-1, 1], 4))`,
  testCode: `import numpy as np
import pytest
from stanley_controller import stanley_steering, simulate_straight_path

def test_zero_error_gives_zero_steering():
    assert abs(stanley_steering(0.0, 0.0, 3.0)) < 1e-9

def test_positive_cte_gives_positive_steering():
    # vehicle is right of path → need to steer left (positive delta)
    delta = stanley_steering(0.0, 0.5, 3.0, k=1.0)
    assert delta > 0, "양의 CTE → 양의 조향각(좌회전)"

def test_convergence():
    traj = simulate_straight_path(steps=200)
    final_cte = abs(traj[-1, 1])
    assert final_cte < 0.05, f"Stanley가 경로에 수렴해야 함, CTE={final_cte:.4f}"`,
  expectedOutput: "final CTE: 0.0012",
  runCommand: "python stanley_controller.py && pytest test_stanley_controller.py",
  commonBugs: [
    "arctan의 인자를 (k * e_cte / v) 대신 k * (e_cte / v)로 계산해 동일하지만, e_cte와 psi_e 부호를 반대로 정의하면 발산",
    "v_min softening 없이 v≈0에서 arctan(inf)가 생겨 steering이 ±π/2로 포화",
    "psi_e 단위를 도(degree)로 그대로 더해서 steering이 수십 배 과대",
  ],
  extensionTask:
    "k를 0.5, 1.0, 2.0, 5.0으로 바꾸면서 수렴 속도와 overshooting을 비교하라. 최적 k를 찾는 기준을 제안하라.",
};

// ─── MPPI Overview ───────────────────────────────────────────────────────────

const mppiLab = {
  id: "lab_mppi_trajectory_sampling",
  title: "MPPI Trajectory Sampling (Simplified)",
  language: "python" as const,
  theoryConnection: "u* = sum(w_k * delta_u_k), w_k = exp(-S_k / lambda) / Z",
  starterCode: `import numpy as np

def rollout_cost(trajectory, goal, obstacles, dt=0.1):
    """
    trajectory: (T, 2) array of [x, y] positions
    goal: [gx, gy]
    obstacles: list of (ox, oy, radius)
    Returns total cost (lower is better).
    """
    # TODO: sum squared distance to goal at final step
    #       + obstacle penalty: if dist < radius, add large cost
    raise NotImplementedError

def mppi_update(state, goal, obstacles, K=200, T=20, lambda_=1.0,
                sigma=0.3, dt=0.1):
    """
    state: [x, y, theta]
    Returns best_u: (T, 2) control sequence [v, omega]
    """
    np.random.seed(42)
    # Nominal control: straight at 1 m/s
    u_nom = np.tile([1.0, 0.0], (T, 1))
    delta_u = np.random.normal(0, sigma, (K, T, 2))
    costs = []
    for k in range(K):
        u = u_nom + delta_u[k]
        # TODO: simulate trajectory under u, compute cost
        raise NotImplementedError
    # TODO: compute weights w_k = exp(-cost_k / lambda) / Z
    # TODO: return u_nom + sum(w_k * delta_u[k])
    raise NotImplementedError

if __name__ == "__main__":
    state = np.array([0.0, 0.0, 0.0])
    goal = np.array([5.0, 0.0])
    obstacles = [(2.5, 0.5, 0.6)]
    u_best = mppi_update(state, goal, obstacles)
    print("first action v:", round(u_best[0, 0], 3),
          "omega:", round(u_best[0, 1], 3))`,
  solutionCode: `import numpy as np

def rollout_cost(trajectory, goal, obstacles, dt=0.1):
    cost = np.sum((trajectory[-1] - goal) ** 2)
    for pos in trajectory:
        for (ox, oy, r) in obstacles:
            d = np.linalg.norm(pos - np.array([ox, oy]))
            if d < r:
                cost += 1000.0
    return cost

def simulate_trajectory(state, u_seq, dt):
    traj = [state[:2].copy()]
    x, y, theta = state
    for v, omega in u_seq:
        x += v * np.cos(theta) * dt
        y += v * np.sin(theta) * dt
        theta += omega * dt
        traj.append(np.array([x, y]))
    return np.array(traj)

def mppi_update(state, goal, obstacles, K=200, T=20, lambda_=1.0,
                sigma=0.3, dt=0.1):
    np.random.seed(42)
    u_nom = np.tile([1.0, 0.0], (T, 1))
    delta_u = np.random.normal(0, sigma, (K, T, 2))
    costs = []
    for k in range(K):
        u = u_nom + delta_u[k]
        traj = simulate_trajectory(state, u, dt)
        costs.append(rollout_cost(traj, goal, obstacles))
    costs = np.array(costs)
    beta = np.min(costs)
    w = np.exp(-(costs - beta) / lambda_)
    w /= w.sum()
    u_best = u_nom + np.einsum("k,ktd->td", w, delta_u)
    return u_best

if __name__ == "__main__":
    state = np.array([0.0, 0.0, 0.0])
    goal = np.array([5.0, 0.0])
    obstacles = [(2.5, 0.5, 0.6)]
    u_best = mppi_update(state, goal, obstacles)
    print("first action v:", round(u_best[0, 0], 3),
          "omega:", round(u_best[0, 1], 3))`,
  testCode: `import numpy as np
import pytest
from mppi_trajectory_sampling import rollout_cost, mppi_update

def test_goal_reached_costs_zero_no_obstacles():
    traj = np.array([[5.0, 0.0]])
    cost = rollout_cost(traj, np.array([5.0, 0.0]), [])
    assert cost == 0.0

def test_obstacle_hit_increases_cost():
    traj_clear = np.array([[0.0, 0.0], [5.0, 0.0]])
    traj_hit   = np.array([[0.0, 0.0], [2.5, 0.4]])  # inside obstacle
    obs = [(2.5, 0.5, 0.6)]
    goal = np.array([5.0, 0.0])
    assert rollout_cost(traj_hit, goal, obs) > rollout_cost(traj_clear, goal, obs)

def test_mppi_returns_correct_shape():
    state = np.array([0.0, 0.0, 0.0])
    u = mppi_update(state, np.array([5.0, 0.0]), [])
    assert u.shape == (20, 2), "제어 시퀀스 shape이 (T, 2)여야 함"`,
  expectedOutput: "first action v: 0.981 omega: -0.142",
  runCommand: "python mppi_trajectory_sampling.py && pytest test_mppi_trajectory_sampling.py",
  commonBugs: [
    "가중치 정규화 없이 w = exp(-cost/lambda)만 쓰면 수치 overflow/underflow 발생 — beta subtraction 필수",
    "delta_u에 u_nom을 더하지 않고 delta_u 자체를 제어 입력으로 사용",
    "rollout_cost에서 마지막 위치가 아닌 전체 경로 합산으로 목표 비용 계산 → 중간 경유 경로 bias",
  ],
  extensionTask:
    "lambda_를 0.1, 1.0, 10.0으로 바꾸면서 장애물 회피 성공률과 경로 공격성을 비교하라.",
};

// ─── Exported sessions ────────────────────────────────────────────────────────

export const bicycleModelStanleySessions: Session[] = [
  makeAdvancedSession({
    id: "bicycle_model_kinematics",
    part: "Part 4. 자율주행과 SLAM",
    title: "Bicycle Model — 차량 기구학의 기초",
    level: "beginner",
    difficulty: "easy",
    prerequisites: ["differential_drive_odometry", "2d_pose_representation"],
    objectives: [
      "단순 자전거 모델(rear-axle)의 운동방정식 3개를 유도한다.",
      "steering angle δ와 turning radius R의 관계를 계산한다.",
      "Python으로 kinematic simulation을 구현하고 원운동을 검증한다.",
    ],
    definition:
      "Bicycle model은 4륜 차량의 양쪽 바퀴를 하나로 합쳐 front/rear 2개 바퀴로 단순화한 평면 기구학 모델이다. ẋ=v·cos θ, ẏ=v·sin θ, θ̇=v·tan δ / L 세 방정식으로 기술된다.",
    whyItMatters:
      "자율주행 차량(Apollo, Autoware, nav2 carlike)의 로컬 경로 추종 알고리즘(Pure Pursuit, Stanley, MPC)은 모두 bicycle model을 내부 운동 모델로 사용한다. differential drive로는 car-like robot을 정확히 모델링할 수 없다.",
    intuition:
      "자전거를 타면서 핸들을 꺾으면 앞바퀴가 가리키는 방향과 실제 진행 방향이 달라진다. 그 차이(slip 없는 rolling)가 θ̇=v·tan δ/L 공식의 핵심이다.",
    equations: [
      {
        label: "x 방향 속도",
        expression: "\\dot x = v\\cos\\theta",
        terms: [["v", "종방향 속도 m/s"], ["θ", "차량 방향각 rad"]],
        explanation: "후륜 중심이 전진하는 x 성분.",
      },
      {
        label: "y 방향 속도",
        expression: "\\dot y = v\\sin\\theta",
        terms: [["v", "종방향 속도"], ["θ", "방향각"]],
        explanation: "후륜 중심이 전진하는 y 성분.",
      },
      {
        label: "방향각 변화율",
        expression: "\\dot\\theta = \\frac{v\\tan\\delta}{L}",
        terms: [["δ", "전륜 조향각 rad"], ["L", "축간 거리 wheelbase m"]],
        explanation: "조향각과 속도로부터 회전율을 결정한다. R = L/tan δ가 회전 반경.",
      },
    ],
    derivation: [
      ["slip 없는 rolling 제약", "전륜은 앞을 향하고, 후륜은 차체 방향으로만 구른다."],
      ["전륜 기하학", "전륜 위치 = 후륜 + L*(cos θ, sin θ). 전륜 속도 방향이 θ+δ."],
      ["각속도 유도", "ω = v/R, R = L/tan δ → θ̇ = v·tan δ / L."],
      ["오일러 적분", "x_{k+1} = x_k + ẋ·dt, 작은 dt에서 충분한 정확도."],
    ],
    handCalculation: {
      problem: "v=2 m/s, δ=0.2 rad, L=2.5 m, θ=0, dt=0.1 s이면 한 스텝 후 (x, y, θ)는?",
      given: { v: 2, delta: 0.2, L: 2.5, theta: 0, dt: 0.1 },
      steps: [
        "dx = 2·cos(0)·0.1 = 0.2",
        "dy = 2·sin(0)·0.1 = 0.0",
        "dθ = 2·tan(0.2)/2.5·0.1 = 2·0.2027/2.5·0.1 ≈ 0.0162",
        "new state: (0.2, 0.0, 0.0162)",
      ],
      answer: "(0.2, 0.0, 0.016 rad)",
    },
    robotApplication:
      "nav2의 regulated_pure_pursuit_controller와 Autoware의 mpc_lateral_controller 모두 bicycle model을 기본 차량 모델로 사용한다. 파라미터 wheelbase는 robot_description의 URDF에서 읽어온다.",
    lab: bicycleLab,
    visualization: {
      id: "vis_bicycle_model_turning_radius",
      title: "Bicycle Model Turning Radius",
      equation: "\\dot\\theta=v\\tan\\delta/L",
      parameters: [
        { name: "steering_angle", symbol: "\\delta", min: -0.5, max: 0.5, default: 0.2, description: "전륜 조향각 rad" },
        { name: "wheelbase_L", symbol: "L", min: 1.0, max: 4.0, default: 2.5, description: "축간 거리 m" },
        { name: "speed_v", symbol: "v", min: 0.5, max: 5.0, default: 2.0, description: "종방향 속도 m/s" },
      ],
      normalCase: "δ=0.2 rad, L=2.5 m이면 R≈12.2 m 원운동. 경로가 부드러운 호(arc)를 그린다.",
      failureCase: "δ=0 이면 직진. δ가 너무 크면(|δ|>0.4 rad) 회전 반경이 너무 작아 실차 조향 한계를 초과한다.",
    },
    quiz: {
      id: "bicycle_model",
      conceptQuestion: "bicycle model에서 rear axle을 기준으로 삼는 이유는?",
      conceptAnswer:
        "rear axle은 slip이 없는 구름 접촉점이므로 속도 방향이 차체 방향과 일치한다. front axle은 조향각만큼 틀어져 있어 기준으로 삼으면 방정식이 더 복잡해진다.",
      calculationQuestion: "L=3 m, δ=0.3 rad이면 turning radius R은?",
      calculationAnswer: "R = L/tan(δ) = 3/tan(0.3) = 3/0.3093 ≈ 9.70 m",
      codeQuestion: "bicycle_step 한 줄 핵심 코드(dtheta 계산)는?",
      codeAnswer: "dtheta = v * np.tan(delta) / L",
      debugQuestion: "시뮬레이션에서 차량이 직진만 하고 방향이 변하지 않는다. 무엇이 잘못됐는가?",
      debugAnswer: "dtheta가 0이거나 state 업데이트에서 theta를 수정하지 않았다. bicycle_step이 새 theta를 반환하는지 확인하라.",
      visualQuestion: "슬라이더로 δ를 0에서 0.4로 늘리면 시각화에서 경로가 어떻게 바뀌는가?",
      visualAnswer: "직선에서 점점 작은 원호로 바뀐다. R = L/tan(δ)이므로 δ가 클수록 원이 작아진다.",
      robotQuestion: "nav2에서 차량 유형(car-like)의 wheelbase를 잘못 설정하면 어떤 현상이 생기는가?",
      robotAnswer: "회전 반경 예측이 틀려 경로 추종 오차가 커지고, 급커브에서 경로를 벗어난다. regulated_pure_pursuit_controller의 wheelbase 파라미터를 URDF와 일치시켜야 한다.",
      designQuestion: "high-speed에서 bicycle model이 부정확해지는 이유와 대안은?",
      designAnswer: "고속에서는 타이어 slip angle이 무시할 수 없어 kinematic model이 부정확해진다. dynamic bicycle model(slip angle, lateral force 포함)이나 MPC+tire model을 사용해야 한다.",
    },
    wrongTagLabel: "bicycle model 운동방정식 오류",
    nextSessions: ["stanley_lateral_controller", "pure_pursuit_path_tracking", "mppi_trajectory_planner_overview"],
  }),

  makeAdvancedSession({
    id: "stanley_lateral_controller",
    part: "Part 4. 자율주행과 SLAM",
    title: "Stanley Lateral Controller — 경로 추종 제어",
    level: "intermediate",
    difficulty: "medium",
    prerequisites: ["bicycle_model_kinematics", "pure_pursuit_path_tracking"],
    objectives: [
      "Stanley 공식 δ=ψ_e+arctan(k·e_cte/v)를 유도한다.",
      "cross-track error와 heading error 두 가지 오차를 동시에 보정하는 원리를 설명한다.",
      "Python으로 직선 경로 추종 시뮬레이션을 구현하고 수렴을 검증한다.",
    ],
    definition:
      "Stanley controller는 앞축 중심을 기준으로 cross-track error(횡방향 위치 오차)와 heading error(방향 오차)를 동시에 제거하는 기하학적 lateral controller다. 2005 DARPA Grand Challenge 우승 차량(Stanley)에서 유래했다.",
    whyItMatters:
      "Pure Pursuit은 lookahead 거리에 따라 경로를 앞에서 따라가지만, Stanley는 현재 위치의 CTE를 직접 제어해 고속에서도 경로를 정확히 추종한다. Autoware의 lane_keeping controller와 Apollo의 Stanley controller 모두 이 공식을 기반으로 한다.",
    intuition:
      "차가 경로 오른쪽에 있으면 왼쪽으로 꺾고(arctan(k·e_cte/v)), 동시에 진행 방향이 경로 방향과 다르면 그 차이(ψ_e)만큼도 꺾는다. 두 보정을 더하면 차가 경로에 부드럽게 수렴한다.",
    equations: [
      {
        label: "Stanley 공식",
        expression: "\\delta = \\psi_e + \\arctan\\!\\left(\\frac{k\\,e_{cte}}{\\max(v, v_{\\min})}\\right)",
        terms: [["ψ_e", "heading error rad"], ["e_cte", "cross-track error m"], ["k", "gain"], ["v_min", "저속 soften 상수"]],
        explanation: "heading error와 위치 오차 두 가지를 동시에 보정한다.",
      },
      {
        label: "CTE가 0으로 수렴하는 조건",
        expression: "\\dot e_{cte} = -v\\sin(\\psi_e + \\delta)",
        terms: [["ė_cte", "CTE 시간 미분"], ["ψ_e+δ", "경로 기준 차체 방향"]],
        explanation: "δ를 올바르게 설정하면 ė_cte가 음수가 되어 CTE가 감소한다.",
      },
      {
        label: "Turning radius (Stanley)",
        expression: "R = \\frac{L}{\\tan\\delta}",
        terms: [["L", "wheelbase"], ["δ", "Stanley 조향각"]],
        explanation: "bicycle model 전제 하에 조향각으로부터 회전 반경이 결정된다.",
      },
    ],
    derivation: [
      ["두 오차 정의", "ψ_e = path_heading - vehicle_heading, e_cte = 경로에서 전륜까지 수직 거리."],
      ["heading 보정", "ψ_e만 보정하면 평행하게 달리다 경로를 만나지 못한다."],
      ["CTE 보정", "arctan(k·e_cte/v)는 속도 적응형 비율로 전륜을 경로 쪽으로 꺾는다."],
      ["안정성", "k와 v가 적절하면 e_cte → 0, ψ_e → 0으로 수렴. 고속에서 분모 v가 커져 부드러워진다."],
    ],
    handCalculation: {
      problem: "ψ_e=0.1 rad, e_cte=0.5 m, v=3 m/s, k=1.0이면 Stanley 조향각은?",
      given: { psi_e: 0.1, e_cte: 0.5, v: 3.0, k: 1.0 },
      steps: [
        "arctan(k·e_cte/v) = arctan(1.0·0.5/3.0) = arctan(0.167) ≈ 0.165 rad",
        "δ = ψ_e + 0.165 = 0.1 + 0.165 = 0.265 rad",
      ],
      answer: "δ ≈ 0.265 rad (약 15.2도)",
    },
    robotApplication:
      "Autoware Universe의 pure_pursuit_lateral_controller 파라미터에 use_front_axle_state: true를 설정하면 Stanley 방식으로 전환된다. e_cte는 /localization/kinematic_state에서 읽은 위치와 /planning/scenario_planning/trajectory의 closest waypoint 사이 수직 거리로 계산된다.",
    lab: stanleyLab,
    visualization: {
      id: "vis_stanley_cte_convergence",
      title: "Stanley CTE Convergence",
      equation: "\\delta=\\psi_e+\\arctan(k\\,e_{cte}/v)",
      parameters: [
        { name: "gain_k", symbol: "k", min: 0.1, max: 5.0, default: 1.0, description: "Stanley gain" },
        { name: "initial_cte", symbol: "e_{cte,0}", min: 0.1, max: 2.0, default: 0.5, description: "초기 횡방향 오차 m" },
        { name: "speed_v", symbol: "v", min: 0.5, max: 10.0, default: 3.0, description: "차량 속도 m/s" },
      ],
      normalCase: "k=1.0에서 CTE가 지수적으로 감소해 수렴. 고속일수록 수렴이 느려지지만 안정적이다.",
      failureCase: "k가 너무 크면 저속에서 overshoot 후 진동. v_min soften 없이 v→0이면 delta가 ±π/2로 포화된다.",
    },
    quiz: {
      id: "stanley_controller",
      conceptQuestion: "Stanley controller가 Pure Pursuit과 다른 핵심 차이점은?",
      conceptAnswer:
        "Pure Pursuit은 lookahead point(미래 경로점)를 향해 조향하지만, Stanley는 현재 전륜 위치의 cross-track error를 직접 제어한다. Stanley는 heading error와 위치 오차를 동시에 보정하므로 정밀 추종에 유리하다.",
      calculationQuestion: "ψ_e=0, e_cte=1.0 m, v=2 m/s, k=2.0이면 δ는?",
      calculationAnswer: "arctan(2.0·1.0/2.0) = arctan(1.0) = π/4 ≈ 0.785 rad",
      codeQuestion: "Stanley 조향각을 한 줄로 계산하는 Python 코드는?",
      codeAnswer: "delta = psi_e + np.arctan(k * e_cte / max(v, v_min))",
      debugQuestion: "Stanley controller를 적용했는데 차가 경로와 평행하게 달리며 수렴하지 않는다. 원인은?",
      debugAnswer: "psi_e가 0으로 고정돼 있거나 부호가 반대다. heading error를 path_heading - vehicle_heading으로 올바르게 계산하는지 확인하라.",
      visualQuestion: "gain k 슬라이더를 높이면 CTE 수렴 곡선이 어떻게 바뀌는가?",
      visualAnswer: "수렴이 빨라지지만 overshoot가 생기고 진동이 커진다. k가 너무 크면 발산할 수 있다.",
      robotQuestion: "Autoware에서 stanley controller 적용 시 고속(>60 km/h)에서 경로 추종 정밀도가 떨어지는 이유는?",
      robotAnswer: "고속에서는 arctan(k·e_cte/v) 항이 v가 크므로 매우 작아진다. k를 속도에 비례해 늘리거나, MPC로 전환해야 한다.",
      designQuestion: "k 파라미터 튜닝 순서는?",
      designAnswer: "1) k=1로 시작해 수렴 속도 확인. 2) 진동이 없으면 k를 1.5로 증가. 3) overshoot가 10cm 이하면 적절. 4) 고속 구간은 k/v 비율이 일정하도록 속도 적응형 gain 도입.",
    },
    wrongTagLabel: "Stanley controller heading/CTE 오차 계산 오류",
    nextSessions: ["mppi_trajectory_planner_overview", "bicycle_model_kinematics", "dwa_obstacle_avoidance"],
  }),

  makeAdvancedSession({
    id: "mppi_trajectory_planner_overview",
    part: "Part 4. 자율주행과 SLAM",
    title: "MPPI — 샘플링 기반 최적 경로계획 개요",
    level: "advanced",
    difficulty: "hard",
    prerequisites: ["dwa_obstacle_avoidance", "stanley_lateral_controller", "mpc_linear_quadratic"],
    objectives: [
      "MPPI의 sampling → rollout → reweighting → update 4단계 흐름을 설명한다.",
      "temperature λ가 trajectory 다양성과 안전성에 미치는 영향을 정량화한다.",
      "Python으로 단순 2D MPPI를 구현하고 장애물 회피를 검증한다.",
    ],
    definition:
      "MPPI(Model Predictive Path Integral)는 K개의 랜덤 제어 시퀀스를 샘플링해 각각의 궤적 비용을 계산하고, 정보 이론적 가중치로 최적 제어를 추정하는 stochastic MPC 방법이다.",
    whyItMatters:
      "기존 MPC는 convex 제약 최적화를 풀어야 하므로 장애물이 많거나 비선형 비용일 때 느리다. MPPI는 GPU 병렬 rollout으로 100ms 이내에 수천 개 궤적을 평가할 수 있어 nav2_mppi_controller(ROS2 Humble+)가 채택했다.",
    intuition:
      "수능 시험에서 모든 선택지를 빠르게 훑어보고 가장 좋아 보이는 것을 고르는 것처럼, MPPI는 수천 개의 제어 시퀀스를 한꺼번에 시뮬레이션해 가장 낮은 비용의 평균을 구한다.",
    equations: [
      {
        label: "샘플링",
        expression: "U^{(k)} = U_{nom} + \\delta U^{(k)},\\quad \\delta U^{(k)} \\sim \\mathcal{N}(0,\\sigma^2)",
        terms: [["U_nom", "기본 제어 시퀀스"], ["δU", "랜덤 교란"], ["σ", "탐색 분산"]],
        explanation: "기존 제어 시퀀스에 가우시안 노이즈를 더해 다양한 궤적을 만든다.",
      },
      {
        label: "가중치",
        expression: "w_k = \\frac{\\exp\\!\\left(-S_k/\\lambda\\right)}{\\sum_j \\exp(-S_j/\\lambda)}",
        terms: [["S_k", "궤적 k의 총 비용"], ["λ", "temperature (탐색 다양성)"]],
        explanation: "비용이 낮은 궤적에 큰 가중치를 부여한다. λ가 작을수록 최소 비용 궤적에 집중.",
      },
      {
        label: "제어 업데이트",
        expression: "U^* = U_{nom} + \\sum_k w_k \\delta U^{(k)}",
        terms: [["U*", "업데이트된 최적 제어"], ["w_k", "정규화 가중치"]],
        explanation: "가중 평균으로 최적 제어 시퀀스를 추정한다.",
      },
    ],
    derivation: [
      ["정보 이론적 기반", "KL divergence 최소화 문제를 풀면 w_k = exp(-S_k/λ)/Z 가중치가 나온다."],
      ["수치 안정", "beta = min(S_k)를 빼고 exp(-(S_k-beta)/λ)를 쓰면 overflow를 방지한다."],
      ["GPU 병렬화", "K개 rollout이 독립적이므로 CUDA 커널로 병렬 실행 가능. nav2_mppi_controller가 이 방식."],
      ["재귀 적용", "MPC처럼 첫 번째 제어만 실행하고 다음 스텝에서 다시 샘플링한다."],
    ],
    handCalculation: {
      problem: "S = [10, 20, 5], λ=1이면 가중치 w는?",
      given: { S: "[10, 20, 5]", lambda_: 1 },
      steps: [
        "beta = min(S) = 5",
        "exp(-(10-5)/1)=exp(-5)≈0.0067, exp(-(20-5)/1)=exp(-15)≈3e-7, exp(0)=1",
        "Z = 0.0067 + 0.000003 + 1 ≈ 1.0067",
        "w ≈ [0.0067, 0.0, 0.9933]",
      ],
      answer: "비용 5인 궤적이 99.3% 선택됨",
    },
    robotApplication:
      "nav2_mppi_controller(ROS2 Humble 이후 기본 포함)의 주요 파라미터: K(iteration_count=1000), T(time_steps=56), λ(temperature=0.3), σ(model_dt·noise_std). 장애물 회피 비용은 costmap의 inflation layer와 연동된다.",
    lab: mppiLab,
    visualization: {
      id: "vis_mppi_sampling_temperature",
      title: "MPPI Sampling Temperature Effect",
      equation: "w_k=\\exp(-S_k/\\lambda)/Z",
      parameters: [
        { name: "temperature_lambda", symbol: "\\lambda", min: 0.1, max: 10.0, default: 1.0, description: "MPPI temperature" },
        { name: "num_samples_K", symbol: "K", min: 10, max: 500, default: 200, description: "샘플 수" },
        { name: "noise_sigma", symbol: "\\sigma", min: 0.05, max: 1.0, default: 0.3, description: "제어 노이즈 표준편차" },
      ],
      normalCase: "λ=1.0에서 낮은 비용 궤적이 선택되고 장애물을 피하는 평균 경로가 나온다.",
      failureCase: "λ가 너무 작으면 하나의 궤적에 집중해 지역 최소(local minimum)에 갇힌다. λ가 너무 크면 고비용 궤적도 선택돼 장애물에 충돌할 수 있다.",
    },
    quiz: {
      id: "mppi_overview",
      conceptQuestion: "MPPI와 기존 MPC의 가장 큰 차이점은?",
      conceptAnswer:
        "기존 MPC는 gradient 기반 최적화를 반복해 single optimal trajectory를 찾는다. MPPI는 K개 random trajectory를 병렬 샘플링해 weighted average로 제어를 추정한다. 비선형·비볼록 비용에서도 작동하며 GPU 병렬화가 용이하다.",
      calculationQuestion: "S=[2, 4, 1], λ=0.5이면 beta subtraction 후 w를 대략 계산하라.",
      calculationAnswer:
        "beta=1. exp(-(2-1)/0.5)=exp(-2)≈0.135, exp(-(4-1)/0.5)=exp(-6)≈0.0025, exp(0)=1. Z≈1.137. w≈[0.119, 0.002, 0.879]",
      codeQuestion: "beta subtraction을 포함한 가중치 계산 Python 한 줄은?",
      codeAnswer: "w = np.exp(-(costs - costs.min()) / lambda_); w /= w.sum()",
      debugQuestion: "MPPI에서 모든 가중치가 0이 되어 NaN이 발생한다. 원인은?",
      debugAnswer: "lambda_가 너무 작아 exp(-S/λ)가 모두 underflow가 됐다. beta subtraction(costs-costs.min())을 추가하거나 lambda_를 키워야 한다.",
      visualQuestion: "λ 슬라이더를 0.1로 낮추면 선택 궤적 분포가 어떻게 바뀌는가?",
      visualAnswer: "하나의 최저비용 궤적에 거의 모든 가중치가 집중되어 다양성이 사라진다. 지역 최소 탈출이 어려워진다.",
      robotQuestion: "nav2_mppi_controller 적용 시 좁은 복도에서 경로를 못 찾는다. 어떻게 튜닝하는가?",
      robotAnswer: "K(샘플 수)를 늘리고 σ를 줄여 복도 통과 궤적이 샘플링될 확률을 높인다. temperature λ를 0.5 이하로 낮추면 좁은 공간 통과 궤적이 강하게 선택된다.",
      designQuestion: "MPPI를 실시간(100ms 이내)으로 실행하기 위한 시스템 설계 요소는?",
      designAnswer: "1) K를 GPU 스레드 수에 맞게 설정(CUDA 1024 threads·N blocks). 2) rollout 모델을 단순화(bicycle model). 3) costmap lookup을 텍스처 메모리로. 4) 제어 시퀀스를 직전 결과로 warm-start.",
    },
    wrongTagLabel: "MPPI 가중치/temperature 계산 오류",
    nextSessions: ["nav2_behavior_tree_action_server", "cbf_qp_safety_filter"],
  }),
];
