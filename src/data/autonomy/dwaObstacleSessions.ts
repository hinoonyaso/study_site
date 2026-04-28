import type { Session } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

const dwaLab = {
  id: "lab_dwa_velocity_space",
  title: "Dynamic Window Velocity Scoring",
  language: "python" as const,
  theoryConnection: "score(v,w)=heading_weight*heading + clearance_weight*clearance + velocity_weight*v",
  starterCode: `import numpy as np

def score_velocity(v, clearance, heading_error, weights=(1.0, 1.0, 0.2)):
    # TODO: high clearance, high v, low heading_error are better
    raise NotImplementedError

def choose_velocity(candidates):
    # TODO: candidates: [(v, clearance, heading_error), ...]
    raise NotImplementedError

if __name__ == "__main__":
    candidates = [(0.5, 0.2, 0.1), (0.2, 1.0, 0.3), (0.8, 0.05, 0.0)]
    print(choose_velocity(candidates))`,
  solutionCode: `import numpy as np

def score_velocity(v, clearance, heading_error, weights=(1.0, 1.0, 0.2)):
    wh, wc, wv = weights
    return wh * (1.0 - heading_error) + wc * clearance + wv * v

def choose_velocity(candidates):
    scores = [score_velocity(*c) for c in candidates]
    return int(np.argmax(scores))

if __name__ == "__main__":
    candidates = [(0.5, 0.2, 0.1), (0.2, 1.0, 0.3), (0.8, 0.05, 0.0)]
    print(choose_velocity(candidates))`,
  testCode: `from dwa_velocity_space import score_velocity, choose_velocity

def test_clearance_matters():
    assert score_velocity(0.2, 1.0, 0.1) > score_velocity(0.2, 0.1, 0.1)

def test_choose_safe_candidate():
    assert choose_velocity([(0.5,0.2,0.1), (0.2,1.0,0.3)]) == 1`,
  expectedOutput: "1",
  runCommand: "python dwa_velocity_space.py && pytest test_dwa_velocity_space.py",
  commonBugs: ["clearance가 낮은 후보를 penalty하지 않음", "heading_error를 reward로 더해 방향이 나빠질수록 점수가 커짐", "dynamic window acceleration limit을 무시함"],
  extensionTask: "v,w 샘플 grid를 만들고 collision-free 후보만 색칠하라.",
};

export const dwaObstacleSessions: Session[] = [
  makeAdvancedSession({
    id: "dwa_obstacle_avoidance",
    part: "Part 4. 자율주행과 SLAM",
    title: "Obstacle Avoidance: DWA Velocity Space",
    prerequisites: ["path_planning_astar", "state_space_model"],
    objectives: ["DWA가 velocity command 후보를 샘플링하는 구조를 설명한다.", "heading, clearance, velocity score를 계산한다.", "dynamic window와 collision check를 구분한다.", "Nav2 local planner와 연결한다."],
    definition: "DWA(Dynamic Window Approach)는 현재 속도와 가속도 제한으로 다음 제어 주기에 가능한 속도 후보를 만들고, 장애물 clearance와 목표 방향 score로 안전한 command를 고르는 local planner다.",
    whyItMatters: "A*가 global path를 만들더라도 실제 로봇은 동적 장애물과 actuator limit을 고려해 매 순간 v,w command를 골라야 한다.",
    intuition: "지금 당장 낼 수 있는 속도 후보들을 펼쳐 놓고, 목표에 잘 가면서 장애물과 충분히 떨어진 후보를 고른다.",
    equations: [
      { label: "DWA score", expression: "J(v,\\omega)=w_hH+w_cC+w_vV", terms: [["H", "heading score"], ["C", "clearance"], ["V", "velocity preference"]], explanation: "여러 기준을 weighted sum으로 합친다." },
      { label: "Dynamic window", expression: "v\\in[v_0-a_v\\Delta t, v_0+a_v\\Delta t]", terms: [["a_v", "acceleration limit"]], explanation: "물리적으로 다음 주기에 도달 가능한 속도만 본다." },
      { label: "Time-to-collision", expression: "TTC=d/v_{rel}", terms: [["d", "장애물 거리"], ["v_rel", "상대속도"]], explanation: "충돌 시간이 짧으면 후보를 제거한다." },
    ],
    derivation: [["후보 생성", "현재 v,w와 acceleration limit으로 dynamic window를 만든다."], ["rollout", "각 후보를 짧은 시간 시뮬레이션한다."], ["충돌 검사", "costmap에서 obstacle과 부딪히는 후보를 제거한다."], ["score 선택", "남은 후보 중 weighted score가 가장 큰 command를 보낸다."]],
    handCalculation: { problem: "heading=0.8, clearance=0.5, velocity=0.4, weights 모두 1이면 score는?", given: { H: 0.8, C: 0.5, V: 0.4 }, steps: ["J=0.8+0.5+0.4"], answer: "1.7" },
    robotApplication: "Nav2 DWB controller는 path distance, goal distance, obstacle critic 같은 score를 조합해 cmd_vel을 선택한다.",
    lab: dwaLab,
    visualization: { id: "vis_dwa_velocity_space", title: "DWA 속도 공간 후보", equation: "J=w_hH+w_cC+w_vV", parameters: [{ name: "clearance_weight", symbol: "w_c", min: 0, max: 5, default: 1, description: "장애물 거리 weight" }, { name: "velocity_weight", symbol: "w_v", min: 0, max: 2, default: 0.2, description: "속도 선호 weight" }], normalCase: "충돌 없는 후보 중 목표 방향과 clearance가 좋은 command가 선택된다.", failureCase: "clearance weight가 낮으면 장애물에 너무 붙는 command가 선택된다." },
    quiz: {
      id: "dwa",
      conceptQuestion: "DWA가 global planner가 아니라 local planner인 이유는?",
      conceptAnswer: "현재 속도와 가까운 미래 obstacle만 보고 다음 cmd_vel을 고르기 때문이다.",
      calculationQuestion: "d=2m, v_rel=0.5m/s이면 TTC는?",
      calculationAnswer: "2/0.5=4초이다.",
      codeQuestion: "가장 큰 score index를 고르는 NumPy 한 줄은?",
      codeAnswer: "return int(np.argmax(scores))",
      debugQuestion: "로봇이 장애물에 붙어 지나가면 어떤 weight를 확인하는가?",
      debugAnswer: "clearance/obstacle critic weight가 너무 낮은지 확인한다.",
      visualQuestion: "clearance_weight를 키우면 선택 후보는 어떻게 변하는가?",
      visualAnswer: "장애물에서 더 멀리 떨어진 속도 후보가 선택된다.",
      robotQuestion: "A* path는 있는데 로봇이 사람을 피하지 못하면 무엇이 부족한가?",
      robotAnswer: "동적 장애물을 반영하는 local obstacle avoidance와 velocity command scoring이 부족하다.",
      designQuestion: "DWA fallback은 언제 emergency stop으로 가야 하는가?",
      designAnswer: "collision-free 후보가 없거나 TTC가 safety threshold보다 작을 때 stop으로 전환해야 한다.",
    },
    wrongTagLabel: "DWA velocity/clearance score 오류",
    nextSessions: ["mpc_1d_receding_horizon", "safety_watchdog_timer"],
  }),
];

