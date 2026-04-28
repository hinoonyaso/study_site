import type { CodeLab, Session, VisualizationSpec } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

type Param = VisualizationSpec["parameters"][number];

const param = (name: string, symbol: string, min: number, max: number, defaultValue: number, description: string): Param => ({
  name,
  symbol,
  min,
  max,
  default: defaultValue,
  description,
});

const matrixLab: CodeLab = {
  id: "lab_matrix_multiplication_grid_basics",
  title: "Matrix Multiplication Grid Steps",
  language: "python",
  theoryConnection: "C = A @ B and columns of C are A times columns of B",
  starterCode: `import numpy as np

def multiply_step(A, B):
    # TODO: C=A@B와 각 column이 어떻게 만들어지는지 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    A = np.array([[1.0, 2.0], [0.0, 1.0]])
    B = np.array([[2.0, 0.0], [1.0, 3.0]])
    C, columns = multiply_step(A, B)
    print(np.round(C, 3))
    print([np.round(c, 3).tolist() for c in columns])`,
  solutionCode: `import numpy as np

def multiply_step(A, B):
    C = A @ B
    columns = [A @ B[:, i] for i in range(B.shape[1])]
    return C, columns

if __name__ == "__main__":
    A = np.array([[1.0, 2.0], [0.0, 1.0]])
    B = np.array([[2.0, 0.0], [1.0, 3.0]])
    C, columns = multiply_step(A, B)
    print(np.round(C, 3))
    print([np.round(c, 3).tolist() for c in columns])`,
  testCode: `import numpy as np
from matrix_multiplication_grid_basics import multiply_step

def test_product_matches_numpy():
    A = np.array([[1.0, 2.0], [0.0, 1.0]])
    B = np.array([[2.0, 0.0], [1.0, 3.0]])
    C, _ = multiply_step(A, B)
    assert np.allclose(C, A @ B)

def test_columns_are_transformed_basis():
    A = np.array([[1.0, 2.0], [0.0, 1.0]])
    B = np.eye(2)
    _, columns = multiply_step(A, B)
    assert np.allclose(columns[0], A[:, 0])

def test_shape():
    C, columns = multiply_step(np.eye(3), np.ones((3, 2)))
    assert C.shape == (3, 2)
    assert len(columns) == 2`,
  expectedOutput: "[[4. 6.]\n [1. 3.]]\n[[4.0, 1.0], [6.0, 3.0]]",
  runCommand: "python matrix_multiplication_grid_basics.py && pytest test_matrix_multiplication_grid_basics.py",
  commonBugs: [
    "A @ B와 B @ A의 순서를 바꾸어 frame composition 순서를 뒤집음",
    "행렬곱을 element-wise 곱셈 A * B로 착각함",
    "열벡터가 변환된 basis라는 해석 없이 숫자 표만 계산함",
  ],
  extensionTask: "2D 정사각형 격자 점들을 B로 먼저 움직이고 A로 다시 움직인 결과가 A@B와 일치하는지 그려라.",
};

const pseudoinverseLab: CodeLab = {
  id: "lab_pseudoinverse_rank_deficient_basics",
  title: "Rank-deficient Pseudoinverse",
  language: "python",
  theoryConnection: "A^+ = V Sigma^+ U^T and x = A^+ b",
  starterCode: `import numpy as np

def solve_pinv(A, b, rcond=1e-8):
    # TODO: SVD 기반 pseudoinverse로 minimum-norm 해를 구하라.
    raise NotImplementedError

if __name__ == "__main__":
    A = np.array([[1.0, 1.0], [2.0, 2.0]])
    b = np.array([2.0, 4.0])
    x, residual = solve_pinv(A, b)
    print(np.round(x, 3), round(float(residual), 6))`,
  solutionCode: `import numpy as np

def solve_pinv(A, b, rcond=1e-8):
    U, s, Vt = np.linalg.svd(A, full_matrices=False)
    s_inv = np.array([1.0 / value if value > rcond else 0.0 for value in s])
    A_pinv = Vt.T @ np.diag(s_inv) @ U.T
    x = A_pinv @ b
    residual = np.linalg.norm(A @ x - b)
    return x, residual

if __name__ == "__main__":
    A = np.array([[1.0, 1.0], [2.0, 2.0]])
    b = np.array([2.0, 4.0])
    x, residual = solve_pinv(A, b)
    print(np.round(x, 3), round(float(residual), 6))`,
  testCode: `import numpy as np
from pseudoinverse_rank_deficient_basics import solve_pinv

def test_rank_deficient_min_norm_solution():
    A = np.array([[1.0, 1.0], [2.0, 2.0]])
    b = np.array([2.0, 4.0])
    x, residual = solve_pinv(A, b)
    assert residual < 1e-8
    assert np.allclose(x, [1.0, 1.0])

def test_overdetermined_residual_small():
    A = np.array([[1.0], [2.0], [3.0]])
    b = np.array([1.0, 2.0, 3.0])
    x, residual = solve_pinv(A, b)
    assert residual < 1e-8
    assert abs(x[0] - 1.0) < 1e-8

def test_inconsistent_system_returns_least_squares():
    A = np.array([[1.0], [1.0]])
    b = np.array([1.0, 3.0])
    x, residual = solve_pinv(A, b)
    assert abs(x[0] - 2.0) < 1e-8
    assert residual > 0`,
  expectedOutput: "[1. 1.] 0.0",
  runCommand: "python pseudoinverse_rank_deficient_basics.py && pytest test_pseudoinverse_rank_deficient_basics.py",
  commonBugs: [
    "rank-deficient A에 np.linalg.inv(A.T @ A)를 직접 적용함",
    "작은 singular value를 threshold 없이 뒤집어 노이즈를 폭증시킴",
    "무한히 많은 해 중 minimum-norm 해라는 의미를 놓침",
  ],
  extensionTask: "null-space 벡터를 x에 더해도 Ax가 유지되는지 확인하고 norm이 어떻게 바뀌는지 비교하라.",
};

