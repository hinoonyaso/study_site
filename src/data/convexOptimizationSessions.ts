import type { Session } from "../types";
import { makeAdvancedSession } from "./advancedSessionFactory";

const convexLab = {
  id: "lab_convex_vs_nonconvex_gd",
  title: "Convex vs Non-convex Gradient Descent",
  language: "python" as const,
  theoryConnection: "convex if Hessian >= 0; non-convex can have local minima",
  starterCode: `import numpy as np

def gd(f_grad, x0, lr=0.05, steps=100):
    # TODO: x <- x - lr * grad(x)
    raise NotImplementedError

def convex_grad(x):
    # f=(x-2)^2
    raise NotImplementedError

def nonconvex_grad(x):
    # f=x^4-3x^2+x
    raise NotImplementedError

if __name__ == "__main__":
    print(round(gd(convex_grad, -5.0)[-1], 3))
    print(round(gd(nonconvex_grad, -0.5)[-1], 3))`,
  solutionCode: `import numpy as np

def gd(f_grad, x0, lr=0.05, steps=100):
    xs = [float(x0)]
    x = float(x0)
    for _ in range(steps):
        x = x - lr * f_grad(x)
        xs.append(x)
    return xs

def convex_grad(x):
    return 2 * (x - 2)

def nonconvex_grad(x):
    return 4 * x**3 - 6 * x + 1

if __name__ == "__main__":
    print(round(gd(convex_grad, -5.0)[-1], 3))
    print(round(gd(nonconvex_grad, -0.5)[-1], 3))`,
  testCode: `from convex_vs_nonconvex_gd import gd, convex_grad, nonconvex_grad

def test_convex_converges_global():
    assert abs(gd(convex_grad, -5.0)[-1] - 2.0) < 1e-3

def test_nonconvex_depends_on_start():
    a = gd(nonconvex_grad, -2.0)[-1]
    b = gd(nonconvex_grad, 2.0)[-1]
    assert abs(a - b) > 1.0`,
  expectedOutput: "2.0\n-1.301",
  runCommand: "python convex_vs_nonconvex_gd.py && pytest test_convex_vs_nonconvex_gd.py",
  commonBugs: ["Hessian 부호를 한 점에서만 보고 전역 convex로 착각", "KKT active constraint를 무시함", "learning rate를 너무 키워 convex 함수에서도 발산함"],
  extensionTask: "f(x)=x^4-3x^2+x의 시작점별 최종 local minimum을 그래프로 그려라.",
};

const scipyConstraintLab = {
  id: "lab_scipy_constrained_qp",
  title: "SciPy Constraint Optimization: 1D QP-style Problem",
  language: "python" as const,
  theoryConnection: "min (x-2)^2 subject to x <= 1, active constraint -> optimum x=1",
  starterCode: `import numpy as np
from scipy.optimize import minimize

def solve_constrained():
    # TODO: minimize (x-2)^2 subject to x <= 1
    raise NotImplementedError

if __name__ == "__main__":
    x = solve_constrained()
    print(round(float(x), 3))`,
  solutionCode: `import numpy as np
from scipy.optimize import minimize

def solve_constrained():
    objective = lambda x: (x[0] - 2.0) ** 2
    constraints = [{"type": "ineq", "fun": lambda x: 1.0 - x[0]}]  # x <= 1
    result = minimize(objective, x0=np.array([0.0]), constraints=constraints, method="SLSQP")
    if not result.success:
        raise RuntimeError(result.message)
    return result.x[0]

if __name__ == "__main__":
    x = solve_constrained()
    print(round(float(x), 3))`,
  testCode: `from scipy_constrained_qp import solve_constrained

def test_active_constraint_solution():
    assert abs(solve_constrained() - 1.0) < 1e-6`,
  expectedOutput: "1.0",
  runCommand: "python scipy_constrained_qp.py && pytest test_scipy_constrained_qp.py",
  commonBugs: [
    "SciPy inequality constraint가 fun(x)>=0 형식임을 잊고 x-1을 넣어 x>=1로 바꿈",
    "unconstrained optimum x=2만 보고 active constraint x<=1을 무시함",
    "solver success flag를 확인하지 않고 실패 결과를 그대로 사용함",
  ],
  extensionTask: "2D quadratic cost와 box constraint를 추가해 작은 MPC QP 형태로 확장하라.",
};

