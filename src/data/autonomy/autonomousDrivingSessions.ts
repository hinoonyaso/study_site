import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "../core/v2SessionHelpers";

const diffDriveLab = ensureCodeLabShape({
  id: "lab_differential_drive_odometry",
  title: "Differential Drive Odometry Integration",
  language: "python",
  theoryConnection: "v=(v_r+v_l)/2, omega=(v_r-v_l)/b, x+=v*cos(theta)*dt",
  starterCode: `import numpy as np

def integrate_diff_drive(v_l, v_r, wheel_base, dt, steps):
    # TODO: integrate x, y, theta for a differential drive robot.
    # Return a numpy array [x, y, theta].
    raise NotImplementedError

if __name__ == "__main__":
    pose = integrate_diff_drive(0.8, 0.8, 0.4, 0.1, 10)
    print(np.round(pose, 3))`,
  solutionCode: `import numpy as np

def integrate_diff_drive(v_l, v_r, wheel_base, dt, steps):
    x, y, theta = 0.0, 0.0, 0.0
    for _ in range(steps):
        v = 0.5 * (v_r + v_l)
        omega = (v_r - v_l) / wheel_base
        x += v * np.cos(theta) * dt
        y += v * np.sin(theta) * dt
        theta += omega * dt
    return np.array([x, y, theta])

if __name__ == "__main__":
    pose = integrate_diff_drive(0.8, 0.8, 0.4, 0.1, 10)
    print(np.round(pose, 3))`,
  testCode: `import numpy as np
from differential_drive_odometry import integrate_diff_drive

def test_equal_wheels_drive_straight():
    pose = integrate_diff_drive(1.0, 1.0, 0.5, 0.1, 10)
    assert np.allclose(pose, [1.0, 0.0, 0.0], atol=1e-6)

def test_right_wheel_faster_turns_left():
    pose = integrate_diff_drive(0.5, 0.8, 0.3, 0.1, 5)
    assert pose[2] > 0.0
    assert pose[0] > 0.0

def test_zero_speed_stays_put():
    pose = integrate_diff_drive(0.0, 0.0, 0.4, 0.1, 20)
    assert np.allclose(pose, [0.0, 0.0, 0.0])`,
  expectedOutput: "[0.8 0.  0. ]",
  runCommand: "python differential_drive_odometry.py && pytest test_differential_drive_odometry.py",
  commonBugs: ["wheel_base를 나누지 않아 yaw가 너무 커짐", "theta 업데이트 전에/후에 적용 순서를 섞고 검산하지 않음", "degree와 radian yaw를 혼동함"],
  extensionTask: "v_l=0.55, v_r=0.85에서 10초 궤적을 그리고 wheel_base 변화가 회전반경에 주는 영향을 비교하라.",
});

const encoderOdometryLab = ensureCodeLabShape({
  id: "lab_wheel_encoder_tick_odometry",
  title: "Wheel Encoder Ticks to Odometry",
  language: "python",
  theoryConnection: "d=2*pi*r*ticks/ticks_per_rev, ds=(dr+dl)/2, dtheta=(dr-dl)/b",
  starterCode: `import numpy as np

def ticks_to_distance(ticks, ticks_per_rev, wheel_radius):
    # TODO: convert encoder ticks to traveled wheel distance in meters.
    raise NotImplementedError

def encoder_delta(left_ticks, right_ticks, ticks_per_rev, wheel_radius, wheel_base):
    # TODO: return [ds, dtheta] from left/right wheel ticks.
    raise NotImplementedError

if __name__ == "__main__":
    print(np.round(encoder_delta(1000, 1000, 1000, 0.05, 0.30), 3))`,
  solutionCode: `import numpy as np

def ticks_to_distance(ticks, ticks_per_rev, wheel_radius):
    return 2.0 * np.pi * wheel_radius * ticks / ticks_per_rev

def encoder_delta(left_ticks, right_ticks, ticks_per_rev, wheel_radius, wheel_base):
    dl = ticks_to_distance(left_ticks, ticks_per_rev, wheel_radius)
    dr = ticks_to_distance(right_ticks, ticks_per_rev, wheel_radius)
    ds = 0.5 * (dr + dl)
    dtheta = (dr - dl) / wheel_base
    return np.array([ds, dtheta])

if __name__ == "__main__":
    print(np.round(encoder_delta(1000, 1000, 1000, 0.05, 0.30), 3))`,
  testCode: `import numpy as np
from wheel_encoder_tick_odometry import ticks_to_distance, encoder_delta

def test_one_revolution_distance():
    assert np.allclose(ticks_to_distance(1000, 1000, 0.05), 2 * np.pi * 0.05)

def test_equal_ticks_no_yaw():
    ds, dtheta = encoder_delta(100, 100, 1000, 0.05, 0.3)
    assert ds > 0.0
    assert abs(dtheta) < 1e-12

def test_different_ticks_yaw_nonzero():
    _, dtheta = encoder_delta(100, 120, 1000, 0.05, 0.3)
    assert dtheta > 0.0`,
  expectedOutput: "[0.314 0.   ]",
  runCommand: "python wheel_encoder_tick_odometry.py && pytest test_wheel_encoder_tick_odometry.py",
  commonBugs: ["ticks_per_rev 대신 ticks를 분모에 넣음", "wheel radius와 diameter를 혼동함", "left/right 부호를 바꿔 yaw 방향이 반대로 나옴"],
  extensionTask: "실제 직선 주행 1m 로그와 encoder ds를 비교해 wheel_radius scale factor를 추정하라.",
});

const lidarPreprocessLab = ensureCodeLabShape({
  id: "lab_lidar_scan_preprocessing",
  title: "LiDAR Scan Filtering and Polar Projection",
  language: "python",
  theoryConnection: "valid = range_min <= r <= range_max, x=r*cos(theta), y=r*sin(theta)",
  starterCode: `import numpy as np

def filter_ranges(ranges, range_min, range_max):
    # TODO: return float array where invalid/inf ranges become np.nan.
    raise NotImplementedError

def scan_to_xy(ranges, angle_min, angle_increment):
    # TODO: convert valid polar ranges to Nx2 xy points.
    raise NotImplementedError

if __name__ == "__main__":
    ranges = filter_ranges([0.1, 1.0, np.inf, 2.0, 8.0], 0.2, 5.0)
    points = scan_to_xy(ranges, 0.0, np.pi / 4)
    print(points.shape[0])`,
  solutionCode: `import numpy as np

def filter_ranges(ranges, range_min, range_max):
    out = np.asarray(ranges, dtype=float)
    invalid = (~np.isfinite(out)) | (out < range_min) | (out > range_max)
    out[invalid] = np.nan
    return out

def scan_to_xy(ranges, angle_min, angle_increment):
    points = []
    for i, r in enumerate(ranges):
        if np.isnan(r):
            continue
        theta = angle_min + i * angle_increment
        points.append([r * np.cos(theta), r * np.sin(theta)])
    return np.asarray(points, dtype=float)

if __name__ == "__main__":
    ranges = filter_ranges([0.1, 1.0, np.inf, 2.0, 8.0], 0.2, 5.0)
    points = scan_to_xy(ranges, 0.0, np.pi / 4)
    print(points.shape[0])`,
  testCode: `import numpy as np
from lidar_scan_preprocessing import filter_ranges, scan_to_xy

def test_invalid_ranges_become_nan():
    out = filter_ranges([0.1, 1.0, np.inf, 9.0], 0.2, 5.0)
    assert np.isnan(out[0]) and np.isnan(out[2]) and np.isnan(out[3])
    assert out[1] == 1.0

def test_scan_to_xy_skips_nan():
    points = scan_to_xy(np.array([1.0, np.nan, 1.0]), 0.0, np.pi / 2)
    assert points.shape == (2, 2)

def test_projection_first_beam_on_x_axis():
    points = scan_to_xy(np.array([2.0]), 0.0, 0.1)
    assert np.allclose(points[0], [2.0, 0.0])`,
  expectedOutput: "2",
  runCommand: "python lidar_scan_preprocessing.py && pytest test_lidar_scan_preprocessing.py",
  commonBugs: ["inf range를 그대로 costmap에 넣음", "angle_min을 무시해 scan이 회전된 상태로 투영됨", "range_min보다 작은 self-hit를 장애물로 등록함"],
  extensionTask: "median filter와 voxel downsample을 추가하고 obstacle layer에 들어갈 point count 변화를 출력하라.",
});

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

