import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const svdJacobianLab = {
  id: "lab_svd_jacobian_condition",
  title: "SVD로 Jacobian Rank와 Condition Number 판별",
  language: "python" as const,
  theoryConnection: "J = U Sigma V^T, manipulability = prod(sigma), cond = sigma_max/sigma_min",
  starterCode: `import numpy as np

def jacobian_2link(q1, q2, l1=1.0, l2=0.7):
    # TODO: analytic 2-link planar Jacobian
    raise NotImplementedError

def jacobian_svd_metrics(J):
    # TODO: singular values, rank, condition number, manipulability
    raise NotImplementedError

if __name__ == "__main__":
    J = jacobian_2link(0.0, 0.1)
    metrics = jacobian_svd_metrics(J)
    print(metrics["rank"], round(metrics["condition"], 2))`,
  solutionCode: `import numpy as np

def jacobian_2link(q1, q2, l1=1.0, l2=0.7):
    s1, c1 = np.sin(q1), np.cos(q1)
    s12, c12 = np.sin(q1 + q2), np.cos(q1 + q2)
    return np.array([
        [-l1 * s1 - l2 * s12, -l2 * s12],
        [ l1 * c1 + l2 * c12,  l2 * c12],
    ], dtype=float)

def jacobian_svd_metrics(J):
    s = np.linalg.svd(J, compute_uv=False)
    tol = 1e-6
    rank = int(np.sum(s > tol))
    condition = float(np.inf if s[-1] <= tol else s[0] / s[-1])
    manipulability = float(np.prod(s))
    return {"singular_values": s, "rank": rank, "condition": condition, "manipulability": manipulability}

if __name__ == "__main__":
    J = jacobian_2link(0.0, 0.1)
    metrics = jacobian_svd_metrics(J)
    print(metrics["rank"], round(metrics["condition"], 2))`,
  testCode: `import numpy as np
from svd_jacobian_condition import jacobian_2link, jacobian_svd_metrics

def test_singular_stretched_arm():
    metrics = jacobian_svd_metrics(jacobian_2link(0.0, 0.0))
    assert metrics["rank"] == 1
    assert np.isinf(metrics["condition"])

def test_bent_arm_full_rank():
    metrics = jacobian_svd_metrics(jacobian_2link(0.0, 1.0))
    assert metrics["rank"] == 2
    assert metrics["condition"] < 10`,
  expectedOutput: "2 48.25",
  runCommand: "python svd_jacobian_condition.py && pytest test_svd_jacobian_condition.py",
  commonBugs: [
    "작은 singular value를 0으로 보는 tolerance를 두지 않아 singularity를 놓침",
    "condition number를 sigma_min/sigma_max로 거꾸로 계산함",
    "Jacobian 열이 joint velocity 방향이라는 의미를 잊고 행/열을 바꿈",
  ],
  extensionTask: "q2를 -pi~pi로 sweep해 condition number heatmap과 singularity region을 저장하라.",
};