const convexOptimizationSession = makeAdvancedSession({
    id: "convex_optimization_kkt",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Convex Optimization과 KKT 조건 입문",
    prerequisites: ["calculus_gradient_descent", "least_squares"],
    objectives: ["convex set/function을 판별한다.", "Hessian 양의 준정부호 조건을 설명한다.", "제약 최적화에서 KKT active constraint를 구분한다.", "LQR/MPC가 왜 최적화 문제인지 연결한다."],
    definition: "Convex optimization은 목적함수와 feasible set이 convex인 최적화 문제다. local optimum이 global optimum이 되는 구조라 제어와 로봇 계획에서 매우 중요하다.",
    whyItMatters: "MPC, trajectory optimization, QP 기반 whole-body control은 제약 최적화다. convex/non-convex를 구분하지 못하면 solver 결과의 신뢰성을 판단할 수 없다.",
    intuition: "convex 함수는 그릇처럼 한 개의 바닥을 가진 지형이고, non-convex 함수는 골짜기가 여러 개라 시작점에 따라 다른 곳에 멈춘다.",
    equations: [
      { label: "Convex function", expression: "f(\\lambda x+(1-\\lambda)y)\\le \\lambda f(x)+(1-\\lambda)f(y)", terms: [["λ", "0~1 혼합 비율"]], explanation: "두 점을 잇는 직선보다 함수가 아래에 있으면 convex다." },
      { label: "Hessian test", expression: "\\nabla^2 f(x) \\succeq 0", terms: [["∇²f", "Hessian"], ["⪰0", "positive semidefinite"]], explanation: "2차 미분 행렬이 모든 방향에서 음수가 아니면 convex다." },
      { label: "KKT stationarity", expression: "\\nabla f(x^*)+\\sum_i \\lambda_i \\nabla g_i(x^*)=0", terms: [["λ_i", "constraint multiplier"], ["g_i", "inequality constraint"]], explanation: "최적점에서 목적함수 gradient와 active constraint gradient가 균형을 이룬다." },
    ],
    derivation: [["무제약 최적화", "gradient=0인 점을 찾는다."], ["convex 확인", "Hessian eigenvalue가 모두 0 이상인지 본다."], ["제약 추가", "active constraint에 multiplier를 붙인다."], ["MPC 연결", "quadratic cost와 linear constraint는 QP가 된다."]],
    handCalculation: { problem: "f(x)=(x-2)^2의 Hessian과 convex 여부는?", given: { f: "(x-2)^2" }, steps: ["f'=2(x-2)", "f''=2", "2>0이므로 strictly convex"], answer: "convex이며 global minimum은 x=2" },
    robotApplication: "로봇팔 joint limit을 포함한 trajectory optimization은 제약이 active 되는 순간 multiplier가 커지고, 그 방향으로 더 움직이지 못하게 된다.",
    lab: convexLab,
    visualization: { id: "vis_convex_nonconvex_gd", title: "Convex vs Non-convex Gradient Descent", equation: "x <- x - alpha grad f", parameters: [{ name: "x0", symbol: "x_0", min: -3, max: 3, default: -1, description: "초기점" }, { name: "lr", symbol: "\\alpha", min: 0.01, max: 0.2, default: 0.05, description: "학습률" }], normalCase: "convex 함수에서는 시작점과 무관하게 같은 optimum으로 수렴한다.", failureCase: "non-convex 함수에서는 시작점별로 다른 local minimum에 수렴한다." },
    quiz: {
      id: "convex_kkt",
      conceptQuestion: "Convex 문제에서 local optimum이 중요한 이유는?",
      conceptAnswer: "convex 문제에서는 모든 local optimum이 global optimum이므로 solver 결과를 더 신뢰할 수 있다.",
      calculationQuestion: "f(x)=x^2의 Hessian은?",
      calculationAnswer: "f''(x)=2로 양수이므로 strictly convex다.",
      codeQuestion: "gradient descent 업데이트 한 줄은?",
      codeAnswer: "x = x - lr * grad(x)",
      debugQuestion: "convex 함수에서도 GD가 발산하면 무엇을 의심하는가?",
      debugAnswer: "learning rate가 너무 크거나 gradient 부호가 반대로 구현된 것을 의심한다.",
      visualQuestion: "시작점을 바꿔도 같은 점으로 가는 그래프는 무엇을 의미하는가?",
      visualAnswer: "convex 구조라 global optimum으로 안정적으로 수렴한다는 뜻이다.",
      robotQuestion: "joint limit이 active라는 말은 무엇인가?",
      robotAnswer: "최적해가 limit 경계에 걸려 있고 해당 제약이 solution을 결정한다는 뜻이다.",
      designQuestion: "MPC solver가 infeasible을 반환하면 시스템은 어떻게 해야 하는가?",
      designAnswer: "fallback controller, 제약 완화, emergency stop 중 하나로 전환하고 infeasible 원인을 로그로 남긴다.",
    },
    wrongTagLabel: "Convex/KKT 판별 오류",
    nextSessions: ["mpc_1d_receding_horizon"],
  });

export const convexOptimizationSessions: Session[] = [
  {
    ...convexOptimizationSession,
    codeLabs: [...convexOptimizationSession.codeLabs, scipyConstraintLab],
    theory: {
      ...convexOptimizationSession.theory,
      robotApplication:
        `${convexOptimizationSession.theory.robotApplication} SciPy SLSQP 같은 constrained optimizer는 실제 MPC/QP solver의 동작을 작게 검산하는 학습 도구로 쓸 수 있다.`,
    },
  },
];