const dijkstraLab = ensureCodeLabShape({
  id: "lab_dijkstra_grid_planner",
  title: "Dijkstra Grid Planner",
  language: "python",
  theoryConnection: "Dijkstra uses f(n)=g(n), A* uses f(n)=g(n)+h(n)",
  starterCode: `import heapq
import numpy as np

def dijkstra(grid, start, goal):
    # TODO: uniform-cost search on 4-connected grid.
    # Return path list of (row, col), or None if blocked.
    raise NotImplementedError

if __name__ == "__main__":
    grid = np.zeros((3, 3), dtype=int)
    print(len(dijkstra(grid, (0, 0), (2, 2))))`,
  solutionCode: `import heapq
import numpy as np

def dijkstra(grid, start, goal):
    rows, cols = grid.shape
    pq = [(0.0, start)]
    came_from = {}
    cost = {start: 0.0}
    visited = set()
    while pq:
        g, current = heapq.heappop(pq)
        if current in visited:
            continue
        visited.add(current)
        if current == goal:
            path = [current]
            while path[0] in came_from:
                path.insert(0, came_from[path[0]])
            return path
        r, c = current
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols) or grid[nr, nc] == 1:
                continue
            neighbor = (nr, nc)
            new_cost = g + 1.0
            if new_cost < cost.get(neighbor, float("inf")):
                cost[neighbor] = new_cost
                came_from[neighbor] = current
                heapq.heappush(pq, (new_cost, neighbor))
    return None

if __name__ == "__main__":
    grid = np.zeros((3, 3), dtype=int)
    print(len(dijkstra(grid, (0, 0), (2, 2))))`,
  testCode: `import numpy as np
from dijkstra_grid_planner import dijkstra

def test_empty_grid_shortest_path_length():
    path = dijkstra(np.zeros((3, 3), dtype=int), (0, 0), (2, 2))
    assert path is not None and len(path) == 5

def test_blocked_grid_returns_none():
    grid = np.array([[0, 0, 0], [1, 1, 1], [0, 0, 0]])
    assert dijkstra(grid, (0, 0), (2, 2)) is None

def test_path_avoids_obstacle():
    grid = np.zeros((4, 4), dtype=int)
    grid[1, 0] = 1
    path = dijkstra(grid, (0, 0), (3, 0))
    assert path is not None and (1, 0) not in path`,
  expectedOutput: "5",
  runCommand: "python dijkstra_grid_planner.py && pytest test_dijkstra_grid_planner.py",
  commonBugs: ["heuristic을 몰래 더해 Dijkstra가 아니라 A*가 됨", "visited 처리 없이 같은 노드를 반복 확장함", "장애물 셀을 이웃에서 거르지 않음"],
  extensionTask: "같은 grid에서 Dijkstra와 A*의 expansion count를 비교하고 heuristic weight=0이 Dijkstra와 같음을 확인하라.",
});

const hybridAstarLab = ensureCodeLabShape({
  id: "lab_hybrid_astar_state_lattice",
  title: "Hybrid A* State Lattice Mini Planner",
  language: "python",
  theoryConnection: "state=(x,y,heading), successor applies forward motion and discrete steering",
  starterCode: `import heapq

HEADINGS = [(1,0), (0,1), (-1,0), (0,-1)]

def successors(state, width, height, obstacles):
    # TODO: return forward/left/right successor states (x,y,heading_index).
    raise NotImplementedError

def hybrid_astar(width, height, obstacles, start, goal_xy):
    # TODO: A* over (x,y,heading) states.
    raise NotImplementedError

if __name__ == "__main__":
    path = hybrid_astar(5, 5, {(2, 2)}, (0, 0, 0), (4, 4))
    print(path[-1][:2])`,
  solutionCode: `import heapq

HEADINGS = [(1,0), (0,1), (-1,0), (0,-1)]

def successors(state, width, height, obstacles):
    x, y, h = state
    out = []
    for steer in [0, -1, 1]:
        nh = (h + steer) % len(HEADINGS)
        dx, dy = HEADINGS[nh]
        nx, ny = x + dx, y + dy
        if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in obstacles:
            turn_cost = 0.2 if steer else 0.0
            out.append(((nx, ny, nh), 1.0 + turn_cost))
    return out

def hybrid_astar(width, height, obstacles, start, goal_xy):
    def h_cost(state):
        return abs(goal_xy[0] - state[0]) + abs(goal_xy[1] - state[1])
    pq = [(h_cost(start), 0.0, start)]
    came_from = {}
    cost = {start: 0.0}
    while pq:
        _, g, current = heapq.heappop(pq)
        if current[:2] == goal_xy:
            path = [current]
            while path[0] in came_from:
                path.insert(0, came_from[path[0]])
            return path
        for nxt, step_cost in successors(current, width, height, obstacles):
            new_cost = g + step_cost
            if new_cost < cost.get(nxt, float("inf")):
                cost[nxt] = new_cost
                came_from[nxt] = current
                heapq.heappush(pq, (new_cost + h_cost(nxt), new_cost, nxt))
    return None

if __name__ == "__main__":
    path = hybrid_astar(5, 5, {(2, 2)}, (0, 0, 0), (4, 4))
    print(path[-1][:2])`,
  testCode: `from hybrid_astar_state_lattice import successors, hybrid_astar

def test_successor_keeps_heading_state():
    out = successors((0, 0, 0), 5, 5, set())
    assert all(len(state) == 3 for state, _ in out)

def test_planner_reaches_goal_xy():
    path = hybrid_astar(5, 5, {(2, 2)}, (0, 0, 0), (4, 4))
    assert path is not None
    assert path[-1][:2] == (4, 4)

def test_obstacle_not_in_path():
    path = hybrid_astar(5, 5, {(2, 2)}, (0, 0, 0), (4, 4))
    assert all(state[:2] != (2, 2) for state in path)`,
  expectedOutput: "(4, 4)",
  runCommand: "python hybrid_astar_state_lattice.py && pytest test_hybrid_astar_state_lattice.py",
  commonBugs: ["state에서 heading을 빼서 일반 A*와 같아짐", "steering 전환 비용을 무시해 불가능한 급회전을 허용함", "goal heading 조건을 지나치게 강하게 걸어 경로를 못 찾음"],
  extensionTask: "heading을 8방향으로 늘리고 최소 회전반경이 커질 때 경로가 얼마나 길어지는지 비교하라.",
});

