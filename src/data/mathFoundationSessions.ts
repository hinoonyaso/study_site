import type { Session } from "../types";
import { ensureCodeLabShape, makeCoreQuizzes, makeEquation, makeVisualization, makeWrongTags, session, step } from "./v2SessionHelpers";

const eigenLab = ensureCodeLabShape({
  id: "lab_eigen_covariance_ellipse",
  title: "Eigenvalue and Covariance Ellipse",
  language: "python",
  theoryConnection: "Sigma v = lambda v, ellipse radius = sqrt(lambda)",
  starterCode: `import numpy as np

def covariance_ellipse(cov):
    # TODO: compute eigenvalues and eigenvectors of cov
    # TODO: sort eigenvalues from large to small
    # TODO: return axes lengths sqrt(lambda) and principal directions
    raise NotImplementedError

if __name__ == "__main__":
    cov = np.array([[4.0, 1.2], [1.2, 1.0]])
    axes, directions = covariance_ellipse(cov)
    print(np.round(axes, 3))
    print(np.round(directions[:, 0], 3))`,
  solutionCode: `import numpy as np
import matplotlib.pyplot as plt

def covariance_ellipse(cov):
    # Symmetric covariance matrices should use eigh for real, stable eigenpairs.
    values, vectors = np.linalg.eigh(cov)
    order = np.argsort(values)[::-1]
    values = values[order]
    vectors = vectors[:, order]
    axes = np.sqrt(np.maximum(values, 0.0))
    return axes, vectors

if __name__ == "__main__":
    cov = np.array([[4.0, 1.2], [1.2, 1.0]])
    axes, directions = covariance_ellipse(cov)
    print(np.round(axes, 3))
    print(np.round(directions[:, 0], 3))

    fig, ax = plt.subplots(figsize=(6, 6))
    origin = np.array([0.0, 0.0])
    colors = ["red", "blue"]
    for i, (axis, vec) in enumerate(zip(axes, directions.T)):
        arrow = vec * axis
        ax.annotate(
            "",
            xy=arrow,
            xytext=origin,
            arrowprops=dict(arrowstyle="->", color=colors[i], lw=2),
        )
        ax.text(arrow[0] * 1.08, arrow[1] * 1.08, f"axis={axis:.2f}", color=colors[i])
    ax.set_xlim(-2.5, 2.5)
    ax.set_ylim(-2.5, 2.5)
    ax.axhline(0, color="k", lw=0.5)
    ax.axvline(0, color="k", lw=0.5)
    ax.set_title("고유벡터 방향 시각화")
    ax.set_aspect("equal")
    ax.grid(True)
    plt.savefig("eigenvectors.png")
    plt.close()
    print("eigenvectors.png 저장 완료")`,
  testCode: `import numpy as np
from eigen_covariance_ellipse import covariance_ellipse

def test_diagonal_covariance():
    axes, directions = covariance_ellipse(np.diag([9.0, 4.0]))
    assert np.allclose(axes, [3.0, 2.0], atol=1e-9)
    assert np.allclose(np.abs(directions), np.eye(2), atol=1e-9)

def test_correlated_covariance():
    cov = np.array([[4.0, 1.2], [1.2, 1.0]])
    axes, directions = covariance_ellipse(cov)
    assert axes[0] > axes[1]
    assert np.allclose(directions.T @ directions, np.eye(2), atol=1e-8)

def test_invalid_negative_variance():
    axes, _ = covariance_ellipse(np.array([[1.0, 0.0], [0.0, -1e-12]]))
    assert np.all(axes >= 0.0)`,
  expectedOutput: "[2.099 0.764]\n[-0.944 -0.329]\neigenvectors.png 저장 완료",
  runCommand: "python eigen_covariance_ellipse.py && pytest test_eigen_covariance_ellipse.py",
  commonBugs: ["np.linalg.eig로 복소수 잡음을 만들기", "고유값 정렬을 하지 않아 장축/단축이 뒤집힘", "sqrt 전에 음수 수치오차를 clamp하지 않음"],
  extensionTask: "상관계수 rho를 -0.9부터 0.9까지 바꾸며 ellipse 방향이 어떻게 회전하는지 비교하라.",
});

