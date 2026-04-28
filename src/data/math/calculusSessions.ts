import type { Session } from "../../types";
import {
  ensureCodeLabShape,
  makeCoreQuizzes,
  makeEquation,
  makeVisualization,
  makeWrongTags,
  session,
  step,
} from "../core/v2SessionHelpers";

const numericalDiffLab = ensureCodeLabShape({
  id: "lab_numerical_derivative",
  title: "Numerical Derivative",
  language: "python",
  theoryConnection: "f'(x) ≈ (f(x+h) - f(x-h)) / (2h)",
  starterCode: `import numpy as np
import matplotlib.pyplot as plt

def numerical_derivative(f, x, h=1e-5):
    # TODO: 중앙차분 공식으로 f'(x)를 계산한다.
    # 힌트: (f(x+h) - f(x-h)) / (2*h)
    raise NotImplementedError

if __name__ == "__main__":
    f = lambda x: x**3
    dfdx = lambda x: 3 * x**2
    x = 2.0
    approx = numerical_derivative(f, x)
    exact = dfdx(x)
    print(f"수치 미분: {approx:.6f}")
    print(f"해석 미분: {exact:.6f}")
    print(f"오차: {abs(approx - exact):.2e}")`,
  solutionCode: `import numpy as np
import matplotlib.pyplot as plt

def numerical_derivative(f, x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)

if __name__ == "__main__":
    f = lambda x: x**3
    dfdx = lambda x: 3 * x**2
    x = 2.0
    approx = numerical_derivative(f, x)
    exact = dfdx(x)
    print(f"수치 미분: {approx:.6f}")
    print(f"해석 미분: {exact:.6f}")
    print(f"오차: {abs(approx - exact):.2e}")

    xs = np.linspace(-2, 2, 200)
    approx_all = [numerical_derivative(f, xi) for xi in xs]
    plt.figure(figsize=(8, 4))
    plt.plot(xs, xs**3, label="f(x) = x^3")
    plt.plot(xs, 3 * xs**2, label="f'(x) = 3x^2 (해석)")
    plt.plot(xs, approx_all, "--", label="f'(x) 수치", alpha=0.7)
    plt.legend()
    plt.grid(True)
    plt.title("수치 미분 vs 해석 미분")
    plt.savefig("derivative.png")
    plt.close()
    print("derivative.png 저장 완료")`,
  testCode: `import math
from numerical_derivative import numerical_derivative

def test_derivative_of_x_squared():
    f = lambda x: x**2
    assert abs(numerical_derivative(f, 3.0) - 6.0) < 1e-4

def test_derivative_of_sin():
    assert abs(numerical_derivative(math.sin, 0.0) - 1.0) < 1e-4

def test_constant_function_derivative_is_zero():
    f = lambda x: 5.0
    assert abs(numerical_derivative(f, 10.0)) < 1e-6`,
  expectedOutput: `수치 미분: 12.000000
해석 미분: 12.000000
오차: 4.44e-11`,
  runCommand: "python numerical_derivative.py && pytest test_numerical_derivative.py",
  commonBugs: [
    "전진차분 (f(x+h)-f(x))/h를 써서 오차가 커짐",
    "h를 너무 크게 잡아 근사 오차가 커짐",
    "h가 너무 작아 부동소수점 취소 오류가 커짐",
  ],
  extensionTask:
    "전진차분/중앙차분/후진차분의 오차를 h=1e-1~1e-10 범위로 sweep하여 log-log 그래프로 비교하라.",
});