const dwbCriticLab = ensureCodeLabShape({
  id: "lab_dwb_critic_scores",
  title: "DWB Critic Score Selection",
  language: "python",
  theoryConnection: "cost = w_path*path_dist + w_goal*goal_dist + w_obstacle/(clearance+eps)",
  starterCode: `import numpy as np

def score_cmd(path_dist, goal_dist, clearance, weights=(1.0, 1.0, 0.8)):
    # TODO: lower path/goal distance and larger clearance should be better.
    raise NotImplementedError

def choose_cmd(candidates, weights=(1.0, 1.0, 0.8)):
    # candidates are (v, w, path_dist, goal_dist, clearance)
    # TODO: return the lowest-cost (v, w)
    raise NotImplementedError

if __name__ == "__main__":
    candidates = [(0.3, 0.0, 0.1, 1.0, 0.2), (0.2, 0.4, 0.3, 1.2, 1.0)]
    print(choose_cmd(candidates))`,
  solutionCode: `import numpy as np

def score_cmd(path_dist, goal_dist, clearance, weights=(1.0, 1.0, 0.8)):
    w_path, w_goal, w_obstacle = weights
    return w_path * path_dist + w_goal * goal_dist + w_obstacle / max(clearance, 1e-6)

def choose_cmd(candidates, weights=(1.0, 1.0, 0.8)):
    costs = [score_cmd(p, g, c, weights) for _, _, p, g, c in candidates]
    v, w, *_ = candidates[int(np.argmin(costs))]
    return (v, w)

if __name__ == "__main__":
    candidates = [(0.3, 0.0, 0.1, 1.0, 0.2), (0.2, 0.4, 0.3, 1.2, 1.0)]
    print(choose_cmd(candidates))`,
  testCode: `from dwb_critic_scores import score_cmd, choose_cmd

def test_low_clearance_costs_more():
    assert score_cmd(0.1, 1.0, 0.1) > score_cmd(0.1, 1.0, 1.0)

def test_choose_safer_command_with_obstacle_weight():
    cmd = choose_cmd([(0.3, 0.0, 0.1, 1.0, 0.2), (0.2, 0.4, 0.3, 1.2, 1.0)])
    assert cmd == (0.2, 0.4)

def test_path_weight_can_change_preference():
    cmd = choose_cmd([(0.3, 0.0, 0.0, 1.0, 0.5), (0.2, 0.5, 0.8, 1.0, 0.5)], weights=(5.0, 1.0, 0.1))
    assert cmd == (0.3, 0.0)`,
  expectedOutput: "(0.2, 0.4)",
  runCommand: "python dwb_critic_scores.py && pytest test_dwb_critic_scores.py",
  commonBugs: ["DWB cost를 maximize해서 가장 위험한 후보를 고름", "obstacle clearance를 reward처럼 더해 가까울수록 좋아지는 오류", "critic weight 단위를 로그에 남기지 않아 튜닝 재현이 안 됨"],
  extensionTask: "PathDist, GoalDist, BaseObstacle critic weight sweep을 만들어 선택 cmd_vel이 바뀌는 경계를 표로 출력하라.",
});

const slamToolboxLaunchLab = ensureCodeLabShape({
  id: "lab_slam_toolbox_launch_contract",
  title: "slam_toolbox Launch and Map Save Contract",
  language: "python",
  theoryConnection: "slam_toolbox publishes map->odom and /map OccupancyGrid from LaserScan + odom",
  starterCode: `SLAM_PARAMS = {
    "map_frame": "map",
    "odom_frame": "odom",
    "base_frame": "base_link",
    "scan_topic": "/scan",
    "mode": "mapping",
}

LAUNCH_COMMAND = "ros2 launch slam_toolbox online_async_launch.py slam_params_file:=slam_toolbox.yaml"
SAVE_COMMAND = "ros2 run nav2_map_server map_saver_cli -f my_map"

def validate_config(params):
    # TODO: return True only when required frames/topics for slam_toolbox exist.
    raise NotImplementedError

if __name__ == "__main__":
    print(validate_config(SLAM_PARAMS))
    print(LAUNCH_COMMAND)
    print(SAVE_COMMAND)`,
  solutionCode: `SLAM_PARAMS = {
    "map_frame": "map",
    "odom_frame": "odom",
    "base_frame": "base_link",
    "scan_topic": "/scan",
    "mode": "mapping",
}

LAUNCH_COMMAND = "ros2 launch slam_toolbox online_async_launch.py slam_params_file:=slam_toolbox.yaml"
SAVE_COMMAND = "ros2 run nav2_map_server map_saver_cli -f my_map"

def validate_config(params):
    required = ["map_frame", "odom_frame", "base_frame", "scan_topic", "mode"]
    return all(params.get(key) for key in required) and params["map_frame"] != params["odom_frame"]

if __name__ == "__main__":
    print(validate_config(SLAM_PARAMS))
    print(LAUNCH_COMMAND)
    print(SAVE_COMMAND)`,
  testCode: `from slam_toolbox_launch_contract import SLAM_PARAMS, LAUNCH_COMMAND, SAVE_COMMAND, validate_config

def test_required_config_is_valid():
    assert validate_config(SLAM_PARAMS)

def test_missing_scan_topic_fails():
    bad = dict(SLAM_PARAMS)
    bad["scan_topic"] = ""
    assert not validate_config(bad)

def test_commands_are_real_ros2_entrypoints():
    assert "slam_toolbox" in LAUNCH_COMMAND
    assert "map_saver_cli" in SAVE_COMMAND`,
  expectedOutput: "True\nros2 launch slam_toolbox online_async_launch.py slam_params_file:=slam_toolbox.yaml\nros2 run nav2_map_server map_saver_cli -f my_map",
  runCommand: "python slam_toolbox_launch_contract.py && pytest test_slam_toolbox_launch_contract.py",
  commonBugs: ["map_frame과 odom_frame을 같은 이름으로 둠", "scan_topic이 실제 /scan 토픽과 다름", "map 저장 전에 lifecycle/map topic 상태를 확인하지 않음"],
  extensionTask: "실제 ROS 2 워크스페이스에서 launch 후 ros2 topic echo /map, ros2 run tf2_ros tf2_echo map base_link, map_saver_cli를 순서대로 실행하라.",
});

const navigationPipelineLab = ensureCodeLabShape({
  id: "lab_mobile_navigation_integrated_pipeline",
  title: "Integrated Localization Mapping Planning Control Gate",
  language: "python",
  theoryConnection: "ready = localization_ok and map_ok and path_ok and controller_ok and tf_fresh",
  starterCode: `def navigation_gate(localization_ok, map_ok, path_ok, controller_ok, tf_age_ms, tf_limit_ms=150):
    # TODO: return "publish_cmd_vel" only if every stage is ready and TF is fresh.
    raise NotImplementedError

if __name__ == "__main__":
    print(navigation_gate(True, True, True, True, 42))`,
  solutionCode: `def navigation_gate(localization_ok, map_ok, path_ok, controller_ok, tf_age_ms, tf_limit_ms=150):
    tf_fresh = tf_age_ms <= tf_limit_ms
    if localization_ok and map_ok and path_ok and controller_ok and tf_fresh:
        return "publish_cmd_vel"
    return "hold_or_recover"

if __name__ == "__main__":
    print(navigation_gate(True, True, True, True, 42))`,
  testCode: `from mobile_navigation_integrated_pipeline import navigation_gate

def test_all_ready_publishes():
    assert navigation_gate(True, True, True, True, 42) == "publish_cmd_vel"

def test_stale_tf_blocks_command():
    assert navigation_gate(True, True, True, True, 300) == "hold_or_recover"

def test_missing_path_blocks_command():
    assert navigation_gate(True, True, False, True, 42) == "hold_or_recover"`,
  expectedOutput: "publish_cmd_vel",
  runCommand: "python mobile_navigation_integrated_pipeline.py && pytest test_mobile_navigation_integrated_pipeline.py",
  commonBugs: ["한 단계만 OK이면 cmd_vel을 publish함", "TF freshness를 확인하지 않음", "global path 없음과 local controller 실패를 같은 로그 없이 처리함"],
  extensionTask: "각 단계의 상태와 latency를 dict로 받아 어떤 stage가 gate를 막았는지 reason list를 반환하라.",
});