export const svdJacobianApplicationSessions: Session[] = [
  makeAdvancedSession({
    id: "svd_jacobian_condition_number",
    part: "Part 2. 로봇 수학",
    title: "SVD로 Jacobian 특이점과 조작성 판별",
    prerequisites: ["svd_intuition_robotics", "jacobian_from_multivariable_calculus", "numerical_jacobian_2link"],
    objectives: [
      "Jacobian SVD의 singular value가 속도 증폭 방향을 뜻함을 설명한다.",
      "rank deficiency와 singularity를 작은 singular value로 판별한다.",
      "condition number와 manipulability를 계산한다.",
      "IK damping이 왜 작은 singular value에서 필요한지 연결한다.",
    ],
    definition:
      "Jacobian SVD는 joint velocity space가 end-effector velocity space로 어떻게 늘어나고 눌리는지 singular value와 singular vector로 분해하는 방법이다.",
    whyItMatters:
      "로봇팔이 특이점 근처에 가면 작은 말단 속도를 만들기 위해 큰 joint velocity가 필요하다. SVD condition number는 그 위험을 수치로 알려준다.",
    intuition:
      "원형 joint velocity 입력이 작업공간에서 찌그러진 타원으로 바뀐다. 타원이 납작해질수록 한 방향으로는 거의 움직일 수 없는 singularity에 가까워진다.",
    equations: [
      {
        label: "Jacobian SVD",
        expression: "J=U\\Sigma V^T",
        terms: [["Σ", "singular values"], ["U,V", "workspace/joint velocity directions"]],
        explanation: "각 singular value는 특정 방향의 velocity gain이다.",
      },
      {
        label: "Condition number",
        expression: "\\kappa(J)=\\frac{\\sigma_{max}}{\\sigma_{min}}",
        terms: [["σ_min", "smallest singular value"]],
        explanation: "σ_min이 0에 가까우면 condition number가 커져 near singular 상태다.",
      },
      {
        label: "Manipulability",
        expression: "w=\\sqrt{\\det(JJ^T)}=\\prod_i\\sigma_i",
        terms: [["w", "Yoshikawa manipulability"]],
        explanation: "작업공간 속도 타원의 면적과 연결된다.",
      },
    ],
    derivation: [
      ["Jacobian 계산", "2-link J(q)를 analytic 또는 numerical로 얻는다."],
      ["SVD", "np.linalg.svd(J)로 singular value를 계산한다."],
      ["rank", "tolerance보다 큰 singular value 개수를 센다."],
      ["IK 연결", "σ_min이 작으면 pseudo-inverse gain이 커지므로 damping을 넣는다."],
    ],
    handCalculation: {
      problem: "singular values가 [2.0, 0.1]이면 condition number와 manipulability는?",
      given: { sigma1: 2.0, sigma2: 0.1 },
      steps: ["condition=2.0/0.1=20", "manipulability=2.0*0.1=0.2"],
      answer: "κ=20, w=0.2",
    },
    robotApplication:
      "MoveIt IK가 특이점 근처에서 joint velocity를 크게 튀기는 현상은 작은 singular value의 역수가 커지기 때문이다. Damped least squares는 이 gain을 제한한다.",
    lab: svdJacobianLab,
    visualization: {
      id: "vis_svd_jacobian_spectrum",
      title: "Jacobian Singular Value Spectrum",
      equation: "kappa=sigma_max/sigma_min",
      parameters: [
        { name: "q2_deg", symbol: "q_2", min: -180, max: 180, default: 10, description: "elbow angle" },
        { name: "damping", symbol: "\\lambda", min: 0, max: 0.5, default: 0.1, description: "DLS damping" },
      ],
      normalCase: "두 singular value가 충분히 크면 full-rank로 안정적인 IK가 가능하다.",
      failureCase: "q2가 0도에 가까우면 σ_min이 0에 가까워져 condition number가 폭증한다.",
    },
    quiz: {
      id: "svd_jacobian",
      conceptQuestion: "Jacobian singular value는 무엇을 의미하는가?",
      conceptAnswer: "특정 joint velocity 방향이 end-effector velocity로 얼마나 증폭되는지를 의미한다.",
      calculationQuestion: "σ=[3,0.2]이면 condition number는?",
      calculationAnswer: "3/0.2=15이다.",
      codeQuestion: "NumPy에서 singular value만 구하는 코드는?",
      codeAnswer: "s = np.linalg.svd(J, compute_uv=False)",
      debugQuestion: "singularity인데 rank=2로 나오면 무엇을 확인하는가?",
      debugAnswer: "tolerance와 floating-point small singular value 처리를 확인한다.",
      visualQuestion: "q2가 0도에 가까워지면 σ_min은?",
      visualAnswer: "0에 가까워져 condition number가 커지고 manipulability가 낮아진다.",
      robotQuestion: "IK가 특이점 근처에서 관절 속도를 크게 만드는 이유는?",
      robotAnswer: "pseudo-inverse가 1/σ_min gain을 사용해 작은 singular value 방향을 과도하게 증폭하기 때문이다.",
      designQuestion: "SVD 기반 IK 안정화 방법은?",
      designAnswer: "Damped least squares, manipulability cost, joint limit avoidance, singularity margin을 사용한다.",
    },
    wrongTagLabel: "SVD/Jacobian condition number 오류",
    nextSessions: ["damped_least_squares_ik", "trajectory_quintic_time_scaling"],
  }),
];