const gradientLab: CodeLab = {
  id: "lab_gradient_tangent_loss_landscape",
  title: "Partial Derivative and Gradient Descent",
  language: "python",
  theoryConnection: "grad f=[df/dx, df/dy] and theta_next=theta-alpha*grad",
  starterCode: `import numpy as np

def loss_grad(theta):
    # f=(x-1)^2+0.5*(y+0.5)^2
    # TODO: loss와 gradient를 반환하라.
    raise NotImplementedError

def step(theta, alpha):
    raise NotImplementedError

if __name__ == "__main__":
    theta = np.array([-1.0, 1.0])
    for _ in range(3):
        theta, loss = step(theta, 0.2)
    print(np.round(theta, 3), round(float(loss), 4))`,
  solutionCode: `import numpy as np

def loss_grad(theta):
    x, y = theta
    loss = (x - 1.0) ** 2 + 0.5 * (y + 0.5) ** 2
    grad = np.array([2.0 * (x - 1.0), y + 0.5])
    return loss, grad

def step(theta, alpha):
    loss, grad = loss_grad(theta)
    return theta - alpha * grad, loss

if __name__ == "__main__":
    theta = np.array([-1.0, 1.0])
    for _ in range(3):
        theta, loss = step(theta, 0.2)
    print(np.round(theta, 3), round(float(loss), 4))`,
  testCode: `import numpy as np
from gradient_tangent_loss_landscape import loss_grad, step

def test_gradient_at_optimum_zero():
    loss, grad = loss_grad(np.array([1.0, -0.5]))
    assert abs(loss) < 1e-12
    assert np.allclose(grad, [0.0, 0.0])

def test_one_step_decreases_loss():
    theta = np.array([-1.0, 1.0])
    loss0, _ = loss_grad(theta)
    theta1, _ = step(theta, 0.1)
    loss1, _ = loss_grad(theta1)
    assert loss1 < loss0

def test_large_alpha_can_overshoot():
    theta = np.array([-1.0, 1.0])
    theta1, _ = step(theta, 2.0)
    assert np.linalg.norm(theta1 - np.array([1.0, -0.5])) > np.linalg.norm(theta - np.array([1.0, -0.5]))`,
  expectedOutput: "[ 0.568  0.268] 1.045",
  runCommand: "python gradient_tangent_loss_landscape.py && pytest test_gradient_tangent_loss_landscape.py",
  commonBugs: [
    "partial derivative를 scalar slope 하나로만 생각해 gradient vector를 놓침",
    "gradient 방향으로 더해 loss를 증가시킴",
    "learning rate를 키우면 항상 빠르다고 생각해 overshoot를 놓침",
  ],
  extensionTask: "alpha를 0.05, 0.2, 0.8로 바꾸고 loss 감소 곡선을 표로 비교하라.",
};

const bayesLab: CodeLab = {
  id: "lab_gaussian_bayes_update_distribution",
  title: "Gaussian Bayes Update",
  language: "python",
  theoryConnection: "posterior precision = prior precision + measurement precision",
  starterCode: `def gaussian_bayes(prior_mu, prior_var, z, meas_var):
    # TODO: 1D Gaussian prior와 measurement를 fusion하라.
    raise NotImplementedError

if __name__ == "__main__":
    print(tuple(round(v, 3) for v in gaussian_bayes(0.0, 4.0, 3.0, 1.0)))`,
  solutionCode: `def gaussian_bayes(prior_mu, prior_var, z, meas_var):
    prior_precision = 1.0 / prior_var
    meas_precision = 1.0 / meas_var
    post_var = 1.0 / (prior_precision + meas_precision)
    post_mu = post_var * (prior_precision * prior_mu + meas_precision * z)
    return post_mu, post_var

if __name__ == "__main__":
    print(tuple(round(v, 3) for v in gaussian_bayes(0.0, 4.0, 3.0, 1.0)))`,
  testCode: `from gaussian_bayes_update_distribution import gaussian_bayes

def test_measurement_dominates_when_precise():
    mu, var = gaussian_bayes(0.0, 100.0, 5.0, 1.0)
    assert abs(mu - 5.0) < 0.1
    assert var < 1.0

def test_prior_dominates_when_measurement_noisy():
    mu, _ = gaussian_bayes(2.0, 1.0, 10.0, 100.0)
    assert abs(mu - 2.0) < 0.2

def test_posterior_variance_smaller():
    _, var = gaussian_bayes(0.0, 4.0, 3.0, 1.0)
    assert var < 1.0`,
  expectedOutput: "(2.4, 0.8)",
  runCommand: "python gaussian_bayes_update_distribution.py && pytest test_gaussian_bayes_update_distribution.py",
  commonBugs: [
    "variance를 weight로 직접 써서 noisy measurement를 더 믿음",
    "posterior variance가 prior보다 작아져야 한다는 sanity check를 빼먹음",
    "확률밀도 정규화 없이 curve 높이만 비교함",
  ],
  extensionTask: "prior variance와 measurement variance를 sweep하며 Kalman gain K=prior/(prior+R)을 출력하라.",
};