export const autonomousDrivingSessions: Session[] = [
  makeAdvancedSession({
    id: "differential_drive_odometry",
    part: "Part 4. 자율주행과 SLAM",
    title: "Differential Drive Odometry",
    level: "beginner",
    difficulty: "easy",
    estimatedMinutes: 65,
    prerequisites: ["robot_math_2d_rotation_matrix"],
    objectives: ["좌우 바퀴 속도에서 v와 omega를 계산한다.", "unicycle pose를 Euler 적분한다.", "wheel_base 오류가 odometry drift로 이어지는 이유를 설명한다."],
    definition: "Differential drive는 좌우 바퀴 속도 차이로 yaw rate를 만들고 평균 속도로 전진하는 모바일 로봇 기구학 모델이다.",
    whyItMatters: "TurtleBot, JetRover, 실내 AMR의 wheel odometry와 cmd_vel 해석은 대부분 differential drive 모델에서 시작한다.",
    intuition: "두 바퀴가 같은 속도면 직진하고, 오른쪽 바퀴가 더 빠르면 왼쪽으로 돈다.",
    equations: [
      { label: "Body speed", expression: "v=(v_r+v_l)/2", terms: [["v_r,v_l", "right/left wheel speed"]], explanation: "두 바퀴 평균이 전진 속도다." },
      { label: "Yaw rate", expression: "\\omega=(v_r-v_l)/b", terms: [["b", "wheel base"]], explanation: "속도 차이를 바퀴 간 거리로 나누면 회전 속도가 된다." },
      { label: "Pose integration", expression: "x_{k+1}=x_k+v\\cos\\theta\\Delta t", terms: [["theta", "robot yaw"]], explanation: "body 속도를 world frame으로 회전해 누적한다." },
    ],
    derivation: [["평균 속도", "좌우 접점 속도의 평균이 차체 중심 전진 속도다."], ["회전 속도", "두 바퀴 이동거리 차이가 yaw 변화를 만든다."], ["world 누적", "현재 yaw로 v를 x/y 성분으로 나눈다."], ["TF 연결", "결과 pose는 odom->base_link transform으로 발행된다."]],
    handCalculation: { problem: "v_l=0.5, v_r=0.7, b=0.4이면 v와 omega는?", given: { vl: 0.5, vr: 0.7, b: 0.4 }, steps: ["v=(0.7+0.5)/2=0.6", "omega=(0.7-0.5)/0.4=0.5"], answer: "v=0.6 m/s, omega=0.5 rad/s" },
    robotApplication: "ROS 2 diff_drive_controller가 joint velocity와 wheel geometry로 /odom과 /tf를 publish하는 구조를 이해하게 해준다.",
    lab: diffDriveLab,
    visualization: { id: "vis_differential_drive_odometry", title: "Differential Drive Odometry", equation: "v=(v_r+v_l)/2, omega=(v_r-v_l)/b", parameters: [{ name: "left_wheel", symbol: "v_l", min: -0.3, max: 1.2, default: 0.55, description: "left wheel speed" }, { name: "right_wheel", symbol: "v_r", min: -0.3, max: 1.2, default: 0.85, description: "right wheel speed" }, { name: "wheel_base", symbol: "b", min: 0.2, max: 0.8, default: 0.48, description: "wheel distance" }], normalCase: "v_l=v_r이면 직선 odom path가 나온다.", failureCase: "wheel_base가 틀리면 yaw rate가 틀어져 map/odom alignment가 drift한다." },
    quiz: { id: "diff_drive", conceptQuestion: "Differential drive에서 회전은 어떻게 생기는가?", conceptAnswer: "좌우 바퀴 속도 차이가 yaw rate omega=(v_r-v_l)/b를 만든다.", calculationQuestion: "v_l=0.4, v_r=0.8, b=0.4이면 omega는?", calculationAnswer: "(0.8-0.4)/0.4=1.0 rad/s이다.", codeQuestion: "전진 속도 v를 계산하는 Python 한 줄은?", codeAnswer: "v = 0.5 * (v_r + v_l)", debugQuestion: "로봇이 실제보다 더 많이 회전하면 어떤 파라미터를 확인하는가?", debugAnswer: "wheel_base, wheel radius, left/right sign convention을 확인한다.", visualQuestion: "오른쪽 바퀴 속도를 키우면 path는 어떻게 변하는가?", visualAnswer: "yaw가 양의 방향으로 증가하며 곡선 궤적이 된다.", robotQuestion: "이 결과는 ROS 2에서 어떤 transform으로 연결되는가?", robotAnswer: "wheel odometry는 보통 odom->base_link TF와 nav_msgs/Odometry로 발행된다.", designQuestion: "wheel odometry만으로 map 위치를 장시간 믿으면 안 되는 이유는?", designAnswer: "slip과 wheel radius 오차가 누적되어 drift가 생기므로 IMU/LiDAR/GPS 보정이 필요하다." },
    wrongTagLabel: "differential drive odometry 오류",
    nextSessions: ["wheel_encoder_tick_odometry", "ekf_localization"],
  }),
  makeAdvancedSession({
    id: "wheel_encoder_tick_odometry",
    part: "Part 4. 자율주행과 SLAM",
    title: "Wheel Encoder Tick Odometry",
    level: "beginner",
    difficulty: "easy",
    estimatedMinutes: 60,
    prerequisites: ["differential_drive_odometry"],
    objectives: ["tick을 wheel distance로 변환한다.", "left/right tick 차이에서 ds와 dtheta를 계산한다.", "encoder scale calibration 필요성을 설명한다."],
    definition: "Wheel encoder odometry는 모터 encoder tick count를 바퀴 회전수와 이동거리로 바꾸어 로봇의 상대 이동량을 추정하는 방법이다.",
    whyItMatters: "EKF와 slam_toolbox는 /odom이 필요하며, 그 가장 흔한 입력이 wheel encoder에서 나온다.",
    intuition: "바퀴 테두리에 줄자가 감겨 있다고 생각하면 된다. 한 바퀴 돌 때마다 2πr만큼 이동했다고 추정한다.",
    equations: [
      { label: "Tick distance", expression: "d=2\\pi r\\,ticks/N", terms: [["r", "wheel radius"], ["N", "ticks per revolution"]], explanation: "tick 비율을 회전 둘레에 곱한다." },
      { label: "Arc delta", expression: "ds=(d_r+d_l)/2", terms: [["d_r,d_l", "right/left distance"]], explanation: "중심 이동거리다." },
      { label: "Yaw delta", expression: "d\\theta=(d_r-d_l)/b", terms: [["b", "wheel base"]], explanation: "두 바퀴 거리 차이가 회전량이다." },
    ],
    derivation: [["tick 비율", "ticks/N이 wheel revolution 수다."], ["거리 변환", "revolution에 2πr을 곱한다."], ["차체 delta", "좌우 거리 평균과 차이를 ds,dtheta로 바꾼다."], ["보정", "실제 직선 주행 거리와 비교해 radius scale을 맞춘다."]],
    handCalculation: { problem: "N=1000, r=0.05m, ticks=1000이면 바퀴 이동거리는?", given: { N: 1000, r: 0.05, ticks: 1000 }, steps: ["ticks/N=1 rev", "d=2*pi*0.05=0.314m"], answer: "0.314m" },
    robotApplication: "diff_drive_controller, robot_localization EKF, slam_toolbox의 odom input 품질을 encoder 단위에서 검증한다.",
    lab: encoderOdometryLab,
    visualization: { id: "vis_encoder_tick_odometry", title: "Encoder Tick to Odom", equation: "d=2*pi*r*ticks/N", parameters: [{ name: "left_ticks", symbol: "L", min: 0, max: 1000, default: 420, description: "left encoder ticks" }, { name: "right_ticks", symbol: "R", min: 0, max: 1000, default: 510, description: "right encoder ticks" }, { name: "ticks_per_meter", symbol: "N_m", min: 250, max: 1200, default: 680, description: "encoder scale" }], normalCase: "좌우 tick이 같으면 yaw 변화가 0이다.", failureCase: "radius/ticks_per_rev가 틀리면 직선 거리부터 scale drift가 생긴다." },
    quiz: { id: "encoder_odom", conceptQuestion: "encoder tick이 odometry가 되려면 어떤 변환이 필요한가?", conceptAnswer: "tick을 회전수로 바꾸고 wheel circumference를 곱해 거리로 변환해야 한다.", calculationQuestion: "r=0.1, N=500, ticks=250이면 이동거리는?", calculationAnswer: "0.5 rev이므로 d=pi*0.1=0.314m이다.", codeQuestion: "tick distance 한 줄은?", codeAnswer: "distance = 2.0 * np.pi * wheel_radius * ticks / ticks_per_rev", debugQuestion: "직선 주행에서 yaw가 계속 생기면 무엇을 의심하는가?", debugAnswer: "좌우 encoder scale, wheel radius, tick sign, wheel slip을 확인한다.", visualQuestion: "right tick이 left tick보다 크면 odom yaw는?", visualAnswer: "dtheta가 양수로 증가한다.", robotQuestion: "encoder odometry는 어떤 ROS 메시지로 나가는가?", robotAnswer: "nav_msgs/Odometry와 odom->base_link TF로 나간다.", designQuestion: "encoder scale 보정 실험은 어떻게 설계하는가?", designAnswer: "직선 기준거리와 회전 기준각을 반복 측정하고 radius와 wheel_base를 분리 추정한다." },
    wrongTagLabel: "encoder tick/odometry 변환 오류",
    nextSessions: ["imu_preintegration_basic", "ekf_localization", "lidar_scan_preprocessing"],
  }),
  makeAdvancedSession({
    id: "lidar_scan_preprocessing",
    part: "Part 4. 자율주행과 SLAM",
    title: "LiDAR Scan Preprocessing Pipeline",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 70,
    prerequisites: ["wheel_encoder_tick_odometry", "occupancy_grid_mapping"],
    objectives: ["LaserScan range_min/range_max 필터를 구현한다.", "polar scan을 xy point로 투영한다.", "전처리 오류가 costmap obstacle layer에 미치는 영향을 설명한다."],
    definition: "LiDAR 전처리는 LaserScan의 invalid range, self-hit, inf 값을 제거하고 angle metadata로 point cloud나 obstacle ray를 만드는 단계다.",
    whyItMatters: "SLAM과 Nav2 obstacle layer는 scan 품질에 민감하다. 전처리 오류는 벽을 뚫고 지나가는 costmap 또는 phantom obstacle로 바로 이어진다.",
    intuition: "레이저 부채꼴에서 너무 가까운 점, 너무 먼 점, 무한대 값을 버리고 실제 반사점만 지도에 찍는다.",
    equations: [
      { label: "Range gate", expression: "valid = r_{min}\\le r_i\\le r_{max}", terms: [["r_i", "range sample"]], explanation: "센서 유효거리 밖 값은 지도에 넣지 않는다." },
      { label: "Polar projection", expression: "x=r\\cos\\theta, y=r\\sin\\theta", terms: [["theta", "angle_min+i angle_increment"]], explanation: "LaserScan index를 각도로 변환한다." },
      { label: "Obstacle update", expression: "scan\\rightarrow free\\ rays + occupied\\ endpoints", terms: [["free", "레이가 지난 셀"], ["occupied", "반사 endpoint"]], explanation: "occupancy grid 입력 구조다." },
    ],
    derivation: [["range 필터", "inf, NaN, range_min 미만, range_max 초과를 제거한다."], ["각도 복원", "angle_min+i*angle_increment로 beam 방향을 계산한다."], ["좌표 투영", "r cos/sin으로 laser frame point를 만든다."], ["TF 적용", "laser->base_link->odom/map TF를 거쳐 costmap frame에 넣는다."]],
    handCalculation: { problem: "angle=90도, range=2m이면 laser frame point는?", given: { theta: "pi/2", r: 2 }, steps: ["x=2cos(pi/2)=0", "y=2sin(pi/2)=2"], answer: "[0,2]" },
    robotApplication: "Nav2 obstacle_layer와 slam_toolbox scan matcher에 들어가기 전 /scan topic 품질을 점검하는 기준이다.",
    lab: lidarPreprocessLab,
    visualization: { id: "vis_lidar_scan_preprocessing", title: "LiDAR Scan Filtering", equation: "x=r cos(theta), y=r sin(theta)", parameters: [{ name: "range_min", symbol: "r_min", min: 0.05, max: 0.5, default: 0.2, description: "minimum valid range" }, { name: "range_max", symbol: "r_max", min: 2, max: 10, default: 5, description: "maximum valid range" }, { name: "extrinsic_yaw", symbol: "psi", min: -20, max: 20, default: 6, description: "sensor yaw offset" }], normalCase: "valid beam만 xy point로 투영되어 obstacle endpoint가 안정적이다.", failureCase: "inf/self-hit를 넣으면 phantom obstacle이나 robot footprint obstacle이 생긴다." },
    quiz: { id: "lidar_preprocess", conceptQuestion: "LiDAR 전처리에서 가장 먼저 제거해야 하는 값은?", conceptAnswer: "inf, NaN, range_min 미만, range_max 초과 range다.", calculationQuestion: "r=1, theta=0이면 point는?", calculationAnswer: "[1,0]이다.", codeQuestion: "invalid mask 한 줄은?", codeAnswer: "invalid = (~np.isfinite(ranges)) | (ranges < range_min) | (ranges > range_max)", debugQuestion: "로봇 바로 주변에 항상 장애물이 생기면 무엇을 의심하는가?", debugAnswer: "range_min, footprint clearing, self-hit 필터, laser extrinsic을 확인한다.", visualQuestion: "extrinsic yaw가 틀리면 scan cloud는 어떻게 보이는가?", visualAnswer: "벽이나 장애물이 실제 방향에서 회전되어 보인다.", robotQuestion: "전처리된 scan은 Nav2 어디에 들어가는가?", robotAnswer: "costmap obstacle_layer와 slam_toolbox scan matcher에 들어간다.", designQuestion: "LiDAR pipeline 로그에 남길 값은?", designAnswer: "valid beam ratio, dropped inf/NaN count, frame_id, timestamp age, extrinsic version을 남긴다." },
    wrongTagLabel: "LiDAR scan 전처리 오류",
    nextSessions: ["slam_toolbox_launch_mapping", "slam_occupancy_grid", "costmap_inflation_nav2"],
  }),
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
    nextSessions: ["pose_graph_slam", "loop_closure", "mobile_navigation_integrated_stack"],
  }),
  makeAdvancedSession({
    id: "dijkstra_grid_planning",
    part: "Part 4. 자율주행과 SLAM",
    title: "Dijkstra Grid Planning",
    level: "beginner",
    difficulty: "easy",
    estimatedMinutes: 60,
    prerequisites: ["occupancy_grid_mapping"],
    objectives: ["Dijkstra가 heuristic 없이 최단 경로를 보장하는 원리를 설명한다.", "priority queue 기반 uniform-cost search를 구현한다.", "A*와 expansion count 차이를 비교한다."],
    definition: "Dijkstra는 시작점에서 누적 비용 g(n)이 가장 낮은 노드를 확장해 모든 edge cost가 nonnegative일 때 최단 경로를 찾는 알고리즘이다.",
    whyItMatters: "Nav2 global planner에서 heuristic을 끄면 Dijkstra와 같은 동작이 되며, A*의 baseline과 costmap 최단거리 검산 기준이 된다.",
    intuition: "물결이 시작점에서 균일하게 퍼져나가다가 목표에 닿는 순간 가장 짧은 길을 얻는 방식이다.",
    equations: [
      { label: "Priority", expression: "f(n)=g(n)", terms: [["g(n)", "start to n accumulated cost"]], explanation: "heuristic h 없이 실제 누적 비용만 본다." },
      { label: "Relaxation", expression: "g(m)>g(n)+c(n,m)", terms: [["c", "edge cost"]], explanation: "더 싼 경로를 찾으면 parent와 cost를 갱신한다." },
      { label: "A* comparison", expression: "A*: f(n)=g(n)+h(n)", terms: [["h", "goal heuristic"]], explanation: "h=0이면 A*는 Dijkstra가 된다." },
    ],
    derivation: [["초기화", "start cost를 0으로 두고 priority queue에 넣는다."], ["최소 g 확장", "가장 싼 frontier를 꺼낸다."], ["이웃 완화", "새 비용이 더 낮으면 came_from을 갱신한다."], ["A* 비교", "goal 방향 heuristic이 없어서 더 넓게 탐색한다."]],
    handCalculation: { problem: "빈 3x3 grid에서 (0,0)에서 (2,2)까지 4방향 최단 step 수는?", given: { start: "(0,0)", goal: "(2,2)" }, steps: ["row 차이 2", "col 차이 2", "총 4 step"], answer: "경로 노드 수는 start 포함 5개다." },
    robotApplication: "costmap planner에서 heuristic 없이도 최단경로가 나오는지 검산하고, A* heuristic 튜닝 전 baseline으로 사용한다.",
    lab: dijkstraLab,
    visualization: { id: "vis_dijkstra_grid_planning", title: "Dijkstra vs A* Expansion", equation: "Dijkstra f=g, A* f=g+h", parameters: [{ name: "heuristic_weight", symbol: "w_h", min: 0, max: 2, default: 0, description: "0 means Dijkstra" }, { name: "obstacle_density", symbol: "rho", min: 0, max: 0.4, default: 0.15, description: "grid obstacle ratio" }], normalCase: "Dijkstra는 최단경로를 찾지만 A*보다 더 많은 노드를 확장한다.", failureCase: "edge cost가 음수이면 Dijkstra의 최단경로 보장이 깨진다." },
    quiz: { id: "dijkstra", conceptQuestion: "Dijkstra와 A*의 차이는?", conceptAnswer: "Dijkstra는 f=g만 쓰고 A*는 f=g+h를 사용한다.", calculationQuestion: "3x3 빈 grid 대각 목표까지 4방향 step 수는?", calculationAnswer: "4 step이다.", codeQuestion: "priority queue에 넣을 priority는?", codeAnswer: "new_cost 또는 g_score를 넣는다.", debugQuestion: "Dijkstra가 A*처럼 goal 쪽만 확장하면 무엇을 확인하는가?", debugAnswer: "heuristic h를 더하고 있지 않은지 확인한다.", visualQuestion: "heuristic weight를 0으로 낮추면 expansion은?", visualAnswer: "Dijkstra처럼 넓게 퍼지고 expansion 수가 증가한다.", robotQuestion: "Nav2에서 Dijkstra baseline이 유용한 이유는?", robotAnswer: "heuristic이 없어도 costmap 최단경로가 맞는지 검증할 수 있다.", designQuestion: "Dijkstra를 실제 costmap에 쓸 때 필요한 edge cost는?", designAnswer: "free/occupied뿐 아니라 inflation cost와 diagonal move cost를 nonnegative로 정의해야 한다." },
    wrongTagLabel: "Dijkstra priority/relaxation 오류",
    nextSessions: ["path_planning_astar", "hybrid_astar_state_lattice"],
  }),
  makeAdvancedSession({
    id: "hybrid_astar_state_lattice",
    part: "Part 4. 자율주행과 SLAM",
    title: "Hybrid A* State Lattice",
    level: "advanced",
    difficulty: "hard",
    estimatedMinutes: 85,
    prerequisites: ["dijkstra_grid_planning", "bicycle_model_kinematics"],
    objectives: ["grid cell뿐 아니라 heading을 state에 포함한다.", "steering successor와 turning radius 제약을 설명한다.", "car-like global planner가 일반 A*와 다른 이유를 설명한다."],
    definition: "Hybrid A*는 (x,y) grid에 heading과 motion primitive를 결합해 차량의 최소 회전반경을 만족하는 경로를 찾는 planner다.",
    whyItMatters: "차량형 로봇은 제자리 회전이 안 되므로 일반 A*의 직각 경로를 그대로 따라갈 수 없다. Hybrid A*는 Nav2/Autoware 계열 car-like planning의 핵심이다.",
    intuition: "격자 미로를 푸는데 로봇이 어느 방향을 보고 있는지도 같이 기억해서, 갑자기 90도 꺾는 길을 금지한다.",
    equations: [
      { label: "State", expression: "s=(x,y,\\theta)", terms: [["theta", "heading bin"]], explanation: "같은 셀이라도 방향이 다르면 다른 상태다." },
      { label: "Motion primitive", expression: "s_{k+1}=f(s_k,\\delta,\\Delta s)", terms: [["delta", "steering"]], explanation: "조향 후보를 짧게 rollout한다." },
      { label: "Turn radius", expression: "R=L/\\tan\\delta", terms: [["L", "wheelbase"]], explanation: "조향 한계가 경로 곡률을 제한한다." },
    ],
    derivation: [["상태 확장", "grid node에 heading index를 추가한다."], ["successor 생성", "left/straight/right steering primitive를 rollout한다."], ["충돌 검사", "primitive 전체가 costmap footprint와 충돌하지 않는지 본다."], ["후처리", "경로를 smoothing해 controller가 추종할 수 있게 만든다."]],
    handCalculation: { problem: "L=2.5m, delta=0.25rad이면 최소 회전반경 R은?", given: { L: 2.5, delta: 0.25 }, steps: ["tan(0.25)=0.255", "R=2.5/0.255=9.8m"], answer: "약 9.8m" },
    robotApplication: "Nav2 Smac Hybrid-A* planner나 Autoware parking planner의 path feasibility를 이해하는 데 필요하다.",
    lab: hybridAstarLab,
    visualization: { id: "vis_hybrid_astar_state_lattice", title: "Hybrid A* Heading Lattice", equation: "state=(x,y,theta)", parameters: [{ name: "turn_radius", symbol: "R", min: 0.5, max: 3, default: 1.2, description: "minimum turning radius" }, { name: "heading_bins", symbol: "N_theta", min: 4, max: 16, default: 8, description: "heading discretization" }], normalCase: "heading state를 포함하면 곡률이 제한된 부드러운 경로가 나온다.", failureCase: "heading을 무시하면 차량이 따라갈 수 없는 직각 path가 나온다." },
    quiz: { id: "hybrid_astar", conceptQuestion: "Hybrid A*가 일반 A*와 다른 점은?", conceptAnswer: "state에 heading이 포함되고 motion primitive로 successor를 만든다.", calculationQuestion: "L=2, delta=45도이면 R은?", calculationAnswer: "tan(45도)=1이므로 R=2m이다.", codeQuestion: "state tuple에 들어갈 세 값은?", codeAnswer: "(x, y, heading_index)이다.", debugQuestion: "차량이 불가능한 직각 경로를 만들면 무엇이 빠졌는가?", debugAnswer: "heading state, turning radius, motion primitive 제약을 확인한다.", visualQuestion: "turn radius를 키우면 path는?", visualAnswer: "더 넓게 돌아가고 좁은 통로 통과가 어려워진다.", robotQuestion: "차량형 로봇에 grid A*만 쓰면 위험한 이유는?", robotAnswer: "제자리 회전/직각 회전이 가능한 것처럼 경로를 만들어 실제 controller가 추종하지 못한다.", designQuestion: "Hybrid A* planner 검증 로그는?", designAnswer: "expanded states, collision primitive, min turning radius, smoothing cost, final curvature를 남긴다." },
    wrongTagLabel: "Hybrid A* heading/motion primitive 오류",
    nextSessions: ["dwb_critic_controller", "mppi_trajectory_planner_overview"],
  }),
  makeAdvancedSession({
    id: "dwb_critic_controller",
    part: "Part 4. 자율주행과 SLAM",
    title: "DWB Critic Controller",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 70,
    prerequisites: ["dwa_obstacle_avoidance", "costmap_inflation_nav2"],
    objectives: ["DWB가 DWA 후보에 critic score를 더하는 구조를 설명한다.", "PathDist/GoalDist/BaseObstacle critic을 계산한다.", "critic weight tuning 실패 사례를 해석한다."],
    definition: "DWB는 Dynamic Window 기반 cmd_vel 후보를 만들고 여러 critic cost를 합산해 가장 낮은 비용의 velocity command를 선택하는 Nav2 local controller다.",
    whyItMatters: "Nav2 기본 로컬 제어에서 DWB critic weight는 장애물 회피, path 추종, goal 접근 성향을 직접 바꾼다.",
    intuition: "여러 심사위원이 각 속도 후보에 감점을 주고, 총 감점이 가장 낮은 후보를 고른다.",
    equations: [
      { label: "DWB cost", expression: "J=\\sum_i w_i C_i(v,\\omega)", terms: [["C_i", "critic cost"]], explanation: "critic별 비용을 weighted sum으로 합친다." },
      { label: "Obstacle critic", expression: "C_{obs}\\propto 1/(clearance+\\epsilon)", terms: [["clearance", "nearest obstacle distance"]], explanation: "장애물에 가까울수록 비용이 크다." },
      { label: "Path critic", expression: "C_{path}=d(rollout,path)", terms: [["d", "distance"]], explanation: "global path에서 벗어난 후보를 벌점 처리한다." },
    ],
    derivation: [["velocity 후보", "DWA처럼 가능한 v,w를 샘플링한다."], ["rollout", "각 후보의 짧은 미래 궤적을 만든다."], ["critic 평가", "path, goal, obstacle, rotate 등 critic cost를 계산한다."], ["최소 cost 선택", "합산 비용이 가장 낮은 cmd_vel을 publish한다."]],
    handCalculation: { problem: "path=0.1, goal=1.0, clearance=1.0, weights=(1,1,0.8)이면 비용은?", given: { path: 0.1, goal: 1.0, clearance: 1.0 }, steps: ["obstacle=0.8/1.0=0.8", "J=0.1+1.0+0.8"], answer: "1.9" },
    robotApplication: "Nav2 controller_server의 FollowPath에서 DWBLocalPlanner critic 파라미터를 튜닝할 때 직접 쓰인다.",
    lab: dwbCriticLab,
    visualization: { id: "vis_dwb_critic_controller", title: "DWB Critic Score Space", equation: "J=sum(w_i C_i)", parameters: [{ name: "obstacle_weight", symbol: "w_obs", min: 0, max: 4, default: 1.4, description: "obstacle critic weight" }, { name: "path_weight", symbol: "w_path", min: 0, max: 3, default: 0.9, description: "path critic weight" }, { name: "goal_weight", symbol: "w_goal", min: 0, max: 3, default: 1.0, description: "goal critic weight" }], normalCase: "장애물과 path를 모두 고려한 cmd_vel이 선택된다.", failureCase: "obstacle critic이 너무 낮으면 path에 붙다 장애물 가까이 간다." },
    quiz: { id: "dwb", conceptQuestion: "DWB에서 critic은 무엇인가?", conceptAnswer: "각 velocity 후보의 path/goal/obstacle 성향을 비용으로 평가하는 함수다.", calculationQuestion: "J=1*0.2+2*0.3이면?", calculationAnswer: "0.8이다.", codeQuestion: "최소 cost index를 고르는 NumPy 코드는?", codeAnswer: "idx = int(np.argmin(costs))", debugQuestion: "로봇이 장애물에 너무 붙으면 어떤 critic을 확인하는가?", debugAnswer: "BaseObstacle 또는 obstacle critic weight와 inflation radius를 확인한다.", visualQuestion: "path critic을 너무 키우면?", visualAnswer: "path에 집착해 장애물 회피 여유가 줄 수 있다.", robotQuestion: "DWB는 Nav2 어느 서버에서 실행되는가?", robotAnswer: "controller_server의 FollowPath action 처리 중 실행된다.", designQuestion: "DWB 튜닝 실험은 어떻게 기록하는가?", designAnswer: "critic별 raw cost, weight, selected cmd_vel, min clearance, recovery 발생 여부를 함께 기록한다." },
    wrongTagLabel: "DWB critic score/tuning 오류",
    nextSessions: ["mppi_trajectory_planner_overview", "nav2_behavior_tree_action_server"],
  }),
  makeAdvancedSession({
    id: "slam_toolbox_launch_mapping",
    part: "Part 4. 자율주행과 SLAM",
    title: "slam_toolbox Online Mapping Launch",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 75,
    prerequisites: ["lidar_scan_preprocessing", "wheel_encoder_tick_odometry", "ros2_tf2_transform"],
    objectives: ["slam_toolbox launch command와 YAML 계약을 설명한다.", "map/odom/base_link frame과 /scan 토픽을 검증한다.", "map_saver_cli로 결과 map을 저장하는 절차를 작성한다."],
    definition: "slam_toolbox는 LaserScan과 odometry/TF를 사용해 2D pose graph와 OccupancyGrid map을 만들고 map->odom transform을 제공하는 ROS 2 SLAM 패키지다.",
    whyItMatters: "SLAM 개념을 알아도 실제 Nav2를 쓰려면 launch, frame, topic, map save 절차가 맞아야 한다.",
    intuition: "로봇이 걸어가며 레이저로 벽을 그리고, odom drift는 pose graph가 보정해 map 좌표계를 안정화한다.",
    equations: [
      { label: "Frame chain", expression: "map\\rightarrow odom\\rightarrow base\\_link\\rightarrow laser", terms: [["map", "global corrected frame"], ["odom", "locally smooth frame"]], explanation: "slam_toolbox는 map->odom 관계를 갱신한다." },
      { label: "Scan input", expression: "/scan + TF + odom \\rightarrow /map", terms: [["/map", "nav_msgs/OccupancyGrid"]], explanation: "LaserScan이 occupancy grid로 누적된다." },
      { label: "Readiness", expression: "ready=scan\\land TF\\land odom\\land params", terms: [["params", "slam_toolbox YAML"]], explanation: "하나라도 빠지면 mapping이 실패한다." },
    ],
    derivation: [["YAML 작성", "map_frame, odom_frame, base_frame, scan_topic을 실제 robot과 맞춘다."], ["launch", "online_async_launch.py에 slam_params_file을 넘긴다."], ["검증", "/map, /tf, /scan rate를 확인한다."], ["저장", "map_saver_cli로 pgm/yaml map을 저장한다."]],
    handCalculation: { problem: "map_frame과 odom_frame을 둘 다 odom으로 두면?", given: { map_frame: "odom", odom_frame: "odom" }, steps: ["두 frame이 같은 이름", "map->odom 보정 transform을 표현할 수 없음"], answer: "frame contract 실패다." },
    robotApplication: "실제 TurtleBot/JetRover에서 mapping bag을 만들고 Nav2 static map으로 이어지는 첫 실습이다.",
    lab: slamToolboxLaunchLab,
    visualization: { id: "vis_slam_toolbox_launch_mapping", title: "slam_toolbox Frame/Topic Contract", equation: "scan+tf+odom -> map", parameters: [{ name: "tf_age_ms", symbol: "dt_tf", min: 0, max: 500, default: 42, description: "TF age" }, { name: "scan_rate_hz", symbol: "f_scan", min: 1, max: 30, default: 10, description: "LaserScan rate" }, { name: "map_resolution", symbol: "res", min: 0.02, max: 0.2, default: 0.05, description: "map cell size" }], normalCase: "scan, TF, odom이 모두 fresh이면 /map이 안정적으로 갱신된다.", failureCase: "stale TF나 frame 이름 오류가 있으면 scan matching과 map 저장이 실패한다." },
    quiz: { id: "slam_toolbox_launch", conceptQuestion: "slam_toolbox가 갱신하는 핵심 TF는?", conceptAnswer: "map->odom transform이다.", calculationQuestion: "resolution=0.05m이면 1m는 몇 cell인가?", calculationAnswer: "20 cell이다.", codeQuestion: "실행 command 핵심은?", codeAnswer: "ros2 launch slam_toolbox online_async_launch.py slam_params_file:=slam_toolbox.yaml", debugQuestion: "map이 안 나오면 먼저 확인할 것은?", debugAnswer: "/scan topic, map/odom/base_link TF, slam params frame 이름, lifecycle/log를 확인한다.", visualQuestion: "TF age가 커지면 시각화 readiness는?", visualAnswer: "stale로 바뀌고 mapping gate가 막힌다.", robotQuestion: "완성된 map 저장 command는?", robotAnswer: "ros2 run nav2_map_server map_saver_cli -f my_map", designQuestion: "mapping 실험 로그에는 무엇을 남기는가?", designAnswer: "slam params, rosbag 이름, map resolution, scan rate, TF tree, map save 파일 hash를 남긴다." },
    wrongTagLabel: "slam_toolbox launch/frame/topic 오류",
    nextSessions: ["mobile_navigation_integrated_stack", "nav2_behavior_tree_action_server"],
  }),
  makeAdvancedSession({
    id: "mobile_navigation_integrated_stack",
    part: "Part 4. 자율주행과 SLAM",
    title: "Integrated Mobile Navigation Stack",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 80,
    prerequisites: ["ekf_localization", "slam_toolbox_launch_mapping", "path_planning_astar", "dwb_critic_controller"],
    objectives: ["localization, mapping, global planning, local control의 입력/출력을 한 흐름으로 연결한다.", "TF freshness와 stage readiness가 cmd_vel gate를 막는 조건을 설명한다.", "초보자가 Nav2 전체 구조를 한 화면에서 추적할 수 있게 한다."],
    definition: "통합 모바일 내비게이션 스택은 센서 기반 pose 추정, 지도/costmap, 전역 경로, 로컬 속도 명령이 TF와 action contract를 통해 연결된 시스템이다.",
    whyItMatters: "각 알고리즘을 따로 이해해도 실제 로봇은 이 네 단계가 동시에 맞아야 움직인다. 한 단계의 stale data가 전체 cmd_vel을 막아야 안전하다.",
    intuition: "현재 위치를 알고, 지도를 만들고, 큰 길을 정하고, 바로 앞 장애물을 보며 실제 속도를 고르는 네 사람이 한 팀으로 일하는 구조다.",
    equations: [
      { label: "Navigation gate", expression: "ready=loc\\land map\\land path\\land ctrl\\land TF", terms: [["loc", "localization ready"], ["ctrl", "local controller ready"]], explanation: "모든 stage가 준비되어야 cmd_vel을 낸다." },
      { label: "Frame chain", expression: "T_{map}^{base}=T_{map}^{odom}T_{odom}^{base}", terms: [["T", "TF transform"]], explanation: "pose와 map/path/control이 같은 frame으로 연결된다." },
      { label: "Control output", expression: "cmd\\_vel=(v,\\omega)", terms: [["v", "linear velocity"], ["omega", "angular velocity"]], explanation: "마지막 출력은 base controller 명령이다." },
    ],
    derivation: [["localization", "encoder/IMU/LiDAR로 odom 또는 map pose를 추정한다."], ["mapping", "scan으로 occupancy grid와 costmap을 만든다."], ["global path", "costmap에서 A*/Dijkstra/Hybrid A*가 path를 만든다."], ["local control", "DWB/DWA/MPPI가 path와 obstacle을 보고 cmd_vel을 고른다."]],
    handCalculation: { problem: "loc/map/path/ctrl=True인데 TF age=300ms, limit=150ms이면 gate 결과는?", given: { tf_age: 300, limit: 150 }, steps: ["TF fresh 조건 false", "ready 전체 AND가 false"], answer: "cmd_vel publish가 아니라 hold_or_recover다." },
    robotApplication: "Nav2 bringup에서 goal을 보냈는데 움직이지 않는 상황을 localization-map-planner-controller-TF 순서로 디버깅한다.",
    lab: navigationPipelineLab,
    visualization: { id: "vis_mobile_navigation_integrated_stack", title: "Localization to cmd_vel Integrated Stack", equation: "ready=loc&map&path&ctrl&TF", parameters: [{ name: "odom_drift", symbol: "e_odom", min: 0, max: 1, default: 0.25, description: "localization drift" }, { name: "inflation_radius", symbol: "r_inf", min: 0.2, max: 1.5, default: 0.7, description: "costmap inflation" }, { name: "tf_age_ms", symbol: "dt_tf", min: 0, max: 500, default: 42, description: "TF age" }], normalCase: "네 stage와 TF가 모두 green이면 cmd_vel이 publish된다.", failureCase: "stale TF, blocked path, controller collision 후보 없음이면 recovery/hold로 간다." },
    quiz: { id: "mobile_nav_stack", conceptQuestion: "네 핵심 흐름은 무엇인가?", conceptAnswer: "위치추정, 지도작성/costmap, 전역경로, 로컬제어다.", calculationQuestion: "TF age 200ms, limit 150ms이면 fresh인가?", calculationAnswer: "아니다. 200>150이므로 stale이다.", codeQuestion: "ready gate의 핵심 조건은?", codeAnswer: "localization_ok and map_ok and path_ok and controller_ok and tf_fresh", debugQuestion: "goal은 받았는데 cmd_vel이 0이면 어떤 순서로 확인하는가?", debugAnswer: "TF, localization, map/costmap, global path, controller critic/recovery 순서로 본다.", visualQuestion: "inflation radius를 키우면 path는?", visualAnswer: "장애물에서 멀어지지만 좁은 통로가 막힐 수 있다.", robotQuestion: "통합 스택의 최종 출력 topic은?", robotAnswer: "일반적으로 /cmd_vel이다.", designQuestion: "통합 시뮬레이션 로그 key는?", designAnswer: "stage readiness, TF age, localization covariance, path length, min clearance, selected cmd_vel, recovery reason이다." },
    wrongTagLabel: "mobile navigation pipeline 연결 오류",
    nextSessions: ["nav2_behavior_tree_action_server", "ros2_tf2_transform"],
  }),
];
