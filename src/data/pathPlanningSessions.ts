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

const astarLab = ensureCodeLabShape({
  id: "lab_astar_grid",
  title: "A* Pathfinding on Occupancy Grid",
  language: "python",
  theoryConnection: "f(n) = g(n) + h(n), h = Manhattan distance",
  starterCode: `import heapq
import numpy as np
import matplotlib.pyplot as plt

def astar(grid, start, goal):
    """
    grid: 2D numpy array, 0=free, 1=obstacle
    start, goal: (row, col)
    """
    # TODO: open_set priority queue [(f_score, counter, node)]
    # TODO: g_score = {start: 0}, came_from = {}
    # TODO: pop lowest f node, expand 4-neighbors, and reconstruct path at goal
    raise NotImplementedError

if __name__ == "__main__":
    grid = np.array([
        [0,0,0,0,0],
        [0,1,1,0,0],
        [0,1,0,0,0],
        [0,0,0,1,0],
        [0,0,0,0,0],
    ])
    print("경로:", astar(grid, (0,0), (4,4)))`,
  solutionCode: `import heapq
import numpy as np
import matplotlib.pyplot as plt

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar(grid, start, goal):
    rows, cols = grid.shape
    open_set = []
    counter = 0
    heapq.heappush(open_set, (heuristic(start, goal), counter, start))
    came_from = {}
    g_score = {start: 0}

    while open_set:
        _, _, current = heapq.heappop(open_set)
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return list(reversed(path))

        r, c = current
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            if grid[nr][nc] == 1:
                continue
            neighbor = (nr, nc)
            tentative_g = g_score[current] + 1
            if tentative_g < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                counter += 1
                f_score = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score, counter, neighbor))
    return None

if __name__ == "__main__":
    grid = np.array([
        [0,0,0,0,0],
        [0,1,1,0,0],
        [0,1,0,0,0],
        [0,0,0,1,0],
        [0,0,0,0,0],
    ])
    path = astar(grid, (0,0), (4,4))
    print("경로:", path)

    fig, ax = plt.subplots(figsize=(6, 6))
    ax.imshow(grid, cmap=plt.cm.get_cmap("Greys"), vmin=0, vmax=1)
    if path:
        pr, pc = zip(*path)
        ax.plot(pc, pr, "b-o", markersize=8, linewidth=2, label="A* 경로")
    ax.plot(0, 0, "gs", markersize=12, label="시작")
    ax.plot(4, 4, "r*", markersize=12, label="목표")
    ax.set_xticks(range(5))
    ax.set_yticks(range(5))
    ax.grid(True, color="gray", linewidth=0.5)
    ax.legend()
    ax.set_title("A* Pathfinding")
    plt.savefig("astar.png")
    plt.close()
    print("astar.png 저장 완료")`,
  testCode: `import numpy as np
from astar_grid import astar

def test_simple_path():
    grid = np.zeros((5, 5), dtype=int)
    path = astar(grid, (0,0), (4,4))
    assert path is not None
    assert path[0] == (0, 0)
    assert path[-1] == (4, 4)
    assert len(path) == 9

def test_blocked_path_returns_none():
    grid = np.array([
        [0,0,0],
        [1,1,1],
        [0,0,0],
    ])
    assert astar(grid, (0,0), (2,2)) is None

def test_path_avoids_obstacles():
    grid = np.array([
        [0,0,0,0,0],
        [0,1,1,0,0],
        [0,1,0,0,0],
        [0,0,0,1,0],
        [0,0,0,0,0],
    ])
    path = astar(grid, (0,0), (4,4))
    assert path is not None
    for r, c in path:
        assert grid[r][c] == 0`,
  expectedOutput: "경로: [(0, 0), (1, 0), (2, 0), (3, 0), (4, 0), (4, 1), (4, 2), (4, 3), (4, 4)]",
  runCommand: "python astar_grid.py && pytest test_astar_grid.py",
  commonBugs: [
    "g_score.get(neighbor, inf) 비교 없이 이미 나쁜 경로를 계속 push함",
    "0<=nr<rows 경계 조건을 빠뜨려 IndexError 발생",
    "grid==1 장애물 확인을 빠뜨려 벽을 통과함",
    "came_from 역추적에서 start를 누락함",
  ],
  extensionTask:
    "대각선 이동 8방향을 추가하고 h를 Euclidean distance로 바꿔 경로 길이를 비교하라.",
});