const gradientLab = ensureCodeLabShape({
  id: "lab_gradient_descent",
  title: "Gradient and Gradient Descent",
  language: "python",
  theoryConnection: "∇f = [∂f/∂x, ∂f/∂y], θ ← θ - α∇f(θ)",
  starterCode: `import numpy as np
import matplotlib.pyplot as plt

def gradient_2d(f, x, y, h=1e-5):
    # TODO: x 방향 편미분과 y 방향 편미분을 중앙차분으로 계산한다.
    raise NotImplementedError

def gradient_descent(f, grad_f, x0, y0, lr=0.1, steps=50):
    # TODO: gradient 반대 방향으로 이동하며 [(x,y), ...] 경로를 반환한다.
    raise NotImplementedError

if __name__ == "__main__":
    f = lambda x, y: x**2 + 2*y**2
    x, y = 3.0, 2.0
    gx, gy = gradient_2d(f, x, y)
    print(f"gradient at ({x},{y}): ({gx:.4f}, {gy:.4f})")
    path = gradient_descent(f, lambda x, y: gradient_2d(f, x, y), 3.0, 2.0)
    final = path[-1]
    print(f"최종 위치: ({final[0]:.4f}, {final[1]:.4f})")`,
  solutionCode: `import numpy as np
import matplotlib.pyplot as plt

def gradient_2d(f, x, y, h=1e-5):
    dfdx = (f(x + h, y) - f(x - h, y)) / (2 * h)
    dfdy = (f(x, y + h) - f(x, y - h)) / (2 * h)
    return dfdx, dfdy

def gradient_descent(f, grad_f, x0, y0, lr=0.1, steps=50):
    x, y = x0, y0
    path = [(x, y)]
    for _ in range(steps):
        gx, gy = grad_f(x, y)
        x = x - lr * gx
        y = y - lr * gy
        path.append((x, y))
    return path

if __name__ == "__main__":
    f = lambda x, y: x**2 + 2*y**2
    x, y = 3.0, 2.0
    gx, gy = gradient_2d(f, x, y)
    print(f"gradient at ({x},{y}): ({gx:.4f}, {gy:.4f})")
    path = gradient_descent(f, lambda x, y: gradient_2d(f, x, y), 3.0, 2.0)
    final = path[-1]
    print(f"최종 위치: ({final[0]:.4f}, {final[1]:.4f})")

    xs = np.linspace(-3.5, 3.5, 200)
    ys = np.linspace(-2.5, 2.5, 200)
    X, Y = np.meshgrid(xs, ys)
    Z = X**2 + 2 * Y**2
    plt.figure(figsize=(7, 5))
    plt.contourf(X, Y, Z, levels=20, cmap="viridis", alpha=0.7)
    px, py = zip(*path)
    plt.plot(px, py, "r.-", markersize=4, label="GD 경로")
    plt.scatter([3.0], [2.0], color="red", s=80, label="시작점")
    plt.scatter([0.0], [0.0], color="lime", s=80, label="최솟값")
    plt.legend()
    plt.title("Gradient Descent on x^2+2y^2")
    plt.savefig("gradient_descent.png")
    plt.close()
    print("gradient_descent.png 저장 완료")`,
  testCode: `from gradient_descent import gradient_2d, gradient_descent

def test_gradient_of_parabola():
    f = lambda x, y: x**2 + y**2
    gx, gy = gradient_2d(f, 1.0, 2.0)
    assert abs(gx - 2.0) < 1e-4
    assert abs(gy - 4.0) < 1e-4

def test_gradient_descent_converges():
    f = lambda x, y: x**2 + 2*y**2
    path = gradient_descent(f, lambda x, y: gradient_2d(f, x, y), 3.0, 2.0, lr=0.1, steps=200)
    final_x, final_y = path[-1]
    assert abs(final_x) < 0.01
    assert abs(final_y) < 0.01`,
  expectedOutput: `gradient at (3.0,2.0): (6.0000, 8.0000)
최종 위치: (0.0000, 0.0000)`,
  runCommand: "python gradient_descent.py && pytest test_gradient_descent.py",
  commonBugs: [
    "gradient를 더하는 방향으로 이동해서 발산함",
    "학습률 lr이 너무 커서 목적함수가 진동하며 발산함",
    "y 방향 편미분에서 x를 바꿔 쓰는 실수",
  ],
  extensionTask:
    "lr=0.01/0.1/0.5로 바꾸며 수렴 속도를 비교하는 그래프를 출력하라.",
});