const odeLab: CodeLab = {
  id: "lab_finite_difference_ode_solver_basics",
  title: "Finite Difference and ODE Solver Basics",
  language: "python",
  theoryConnection: "dx/dt≈(x(t+h)-x(t))/h and Euler/RK4 integrate xdot=f(x,t)",
  starterCode: `import math

def finite_difference(f, x, h):
    raise NotImplementedError

def euler_decay(x0, dt, steps):
    # xdot=-x
    raise NotImplementedError

if __name__ == "__main__":
    deriv = finite_difference(lambda x: x*x, 2.0, 1e-4)
    x = euler_decay(1.0, 0.1, 10)
    print(round(deriv, 3), round(x, 3), round(math.exp(-1), 3))`,
  solutionCode: `import math

def finite_difference(f, x, h):
    return (f(x + h) - f(x - h)) / (2.0 * h)

def euler_decay(x0, dt, steps):
    x = float(x0)
    for _ in range(steps):
        x += dt * (-x)
    return x

if __name__ == "__main__":
    deriv = finite_difference(lambda x: x*x, 2.0, 1e-4)
    x = euler_decay(1.0, 0.1, 10)
    print(round(deriv, 3), round(x, 3), round(math.exp(-1), 3))`,
  testCode: `import math
from finite_difference_ode_solver_basics import finite_difference, euler_decay

def test_central_difference_quadratic():
    assert abs(finite_difference(lambda x: x*x, 2.0, 1e-5) - 4.0) < 1e-4

def test_euler_decay_close_for_small_dt():
    assert abs(euler_decay(1.0, 0.01, 100) - math.exp(-1)) < 0.01

def test_large_dt_less_accurate():
    err_small = abs(euler_decay(1.0, 0.01, 100) - math.exp(-1))
    err_large = abs(euler_decay(1.0, 0.5, 2) - math.exp(-1))
    assert err_large > err_small`,
  expectedOutput: "4.0 0.349 0.368",
  runCommand: "python finite_difference_ode_solver_basics.py && pytest test_finite_difference_ode_solver_basics.py",
  commonBugs: [
    "forward difference만 써서 truncation error를 키움",
    "dt가 커도 Euler가 항상 정확하다고 생각함",
    "ODE 상태 업데이트에서 이전 x가 아니라 이미 갱신된 값을 여러 번 섞음",
  ],
  extensionTask: "Euler와 RK4를 같은 dt에서 비교하고 dt를 절반으로 줄였을 때 error order를 계산하라.",
};