const svdLab = ensureCodeLabShape({
  id: "lab_svd_condition_number",
  title: "SVD and Condition Number",
  language: "python",
  theoryConnection: "A = U S V^T, kappa(A)=sigma_max/sigma_min",
  starterCode: `import numpy as np

def condition_number(A):
    # TODO: compute singular values
    # TODO: return sigma_max / sigma_min
    raise NotImplementedError

if __name__ == "__main__":
    A = np.array([[1.0, 0.99], [0.99, 0.98]])
    print(round(condition_number(A), 2))`,
  solutionCode: `import numpy as np

def condition_number(A):
    # SVD separates stretch directions; tiny sigma_min means near rank loss.
    singular_values = np.linalg.svd(A, compute_uv=False)
    sigma_max = singular_values[0]
    sigma_min = singular_values[-1]
    if sigma_min < 1e-12:
        return float("inf")
    return float(sigma_max / sigma_min)

if __name__ == "__main__":
    A = np.array([[1.0, 0.99], [0.99, 0.98]])
    print(round(condition_number(A), 2))`,
  testCode: `import math
import numpy as np
from svd_condition_number import condition_number

def test_identity():
    assert condition_number(np.eye(3)) == 1.0

def test_near_singular():
    assert condition_number(np.array([[1.0, 0.99], [0.99, 0.98]])) > 1000

def test_rank_deficient():
    assert math.isinf(condition_number(np.array([[1.0, 2.0], [2.0, 4.0]])))`,
  expectedOutput: "39205.0",
  runCommand: "python svd_condition_number.py && pytest test_svd_condition_number.py",
  commonBugs: ["eigenvalue와 singular value를 혼동함", "sigma_min=0일 때 0으로 나눔", "큰 condition number를 단순히 큰 행렬값으로 해석함"],
  extensionTask: "Damped least squares의 lambda를 키울 때 작은 singular value gain이 어떻게 제한되는지 출력하라.",
});

const leastSquaresLab = ensureCodeLabShape({
  id: "lab_least_squares_line",
  title: "Least Squares Line Fitting",
  language: "python",
  theoryConnection: "theta = (X^T X)^-1 X^T y",
  starterCode: `import numpy as np

def fit_line(xs, ys):
    # TODO: build design matrix [x, 1]
    # TODO: solve least squares for slope and intercept
    raise NotImplementedError

if __name__ == "__main__":
    m, b = fit_line(np.array([0, 1, 2]), np.array([1, 3, 5]))
    print(round(m, 3), round(b, 3))`,
  solutionCode: `import numpy as np

def fit_line(xs, ys):
    # X maps theta=[m,b] to predictions y_hat=m*x+b.
    X = np.column_stack([xs, np.ones_like(xs)])
    theta, *_ = np.linalg.lstsq(X, ys, rcond=None)
    return float(theta[0]), float(theta[1])

if __name__ == "__main__":
    m, b = fit_line(np.array([0, 1, 2]), np.array([1, 3, 5]))
    print(round(m, 3), round(b, 3))`,
  testCode: `import numpy as np
from least_squares_line import fit_line

def test_exact_line():
    m, b = fit_line(np.array([0, 1, 2]), np.array([1, 3, 5]))
    assert abs(m - 2.0) < 1e-9
    assert abs(b - 1.0) < 1e-9

def test_noisy_line():
    m, b = fit_line(np.array([0, 1, 2, 3]), np.array([1.0, 2.9, 5.2, 6.8]))
    assert abs(m - 1.96) < 0.15
    assert abs(b - 1.03) < 0.2

def test_not_enough_points():
    m, b = fit_line(np.array([2.0]), np.array([5.0]))
    assert abs(2.0 * m + b - 5.0) < 1e-9`,
  expectedOutput: "2.0 1.0",
  runCommand: "python least_squares_line.py && pytest test_least_squares_line.py",
  commonBugs: ["X 행렬에 bias 열을 빼먹음", "정규방정식을 직접 inverse로 풀어 ill-conditioned 입력에서 불안정함", "잔차 제곱합 대신 잔차합을 최소화함"],
  extensionTask: "outlier 한 점을 추가하고 일반 least squares와 Huber loss 결과를 비교하라.",
});

const gaussianMleLab = ensureCodeLabShape({
  id: "lab_gaussian_mle",
  title: "Gaussian MLE",
  language: "python",
  theoryConnection: "mu_hat = mean(x), sigma2_hat = (1/N) sum (x_i-mu)^2",
  starterCode: `import numpy as np

def gaussian_mle(samples):
    # TODO: return MLE mean and variance with denominator N
    raise NotImplementedError

if __name__ == "__main__":
    print(gaussian_mle(np.array([1.0, 2.0, 3.0])))`,
  solutionCode: `import numpy as np

def gaussian_mle(samples):
    samples = np.asarray(samples, dtype=float)
    if samples.size == 0:
        raise ValueError("samples must not be empty")
    mu = float(np.mean(samples))
    sigma2 = float(np.mean((samples - mu) ** 2))
    return mu, sigma2

if __name__ == "__main__":
    print(gaussian_mle(np.array([1.0, 2.0, 3.0])))`,
  testCode: `import numpy as np
import pytest
from gaussian_mle import gaussian_mle

def test_three_samples():
    mu, var = gaussian_mle(np.array([1.0, 2.0, 3.0]))
    assert abs(mu - 2.0) < 1e-9
    assert abs(var - 2.0 / 3.0) < 1e-9

def test_single_sample():
    assert gaussian_mle(np.array([4.0])) == (4.0, 0.0)

def test_empty_failure():
    with pytest.raises(ValueError):
        gaussian_mle(np.array([]))`,
  expectedOutput: "(2.0, 0.6666666666666666)",
  runCommand: "python gaussian_mle.py && pytest test_gaussian_mle.py",
  commonBugs: ["분산에서 N-1을 사용해 MLE와 unbiased estimator를 혼동함", "빈 sample을 처리하지 않음", "표준편차와 분산을 혼동함"],
  extensionTask: "센서 노이즈 sample 수가 커질 때 MLE 분산 추정이 안정되는 과정을 그래프로 그려라.",
});