export const calculusSessions: Session[] = [
  session({
    id: "calculus_derivative_chain_rule",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "극한, 미분, 편미분, 체인룰",
    level: "beginner",
    difficulty: "easy",
    estimatedMinutes: 60,
    prerequisites: [],
    learningObjectives: [
      "극한의 정의를 말하고 f(x)=x^2의 도함수를 정의에서 유도한다.",
      "중앙차분 공식으로 수치 미분을 Python으로 구현한다.",
      "다변수 함수의 편미분과 그래디언트를 계산한다.",
      "체인룰을 로봇팔 Jacobian의 원소 계산에 연결한다.",
    ],
    theory: {
      definition:
        "미분은 함수의 순간 변화율이다. h가 0에 가까워질 때 [f(x+h)-f(x)]/h의 극한값이 해당 점에서의 기울기다.",
      whyItMatters:
        "Jacobian, PID의 D항, 라그랑지 동역학, 역전파, 칼만필터 선형화는 모두 미분과 편미분에 기대고 있다.",
      intuition:
        "자동차 속도계는 위치 함수의 순간 변화율을 보여준다. 로봇팔에서는 관절각의 변화가 말단 위치를 얼마나 움직이는지가 같은 아이디어다.",
      equations: [
        makeEquation(
          "도함수 정의",
          "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}",
          [
            ["f'(x)", "점 x에서의 순간 변화율"],
            ["h", "0에 가까워지는 작은 변화량"],
          ],
          "h를 작게 만들면 할선이 접선에 가까워진다.",
        ),
        makeEquation(
          "중앙차분",
          "f'(x) \\approx \\frac{f(x+h)-f(x-h)}{2h}",
          [["h", "컴퓨터에서 쓰는 작은 차분 간격"]],
          "앞뒤 값을 모두 사용해 전진차분보다 보통 더 안정적인 근사를 얻는다.",
        ),
        makeEquation(
          "편미분",
          "\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h,y)-f(x-h,y)}{2h}",
          [["∂f/∂x", "y를 고정했을 때 x 방향 변화율"]],
          "다변수 함수에서 한 변수만 움직였을 때의 변화율이다.",
        ),
        makeEquation(
          "체인룰",
          "\\frac{d}{dx}f(g(x)) = f'(g(x)) \\cdot g'(x)",
          [
            ["g(x)", "안쪽 함수"],
            ["f(·)", "바깥쪽 함수"],
          ],
          "중첩된 함수의 변화율은 바깥 변화율과 안쪽 변화율의 곱이다.",
        ),
      ],
      derivation: [
        step("극한 확인", "f(x)=x^2에서 x가 2에 가까워지면 f(x)는 4에 가까워진다."),
        step("도함수 유도", "정의에 f(x)=x^2를 넣는다.", "[(x+h)^2-x^2]/h=2x+h \\to 2x"),
        step("편미분 적용", "f(x,y)=x^2+2y^2이면 ∂f/∂x=2x, ∂f/∂y=4y이다."),
        step("체인룰 적용", "d/dq [l sin(q)] = l cos(q)로 로봇팔 y좌표 Jacobian 원소가 나온다."),
      ],
      handCalculation: {
        problem: "f(x,y)=x^3+xy^2+y에서 점 (1,2)의 그래디언트를 구하라.",
        given: { f: "x^3 + xy^2 + y", point: "(1, 2)" },
        steps: [
          "∂f/∂x = 3x^2 + y^2, 점 (1,2)에서는 3+4=7",
          "∂f/∂y = 2xy + 1, 점 (1,2)에서는 4+1=5",
          "따라서 ∇f(1,2)=[7,5]",
        ],
        answer: "∇f = [7, 5]",
      },
      robotApplication:
        "2-link 로봇팔에서 y=l1 sin(q1)+l2 sin(q1+q2)를 q1로 편미분하면 ∂y/∂q1=l1 cos(q1)+l2 cos(q1+q2)이며, 이것이 Jacobian의 한 원소다.",
    },
    codeLabs: [numericalDiffLab, gradientLab],
    visualizations: [
      makeVisualization(
        "vis_derivative_tangent",
        "수치 미분과 접선",
        "calculus_derivative_chain_rule",
        "f'(x) ≈ (f(x+h)-f(x-h))/(2h)",
        numericalDiffLab.id,
        [
          { name: "x", symbol: "x", min: -3, max: 3, default: 1.5, description: "미분할 점" },
          { name: "h", symbol: "h", min: 0.001, max: 1, default: 0.1, description: "차분 간격" },
        ],
        "h를 줄일수록 수치 미분이 해석 미분에 수렴한다.",
        "h가 너무 작으면 부동소수점 취소 오류로 오차가 다시 커진다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "calculus_deriv",
      conceptTag: "calculus_derivative_chain_rule",
      reviewSession: "극한, 미분, 편미분, 체인룰",
      conceptQuestion: "미분이 로봇공학에서 왜 필요한가?",
      conceptAnswer:
        "관절 각도 변화가 end-effector 위치에 미치는 영향, 즉 Jacobian을 구하기 위해 편미분이 필요하다.",
      calculationQuestion: "f(x)=x^3에서 x=2의 도함수 값은?",
      calculationAnswer: "f'(x)=3x^2이므로 f'(2)=12이다.",
      codeQuestion: "중앙차분 공식을 Python 한 줄로 쓰면?",
      codeAnswer: "return (f(x + h) - f(x - h)) / (2 * h)",
      debugQuestion: "수치 미분 오차가 h를 줄여도 다시 커지는 이유는?",
      debugAnswer: "h가 너무 작으면 f(x+h)와 f(x-h)의 차가 부동소수점 정밀도에 묻히는 취소 오류가 생긴다.",
      visualQuestion: "h를 1에서 0.001로 줄이면 접선 근사는 어떻게 변하는가?",
      visualAnswer: "할선이 실제 접선에 가까워지며 기울기가 해석 미분 값에 수렴한다.",
      robotQuestion: "q1을 0.01 rad 움직였더니 x가 0.009 m 바뀌었다. ∂x/∂q1의 수치 근사는?",
      robotAnswer: "Δx/Δq1=0.009/0.01=0.9 m/rad이다.",
      designQuestion: "실시간 로봇 제어에서 수치 미분보다 해석적 Jacobian이 유리한 이유는?",
      designAnswer:
        "수치 미분은 관절마다 여러 번 함수 호출이 필요하고 오차가 h에 민감하다. 해석적 Jacobian은 빠르고 반복 가능한 값을 준다.",
    }),
    wrongAnswerTags: makeWrongTags("calculus_derivative_chain_rule", "미분·편미분·체인룰 오류", [
      "calculus_derivative_chain_rule",
    ]),
    nextSessions: ["calculus_gradient_descent", "robot_math_jacobian_velocity_kinematics"],
  }),
  session({
    id: "calculus_gradient_descent",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "그래디언트와 경사하강법",
    level: "beginner",
    difficulty: "easy",
    estimatedMinutes: 60,
    prerequisites: ["calculus_derivative_chain_rule"],
    learningObjectives: [
      "그래디언트가 가장 빠르게 증가하는 방향임을 설명한다.",
      "경사하강법 θ ← θ - α∇f(θ)를 손으로 계산한다.",
      "Python으로 f(x,y)=x^2+2y^2의 최솟값을 찾는다.",
      "학습률이 너무 작거나 클 때의 실패 양상을 해석한다.",
    ],
    theory: {
      definition:
        "그래디언트 ∇f는 다변수 함수가 가장 빠르게 증가하는 방향의 벡터다. 경사하강법은 그 반대 방향으로 이동해 최솟값을 찾는다.",
      whyItMatters:
        "신경망 학습, Behavior Cloning, 최소제곱, trajectory optimization, gain tuning은 모두 손실함수를 줄이는 최적화 문제다.",
      intuition:
        "언덕에서 가장 가파른 오르막 방향이 gradient라면, 손실을 줄이기 위해서는 그 반대 방향으로 한 걸음씩 내려가면 된다.",
      equations: [
        makeEquation(
          "그래디언트",
          "\\nabla f = \\left[\\frac{\\partial f}{\\partial \\theta_1}, \\frac{\\partial f}{\\partial \\theta_2}, \\ldots\\right]",
          [["∇f", "각 변수 방향 편미분 벡터"]],
          "함수값이 가장 빠르게 커지는 방향이다.",
        ),
        makeEquation(
          "경사하강법 업데이트",
          "\\theta \\leftarrow \\theta - \\alpha \\nabla f(\\theta)",
          [
            ["θ", "현재 파라미터"],
            ["α", "학습률"],
            ["∇f(θ)", "현재 위치의 그래디언트"],
          ],
          "그래디언트의 반대 방향으로 α만큼 이동한다.",
        ),
      ],
      derivation: [
        step("목적함수", "f(x,y)=x^2+2y^2의 최솟값은 (0,0)이다."),
        step("그래디언트", "∇f=[2x,4y]이다."),
        step("1회 업데이트", "α=0.1, 시작점 (3,2)이면 (2.4,1.2)가 된다."),
        step("반복", "적절한 α에서는 충분히 반복하면 (0,0)에 수렴한다."),
      ],
      handCalculation: {
        problem: "f(x,y)=x^2+2y^2, 점 (3,2), α=0.1로 1번 업데이트하면?",
        given: { f: "x^2+2y^2", point: "(3,2)", alpha: 0.1 },
        steps: ["∇f=[2x,4y]=[6,8]", "x_new=3-0.1*6=2.4", "y_new=2-0.1*8=1.2"],
        answer: "(2.4, 1.2)",
      },
      robotApplication:
        "Behavior Cloning에서 loss=mean(||πθ(o)-a||^2)를 최소화할 때 PyTorch의 loss.backward()가 gradient를 계산하고 optimizer.step()이 경사하강 업데이트를 수행한다.",
    },
    codeLabs: [gradientLab],
    visualizations: [
      makeVisualization(
        "vis_gradient_descent",
        "경사하강법 등고선 시각화",
        "calculus_gradient_descent",
        "θ ← θ - α∇f(θ)",
        gradientLab.id,
        [
          { name: "lr", symbol: "α", min: 0.01, max: 0.9, default: 0.1, description: "학습률" },
          { name: "steps", symbol: "N", min: 5, max: 200, default: 50, description: "반복 횟수" },
        ],
        "α=0.1이면 등고선을 따라 중심으로 수렴한다.",
        "α가 너무 크면 최솟값을 지나쳐 진동하거나 발산한다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "calculus_gd",
      conceptTag: "calculus_gradient_descent",
      reviewSession: "그래디언트와 경사하강법",
      conceptQuestion: "그래디언트의 반대 방향으로 이동하는 이유는?",
      conceptAnswer: "그래디언트는 함수값이 가장 빠르게 커지는 방향이므로 반대로 가면 함수값이 줄어든다.",
      calculationQuestion: "f(x,y)=x^2+y^2, 점 (2,1), α=0.2로 1회 업데이트하면?",
      calculationAnswer: "∇f=[4,2]이므로 결과는 (1.2,0.6)이다.",
      codeQuestion: "경사하강법 Python 업데이트 코드는?",
      codeAnswer: "x = x - lr * gx",
      debugQuestion: "학습률 0.8에서 값이 발산하는 주된 원인은?",
      debugAnswer: "학습률이 너무 커서 최솟값을 건너뛰며 진동하거나 발산한다. lr을 낮춰야 한다.",
      visualQuestion: "lr을 크게 올리면 경로가 어떻게 변하는가?",
      visualAnswer: "중심으로 부드럽게 들어가지 않고 지그재그로 진동하거나 멀어진다.",
      robotQuestion: "BC 학습 loss가 줄지 않을 때 먼저 조절할 하이퍼파라미터는?",
      robotAnswer: "학습률 lr을 먼저 낮춰보고, 발산과 느린 수렴을 구분한다.",
      designQuestion: "실제 policy 학습에서 SGD 대신 Adam을 쓰는 이유는?",
      designAnswer: "Adam은 파라미터별 gradient 스케일에 맞춰 적응적으로 업데이트해 복잡한 네트워크에서 더 안정적으로 수렴한다.",
    }),
    wrongAnswerTags: makeWrongTags("calculus_gradient_descent", "그래디언트·경사하강법 오류", [
      "calculus_derivative_chain_rule",
    ]),
    nextSessions: ["gaussian_mle", "behavior_cloning_physical_ai"],
  }),
];