export const foundationGapSessions: Session[] = [
  makeAdvancedSession({
    id: "matrix_multiplication_grid_basics",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "행렬 곱셈 입문: 격자 변환과 Frame Composition",
    level: "beginner",
    prerequisites: ["vector_matrix_inverse_cross_product_basics"],
    objectives: ["행렬 곱셈을 열벡터 변환으로 계산한다.", "A@B와 B@A의 순서 차이를 frame composition으로 설명한다.", "격자 변형으로 det와 inverse 가능성을 해석한다."],
    definition: "행렬 곱셈 A@B는 B가 만든 basis 또는 점들을 A로 다시 변환하는 연산이며, 로봇에서는 frame transform을 순서대로 합성하는 기본 규칙이다.",
    whyItMatters: "FK, camera extrinsic, covariance propagation은 모두 행렬곱 순서가 틀리면 숫자는 나와도 frame이 완전히 달라진다.",
    intuition: "B가 종이를 먼저 기울이고, A가 그 종이를 다시 늘린다. 순서를 바꾸면 손동작 순서가 달라져 최종 격자도 달라진다.",
    equations: [
      { label: "Matrix product", expression: "C=AB", terms: [["A", "두 번째로 적용되는 변환"], ["B", "첫 번째 변환"]], explanation: "오른쪽 행렬이 벡터에 먼저 작용한다." },
      { label: "Column view", expression: "C_{:,j}=A B_{:,j}", terms: [["B_{:,j}", "B의 j번째 열"]], explanation: "C의 각 열은 B의 열을 A로 변환한 결과다." },
      { label: "Area scale", expression: "\\det(AB)=\\det(A)\\det(B)", terms: [["det", "면적 배율"]], explanation: "격자 면적 배율은 변환 배율의 곱이다." },
    ],
    derivation: [["벡터 먼저", "ABx에서 Bx가 먼저 계산된다.", "ABx=A(Bx)"], ["basis 해석", "B의 각 열은 B가 보낸 basis다."], ["A 적용", "A가 그 basis들을 다시 변환해 C의 열을 만든다."], ["비가환성", "일반적으로 AB와 BA는 순서가 달라 같지 않다."]],
    handCalculation: { problem: "A=[[1,2],[0,1]], B=[[2,0],[1,3]]일 때 AB의 첫 번째 열은?", given: { A: "[[1,2],[0,1]]", B_col1: "[2,1]" }, steps: ["B의 첫 열은 [2,1]", "A[2,1]=[1*2+2*1, 0*2+1*1]=[4,1]"], answer: "AB의 첫 번째 열은 [4,1]이다." },
    robotApplication: "T_world_camera @ T_camera_object와 T_camera_object @ T_world_camera는 의미가 다르다. 로봇 perception pipeline에서 이 순서 오류가 object pose를 뒤집는다.",
    lab: matrixLab,
    visualization: { id: "vis_matrix_multiplication_grid_steps", title: "Matrix Multiplication Step-by-step Grid", equation: "C=AB", parameters: [param("scale_x", "s_x", 0.2, 3, 1.4, "A의 x scale"), param("shear_xy", "k", -1.5, 1.5, 0.4, "A의 shear"), param("basis_rotation", "\\theta_B", -90, 90, 25, "B basis 회전")], normalCase: "B 격자를 A가 다시 변환한 결과와 AB가 일치한다.", failureCase: "A와 B 순서를 바꾸면 frame composition 결과가 달라진다." },
    quiz: {
      id: "matrix_grid",
      conceptQuestion: "ABx에서 A와 B 중 어떤 변환이 먼저 적용되는가?",
      conceptAnswer: "오른쪽의 B가 x에 먼저 적용되고, 그 결과에 A가 적용된다.",
      calculationQuestion: "A=[[1,2],[0,1]], b=[2,1]이면 Ab는?",
      calculationAnswer: "[4,1]이다.",
      codeQuestion: "NumPy 행렬곱 한 줄은?",
      codeAnswer: "C = A @ B",
      debugQuestion: "FK 결과가 자세마다 frame이 뒤집히면 가장 먼저 무엇을 확인하는가?",
      debugAnswer: "T 행렬 곱셈 순서와 parent/child frame convention이 맞는지 확인한다.",
      visualQuestion: "격자 시각화에서 AB와 BA가 다르게 보이는 이유는?",
      visualAnswer: "행렬곱은 일반적으로 교환법칙이 성립하지 않아 변환 순서가 결과를 바꾼다.",
      robotQuestion: "camera object pose를 world frame으로 보낼 때 어떤 곱셈 구조를 쓰는가?",
      robotAnswer: "T_world_object = T_world_camera @ T_camera_object처럼 parent에서 child로 이어지는 순서로 곱한다.",
      designQuestion: "초보자용 행렬곱 학습 화면에 반드시 넣을 sanity check는?",
      designAnswer: "열벡터별 계산, det 면적 배율, AB와 BA 비교, inverse 복원 오차를 함께 보여준다.",
    },
    wrongTagLabel: "행렬곱/frame composition 순서 오류",
    nextSessions: ["robot_math_2d_rotation_matrix", "dh_craig_spong_convention_guard"],
  }),
  makeAdvancedSession({
    id: "pseudoinverse_rank_deficient_basics",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Pseudoinverse 입문: Rank-deficient 행렬과 무한해",
    level: "beginner",
    prerequisites: ["matrix_multiplication_grid_basics", "svd_condition_number"],
    objectives: ["rank-deficient 행렬에서 inverse가 왜 없는지 설명한다.", "SVD pseudoinverse로 minimum-norm 해를 구한다.", "null space 방향이 해를 무한히 만든다는 것을 확인한다."],
    definition: "Pseudoinverse는 정방/가역이 아닌 행렬에서도 least-squares 또는 minimum-norm 의미의 해를 주는 일반화된 역행렬이다.",
    whyItMatters: "Jacobian IK, calibration, sensor fitting은 rank가 부족하거나 관측이 중복될 수 있어 일반 inverse만으로는 실전 문제를 풀 수 없다.",
    intuition: "접힌 격자는 정확히 펼칠 수 없지만, 접힌 방향을 포기하고 가장 짧고 일관된 해를 고를 수 있다.",
    equations: [
      { label: "SVD pseudoinverse", expression: "A^+=V\\Sigma^+U^T", terms: [["\\Sigma^+", "0이 아닌 singular value만 역수"]], explanation: "작은 singular value를 threshold로 처리한다." },
      { label: "Least-squares solution", expression: "x^*=A^+b", terms: [["x^*", "minimum-norm/least-squares 해"]], explanation: "일관된 시스템이면 Ax=b를 만족하는 가장 짧은 해다." },
      { label: "Null-space family", expression: "x=x^*+(I-A^+A)z", terms: [["z", "임의 벡터"]], explanation: "rank-deficient이면 같은 Ax를 만드는 해가 무한히 많다." },
    ],
    derivation: [["SVD 분해", "A를 U Sigma V^T로 나눈다."], ["0 방향 제거", "sigma=0인 방향은 역수를 만들지 않는다."], ["minimum norm", "남은 singular 방향에서만 b를 복원한다."], ["null space", "A가 볼 수 없는 방향은 Ax를 바꾸지 않는다."]],
    handCalculation: { problem: "A=[[1,1],[2,2]], b=[2,4]이면 minimum-norm 해는?", given: { A: "rank 1", b: "[2,4]" }, steps: ["방정식은 x1+x2=2 하나와 같다.", "해는 [2-t,t]로 무한하다.", "norm이 최소인 해는 x1=x2=1이다."], answer: "[1,1]" },
    robotApplication: "redundant arm에서 end-effector task는 유지하면서 elbow posture를 바꾸는 null-space motion은 pseudoinverse와 null-space projector로 계산한다.",
    lab: pseudoinverseLab,
    visualization: { id: "vis_pseudoinverse_rank_deficient_plane", title: "Pseudoinverse Minimum-norm Solution", equation: "x=A^+b", parameters: [param("sigma_min", "\\sigma_{min}", 0, 1, 0.08, "작은 singular value"), param("rcond", "\\epsilon", 0.0001, 0.2, 0.02, "singular value cutoff"), param("null_vector_gain", "z", -3, 3, 0, "null-space 해 이동")], normalCase: "small singular value를 cutoff하고 minimum-norm 해와 null-space family를 구분한다.", failureCase: "작은 singular value를 무조건 뒤집으면 노이즈와 joint update가 폭증한다." },
    quiz: {
      id: "pinv_basic",
      conceptQuestion: "rank-deficient 행렬에서 일반 inverse가 없는 이유는?",
      conceptAnswer: "서로 다른 입력이 같은 출력으로 접혀 원래 입력을 유일하게 복원할 수 없기 때문이다.",
      calculationQuestion: "x1+x2=2의 minimum-norm 해는?",
      calculationAnswer: "대칭상 x1=x2=1이므로 [1,1]이다.",
      codeQuestion: "NumPy에서 pseudoinverse를 쓰는 한 줄은?",
      codeAnswer: "x = np.linalg.pinv(A) @ b",
      debugQuestion: "pseudoinverse 결과가 너무 큰 값이면 무엇을 확인하는가?",
      debugAnswer: "sigma_min, condition number, rcond threshold가 작은 singular value를 과도하게 뒤집는지 확인한다.",
      visualQuestion: "null_vector_gain을 바꿔도 Ax가 그대로이면 무엇을 의미하는가?",
      visualAnswer: "그 이동 방향이 A의 null space라 task output을 바꾸지 않는다는 뜻이다.",
      robotQuestion: "redundant arm에서 null-space motion은 어떤 장점이 있는가?",
      robotAnswer: "tool pose를 유지하면서 joint limit 회피나 elbow posture 최적화를 할 수 있다.",
      designQuestion: "IK solver에서 pseudoinverse 안정화를 어떻게 설계하는가?",
      designAnswer: "SVD cutoff, DLS damping, joint velocity limit, null-space secondary objective를 함께 둔다.",
    },
    wrongTagLabel: "pseudoinverse/rank-deficient 해석 오류",
    nextSessions: ["rank_nullity_pseudoinverse_ik", "null_space_redundancy_resolution"],
  }),
  makeAdvancedSession({
    id: "partial_derivative_gradient_tangent_plane",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "편미분·Gradient·접평면: Loss Landscape 읽기",
    level: "beginner",
    prerequisites: ["calculus_derivative_chain_rule", "matrix_multiplication_grid_basics"],
    objectives: ["편미분을 각 축 방향 민감도로 해석한다.", "gradient가 가장 빠르게 증가하는 방향임을 설명한다.", "접평면과 local linearization을 센서 모델 Jacobian에 연결한다."],
    definition: "편미분은 다변수 함수에서 한 변수만 움직였을 때의 변화율이고, gradient는 모든 편미분을 모은 벡터이며, 접평면은 그 지점 주변의 1차 근사다.",
    whyItMatters: "EKF Jacobian, backpropagation, trajectory optimization은 모두 비선형 함수를 현재 지점 근처에서 gradient/Jacobian으로 선형화한다.",
    intuition: "산의 한 지점에서 동서 방향 경사와 남북 방향 경사를 따로 재고, 둘을 합친 화살표가 가장 가파른 오르막 방향이다.",
    equations: [
      { label: "Partial derivative", expression: "\\frac{\\partial f}{\\partial x}=\\lim_{h\\to0}\\frac{f(x+h,y)-f(x,y)}{h}", terms: [["h", "작은 x 변화"]], explanation: "y를 고정한 x 방향 변화율이다." },
      { label: "Gradient", expression: "\\nabla f=[\\partial f/\\partial x,\\partial f/\\partial y]^T", terms: [["\\nabla f", "최대 증가 방향"]], explanation: "모든 축 방향 민감도를 벡터로 묶는다." },
      { label: "Tangent plane", expression: "f(x+\\Delta x)\\approx f(x)+\\nabla f^T\\Delta x", terms: [["\\Delta x", "작은 입력 변화"]], explanation: "비선형 함수를 현재 지점 주변에서 선형화한다." },
    ],
    derivation: [["한 축 고정", "y를 고정하고 x만 움직이면 x 방향 slope가 된다."], ["두 축 결합", "x/y slope를 벡터로 묶으면 gradient다."], ["Taylor 1차항", "작은 변화에서는 1차항이 지배적이다."], ["Jacobian 확장", "출력이 여러 개면 gradient들이 행렬 Jacobian이 된다."]],
    handCalculation: { problem: "f=(x-1)^2+0.5(y+0.5)^2, (x,y)=(-1,1)에서 gradient는?", given: { x: -1, y: 1 }, steps: ["df/dx=2(x-1)=2(-2)=-4", "df/dy=y+0.5=1.5"], answer: "gradient=[-4,1.5]" },
    robotApplication: "EKF의 H Jacobian은 measurement function을 현재 pose 주변 접평면으로 근사해 Kalman update가 어느 방향 uncertainty를 줄일지 결정한다.",
    lab: gradientLab,
    visualization: { id: "vis_partial_gradient_tangent_plane", title: "Partial Derivative Tangent Plane", equation: "f(x+dx)=f(x)+grad^T dx", parameters: [param("x_position", "x", -3, 3, -1, "현재 x 위치"), param("y_position", "y", -3, 3, 1, "현재 y 위치"), param("step_size", "h", 0.001, 0.5, 0.05, "finite difference step")], normalCase: "gradient 화살표와 접평면이 작은 주변 변화의 방향을 잘 예측한다.", failureCase: "h가 너무 크면 비선형 곡률 때문에 편미분 근사가 틀어진다." },
    quiz: {
      id: "partial_grad",
      conceptQuestion: "gradient가 의미하는 방향은?",
      conceptAnswer: "함수가 가장 빠르게 증가하는 방향이며, gradient의 반대 방향은 국소적으로 감소 방향이다.",
      calculationQuestion: "f=x^2+y^2, (1,-2)에서 gradient는?",
      calculationAnswer: "[2,-4]이다.",
      codeQuestion: "gradient descent update 한 줄은?",
      codeAnswer: "theta = theta - alpha * grad",
      debugQuestion: "loss가 매 step 증가하면 가장 먼저 무엇을 확인하는가?",
      debugAnswer: "gradient 부호를 반대로 적용했거나 learning rate가 너무 큰지 확인한다.",
      visualQuestion: "접평면이 멀리서 틀어지는 이유는?",
      visualAnswer: "접평면은 현재 지점 근처의 1차 근사라 곡률이 큰 먼 곳에서는 오차가 커진다.",
      robotQuestion: "EKF에서 measurement Jacobian H는 어떤 역할을 하는가?",
      robotAnswer: "비선형 관측식을 현재 추정치 주변에서 선형화해 innovation을 state correction으로 연결한다.",
      designQuestion: "gradient/Jacobian 학습 화면에 어떤 진단을 넣어야 하는가?",
      designAnswer: "analytic gradient, finite difference gradient, step size, local linearization error를 함께 보여준다.",
    },
    wrongTagLabel: "편미분/gradient/local linearization 혼동",
    nextSessions: ["gradient_descent_loss_landscape", "numerical_jacobian_2link"],
  }),
  makeAdvancedSession({
    id: "gradient_descent_loss_landscape",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Gradient Descent Loss Landscape: Learning Rate와 발산",
    level: "beginner",
    prerequisites: ["partial_derivative_gradient_tangent_plane"],
    objectives: ["loss contour 위에서 gradient descent 경로를 해석한다.", "learning rate가 수렴 속도와 발산에 미치는 영향을 실험한다.", "AI 학습과 로봇 최적화의 공통 update 구조를 연결한다."],
    definition: "Gradient descent는 현재 파라미터에서 loss가 가장 빨리 증가하는 방향의 반대로 이동해 비용을 줄이는 반복 최적화 방법이다.",
    whyItMatters: "딥러닝 backprop, trajectory optimization, calibration 모두 loss landscape를 따라 내려가는 알고리즘이므로 learning rate 감각이 없으면 디버깅이 어렵다.",
    intuition: "안개 낀 산에서 발밑 경사만 보고 가장 가파른 내리막으로 한 걸음씩 내려가는 방식이다.",
    equations: [
      { label: "Update", expression: "\\theta_{k+1}=\\theta_k-\\alpha\\nabla J(\\theta_k)", terms: [["\\alpha", "learning rate"]], explanation: "gradient 반대 방향으로 이동한다." },
      { label: "Quadratic loss", expression: "J=(x-1)^2+0.5(y+0.5)^2", terms: [["x,y", "파라미터"]], explanation: "타원형 contour를 가진 기본 loss landscape다." },
      { label: "Descent condition", expression: "J(\\theta_{k+1})<J(\\theta_k)", terms: [["J", "loss"]], explanation: "적절한 alpha에서만 감소가 보장된다." },
    ],
    derivation: [["Taylor 근사", "J(theta+d)≈J(theta)+grad^T d."], ["감소 방향", "d=-alpha grad이면 1차항은 -alpha||grad||^2가 된다."], ["alpha 조건", "alpha가 너무 크면 2차 곡률항이 커져 overshoot한다."], ["반복", "gradient norm이 작아질 때까지 update를 반복한다."]],
    handCalculation: { problem: "theta=[-1,1], grad=[-4,1.5], alpha=0.2이면 다음 theta는?", given: { theta: "[-1,1]", grad: "[-4,1.5]", alpha: 0.2 }, steps: ["theta_next=theta-alpha*grad", "x=-1-0.2*(-4)=-0.2", "y=1-0.2*1.5=0.7"], answer: "theta_next=[-0.2,0.7]" },
    robotApplication: "calibration loss나 model predictive control cost를 줄일 때 learning rate가 크면 시뮬레이션에서는 빨라 보여도 실제 로봇에서는 큰 파라미터 jump로 안전 문제가 생긴다.",
    lab: gradientLab,
    visualization: { id: "vis_gradient_descent_loss_landscape_path", title: "Gradient Descent Loss Landscape", equation: "theta=theta-alpha grad J", parameters: [param("learning_rate", "\\alpha", 0.01, 1.2, 0.2, "update step size"), param("initial_x", "x_0", -3, 3, -1, "초기 x"), param("initial_y", "y_0", -3, 3, 1, "초기 y")], normalCase: "적절한 learning rate에서 contour 중심으로 loss가 단조 감소한다.", failureCase: "learning rate가 너무 크면 valley를 건너뛰며 oscillation 또는 발산이 생긴다." },
    quiz: {
      id: "gd_landscape",
      conceptQuestion: "gradient descent가 gradient의 반대 방향으로 이동하는 이유는?",
      conceptAnswer: "gradient는 loss가 가장 빨리 증가하는 방향이므로 그 반대가 국소적인 감소 방향이기 때문이다.",
      calculationQuestion: "theta=3, J=theta^2, alpha=0.1이면 다음 theta는?",
      calculationAnswer: "grad=2theta=6, theta_next=3-0.1*6=2.4이다.",
      codeQuestion: "loss 감소 여부를 확인하는 assertion 한 줄은?",
      codeAnswer: "assert loss_next < loss_prev",
      debugQuestion: "loss가 NaN이 되면 무엇을 점검하는가?",
      debugAnswer: "learning rate, gradient exploding, 입력 scale, division/log domain 오류를 확인한다.",
      visualQuestion: "loss contour에서 zig-zag 경로가 생기는 이유는?",
      visualAnswer: "learning rate가 크거나 축별 curvature 차이가 커서 valley를 가로질러 overshoot하기 때문이다.",
      robotQuestion: "로봇 calibration에서 큰 parameter update를 바로 적용하면 왜 위험한가?",
      robotAnswer: "모델이 갑자기 바뀌어 제어 명령과 안전 한계가 예상 밖으로 움직일 수 있다.",
      designQuestion: "학습 실험 로그에 반드시 넣을 항목은?",
      designAnswer: "loss, gradient norm, learning rate, parameter delta, validation metric, 실패 seed를 저장한다.",
    },
    wrongTagLabel: "gradient descent/loss landscape 디버깅 오류",
    nextSessions: ["backprop_chain_rule_numpy", "least_squares"],
  }),
  makeAdvancedSession({
    id: "gaussian_bayes_update_distribution",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Gaussian 분포와 Bayes Update: 센서값을 얼마나 믿을까",
    level: "beginner",
    prerequisites: ["gaussian_mle"],
    objectives: ["1D/2D Gaussian 분포를 평균과 분산으로 해석한다.", "Bayes update에서 precision weighting을 계산한다.", "Kalman filter gain의 직관을 Gaussian fusion으로 연결한다."],
    definition: "Gaussian Bayes update는 prior belief와 measurement likelihood를 각자의 precision에 비례해 섞어 posterior Gaussian을 만드는 과정이다.",
    whyItMatters: "로봇은 noisy GPS, IMU, encoder, LiDAR를 동시에 받기 때문에 어떤 센서를 얼마나 믿을지 확률적으로 결정해야 한다.",
    intuition: "불확실한 지도와 새 측정값을 합칠 때, 더 좁은 종 모양 분포를 더 많이 믿는 weighted average다.",
    equations: [
      { label: "Gaussian", expression: "p(x)=\\frac{1}{\\sqrt{2\\pi\\sigma^2}}e^{-(x-\\mu)^2/(2\\sigma^2)}", terms: [["\\mu", "평균"], ["\\sigma^2", "분산"]], explanation: "평균 주변에 종 모양으로 퍼진다." },
      { label: "Posterior variance", expression: "\\sigma_p^2=(1/\\sigma_0^2+1/R)^{-1}", terms: [["R", "measurement variance"]], explanation: "두 정보의 precision을 더한다." },
      { label: "Posterior mean", expression: "\\mu_p=\\sigma_p^2(\\mu_0/\\sigma_0^2+z/R)", terms: [["z", "measurement"]], explanation: "precision이 큰 쪽에 평균이 가까워진다." },
    ],
    derivation: [["Bayes rule", "posterior는 prior와 likelihood의 곱에 비례한다."], ["log Gaussian", "두 제곱항을 더하면 또 Gaussian 꼴이 된다."], ["precision 합", "분산의 역수 precision이 더해진다."], ["Kalman 연결", "K=P/(P+R)는 measurement를 믿는 비율이다."]],
    handCalculation: { problem: "prior N(0,4), measurement z=3, R=1이면 posterior는?", given: { mu0: 0, P: 4, z: 3, R: 1 }, steps: ["precision=1/4+1=1.25", "var=1/1.25=0.8", "mu=0.8*(0/4+3/1)=2.4"], answer: "posterior N(2.4,0.8)" },
    robotApplication: "GPS가 튀거나 covariance가 커질 때 Kalman filter는 R이 큰 센서를 덜 믿고, R이 작지만 innovation이 큰 센서는 chi-squared gate로 걸러야 한다.",
    lab: bayesLab,
    visualization: { id: "vis_gaussian_bayes_update_curves", title: "Gaussian Prior Likelihood Posterior", equation: "posterior ∝ prior * likelihood", parameters: [param("prior_sigma", "\\sigma_0", 0.2, 5, 2, "prior 표준편차"), param("measurement_sigma", "\\sigma_z", 0.2, 5, 1, "측정 표준편차"), param("measurement_z", "z", -5, 5, 3, "측정값")], normalCase: "posterior가 prior와 measurement 사이에서 더 좁아진다.", failureCase: "variance 대신 sigma나 precision을 혼동하면 noisy measurement를 과하게 믿는다." },
    quiz: {
      id: "gauss_bayes",
      conceptQuestion: "Bayes update에서 variance가 작은 센서를 더 믿는 이유는?",
      conceptAnswer: "variance의 역수인 precision이 커서 posterior mean weighting에서 더 큰 비중을 갖기 때문이다.",
      calculationQuestion: "prior var=4, R=1이면 Kalman gain K=P/(P+R)은?",
      calculationAnswer: "K=4/(4+1)=0.8이다.",
      codeQuestion: "posterior variance 계산 한 줄은?",
      codeAnswer: "post_var = 1.0 / (1.0 / prior_var + 1.0 / meas_var)",
      debugQuestion: "posterior variance가 prior variance보다 커졌다면 무엇을 의심하는가?",
      debugAnswer: "precision 합 또는 variance/standard deviation 단위 처리가 잘못됐는지 확인한다.",
      visualQuestion: "measurement_sigma를 키우면 posterior mean은 어디로 이동하는가?",
      visualAnswer: "measurement를 덜 믿으므로 prior mean 쪽으로 가까워진다.",
      robotQuestion: "GPS covariance가 커졌을 때 EKF update는 어떻게 변해야 하는가?",
      robotAnswer: "Kalman gain이 작아져 GPS measurement가 state correction에 덜 반영되어야 한다.",
      designQuestion: "Gaussian/Bayes 시각화에 outlier gate를 붙인다면 어떤 값을 표시해야 하는가?",
      designAnswer: "innovation, S covariance, Mahalanobis distance, chi-squared threshold를 함께 표시한다.",
    },
    wrongTagLabel: "Gaussian/Bayes/센서 신뢰도 해석 오류",
    nextSessions: ["kalman_filter", "ekf_chi_squared_outlier_rejection"],
  }),
  makeAdvancedSession({
    id: "finite_difference_ode_solver_basics",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "수치해석 입문: Finite Difference와 ODE Solver",
    level: "beginner",
    prerequisites: ["partial_derivative_gradient_tangent_plane"],
    objectives: ["finite difference로 derivative를 근사한다.", "Euler와 RK4 적분의 오차 차이를 설명한다.", "dt 선택이 로봇 시뮬레이션 안정성에 미치는 영향을 확인한다."],
    definition: "Finite difference는 작은 입력 변화로 미분을 근사하고, ODE solver는 xdot=f(x,t)를 시간 step으로 적분해 상태 trajectory를 만드는 수치 방법이다.",
    whyItMatters: "로봇 시뮬레이터, controller discretization, numerical Jacobian, dynamics rollout은 모두 dt와 수치오차에 민감하다.",
    intuition: "곡선의 순간 기울기를 아주 가까운 두 점의 기울기로 보고, 짧은 시간 동안 그 기울기대로 상태를 조금씩 이동시킨다.",
    equations: [
      { label: "Central difference", expression: "f'(x)\\approx\\frac{f(x+h)-f(x-h)}{2h}", terms: [["h", "차분 간격"]], explanation: "forward difference보다 보통 정확하다." },
      { label: "Euler integration", expression: "x_{k+1}=x_k+\\Delta t f(x_k,t_k)", terms: [["\\Delta t", "time step"]], explanation: "현재 slope를 한 step 동안 유지한다고 가정한다." },
      { label: "Stability intuition", expression: "\\Delta t\\lambda \\text{ too large} \\Rightarrow \\text{unstable}", terms: [["\\lambda", "system rate"]], explanation: "step이 크면 실제 곡률을 놓쳐 발산할 수 있다." },
    ],
    derivation: [["Taylor 전개", "f(x+h)=f(x)+h f'(x)+O(h^2)."], ["중앙차분", "f(x+h)-f(x-h)를 빼면 짝수차 오차가 상쇄된다."], ["Euler", "xdot을 현재 값으로 고정해 사각형 면적을 더한다."], ["오차", "dt를 줄이면 정확해지지만 계산량과 deadline 부담이 커진다."]],
    handCalculation: { problem: "xdot=-x, x0=1, dt=0.1에서 Euler 한 step은?", given: { x0: 1, dt: 0.1 }, steps: ["f(x0)=-1", "x1=1+0.1*(-1)=0.9"], answer: "x1=0.9" },
    robotApplication: "contact dynamics나 MPC rollout에서 dt가 너무 크면 simulation은 빠르지만 collision timing과 torque peak를 놓쳐 실제 로봇 전이가 실패한다.",
    lab: odeLab,
    visualization: { id: "vis_finite_difference_ode_error", title: "Finite Difference and Euler ODE Error", equation: "x_{k+1}=x_k+dt f(x_k)", parameters: [param("dt", "\\Delta t", 0.005, 0.5, 0.1, "time step"), param("difference_h", "h", 0.000001, 0.1, 0.001, "finite difference step"), param("decay_rate", "\\lambda", 0.1, 5, 1, "ODE decay rate")], normalCase: "dt와 h가 적절하면 derivative와 trajectory가 analytic solution에 가깝다.", failureCase: "dt가 크면 Euler trajectory가 true solution과 크게 벌어진다." },
    quiz: {
      id: "num_ode",
      conceptQuestion: "finite difference에서 h를 너무 작게 하면 왜 오차가 다시 커질 수 있는가?",
      conceptAnswer: "부동소수점 cancellation 때문에 f(x+h)-f(x-h)의 유효 숫자가 사라질 수 있다.",
      calculationQuestion: "xdot=-2x, x0=1, dt=0.1이면 Euler 한 step 후 x는?",
      calculationAnswer: "x1=1+0.1*(-2)=0.8이다.",
      codeQuestion: "중앙차분 한 줄은?",
      codeAnswer: "df = (f(x + h) - f(x - h)) / (2 * h)",
      debugQuestion: "시뮬레이션이 dt를 키웠을 때 갑자기 폭주하면 무엇을 확인하는가?",
      debugAnswer: "ODE solver 안정성, system time constant, integration method, dt deadline trade-off를 확인한다.",
      visualQuestion: "dt 슬라이더를 키우면 Euler와 analytic curve 차이는 어떻게 되는가?",
      visualAnswer: "대체로 오차가 커지고 빠른 dynamics에서는 안정성까지 나빠진다.",
      robotQuestion: "MPC rollout에서 dt를 너무 크게 잡으면 어떤 실전 문제가 생기는가?",
      robotAnswer: "충돌이나 actuator peak를 step 사이에서 놓쳐 실제 실행 시 safety violation이 생길 수 있다.",
      designQuestion: "수치해석 기초 세션의 최소 실험 로그는?",
      designAnswer: "dt, h, solver 종류, analytic/reference error, runtime, deadline miss 여부를 기록한다.",
    },
    wrongTagLabel: "finite difference/ODE solver 수치오차 오류",
    nextSessions: ["ode_euler_rk4", "numerical_jacobian_2link"],
  }),
];