const lowPassLab = ensureCodeLabShape({
  id: "lab_low_pass_filter_imu",
  title: "Low-pass Filter for IMU Noise",
  language: "python",
  theoryConnection: "y[k] = alpha*x[k] + (1-alpha)*y[k-1]",
  starterCode: `def low_pass_filter(samples, alpha):
    # TODO: validate 0 <= alpha <= 1
    # TODO: initialize y[0] with first sample
    # TODO: append recursive filtered values
    raise NotImplementedError

if __name__ == "__main__":
    print([round(v, 3) for v in low_pass_filter([0, 1, 0, 1], 0.25)])`,
  solutionCode: `def low_pass_filter(samples, alpha):
    if not 0.0 <= alpha <= 1.0:
        raise ValueError("alpha must be in [0, 1]")
    if not samples:
        return []
    filtered = [float(samples[0])]
    for x in samples[1:]:
        y_prev = filtered[-1]
        filtered.append(alpha * float(x) + (1.0 - alpha) * y_prev)
    return filtered

if __name__ == "__main__":
    print([round(v, 3) for v in low_pass_filter([0, 1, 0, 1], 0.25)])`,
  testCode: `import pytest
from low_pass_filter_imu import low_pass_filter

def test_nominal_filter():
    out = low_pass_filter([0, 1, 0, 1], 0.25)
    assert [round(v, 3) for v in out] == [0.0, 0.25, 0.188, 0.391]

def test_alpha_one_passthrough():
    assert low_pass_filter([1, 2, 3], 1.0) == [1.0, 2.0, 3.0]

def test_alpha_range_failure:
    with pytest.raises(ValueError):
        low_pass_filter([1, 2], 1.2)`,
  expectedOutput: "[0.0, 0.25, 0.188, 0.391]",
  runCommand: "python low_pass_filter_imu.py && pytest test_low_pass_filter_imu.py",
  commonBugs: ["이전 출력 y[k-1] 대신 이전 입력 x[k-1]을 사용함", "alpha 범위를 검사하지 않음", "첫 sample을 0으로 초기화해 start-up bias를 만듦"],
  extensionTask: "alpha 값을 0.05, 0.25, 0.8로 바꿔 노이즈 제거와 지연 시간의 trade-off를 비교하라.",
});