export const pathPlanningSessions: Session[] = [
  session({
    id: "path_planning_astar",
    part: "Part 4. 자율주행과 SLAM",
    title: "A* 경로계획 Python/C++ 완전 구현",
    level: "intermediate",
    difficulty: "medium",
    estimatedMinutes: 75,
    prerequisites: ["calculus_gradient_descent"],
    learningObjectives: [
      "f(n)=g(n)+h(n) 공식과 각 항의 의미를 설명한다.",
      "맨해튼 거리 휴리스틱을 계산한다.",
      "우선순위 큐로 open set을 관리한다.",
      "장애물이 있으면 피하고, 경로가 없으면 None을 반환한다.",
      "A* 경로를 matplotlib으로 시각화한다.",
    ],
    theory: {
      definition:
        "A*는 출발점에서 목표점까지 f(n)=g(n)+h(n)이 가장 낮은 노드를 먼저 확장하는 최단 경로 탐색 알고리즘이다.",
      whyItMatters:
        "Nav2 global planner와 costmap 기반 모바일 로봇 경로계획은 A* 또는 Dijkstra 계열 알고리즘을 핵심으로 사용한다.",
      intuition:
        "이미 걸어온 거리 g와 목표까지 남은 거리 추정 h를 더해, 지금 가장 유망한 길부터 확인하는 미로 탐색 전략이다.",
      equations: [
        makeEquation(
          "A* 비용함수",
          "f(n) = g(n) + h(n)",
          [
            ["g(n)", "출발점에서 n까지 실제 비용"],
            ["h(n)", "n에서 목표까지 추정 비용"],
            ["f(n)", "전체 추정 비용"],
          ],
          "f가 낮은 노드를 우선 탐색한다.",
        ),
        makeEquation(
          "맨해튼 휴리스틱",
          "h(n, goal) = |r_n-r_g| + |c_n-c_g|",
          [["r,c", "격자의 행과 열"]],
          "4방향 격자 이동에서 실제 최단거리보다 크지 않은 admissible 휴리스틱이다.",
        ),
      ],
      derivation: [
        step("open set 초기화", "시작점을 f=h(start,goal)로 priority queue에 넣는다."),
        step("최소 f 노드 확장", "heap에서 f가 가장 낮은 current를 꺼낸다."),
        step("goal 확인", "current가 goal이면 came_from을 역추적해 path를 만든다."),
        step("이웃 업데이트", "자유공간 4-neighbor에 대해 더 짧은 g를 찾으면 came_from과 g_score를 갱신한다."),
      ],
      handCalculation: {
        problem: "5x5 빈 격자에서 start=(0,0), goal=(4,4)의 h(start)는?",
        given: { start: "(0,0)", goal: "(4,4)" },
        steps: ["h=|0-4|+|0-4|", "h=4+4=8", "g(start)=0이므로 f(start)=8"],
        answer: "h=8, f=8",
      },
      robotApplication:
        "Nav2 costmap에서 obstacle inflation이 커지면 A*의 cell cost가 바뀌어 장애물에서 더 멀리 도는 경로가 선택된다.",
    },
    codeLabs: [astarLab],
    visualizations: [
      makeVisualization(
        "vis_astar_grid",
        "A* 격자 탐색 시각화",
        "path_planning_astar",
        "f=g+h",
        astarLab.id,
        [
          { name: "obstacle_density", symbol: "rho", min: 0, max: 0.4, default: 0.15, description: "장애물 비율" },
          { name: "grid_size", symbol: "N", min: 5, max: 20, default: 10, description: "격자 크기" },
        ],
        "장애물 밀도가 낮으면 직선에 가까운 최단 경로가 나온다.",
        "장애물 밀도가 높으면 경로가 길어지거나 None이 반환된다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "astar",
      conceptTag: "path_planning_astar",
      reviewSession: "A* 경로계획",
      conceptQuestion: "A*에서 h(n)이 실제 비용보다 크면 어떤 문제가 생기는가?",
      conceptAnswer: "admissible 조건을 깨서 최단 경로 보장을 잃을 수 있다.",
      calculationQuestion: "점 (2,3)에서 목표 (5,7)로의 맨해튼 거리는?",
      calculationAnswer: "|2-5|+|3-7|=3+4=7이다.",
      codeQuestion: "Python heapq에서 현재 노드를 꺼내는 코드는?",
      codeAnswer: "_, _, current = heapq.heappop(open_set)",
      debugQuestion: "A*가 장애물을 통과한다면 어떤 조건을 확인해야 하는가?",
      debugAnswer: "이웃 확장 전에 grid[nr][nc] == 0인지 검사하는지 확인한다.",
      visualQuestion: "장애물 밀도를 높이면 경로는 어떻게 변하는가?",
      visualAnswer: "더 구불구불해지거나 goal까지 연결이 끊겨 경로 없음이 된다.",
      robotQuestion: "Nav2 경로가 장애물에 너무 붙어 지나가면 어떤 파라미터를 조정하는가?",
      robotAnswer: "costmap2d의 inflation_radius나 cost_scaling_factor를 조정한다.",
      designQuestion: "A*와 RRT는 언제 각각 선택하는가?",
      designAnswer: "격자 지도에서는 A*, 연속 고차원 로봇팔 공간에서는 RRT/RRT*가 더 적합하다.",
    }),
    wrongAnswerTags: makeWrongTags("path_planning_astar", "A* 경로계획 구현 오류", [
      "calculus_gradient_descent",
    ]),
    nextSessions: ["slam_intro", "rrt_basics"],
  }),
];