export const mathFoundationSessions: Session[] = [
  session({
    id: "eigenvalue_covariance_ellipse",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Eigenvalue and Covariance Ellipse",
    level: "intermediate",
    prerequisites: ["vector_matrix_basics", "probability_variable_gaussian"],
    learningObjectives: [
      "공분산 행렬의 고유값과 고유벡터가 uncertainty ellipse의 축과 방향이 됨을 설명한다.",
      "2x2 covariance에서 ellipse 장축/단축 길이를 손계산한다.",
      "Python으로 eigen decomposition을 구현하고 수치 안정성을 점검한다.",
    ],
    theory: {
      definition: "고유벡터는 행렬 변환 후에도 방향이 유지되는 벡터이고, 고유값은 그 방향의 scale이다. 공분산 ellipse에서는 고유벡터가 불확실성 방향, sqrt(고유값)이 축 길이다.",
      whyItMatters: "EKF localization, SLAM, 센서융합에서 로봇 pose uncertainty를 원이 아니라 방향성 있는 ellipse로 읽어야 안전한 경로계획과 재관측 판단을 할 수 있다.",
      intuition: "불확실성이 고무판이라면 covariance 행렬은 고무판을 어느 방향으로 얼마나 늘릴지 정한다. 가장 많이 늘어난 방향이 첫 번째 고유벡터다.",
      equations: [
        makeEquation("Eigen equation", "A v = \\lambda v", [["A", "선형변환 또는 covariance 행렬"], ["v", "방향이 보존되는 고유벡터"], ["\\lambda", "그 방향의 scale"]], "행렬이 특정 방향을 회전시키지 않고 늘리거나 줄인다."),
        makeEquation("Covariance ellipse", "(x-\\mu)^T \\Sigma^{-1} (x-\\mu)=c^2", [["\\mu", "평균 위치"], ["\\Sigma", "2D covariance"], ["c", "신뢰구간 scale"]], "ellipse의 방향과 길이는 Sigma의 eigenpair로 결정된다."),
      ],
      derivation: [
        step("확률 분포 중심 이동", "평균 mu를 빼서 ellipse를 원점 기준 좌표로 바꾼다.", "z=x-\\mu"),
        step("주축 좌표계 회전", "Sigma=V Lambda V^T로 분해하면 V가 ellipse 좌표축이 된다.", "\\Sigma=V\\Lambda V^T"),
        step("축 길이 계산", "주축 좌표에서는 z_i^2/lambda_i=c^2이므로 반지름은 c sqrt(lambda_i)다.", "r_i=c\\sqrt{\\lambda_i}"),
      ],
      handCalculation: {
        problem: "Sigma=diag(9,4), c=1일 때 covariance ellipse 축 길이와 방향을 구하라.",
        given: { sigma_xx: 9, sigma_yy: 4, sigma_xy: 0, c: 1 },
        steps: ["대각행렬의 고유값은 9와 4다.", "고유벡터는 x축 [1,0], y축 [0,1]이다.", "축 길이는 sqrt(9)=3, sqrt(4)=2다."],
        answer: "장축 3은 x축 방향, 단축 2는 y축 방향이다.",
      },
      robotApplication: "EKF 기반 자율주행에서 covariance ellipse가 좁고 앞쪽으로 길면 로봇은 진행방향 위치 불확실성이 크므로 landmark 재관측 또는 감속 정책을 선택한다.",
    },
    codeLabs: [eigenLab],
    visualizations: [
      makeVisualization(
        "vis_eigen_covariance_ellipse",
        "Eigenvector and Covariance Ellipse",
        "eigen_covariance_ellipse",
        "Sigma v = lambda v",
        eigenLab.id,
        [
          { name: "sigma_x", symbol: "\\sigma_x", min: 0.2, max: 5, default: 2, description: "x 방향 표준편차" },
          { name: "sigma_y", symbol: "\\sigma_y", min: 0.2, max: 5, default: 1, description: "y 방향 표준편차" },
          { name: "rho", symbol: "\\rho", min: -0.95, max: 0.95, default: 0.4, description: "x/y 상관계수" },
        ],
        "rho가 작고 고유값이 양수이면 ellipse가 안정적으로 그려진다.",
        "rho가 ±1에 가까우면 sigma_min이 작아져 ellipse가 납작해지고 수치적으로 불안정해진다.",
      ),
    ],
    quizzes: makeCoreQuizzes({
      id: "eigen_covariance",
      conceptTag: "eigen_covariance_ellipse",
      reviewSession: "Eigenvalue and Covariance Ellipse",
      conceptQuestion: "공분산 ellipse에서 고유벡터와 고유값은 각각 무엇을 의미하는가?",
      conceptAnswer: "고유벡터는 불확실성 ellipse의 주축 방향이고, 고유값의 제곱근은 그 방향의 축 길이다.",
      calculationQuestion: "Sigma=diag(16,1)의 1-sigma ellipse 축 길이를 구하라.",
      calculationAnswer: "sqrt(16)=4, sqrt(1)=1이므로 축 길이는 4와 1이다.",
      codeQuestion: "np.linalg.eigh 결과를 ellipse 장축부터 쓰려면 어떤 처리가 필요한가?",
      codeAnswer: "고유값을 내림차순으로 정렬하고 같은 index로 고유벡터 열도 재정렬한다.",
      debugQuestion: "상관 covariance에서 eigenvector가 복소수로 나왔다면 어떤 구현 선택을 의심해야 하는가?",
      debugAnswer: "대칭 covariance에 np.linalg.eig를 써서 수치 잡음이 생겼을 수 있으므로 np.linalg.eigh를 사용한다.",
      visualQuestion: "rho가 0에서 0.9로 커질 때 ellipse가 기울어지는 이유는?",
      visualAnswer: "비대각 공분산이 커져 x와 y 오차가 함께 변하는 방향이 주축이 되기 때문이다.",
      robotQuestion: "EKF pose ellipse가 복도 진행방향으로 길어졌을 때 로봇 운용 판단은?",
      robotAnswer: "진행방향 위치 불확실성이 크므로 속도를 낮추고 landmark나 loop closure 관측을 우선한다.",
      designQuestion: "오답 태그 기반 복습에서는 이 세션을 어떤 선수 세션과 묶어야 하는가?",
      designAnswer: "Vector and Matrix Basics, Gaussian Distribution, EKF Localization을 함께 추천한다.",
    }),
    wrongAnswerTags: makeWrongTags("eigen_covariance_ellipse", "고유값-공분산 ellipse 해석", ["Vector and Matrix Basics", "EKF Localization"]),
    nextSessions: ["covariance_ellipse_pca", "ekf_localization"],
  }),
  session({
    id: "svd_condition_number",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "SVD and Condition Number",
    level: "intermediate",
    prerequisites: ["rank_null_space", "eigenvalue_covariance_ellipse"],
    learningObjectives: ["SVD의 U, Sigma, V^T를 기하적으로 해석한다.", "condition number가 IK와 least squares 수치 안정성에 미치는 영향을 설명한다.", "Python으로 singular value 기반 condition number를 계산한다."],
    theory: {
      definition: "SVD는 임의 행렬 A를 회전/반사 V^T, 축별 scale Sigma, 회전 U로 나누는 분해다.",
      whyItMatters: "Jacobian inverse, camera calibration, least squares에서 작은 singular value는 작은 센서 노이즈를 큰 제어 명령 오차로 키운다.",
      intuition: "원형 고무도장을 행렬 A에 통과시키면 타원이 된다. 타원의 긴 축과 짧은 축 비율이 condition number다.",
      equations: [
        makeEquation("SVD", "A = U \\Sigma V^T", [["U", "출력 공간의 직교 basis"], ["\\Sigma", "singular value 대각행렬"], ["V", "입력 공간의 직교 basis"]], "행렬이 입력 방향을 어떻게 늘리는지 분리한다."),
        makeEquation("Condition number", "\\kappa(A)=\\sigma_{max}/\\sigma_{min}", [["\\sigma_{max}", "최대 stretch"], ["\\sigma_{min}", "최소 stretch"]], "값이 클수록 역문제가 불안정하다."),
      ],
      derivation: [
        step("입력 basis 선택", "A^T A의 eigenvector를 V로 둔다."),
        step("stretch 계산", "A^T A의 eigenvalue의 제곱근이 singular value다.", "\\sigma_i=\\sqrt{\\lambda_i(A^T A)}"),
        step("출력 basis 계산", "u_i=A v_i / sigma_i로 출력 방향을 얻는다."),
      ],
      handCalculation: {
        problem: "singular values가 [10, 0.1]인 Jacobian의 condition number는?",
        given: { sigma_max: 10, sigma_min: 0.1 },
        steps: ["kappa=sigma_max/sigma_min", "10/0.1=100"],
        answer: "condition number는 100이며 IK update가 노이즈에 민감하다.",
      },
      robotApplication: "Damped Least Squares IK는 작은 singular value 방향 gain을 제한해 singularity 근처에서 관절속도 폭주를 줄인다.",
    },
    codeLabs: [svdLab],
    visualizations: [
      makeVisualization("vis_svd_transformation", "SVD Transformation", "svd_condition_number", "A = U Sigma V^T", svdLab.id, [
        { name: "sigma1", symbol: "\\sigma_1", min: 0.1, max: 5, default: 3, description: "장축 stretch" },
        { name: "sigma2", symbol: "\\sigma_2", min: 0.01, max: 5, default: 0.4, description: "단축 stretch" },
      ], "sigma2가 충분히 크면 inverse gain이 제한적이다.", "sigma2가 0에 가까우면 condition number가 폭증한다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "svd_condition",
      conceptTag: "svd_condition_number",
      reviewSession: "SVD and Condition Number",
      conceptQuestion: "condition number가 큰 행렬의 역문제가 불안정한 이유는?",
      conceptAnswer: "최소 singular value 방향에서 작은 출력 오차가 큰 입력 변화로 증폭되기 때문이다.",
      calculationQuestion: "singular values [5, 0.25]의 condition number는?",
      calculationAnswer: "5 / 0.25 = 20이다.",
      codeQuestion: "rank deficient 행렬에서 condition_number 함수는 무엇을 반환해야 안전한가?",
      codeAnswer: "sigma_min이 tolerance보다 작으면 inf를 반환한다.",
      debugQuestion: "DLS에서 lambda를 0으로 두면 singularity 근처에서 어떤 문제가 생기는가?",
      debugAnswer: "작은 singular value의 역수가 커져 관절속도 명령이 폭주한다.",
      visualQuestion: "SVD 시각화에서 원이 매우 납작한 타원이 되면 무엇을 의미하는가?",
      visualAnswer: "한 방향 singular value가 매우 작아 rank 손실에 가까워졌다는 뜻이다.",
      robotQuestion: "2-link arm이 거의 일직선일 때 SVD로 어떤 지표를 감시해야 하는가?",
      robotAnswer: "Jacobian의 sigma_min 또는 condition number를 감시한다.",
      designQuestion: "IK solver에 condition number 기반 safety를 넣는 설계는?",
      designAnswer: "kappa가 임계값을 넘으면 DLS lambda를 키우고 joint velocity limit을 적용한다.",
    }),
    wrongAnswerTags: makeWrongTags("svd_condition_number", "SVD와 수치 안정성", ["Rank and Null Space", "Damped Least Squares IK"]),
    nextSessions: ["least_squares", "damped_least_squares_ik"],
  }),
  session({
    id: "least_squares",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Least Squares",
    level: "beginner",
    prerequisites: ["matrix_basics", "svd_condition_number"],
    learningObjectives: ["잔차 제곱합 최소화 문제를 행렬식으로 쓴다.", "정규방정식과 np.linalg.lstsq의 차이를 설명한다.", "센서 calibration line fitting을 구현한다."],
    theory: {
      definition: "최소제곱법은 관측 y와 모델 X theta의 잔차 제곱합을 최소로 만드는 theta를 찾는 방법이다.",
      whyItMatters: "카메라 calibration, wheel odometry scale fitting, sensor bias 추정은 대부분 overdetermined system을 least squares로 푼다.",
      intuition: "여러 점을 모두 정확히 지나는 선이 없을 때, 점들과 선 사이의 세로 거리 제곱합이 가장 작은 선을 고른다.",
      equations: [
        makeEquation("Least squares objective", "\\min_\\theta ||X\\theta-y||_2^2", [["X", "design matrix"], ["\\theta", "모델 파라미터"], ["y", "관측값"]], "잔차 벡터의 제곱 norm을 줄인다."),
        makeEquation("Normal equation", "X^T X\\theta=X^T y", [["X^T X", "parameter normal matrix"], ["X^T y", "관측 projection"]], "gradient를 0으로 두면 나온다."),
      ],
      derivation: [
        step("목적함수 정의", "J(theta)=(Xtheta-y)^T(Xtheta-y)로 둔다."),
        step("gradient 계산", "theta에 대해 미분하면 2X^T(Xtheta-y)가 된다."),
        step("정상조건", "gradient=0을 놓고 정리한다.", "X^T X\\theta=X^T y"),
      ],
      handCalculation: {
        problem: "점 (0,1), (1,3), (2,5)에 맞는 y=mx+b를 구하라.",
        given: { xs: "0,1,2", ys: "1,3,5" },
        steps: ["세 점은 y=2x+1에 정확히 놓인다.", "m=2, b=1일 때 모든 잔차가 0이다."],
        answer: "theta=[2,1]^T",
      },
      robotApplication: "모바일 로봇 wheel radius 보정에서 encoder 기반 이동거리와 motion capture 이동거리 사이의 scale을 least squares로 추정한다.",
    },
    codeLabs: [leastSquaresLab],
    visualizations: [
      makeVisualization("vis_least_squares_line", "Least Squares Line Fitting", "least_squares", "min ||X theta-y||^2", leastSquaresLab.id, [
        { name: "outlier_y", symbol: "y_o", min: -5, max: 10, default: 5, description: "outlier 점의 y값" },
        { name: "noise", symbol: "\\epsilon", min: 0, max: 2, default: 0.3, description: "관측 노이즈 크기" },
      ], "잔차가 고르게 작으면 선이 데이터 중심을 지난다.", "outlier가 커지면 제곱 손실 때문에 선이 끌려간다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "least_squares",
      conceptTag: "least_squares",
      reviewSession: "Least Squares",
      conceptQuestion: "least squares에서 최소화하는 값은 무엇인가?",
      conceptAnswer: "관측 y와 예측 Xtheta 사이 잔차의 제곱합이다.",
      calculationQuestion: "y=2x+1 데이터에서 x=3의 예측값은?",
      calculationAnswer: "2*3+1=7이다.",
      codeQuestion: "선형회귀 design matrix에 bias를 넣으려면 어떤 열을 추가해야 하는가?",
      codeAnswer: "모든 원소가 1인 열을 추가한다.",
      debugQuestion: "np.linalg.inv(X.T@X)를 직접 쓰면 어떤 수치 문제가 생기는가?",
      debugAnswer: "X.T@X가 ill-conditioned이면 inverse가 노이즈를 크게 증폭한다.",
      visualQuestion: "outlier 슬라이더를 올렸을 때 fitting line이 크게 바뀌는 이유는?",
      visualAnswer: "잔차를 제곱하기 때문에 큰 오차 한 점의 영향이 커진다.",
      robotQuestion: "wheel odometry calibration에서 least squares 입력 X와 y는 무엇인가?",
      robotAnswer: "X는 encoder 기반 이동량, y는 기준 센서가 측정한 실제 이동량이다.",
      designQuestion: "실험 반복에서 least squares 결과를 신뢰하려면 어떤 로그를 저장해야 하는가?",
      designAnswer: "원본 sample, 잔차 분포, condition number, 추정 파라미터를 함께 저장한다.",
    }),
    wrongAnswerTags: makeWrongTags("least_squares", "최소제곱과 잔차 해석", ["SVD and Condition Number", "Camera Calibration"]),
    nextSessions: ["gradient_descent", "camera_calibration"],
  }),
  session({
    id: "gaussian_mle",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Maximum Likelihood Estimation for Gaussian",
    level: "beginner",
    prerequisites: ["probability_variable_gaussian"],
    learningObjectives: ["Gaussian likelihood를 정의한다.", "평균과 분산 MLE를 유도한다.", "센서 노이즈 추정 코드를 작성한다."],
    theory: {
      definition: "MLE는 관측 데이터가 가장 그럴듯하게 나오도록 분포 파라미터를 선택하는 방법이다.",
      whyItMatters: "IMU, wheel encoder, depth sensor의 noise parameter를 추정해야 Kalman filter의 R/Q를 근거 있게 설정할 수 있다.",
      intuition: "여러 온도계 값을 보고 어떤 평균과 흔들림을 가진 센서가 이 데이터를 만들었을 가능성이 가장 높은지 고르는 과정이다.",
      equations: [
        makeEquation("Gaussian likelihood", "p(x_i|\\mu,\\sigma^2)=\\frac{1}{\\sqrt{2\\pi\\sigma^2}}e^{-(x_i-\\mu)^2/(2\\sigma^2)}", [["\\mu", "평균"], ["\\sigma^2", "분산"], ["x_i", "sample"]], "sample 하나의 확률밀도다."),
        makeEquation("MLE estimates", "\\hat\\mu=\\frac{1}{N}\\sum x_i, \\hat\\sigma^2=\\frac{1}{N}\\sum (x_i-\\hat\\mu)^2", [["N", "sample 수"], ["\\hat\\mu", "MLE 평균"], ["\\hat\\sigma^2", "MLE 분산"]], "Gaussian log likelihood를 최대화한 결과다."),
      ],
      derivation: [
        step("likelihood 곱", "독립 sample likelihood를 모두 곱한다."),
        step("log 변환", "곱을 합으로 바꿔 미분을 쉽게 만든다."),
        step("mu 미분", "log likelihood를 mu로 미분해 0으로 두면 sample mean이 나온다."),
        step("sigma2 미분", "sigma2로 미분해 0으로 두면 N으로 나눈 잔차 제곱 평균이 나온다."),
      ],
      handCalculation: {
        problem: "samples=[1,2,3]의 Gaussian MLE mu와 sigma^2를 구하라.",
        given: { samples: "1,2,3" },
        steps: ["mu=(1+2+3)/3=2", "잔차는 -1,0,1", "분산=(1+0+1)/3=2/3"],
        answer: "mu_hat=2, sigma2_hat=0.6667",
      },
      robotApplication: "정지 상태 IMU gyro sample에서 yaw-rate noise variance를 추정해 EKF measurement noise R에 넣는다.",
    },
    codeLabs: [gaussianMleLab],
    visualizations: [
      makeVisualization("vis_gaussian_mle", "Gaussian MLE Fitting", "gaussian_mle", "mu_hat=mean(x), sigma2_hat=mean((x-mu)^2)", gaussianMleLab.id, [
        { name: "sample_count", symbol: "N", min: 3, max: 200, default: 30, description: "노이즈 sample 개수" },
        { name: "true_sigma", symbol: "\\sigma", min: 0.1, max: 3, default: 0.8, description: "실제 센서 노이즈 표준편차" },
      ], "sample 수가 충분하면 추정 분포가 실제 분포에 가까워진다.", "sample 수가 작으면 variance 추정이 크게 흔들린다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "gaussian_mle",
      conceptTag: "gaussian_mle",
      reviewSession: "MLE for Gaussian",
      conceptQuestion: "Gaussian MLE에서 분산 추정에 N을 쓰는 이유는?",
      conceptAnswer: "likelihood를 최대화하는 분산 파라미터가 1/N 잔차 제곱 평균이기 때문이다.",
      calculationQuestion: "samples=[2,2,4]의 mu_hat은?",
      calculationAnswer: "(2+2+4)/3=8/3이다.",
      codeQuestion: "빈 sample이 들어오면 gaussian_mle은 어떻게 동작해야 하는가?",
      codeAnswer: "파라미터를 정의할 수 없으므로 ValueError를 발생시킨다.",
      debugQuestion: "표준편차를 반환해야 하는데 분산을 반환했다면 어떤 증상이 생기는가?",
      debugAnswer: "Kalman R 설정에서 noise scale이 제곱 단위로 틀어져 필터 gain이 잘못된다.",
      visualQuestion: "N이 커질수록 fitted Gaussian이 안정되는 이유는?",
      visualAnswer: "sample 평균과 분산의 추정 오차가 줄기 때문이다.",
      robotQuestion: "정지 IMU로 추정한 gyro noise는 EKF 어디에 들어가는가?",
      robotAnswer: "각속도 measurement noise 또는 process noise covariance 설정에 들어간다.",
      designQuestion: "센서 노이즈 MLE 실험 설계에서 반드시 고정할 조건은?",
      designAnswer: "로봇 정지 상태, sample rate, 온도/전원 조건, timestamp 누락 여부를 고정하고 로그로 남긴다.",
    }),
    wrongAnswerTags: makeWrongTags("gaussian_mle", "Gaussian MLE와 센서 노이즈", ["Gaussian Distribution", "Kalman Filter"]),
    nextSessions: ["kalman_filter", "ekf_localization"],
  }),
  session({
    id: "low_pass_filter_imu",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Low-pass Filter and Sensor Noise",
    level: "beginner",
    prerequisites: ["sampling_nyquist_aliasing", "gaussian_mle"],
    learningObjectives: ["1차 low-pass filter의 재귀식을 설명한다.", "alpha와 지연/노이즈 제거 trade-off를 해석한다.", "IMU noise smoothing 코드를 테스트한다."],
    theory: {
      definition: "Low-pass filter는 빠르게 흔들리는 고주파 성분을 줄이고 느린 추세를 남기는 필터다.",
      whyItMatters: "IMU, encoder, force sensor 값은 노이즈가 섞여 제어 입력을 흔들 수 있으므로 필터링과 지연의 균형이 필요하다.",
      intuition: "새 측정값을 바로 믿지 않고 이전 출력과 섞어 부드러운 값을 만드는 관성 있는 평균이다.",
      equations: [
        makeEquation("First-order low-pass", "y[k]=\\alpha x[k]+(1-\\alpha)y[k-1]", [["x[k]", "현재 센서 입력"], ["y[k]", "필터 출력"], ["\\alpha", "새 입력을 믿는 비율"]], "alpha가 클수록 빠르지만 노이즈가 많이 남는다."),
      ],
      derivation: [
        step("가중 평균 설정", "현재 입력과 이전 출력을 convex combination으로 섞는다."),
        step("안정 조건", "0<=alpha<=1이면 출력이 입력 범위 바깥으로 튀지 않는다."),
        step("trade-off", "alpha가 작으면 smoothing은 강하지만 step response가 느려진다."),
      ],
      handCalculation: {
        problem: "samples=[0,1,0], alpha=0.25, y0=0일 때 y를 계산하라.",
        given: { alpha: 0.25, samples: "0,1,0" },
        steps: ["y0=0", "y1=0.25*1+0.75*0=0.25", "y2=0.25*0+0.75*0.25=0.1875"],
        answer: "[0, 0.25, 0.1875]",
      },
      robotApplication: "로봇팔 force sensor를 low-pass filtering하면 contact noise는 줄지만 collision 감지 지연이 생기므로 safety threshold와 함께 튜닝한다.",
    },
    codeLabs: [lowPassLab],
    visualizations: [
      makeVisualization("vis_low_pass_imu", "Low-pass Filter Noise Smoothing", "low_pass_filter", "y[k]=alpha*x[k]+(1-alpha)*y[k-1]", lowPassLab.id, [
        { name: "alpha", symbol: "\\alpha", min: 0.01, max: 1, default: 0.25, description: "현재 sample 반영 비율" },
        { name: "noise", symbol: "\\epsilon", min: 0, max: 2, default: 0.5, description: "IMU measurement noise 크기" },
      ], "alpha가 중간값이면 노이즈와 지연이 균형을 이룬다.", "alpha가 너무 작으면 급격한 실제 움직임을 늦게 감지한다."),
    ],
    quizzes: makeCoreQuizzes({
      id: "low_pass",
      conceptTag: "low_pass_filter",
      reviewSession: "Low-pass Filter",
      conceptQuestion: "low-pass filter에서 alpha가 작아지면 어떤 trade-off가 생기는가?",
      conceptAnswer: "노이즈는 더 줄지만 출력 지연이 커진다.",
      calculationQuestion: "x=[0,1], alpha=0.2, y0=0이면 y1은?",
      calculationAnswer: "0.2*1+0.8*0=0.2이다.",
      codeQuestion: "첫 sample은 어떻게 초기화해야 start-up bias가 작은가?",
      codeAnswer: "첫 출력 y[0]을 첫 입력 x[0]로 둔다.",
      debugQuestion: "이전 입력 x[k-1]을 섞는 버그는 왜 문제인가?",
      debugAnswer: "재귀 low-pass가 아니라 단순 입력 보간이 되어 누적 smoothing 특성이 사라진다.",
      visualQuestion: "alpha=0.05에서 step 변화가 늦게 따라가는 이유는?",
      visualAnswer: "이전 출력 가중치 0.95가 커서 새 입력 반영이 느리기 때문이다.",
      robotQuestion: "collision 감지 force sensor에 alpha를 너무 작게 두면 위험한 이유는?",
      robotAnswer: "충돌 힘 상승을 늦게 감지해 정지 명령이 지연될 수 있다.",
      designQuestion: "필터 설계에서 로그로 남겨야 할 항목은?",
      designAnswer: "raw signal, filtered signal, alpha, sample time, 감지 지연, false trigger 수를 저장한다.",
    }),
    wrongAnswerTags: makeWrongTags("low_pass_filter", "저역통과 필터와 센서 노이즈", ["Sampling, Nyquist, and Aliasing", "Real-time Loop Timing"]),
    nextSessions: ["sensor_pipeline", "real_time_loop_timing"],
  }),
];
