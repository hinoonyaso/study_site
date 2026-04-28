import type { CodeLab, Session, VisualizationSpec } from "../../types";
import { makeAdvancedSession } from "../core/advancedSessionFactory";

type Param = VisualizationSpec["parameters"][number];
type TopicSpec = {
  id: string;
  part: string;
  title: string;
  prerequisites: string[];
  objectives: string[];
  definition: string;
  whyItMatters: string;
  intuition: string;
  equation: string;
  designEquation: string;
  failureEquation: string;
  terms: Array<[string, string]>;
  derivation: Array<[string, string]>;
  handProblem: string;
  handGiven: Record<string, string | number>;
  handSteps: string[];
  handAnswer: string;
  robotApplication: string;
  labTitle: string;
  args: [string, string, string];
  sample: [number, number, number];
  codeExpression: string;
  commonBugs: string[];
  extensionTask: string;
  visualId: string;
  visualTitle: string;
  visualParams: Param[];
  normalCase: string;
  failureCase: string;
  quiz: {
    conceptQuestion: string;
    conceptAnswer: string;
    calculationQuestion: string;
    calculationAnswer: string;
    codeQuestion: string;
    codeAnswer: string;
    debugQuestion: string;
    debugAnswer: string;
    visualQuestion: string;
    visualAnswer: string;
    robotQuestion: string;
    robotAnswer: string;
    designQuestion: string;
    designAnswer: string;
  };
  wrongTagLabel: string;
  nextSessions: string[];
};

const param = (
  name: string,
  symbol: string,
  min: number,
  max: number,
  defaultValue: number,
  description: string,
): Param => ({ name, symbol, min, max, default: defaultValue, description });

const customLabs: Record<string, CodeLab> = {
  ekf_chi_squared_outlier_rejection: {
    id: "lab_ekf_chi_squared_outlier_rejection",
    title: "Chi-squared Mahalanobis Gate with scipy",
    language: "python",
    theoryConnection: "d^2 = innovation^T S^{-1} innovation, threshold = scipy.stats.chi2.ppf(confidence, df)",
    starterCode: `import numpy as np
from scipy.stats import chi2

def mahalanobis_gate(innovation, S, confidence=0.95):
    # TODO: d2와 chi2 threshold를 계산하고 outlier 여부를 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    innovation = np.array([2.0, 1.0, 0.5])
    S = np.eye(3) * 0.4
    d2, threshold, outlier = mahalanobis_gate(innovation, S)
    print("d2:", round(d2, 3), "threshold:", round(threshold, 3), "outlier:", outlier)`,
    solutionCode: `import numpy as np
from scipy.stats import chi2

def mahalanobis_gate(innovation, S, confidence=0.95):
    innovation = np.asarray(innovation, dtype=float)
    S = np.asarray(S, dtype=float)
    d2 = float(innovation.T @ np.linalg.inv(S) @ innovation)
    threshold = float(chi2.ppf(confidence, df=innovation.size))
    return d2, threshold, d2 > threshold

if __name__ == "__main__":
    innovation = np.array([2.0, 1.0, 0.5])
    S = np.eye(3) * 0.4
    d2, threshold, outlier = mahalanobis_gate(innovation, S)
    print("d2:", round(d2, 3), "threshold:", round(threshold, 3), "outlier:", outlier)`,
    testCode: `import numpy as np
from scipy.stats import chi2
from ekf_chi_squared_outlier_rejection import mahalanobis_gate

def test_chi2_threshold_matches_scipy():
    _, threshold, _ = mahalanobis_gate(np.ones(3), np.eye(3), confidence=0.95)
    assert abs(threshold - chi2.ppf(0.95, df=3)) < 1e-9

def test_large_innovation_is_outlier():
    d2, threshold, outlier = mahalanobis_gate(np.array([4.0, 0.0, 0.0]), np.eye(3))
    assert d2 > threshold and outlier

def test_small_innovation_is_accepted():
    _, _, outlier = mahalanobis_gate(np.array([0.1, 0.0, 0.0]), np.eye(3))
    assert not outlier`,
    expectedOutput: "d2: 13.125 threshold: 7.815 outlier: True",
    runCommand: "python ekf_chi_squared_outlier_rejection.py && pytest test_ekf_chi_squared_outlier_rejection.py",
    commonBugs: ["Euclidean norm만 계산하고 covariance S^{-1}를 빼먹음", "df를 measurement dimension과 다르게 설정함", "d2가 threshold를 넘었는데도 update를 적용함"],
    extensionTask: "confidence 0.90, 0.95, 0.99와 df=1~6을 표로 만들고 reject rate를 비교하라.",
  },
  butterworth_filter_order_design: {
    id: "lab_butterworth_filter_order_design",
    title: "Butterworth Filter Design with scipy.signal.butter",
    language: "python",
    theoryConnection: "|H(jw)|^2 = 1 / (1 + (w/wc)^(2n)), scipy.signal.butter(order, cutoff, fs=fs)",
    starterCode: `import numpy as np
from scipy.signal import butter, freqz

def design_response(order=4, cutoff_hz=60.0, sample_rate_hz=500.0):
    # TODO: butter low-pass filter를 만들고 cutoff 근처 magnitude를 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    mag = design_response(order=4, cutoff_hz=60.0, sample_rate_hz=500.0)
    print("cutoff magnitude:", round(float(mag), 3))`,
    solutionCode: `import numpy as np
from scipy.signal import butter, freqz

def design_response(order=4, cutoff_hz=60.0, sample_rate_hz=500.0):
    b, a = butter(order, cutoff_hz, btype="lowpass", fs=sample_rate_hz)
    w, h = freqz(b, a, fs=sample_rate_hz, worN=2048)
    idx = int(np.argmin(np.abs(w - cutoff_hz)))
    return float(abs(h[idx]))

if __name__ == "__main__":
    mag = design_response(order=4, cutoff_hz=60.0, sample_rate_hz=500.0)
    print("cutoff magnitude:", round(float(mag), 3))`,
    testCode: `from butterworth_filter_order_design import design_response

def test_cutoff_is_near_minus_3db():
    mag = design_response(order=4, cutoff_hz=60.0, sample_rate_hz=500.0)
    assert 0.65 < mag < 0.76

def test_higher_order_is_valid():
    assert design_response(order=6, cutoff_hz=60.0, sample_rate_hz=500.0) > 0

def test_lower_cutoff_is_valid():
    assert design_response(order=2, cutoff_hz=30.0, sample_rate_hz=500.0) > 0`,
    expectedOutput: "cutoff magnitude: 0.707",
    runCommand: "python butterworth_filter_order_design.py && pytest test_butterworth_filter_order_design.py",
    commonBugs: ["cutoff를 normalized frequency와 Hz로 혼동함", "order를 높이면 delay가 증가한다는 점을 무시함", "sampling rate Nyquist 조건을 확인하지 않음"],
    extensionTask: "2차/4차/6차의 60Hz cutoff magnitude, stopband attenuation, phase delay를 비교하라.",
  },
  rank_nullity_pseudoinverse_ik: {
    id: "lab_rank_nullity_pseudoinverse_ik",
    title: "Rank-deficient Jacobian Null-space IK",
    language: "python",
    theoryConnection: "rank(J)+nullity(J)=n, dq = J^+ xdot + (I-J^+J)z",
    starterCode: `import numpy as np

def rank_nullity_solution(J, xdot, z):
    # TODO: SVD rank/nullity, minimum-norm solution, null-space projected motion을 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    J = np.array([[1.0, 1.0, 0.0]])
    dq, nullity = rank_nullity_solution(J, np.array([1.0]), np.array([0.0, 0.0, 1.0]))
    print("dq:", np.round(dq, 3), "nullity:", nullity)`,
    solutionCode: `import numpy as np

def rank_nullity_solution(J, xdot, z):
    J = np.asarray(J, dtype=float)
    xdot = np.asarray(xdot, dtype=float)
    z = np.asarray(z, dtype=float)
    rank = int(np.linalg.matrix_rank(J))
    nullity = J.shape[1] - rank
    J_pinv = np.linalg.pinv(J)
    projector = np.eye(J.shape[1]) - J_pinv @ J
    dq = J_pinv @ xdot + projector @ z
    return dq, nullity

if __name__ == "__main__":
    J = np.array([[1.0, 1.0, 0.0]])
    dq, nullity = rank_nullity_solution(J, np.array([1.0]), np.array([0.0, 0.0, 1.0]))
    print("dq:", np.round(dq, 3), "nullity:", nullity)`,
    testCode: `import numpy as np
from rank_nullity_pseudoinverse_ik import rank_nullity_solution

def test_task_velocity_preserved():
    J = np.array([[1.0, 1.0, 0.0]])
    dq, _ = rank_nullity_solution(J, np.array([1.0]), np.array([0.0, 0.0, 1.0]))
    assert np.allclose(J @ dq, np.array([1.0]))

def test_rank_nullity_theorem():
    _, nullity = rank_nullity_solution(np.array([[1.0, 1.0, 0.0]]), np.array([1.0]), np.zeros(3))
    assert nullity == 2

def test_null_motion_changes_solution_without_changing_task():
    J = np.array([[1.0, 1.0, 0.0]])
    dq1, _ = rank_nullity_solution(J, np.array([1.0]), np.zeros(3))
    dq2, _ = rank_nullity_solution(J, np.array([1.0]), np.array([0.0, 0.0, 2.0]))
    assert not np.allclose(dq1, dq2) and np.allclose(J @ dq2, np.array([1.0]))`,
    expectedOutput: "dq: [0.5 0.5 1. ] nullity: 2",
    runCommand: "python rank_nullity_pseudoinverse_ik.py && pytest test_rank_nullity_pseudoinverse_ik.py",
    commonBugs: ["rank-deficient J에서 해가 unique하다고 착각함", "null-space projector I-J^+J 대신 task-space projector를 사용함", "minimum-norm 해와 secondary objective 해를 구분하지 않음"],
    extensionTask: "3DOF arm의 elbow posture z를 바꿔도 end-effector velocity가 유지되는지 plot하라.",
  },
  laplace_final_value_bode_margin: {
    id: "lab_laplace_final_value_bode_margin",
    title: "Laplace Initial/Final Value and scipy.signal.bode Margins",
    language: "python",
    theoryConnection: "final value: lim sF(s), initial value: lim s->inf sF(s), Bode margin from scipy.signal.bode crossing",
    starterCode: `import numpy as np
from scipy import signal

def bode_phase_margin(num, den):
    # TODO: scipy.signal.bode로 0dB crossover와 phase margin을 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    wc, pm = bode_phase_margin([10.0], [1.0, 3.0, 2.0])
    print("wc:", round(float(wc), 3), "pm:", round(float(pm), 3))`,
    solutionCode: `import numpy as np
from scipy import signal

def bode_phase_margin(num, den):
    system = signal.TransferFunction(num, den)
    w = np.logspace(-2, 3, 5000)
    w, mag_db, phase_deg = signal.bode(system, w=w)
    idx = int(np.argmin(np.abs(mag_db)))
    phase_margin = 180.0 + float(phase_deg[idx])
    return float(w[idx]), phase_margin

if __name__ == "__main__":
    wc, pm = bode_phase_margin([10.0], [1.0, 3.0, 2.0])
    print("wc:", round(float(wc), 3), "pm:", round(float(pm), 3))`,
    testCode: `from laplace_final_value_bode_margin import bode_phase_margin

def test_phase_margin_is_positive_for_stable_example():
    _, pm = bode_phase_margin([10.0], [1.0, 3.0, 2.0])
    assert pm > 0

def test_crossover_frequency_is_positive():
    wc, _ = bode_phase_margin([10.0], [1.0, 3.0, 2.0])
    assert wc > 0

def test_gain_change_changes_crossover():
    wc1, _ = bode_phase_margin([5.0], [1.0, 3.0, 2.0])
    wc2, _ = bode_phase_margin([20.0], [1.0, 3.0, 2.0])
    assert wc1 != wc2`,
    expectedOutput: "wc: see run output, pm: see run output",
    runCommand: "python laplace_final_value_bode_margin.py && pytest test_laplace_final_value_bode_margin.py",
    commonBugs: ["0dB crossing과 -180도 crossing을 혼동함", "phase wrapping을 처리하지 않음", "불안정 pole에서 final value theorem을 사용함"],
    extensionTask: "gain K를 sweep하며 scipy.signal.bode에서 phase margin과 step overshoot를 함께 표로 만들라.",
  },
  kkt_osqp_active_constraints: {
    id: "lab_kkt_osqp_active_constraints",
    title: "KKT Multiplier and OSQP Active Constraint",
    language: "python",
    theoryConnection: "KKT complementarity: lambda_i g_i(x)=0, active constraint has nonzero multiplier",
    starterCode: `import numpy as np
import scipy.sparse as sp
import osqp

def solve_box_qp(target=2.0, upper=1.0):
    # TODO: min 0.5*x^2-target*x subject to x <= upper using OSQP, return x and upper multiplier.
    raise NotImplementedError

if __name__ == "__main__":
    x, multiplier = solve_box_qp()
    print("x:", round(float(x), 3), "lambda_upper:", round(float(multiplier), 3))`,
    solutionCode: `import numpy as np
import scipy.sparse as sp
import osqp

def solve_box_qp(target=2.0, upper=1.0):
    P = sp.csc_matrix([[1.0]])
    q = np.array([-target])
    A = sp.csc_matrix([[1.0]])
    l = np.array([-np.inf])
    u = np.array([upper])
    solver = osqp.OSQP()
    solver.setup(P=P, q=q, A=A, l=l, u=u, verbose=False)
    result = solver.solve()
    return float(result.x[0]), float(result.y[0])

if __name__ == "__main__":
    x, multiplier = solve_box_qp()
    print("x:", round(float(x), 3), "lambda_upper:", round(float(multiplier), 3))`,
    testCode: `from kkt_osqp_active_constraints import solve_box_qp

def test_upper_bound_is_active_when_target_exceeds_bound():
    x, multiplier = solve_box_qp(target=2.0, upper=1.0)
    assert abs(x - 1.0) < 1e-3 and multiplier > 0

def test_constraint_inactive_when_target_inside_bound():
    x, multiplier = solve_box_qp(target=0.5, upper=1.0)
    assert abs(x - 0.5) < 1e-3 and abs(multiplier) < 1e-3

def test_tighter_bound_changes_solution():
    x1, _ = solve_box_qp(target=2.0, upper=1.0)
    x2, _ = solve_box_qp(target=2.0, upper=0.5)
    assert x2 < x1`,
    expectedOutput: "x: 1.0 lambda_upper: positive",
    runCommand: "python kkt_osqp_active_constraints.py && pytest test_kkt_osqp_active_constraints.py",
    commonBugs: ["constraint가 active인지 primal value만 보고 multiplier를 확인하지 않음", "OSQP의 result.y 부호와 constraint bound 방향을 해석하지 못함", "inactive constraint에도 큰 multiplier가 있다고 착각함"],
    extensionTask: "CBF-QP에서 distance constraint multiplier를 출력하고 어느 obstacle constraint가 active인지 표시하라.",
  },
  se3_lie_algebra_expmap_twist: {
    id: "lab_se3_expmap_twist_tf2",
    title: "se(3) Twist Exponential Map to tf2 Transform",
    language: "python",
    theoryConnection: "SO(3) exp via Rodrigues, SE(3) exp maps twist tangent vector to transform",
    starterCode: `import numpy as np

def so3_exp(omega):
    # TODO: Rodrigues formula로 rotation matrix를 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    R = so3_exp(np.array([0.0, 0.0, np.pi / 2]))
    print(np.round(R, 3))`,
    solutionCode: `import numpy as np

def hat(w):
    wx, wy, wz = w
    return np.array([[0, -wz, wy], [wz, 0, -wx], [-wy, wx, 0]], dtype=float)

def so3_exp(omega):
    omega = np.asarray(omega, dtype=float)
    theta = float(np.linalg.norm(omega))
    if theta < 1e-9:
        return np.eye(3) + hat(omega)
    K = hat(omega / theta)
    return np.eye(3) + np.sin(theta) * K + (1.0 - np.cos(theta)) * (K @ K)

if __name__ == "__main__":
    R = so3_exp(np.array([0.0, 0.0, np.pi / 2]))
    print(np.round(R, 3))`,
    testCode: `import numpy as np
from se3_expmap_twist_tf2 import so3_exp

def test_rotation_is_orthonormal():
    R = so3_exp(np.array([0.1, 0.2, 0.3]))
    assert np.allclose(R.T @ R, np.eye(3), atol=1e-6)

def test_z_90_rotation():
    R = so3_exp(np.array([0.0, 0.0, np.pi / 2]))
    assert np.allclose(R @ np.array([1.0, 0.0, 0.0]), np.array([0.0, 1.0, 0.0]), atol=1e-6)

def test_small_angle_is_finite():
    R = so3_exp(np.array([1e-10, 0.0, 0.0]))
    assert np.isfinite(R).all()`,
    expectedOutput: "90 degree z rotation matrix",
    runCommand: "python se3_expmap_twist_tf2.py && pytest test_se3_expmap_twist_tf2.py",
    commonBugs: ["axis를 normalize하지 않고 Rodrigues를 적용함", "theta가 0에 가까울 때 나눗셈이 터짐", "body/world twist frame을 tf2 transform과 섞음"],
    extensionTask: "SO(3) exp 결과를 quaternion으로 바꿔 ROS2 TransformStamped rotation 필드에 넣어라.",
  },
  chebyshev_butterworth_filter_design: {
    id: "lab_chebyshev_butterworth_filter_design",
    title: "Butterworth vs Chebyshev Filter Order Design",
    language: "python",
    theoryConnection: "Butterworth is maximally flat; Chebyshev trades passband ripple for sharper transition",
    starterCode: `import numpy as np
from scipy.signal import buttord, cheb1ord

def compare_orders(pass_hz=40.0, stop_hz=80.0, ripple_db=1.0, attenuation_db=30.0, fs=500.0):
    # TODO: buttord와 cheb1ord로 필요한 차수를 비교하라.
    raise NotImplementedError

if __name__ == "__main__":
    print(compare_orders())`,
    solutionCode: `import numpy as np
from scipy.signal import buttord, cheb1ord

def compare_orders(pass_hz=40.0, stop_hz=80.0, ripple_db=1.0, attenuation_db=30.0, fs=500.0):
    butter_order, _ = buttord(pass_hz, stop_hz, ripple_db, attenuation_db, fs=fs)
    cheby_order, _ = cheb1ord(pass_hz, stop_hz, ripple_db, attenuation_db, fs=fs)
    return int(butter_order), int(cheby_order)

if __name__ == "__main__":
    print(compare_orders())`,
    testCode: `from chebyshev_butterworth_filter_design import compare_orders

def test_orders_are_positive():
    b, c = compare_orders()
    assert b > 0 and c > 0

def test_chebyshev_needs_no_more_order_for_same_specs():
    b, c = compare_orders()
    assert c <= b

def test_harder_attenuation_increases_or_keeps_order:
    b1, _ = compare_orders(attenuation_db=20)
    b2, _ = compare_orders(attenuation_db=40)
    assert b2 >= b1`,
    expectedOutput: "(butter_order, chebyshev_order)",
    runCommand: "python chebyshev_butterworth_filter_design.py && pytest test_chebyshev_butterworth_filter_design.py",
    commonBugs: ["Chebyshev ripple을 noise로 오해함", "stopband attenuation 단위를 linear로 넣음", "필터 order만 보고 group delay를 검증하지 않음"],
    extensionTask: "같은 IMU data에 Butterworth와 Chebyshev를 적용하고 magnitude/phase/group delay를 비교하라.",
  },
  dh_craig_spong_convention_guard: {
    id: "lab_dh_craig_spong_convention_guard",
    title: "Craig/Spong DH Convention Guard",
    language: "python",
    theoryConnection: "standard DH A=Rz(theta)Tz(d)Tx(a)Rx(alpha), modified DH A=Rx(alpha)Tx(a)Rz(theta)Tz(d)",
    starterCode: `import numpy as np

def dh_transform(theta, d, a, alpha, convention="standard"):
    # TODO: standard DH와 modified DH를 convention 인자로 구분하라.
    raise NotImplementedError

if __name__ == "__main__":
    A_std = dh_transform(0.3, 0.2, 0.4, -0.5, "standard")
    A_mod = dh_transform(0.3, 0.2, 0.4, -0.5, "modified")
    print("same:", bool(np.allclose(A_std, A_mod)))`,
    solutionCode: `import numpy as np

def rot_z(theta):
    c, s = np.cos(theta), np.sin(theta)
    return np.array([[c, -s, 0, 0], [s, c, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], dtype=float)

def rot_x(alpha):
    c, s = np.cos(alpha), np.sin(alpha)
    return np.array([[1, 0, 0, 0], [0, c, -s, 0], [0, s, c, 0], [0, 0, 0, 1]], dtype=float)

def trans_z(d):
    T = np.eye(4)
    T[2, 3] = d
    return T

def trans_x(a):
    T = np.eye(4)
    T[0, 3] = a
    return T

def dh_transform(theta, d, a, alpha, convention="standard"):
    if convention == "standard":
        return rot_z(theta) @ trans_z(d) @ trans_x(a) @ rot_x(alpha)
    if convention == "modified":
        return rot_x(alpha) @ trans_x(a) @ rot_z(theta) @ trans_z(d)
    raise ValueError("convention must be standard or modified")

if __name__ == "__main__":
    A_std = dh_transform(0.3, 0.2, 0.4, -0.5, "standard")
    A_mod = dh_transform(0.3, 0.2, 0.4, -0.5, "modified")
    print("same:", bool(np.allclose(A_std, A_mod)))`,
    testCode: `import numpy as np
from dh_craig_spong_convention_guard import dh_transform

def test_standard_and_modified_differ_for_general_link():
    A_std = dh_transform(0.3, 0.2, 0.4, -0.5, "standard")
    A_mod = dh_transform(0.3, 0.2, 0.4, -0.5, "modified")
    assert not np.allclose(A_std, A_mod)

def test_rotation_block_is_valid():
    A = dh_transform(0.3, 0.2, 0.4, -0.5, "standard")
    R = A[:3, :3]
    assert np.allclose(R.T @ R, np.eye(3), atol=1e-6)

def test_unknown_convention_fails_fast():
    try:
        dh_transform(0, 0, 0, 0, "spong_craig_mixed")
    except ValueError:
        return
    assert False, "mixed convention must fail fast"`,
    expectedOutput: "same: False",
    runCommand: "python dh_craig_spong_convention_guard.py && pytest test_dh_craig_spong_convention_guard.py",
    commonBugs: ["Craig modified DH와 Spong/Craig standard DH를 한 chain에서 섞음", "a_i와 alpha_i index를 URDF link frame에 맞추지 않음", "교재 convention을 코드 주석에 명시하지 않음"],
    extensionTask: "같은 2-link arm을 standard DH와 modified DH로 각각 만들고 FK pose 차이를 수치로 비교하라.",
  },
  ik_solution_selection_joint_limit_continuity: {
    id: "lab_ik_solution_selection_joint_limit_continuity",
    title: "IK Multiple Solution Selection by Limits and Continuity",
    language: "python",
    theoryConnection: "best q = argmin ||q-q_prev||^2 + w_limit * joint_limit_penalty(q)",
    starterCode: `import numpy as np

def choose_solution(candidates, q_prev, q_min, q_max, w_center=0.1):
    # TODO: joint limit 안에 있고 이전 자세와 연속적인 IK 해를 고르라.
    raise NotImplementedError

if __name__ == "__main__":
    candidates = np.array([[0.2, 1.2], [2.9, -2.8], [-0.3, 0.9]])
    q, score = choose_solution(candidates, np.array([0.0, 1.0]), np.array([-1.0, -2.0]), np.array([1.0, 2.0]))
    print(np.round(q, 3), round(float(score), 3))`,
    solutionCode: `import numpy as np

def choose_solution(candidates, q_prev, q_min, q_max, w_center=0.1):
    candidates = np.asarray(candidates, dtype=float)
    q_prev = np.asarray(q_prev, dtype=float)
    q_min = np.asarray(q_min, dtype=float)
    q_max = np.asarray(q_max, dtype=float)
    center = 0.5 * (q_min + q_max)
    half_range = np.maximum(0.5 * (q_max - q_min), 1e-9)
    best_q, best_score = None, float("inf")
    for q in candidates:
        if np.any(q < q_min) or np.any(q > q_max):
            continue
        continuity = float(np.sum((q - q_prev) ** 2))
        center_penalty = float(np.sum(((q - center) / half_range) ** 2))
        score = continuity + w_center * center_penalty
        if score < best_score:
            best_q, best_score = q.copy(), score
    if best_q is None:
        raise ValueError("no IK solution inside joint limits")
    return best_q, best_score

if __name__ == "__main__":
    candidates = np.array([[0.2, 1.2], [2.9, -2.8], [-0.3, 0.9]])
    q, score = choose_solution(candidates, np.array([0.0, 1.0]), np.array([-1.0, -2.0]), np.array([1.0, 2.0]))
    print(np.round(q, 3), round(float(score), 3))`,
    testCode: `import numpy as np
from ik_solution_selection_joint_limit_continuity import choose_solution

def test_rejects_joint_limit_violation():
    candidates = np.array([[2.0, 0.0], [0.1, 0.0]])
    q, _ = choose_solution(candidates, np.zeros(2), np.array([-1, -1]), np.array([1, 1]))
    assert np.allclose(q, [0.1, 0.0])

def test_prefers_continuity():
    candidates = np.array([[0.8, 0.8], [0.1, 0.1]])
    q, _ = choose_solution(candidates, np.zeros(2), np.array([-1, -1]), np.array([1, 1]))
    assert np.allclose(q, [0.1, 0.1])

def test_no_valid_solution_raises():
    try:
        choose_solution(np.array([[2.0, 0.0]]), np.zeros(2), np.array([-1, -1]), np.array([1, 1]))
    except ValueError:
        return
    assert False, "must fail when all IK candidates violate joint limits"`,
    expectedOutput: "[0.2 1.2] 0.056",
    runCommand: "python ik_solution_selection_joint_limit_continuity.py && pytest test_ik_solution_selection_joint_limit_continuity.py",
    commonBugs: ["elbow-up/down 중 첫 번째 해를 무조건 사용함", "joint limit 밖 후보를 clamp한 뒤 FK 오차를 재검증하지 않음", "이전 timestep과의 연속성 비용을 넣지 않아 elbow flip이 생김"],
    extensionTask: "원 궤적을 따라가며 elbow-up/down 해를 모두 만들고 continuity 기반 선택이 elbow flip을 줄이는지 확인하라.",
  },
  feedforward_model_error_robustness: {
    id: "lab_feedforward_model_error_robustness",
    title: "Feedforward Gravity Model Error Robustness",
    language: "python",
    theoryConnection: "tau = Kp(q_ref-q) + g_hat(q), residual = g_true(q)-g_hat(q)",
    starterCode: `import numpy as np

def feedforward_residual(q, q_ref, true_g, model_g, kp=20.0, limit=30.0):
    # TODO: feedback+feedforward torque, residual model error, risk score를 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    tau, residual, risk = feedforward_residual(0.0, 0.0, 10.0, 16.0)
    print("tau:", round(float(tau), 3), "residual:", round(float(residual), 3), "risk:", round(float(risk), 3))`,
    solutionCode: `import numpy as np

def feedforward_residual(q, q_ref, true_g, model_g, kp=20.0, limit=30.0):
    feedback = kp * (q_ref - q)
    tau_raw = feedback + model_g
    tau = float(np.clip(tau_raw, -limit, limit))
    residual = float(true_g - model_g)
    risk = abs(residual) / max(abs(true_g), 1e-9)
    return tau, residual, risk

if __name__ == "__main__":
    tau, residual, risk = feedforward_residual(0.0, 0.0, 10.0, 16.0)
    print("tau:", round(float(tau), 3), "residual:", round(float(residual), 3), "risk:", round(float(risk), 3))`,
    testCode: `from feedforward_model_error_robustness import feedforward_residual

def test_perfect_model_has_zero_residual():
    _, residual, risk = feedforward_residual(0.0, 0.0, 10.0, 10.0)
    assert residual == 0.0 and risk == 0.0

def test_wrong_model_has_risk():
    _, residual, risk = feedforward_residual(0.0, 0.0, 10.0, 16.0)
    assert residual < 0 and risk > 0.5

def test_torque_is_limited():
    tau, _, _ = feedforward_residual(0.0, 0.0, 10.0, 100.0, limit=30.0)
    assert abs(tau) <= 30.0`,
    expectedOutput: "tau: 16.0 residual: -6.0 risk: 0.6",
    runCommand: "python feedforward_model_error_robustness.py && pytest test_feedforward_model_error_robustness.py",
    commonBugs: ["feedforward를 항상 좋은 보상으로 가정하고 모델 오차 residual을 보지 않음", "payload 변경 후 gravity model을 갱신하지 않음", "saturation된 torque를 feedback error로만 해석함"],
    extensionTask: "payload mass 오차를 sweep하며 feedforward가 tracking error를 줄이는 구간과 오히려 키우는 구간을 비교하라.",
  },
  controllability_gramian_numeric: {
    id: "lab_controllability_gramian_numeric",
    title: "Numeric Controllability Gramian",
    language: "python",
    theoryConnection: "W_c(N)=sum_{k=0}^{N-1} A^k B B^T (A^T)^k, rank(W_c)=n means controllable",
    starterCode: `import numpy as np

def controllability_gramian(A, B, horizon=20):
    # TODO: finite-horizon discrete controllability Gramian과 rank를 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    A = np.array([[1.0, 1.0], [0.0, 1.0]])
    B = np.array([[0.0], [1.0]])
    W, rank = controllability_gramian(A, B)
    print("rank:", rank, "det:", round(float(np.linalg.det(W)), 3))`,
    solutionCode: `import numpy as np

def controllability_gramian(A, B, horizon=20):
    A = np.asarray(A, dtype=float)
    B = np.asarray(B, dtype=float)
    W = np.zeros((A.shape[0], A.shape[0]))
    Ak = np.eye(A.shape[0])
    for _ in range(horizon):
        W += Ak @ B @ B.T @ Ak.T
        Ak = A @ Ak
    return W, int(np.linalg.matrix_rank(W))

if __name__ == "__main__":
    A = np.array([[1.0, 1.0], [0.0, 1.0]])
    B = np.array([[0.0], [1.0]])
    W, rank = controllability_gramian(A, B)
    print("rank:", rank, "det:", round(float(np.linalg.det(W)), 3))`,
    testCode: `import numpy as np
from controllability_gramian_numeric import controllability_gramian

def test_double_integrator_is_controllable():
    A = np.array([[1.0, 1.0], [0.0, 1.0]])
    B = np.array([[0.0], [1.0]])
    _, rank = controllability_gramian(A, B)
    assert rank == 2

def test_zero_input_is_not_controllable():
    A = np.eye(2)
    B = np.zeros((2, 1))
    _, rank = controllability_gramian(A, B)
    assert rank == 0

def test_longer_horizon_has_more_or_equal_energy():
    A = np.eye(1)
    B = np.ones((1, 1))
    W1, _ = controllability_gramian(A, B, horizon=1)
    W2, _ = controllability_gramian(A, B, horizon=3)
    assert W2[0, 0] >= W1[0, 0]`,
    expectedOutput: "rank: 2 det: positive",
    runCommand: "python controllability_gramian_numeric.py && pytest test_controllability_gramian_numeric.py",
    commonBugs: ["controllability matrix rank만 외우고 Gramian eigenvalue conditioning을 보지 않음", "horizon이 짧아 rank가 낮게 나오는 것을 system 불능으로 오판함", "단위가 큰 state가 Gramian condition number를 왜곡함"],
    extensionTask: "cart-pole linearization에서 horizon별 Gramian eigenvalue와 condition number를 비교하라.",
  },
  preempt_rt_kernel_jitter_comparison: {
    id: "lab_preempt_rt_kernel_jitter_comparison",
    title: "PREEMPT_RT vs Generic Kernel Jitter Budget",
    language: "python",
    theoryConnection: "deadline miss if |jitter_us| > jitter_budget_us; PREEMPT_RT reduces tail latency",
    starterCode: `import numpy as np

def jitter_summary(jitter_us, period_us=1000.0, budget_ratio=0.1):
    # TODO: max jitter, rms jitter, deadline miss rate를 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    generic = np.array([20, 30, 200, 40, 150], dtype=float)
    print(jitter_summary(generic))`,
    solutionCode: `import numpy as np

def jitter_summary(jitter_us, period_us=1000.0, budget_ratio=0.1):
    jitter_us = np.asarray(jitter_us, dtype=float)
    budget = period_us * budget_ratio
    max_abs = float(np.max(np.abs(jitter_us)))
    rms = float(np.sqrt(np.mean(jitter_us ** 2)))
    miss_rate = float(np.mean(np.abs(jitter_us) > budget))
    return max_abs, rms, miss_rate

if __name__ == "__main__":
    generic = np.array([20, 30, 200, 40, 150], dtype=float)
    print(jitter_summary(generic))`,
    testCode: `import numpy as np
from preempt_rt_kernel_jitter_comparison import jitter_summary

def test_miss_rate_detects_tail_latency():
    _, _, miss = jitter_summary(np.array([10, 20, 200]), period_us=1000, budget_ratio=0.1)
    assert miss > 0

def test_rt_like_trace_has_lower_rms():
    _, rms_generic, _ = jitter_summary(np.array([20, 30, 200, 40, 150]))
    _, rms_rt, _ = jitter_summary(np.array([5, 8, 12, 9, 7]))
    assert rms_rt < rms_generic

def test_no_miss_inside_budget():
    _, _, miss = jitter_summary(np.array([1, 2, 3]), period_us=1000, budget_ratio=0.1)
    assert miss == 0.0`,
    expectedOutput: "(max_abs_us, rms_us, miss_rate)",
    runCommand: "python preempt_rt_kernel_jitter_comparison.py && pytest test_preempt_rt_kernel_jitter_comparison.py",
    commonBugs: ["평균 jitter만 보고 tail latency를 놓침", "PREEMPT_RT가 control algorithm을 빠르게 만드는 것으로 착각함", "CPU isolation, priority, memory lock 없이 kernel만 바꾸고 끝냄"],
    extensionTask: "cyclictest 로그에서 generic kernel과 PREEMPT_RT kernel의 99.9 percentile jitter를 비교하라.",
  },
  particle_filter_resampling_comparison: {
    id: "lab_particle_filter_resampling_comparison",
    title: "Particle Filter Resampling Method Comparison",
    language: "python",
    theoryConnection: "N_eff=1/sum(w_i^2); multinomial has higher variance than systematic/low-variance resampling",
    starterCode: `import numpy as np

def effective_sample_size(weights):
    # TODO: normalized weight의 N_eff를 계산하라.
    raise NotImplementedError

def systematic_resample(weights, n=None, offset=0.0):
    # TODO: low-variance/systematic resampling index를 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    weights = np.array([0.7, 0.2, 0.1])
    print("neff:", round(float(effective_sample_size(weights)), 3), "idx:", systematic_resample(weights, n=5, offset=0.1))`,
    solutionCode: `import numpy as np

def normalize(weights):
    weights = np.asarray(weights, dtype=float)
    return weights / np.sum(weights)

def effective_sample_size(weights):
    w = normalize(weights)
    return float(1.0 / np.sum(w ** 2))

def systematic_resample(weights, n=None, offset=0.0):
    w = normalize(weights)
    n = int(n or len(w))
    positions = (offset + np.arange(n)) / n
    cumulative = np.cumsum(w)
    return np.searchsorted(cumulative, positions, side="right").tolist()

def multinomial_resample(weights, n=None, seed=0):
    w = normalize(weights)
    rng = np.random.default_rng(seed)
    return rng.choice(len(w), size=int(n or len(w)), p=w).tolist()

if __name__ == "__main__":
    weights = np.array([0.7, 0.2, 0.1])
    print("neff:", round(float(effective_sample_size(weights)), 3), "idx:", systematic_resample(weights, n=5, offset=0.1))`,
    testCode: `from particle_filter_resampling_comparison import effective_sample_size, systematic_resample, multinomial_resample

def test_neff_drops_for_degenerate_weights():
    assert effective_sample_size([0.9, 0.1]) < effective_sample_size([0.5, 0.5])

def test_systematic_returns_requested_count():
    assert len(systematic_resample([0.7, 0.2, 0.1], n=5, offset=0.1)) == 5

def test_multinomial_is_seeded():
    assert multinomial_resample([0.7, 0.2, 0.1], n=5, seed=4) == multinomial_resample([0.7, 0.2, 0.1], n=5, seed=4)`,
    expectedOutput: "neff: 1.852 idx: [0, 0, 0, 1, 2]",
    runCommand: "python particle_filter_resampling_comparison.py && pytest test_particle_filter_resampling_comparison.py",
    commonBugs: ["weights normalize를 빼먹음", "resampling 후 weight를 uniform으로 초기화하지 않음", "multinomial variance와 particle deprivation을 비교하지 않음"],
    extensionTask: "multinomial, systematic, stratified resampling의 estimate variance를 같은 weight vector에서 Monte Carlo로 비교하라.",
  },
  imu_camera_tight_coupling_factor: {
    id: "lab_imu_camera_tight_coupling_factor",
    title: "IMU-Camera Tight Coupling Residual",
    language: "python",
    theoryConnection: "joint residual r=[r_pixel/sigma_pixel, r_imu/sigma_imu], cost=0.5*r^T r",
    starterCode: `import numpy as np

def tight_coupled_cost(pixel_residual, imu_residual, pixel_sigma=1.0, imu_sigma=0.1):
    # TODO: visual residual과 IMU preintegration residual을 하나의 weighted factor cost로 합쳐라.
    raise NotImplementedError

if __name__ == "__main__":
    residual, cost = tight_coupled_cost([2.0, -1.0], [0.02, 0.01, -0.01])
    print("dim:", residual.size, "cost:", round(float(cost), 3))`,
    solutionCode: `import numpy as np

def tight_coupled_cost(pixel_residual, imu_residual, pixel_sigma=1.0, imu_sigma=0.1):
    r_pixel = np.asarray(pixel_residual, dtype=float) / max(pixel_sigma, 1e-9)
    r_imu = np.asarray(imu_residual, dtype=float) / max(imu_sigma, 1e-9)
    residual = np.concatenate([r_pixel, r_imu])
    cost = 0.5 * float(residual @ residual)
    return residual, cost

if __name__ == "__main__":
    residual, cost = tight_coupled_cost([2.0, -1.0], [0.02, 0.01, -0.01])
    print("dim:", residual.size, "cost:", round(float(cost), 3))`,
    testCode: `from imu_camera_tight_coupling_factor import tight_coupled_cost

def test_residual_contains_visual_and_imu_terms():
    residual, _ = tight_coupled_cost([1, 2], [0.1, 0.2, 0.3])
    assert residual.size == 5

def test_smaller_sigma_increases_cost():
    _, cost_loose = tight_coupled_cost([1], [0.1], pixel_sigma=2.0, imu_sigma=1.0)
    _, cost_tight = tight_coupled_cost([1], [0.1], pixel_sigma=0.5, imu_sigma=0.1)
    assert cost_tight > cost_loose

def test_zero_residual_has_zero_cost():
    _, cost = tight_coupled_cost([0, 0], [0, 0, 0])
    assert cost == 0.0`,
    expectedOutput: "dim: 5 cost: 2.53",
    runCommand: "python imu_camera_tight_coupling_factor.py && pytest test_imu_camera_tight_coupling_factor.py",
    commonBugs: ["camera pose estimate와 IMU estimate를 느슨하게 평균내 tight coupling이라고 부름", "timestamp offset과 extrinsic calibration을 residual에 반영하지 않음", "pixel residual과 IMU residual covariance scale을 맞추지 않음"],
    extensionTask: "pixel sigma와 IMU sigma를 sweep하며 pose update가 camera/IMU 중 어느 쪽에 끌리는지 비교하라.",
  },
  ppo_gae_sac_entropy_tuning: {
    id: "lab_ppo_gae_sac_entropy_tuning",
    title: "PPO GAE Lambda and SAC Entropy Temperature",
    language: "python",
    theoryConnection: "GAE A_t=sum_l (gamma lambda)^l delta_{t+l}; SAC tunes alpha toward target entropy",
    starterCode: `import numpy as np

def gae_advantages(rewards, values, gamma=0.99, lam=0.95):
    # TODO: values는 rewards보다 하나 길다고 가정하고 GAE advantage를 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    adv = gae_advantages(np.array([1.0, 0.0, 2.0]), np.array([0.5, 0.4, 0.3, 0.0]))
    print(np.round(adv, 3))`,
    solutionCode: `import numpy as np

def gae_advantages(rewards, values, gamma=0.99, lam=0.95):
    rewards = np.asarray(rewards, dtype=float)
    values = np.asarray(values, dtype=float)
    adv = np.zeros_like(rewards)
    gae = 0.0
    for t in reversed(range(len(rewards))):
        delta = rewards[t] + gamma * values[t + 1] - values[t]
        gae = delta + gamma * lam * gae
        adv[t] = gae
    return adv

def sac_alpha_loss(log_alpha, log_prob, target_entropy):
    alpha = float(np.exp(log_alpha))
    return alpha * float(-log_prob - target_entropy)

if __name__ == "__main__":
    adv = gae_advantages(np.array([1.0, 0.0, 2.0]), np.array([0.5, 0.4, 0.3, 0.0]))
    print(np.round(adv, 3))`,
    testCode: `import numpy as np
from ppo_gae_sac_entropy_tuning import gae_advantages, sac_alpha_loss

def test_gae_shape_matches_rewards():
    adv = gae_advantages(np.array([1.0, 0.0]), np.array([0.5, 0.3, 0.0]))
    assert adv.shape == (2,)

def test_lambda_changes_advantage():
    rewards = np.array([1.0, 0.0, 2.0])
    values = np.array([0.5, 0.4, 0.3, 0.0])
    assert not np.allclose(gae_advantages(rewards, values, lam=0.0), gae_advantages(rewards, values, lam=0.95))

def test_sac_alpha_loss_is_finite():
    assert np.isfinite(sac_alpha_loss(0.0, log_prob=-2.0, target_entropy=-1.0))`,
    expectedOutput: "GAE advantage vector",
    runCommand: "python ppo_gae_sac_entropy_tuning.py && pytest test_ppo_gae_sac_entropy_tuning.py",
    commonBugs: ["lambda를 discount gamma와 같은 의미로 착각함", "terminal value bootstrap 처리를 빼먹음", "SAC alpha가 크면 exploration/entropy가 어떻게 바뀌는지 로그로 보지 않음"],
    extensionTask: "GAE lambda 0, 0.5, 0.95, 1.0과 SAC target entropy를 sweep해 variance와 return estimate를 비교하라.",
  },
  spatial_rnea_6dof_backward_pass: {
    id: "lab_spatial_rnea_6dof_backward_pass",
    title: "3-link Spatial RNEA Backward Pass",
    language: "python",
    theoryConnection: "f_i = I_i a_i + v_i x* I_i v_i + X^T f_child, tau_i = S_i^T f_i",
    starterCode: `import numpy as np

def backward_pass(link_wrenches, child_transforms, motion_subspaces):
    # TODO: distal link부터 parent로 wrench를 누적하고 tau_i=S_i^T f_i를 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    wrenches = [np.array([0,0,1,0,0,0.0]), np.array([0,0,2,0,0,0.0]), np.array([0,0,3,0,0,0.0])]
    transforms = [np.eye(6), np.eye(6), np.eye(6)]
    S = [np.array([0,0,1,0,0,0.0]) for _ in range(3)]
    print(np.round(backward_pass(wrenches, transforms, S), 3))`,
    solutionCode: `import numpy as np

def backward_pass(link_wrenches, child_transforms, motion_subspaces):
    accumulated = None
    torques = []
    for wrench, X_child_parent, S in zip(reversed(link_wrenches), reversed(child_transforms), reversed(motion_subspaces)):
        wrench = np.asarray(wrench, dtype=float)
        S = np.asarray(S, dtype=float)
        total = wrench if accumulated is None else wrench + X_child_parent.T @ accumulated
        torques.append(float(S.T @ total))
        accumulated = total
    return list(reversed(torques))

if __name__ == "__main__":
    wrenches = [np.array([0,0,1,0,0,0.0]), np.array([0,0,2,0,0,0.0]), np.array([0,0,3,0,0,0.0])]
    transforms = [np.eye(6), np.eye(6), np.eye(6)]
    S = [np.array([0,0,1,0,0,0.0]) for _ in range(3)]
    print(np.round(backward_pass(wrenches, transforms, S), 3))`,
    testCode: `import numpy as np
from spatial_rnea_6dof_backward_pass import backward_pass

def test_distal_wrench_accumulates_to_parent():
    w = [np.array([0,0,1,0,0,0.0]), np.array([0,0,2,0,0,0.0]), np.array([0,0,3,0,0,0.0])]
    X = [np.eye(6), np.eye(6), np.eye(6)]
    S = [np.array([0,0,1,0,0,0.0]) for _ in range(3)]
    assert np.allclose(backward_pass(w, X, S), [6, 5, 3])

def test_torque_count_matches_links():
    assert len(backward_pass([np.ones(6)], [np.eye(6)], [np.ones(6)])) == 1

def test_projection_uses_motion_subspace():
    assert backward_pass([np.array([0,0,2,0,0,0.0])], [np.eye(6)], [np.array([0,0,1,0,0,0.0])])[0] == 2`,
    expectedOutput: "[6. 5. 3.]",
    runCommand: "python spatial_rnea_6dof_backward_pass.py && pytest test_spatial_rnea_6dof_backward_pass.py",
    commonBugs: ["child wrench transform 방향을 반대로 씀", "distal에서 proximal로 누적하지 않음", "S_i^T f_i projection 없이 wrench norm을 torque로 사용함"],
    extensionTask: "3번 link에 1kg payload wrench를 추가하고 1번 joint torque 변화량을 계산하라.",
  },
  back_calculation_antiwindup_control: {
    id: "lab_back_calculation_antiwindup_control",
    title: "Back-calculation Anti-windup vs Clamping",
    language: "python",
    theoryConnection: "I += e*dt + Ka*(u_sat-u_raw)*dt compared with I=clip(I+e*dt)",
    starterCode: `import numpy as np

def update_integral(error, integral, dt, raw_u, sat_u, I_max=2.0, Ka=1.0):
    # TODO: clamping integral과 back-calculation integral을 둘 다 반환하라.
    raise NotImplementedError

if __name__ == "__main__":
    print(update_integral(0.5, 1.0, 0.1, raw_u=4.0, sat_u=2.0, Ka=2.0))`,
    solutionCode: `import numpy as np

def update_integral(error, integral, dt, raw_u, sat_u, I_max=2.0, Ka=1.0):
    clamped = float(np.clip(integral + error * dt, -I_max, I_max))
    backcalc = float(integral + error * dt + Ka * (sat_u - raw_u) * dt)
    return clamped, backcalc

if __name__ == "__main__":
    print(update_integral(0.5, 1.0, 0.1, raw_u=4.0, sat_u=2.0, Ka=2.0))`,
    testCode: `from back_calculation_antiwindup_control import update_integral

def test_backcalc_reduces_integral_when_saturated_high():
    clamped, backcalc = update_integral(0.5, 1.0, 0.1, raw_u=4.0, sat_u=2.0, Ka=2.0)
    assert backcalc < clamped

def test_clamping_respects_limit():
    clamped, _ = update_integral(100.0, 10.0, 0.1, raw_u=1.0, sat_u=1.0, I_max=2.0)
    assert clamped == 2.0

def test_no_saturation_matches_error_integration_for_backcalc():
    _, backcalc = update_integral(0.5, 1.0, 0.1, raw_u=2.0, sat_u=2.0, Ka=2.0)
    assert abs(backcalc - 1.05) < 1e-9`,
    expectedOutput: "(1.05, 0.65)",
    runCommand: "python back_calculation_antiwindup_control.py && pytest test_back_calculation_antiwindup_control.py",
    commonBugs: ["u_sat-u_raw 부호를 반대로 씀", "포화가 없는데도 backcalc 보정이 생김", "Ka를 너무 크게 잡아 integral oscillation을 만듦"],
    extensionTask: "Ka=0,0.5,1,2,5에서 recovery time과 overshoot를 비교하라.",
  },
  clip_contrastive_temperature_loss: {
    id: "lab_clip_contrastive_temperature_loss",
    title: "CLIP-style Contrastive Loss with PyTorch",
    language: "python",
    theoryConnection: "loss = 0.5 * (CE(image @ text.T / tau) + CE(text @ image.T / tau))",
    starterCode: `import torch
import torch.nn.functional as F

def clip_loss(image_emb, text_emb, temperature=0.07):
    # TODO: normalize, similarity logits, bidirectional CE를 구현하라.
    raise NotImplementedError

if __name__ == "__main__":
    torch.manual_seed(0)
    image = torch.eye(3)
    text = torch.eye(3)
    print("loss:", round(float(clip_loss(image, text, 0.07)), 3))`,
    solutionCode: `import torch
import torch.nn.functional as F

def clip_loss(image_emb, text_emb, temperature=0.07):
    image_emb = F.normalize(image_emb, dim=-1)
    text_emb = F.normalize(text_emb, dim=-1)
    logits = image_emb @ text_emb.T / temperature
    labels = torch.arange(logits.shape[0], device=logits.device)
    return 0.5 * (F.cross_entropy(logits, labels) + F.cross_entropy(logits.T, labels))

if __name__ == "__main__":
    torch.manual_seed(0)
    image = torch.eye(3)
    text = torch.eye(3)
    print("loss:", round(float(clip_loss(image, text, 0.07)), 3))`,
    testCode: `import torch
from clip_contrastive_temperature_loss import clip_loss

def test_identity_embeddings_have_low_loss():
    assert float(clip_loss(torch.eye(3), torch.eye(3), 0.07)) < 0.01

def test_temperature_changes_loss():
    image = torch.eye(3)
    text = torch.roll(torch.eye(3), shifts=1, dims=0)
    assert float(clip_loss(image, text, 0.07)) != float(clip_loss(image, text, 0.5))

def test_loss_is_scalar():
    assert clip_loss(torch.eye(2), torch.eye(2)).ndim == 0`,
    expectedOutput: "loss: 0.0",
    runCommand: "python clip_contrastive_temperature_loss.py && pytest test_clip_contrastive_temperature_loss.py",
    commonBugs: ["embedding normalization을 빼먹음", "temperature를 곱해서 sharpness 방향을 반대로 만듦", "image->text 한 방향 loss만 계산함"],
    extensionTask: "tau=0.07과 tau=0.5에서 hard negative gradient norm을 비교하라.",
  },
  orca_velocity_obstacle_avoidance: {
    id: "lab_orca_velocity_obstacle_avoidance",
    title: "ORCA Two-robot Velocity Obstacle",
    language: "python",
    theoryConnection: "TTC=(distance-radius_sum)/relative_speed and allowed velocities stay outside the collision cone",
    starterCode: `import numpy as np

def time_to_collision(p_a, v_a, p_b, v_b, radius_sum):
    # TODO: closing speed 기반 TTC를 계산하라. 멀어지면 inf를 반환한다.
    raise NotImplementedError

if __name__ == "__main__":
    print("ttc:", round(time_to_collision(np.array([0.,0.]), np.array([1.,0.]), np.array([2.,0.]), np.array([0.,0.]), 0.5), 3))`,
    solutionCode: `import numpy as np

def time_to_collision(p_a, v_a, p_b, v_b, radius_sum):
    rel_pos = np.asarray(p_b, dtype=float) - np.asarray(p_a, dtype=float)
    rel_vel = np.asarray(v_a, dtype=float) - np.asarray(v_b, dtype=float)
    distance = float(np.linalg.norm(rel_pos))
    closing = float(rel_vel @ (rel_pos / max(distance, 1e-9)))
    if closing <= 0:
        return float("inf")
    return max(0.0, (distance - radius_sum) / closing)

if __name__ == "__main__":
    print("ttc:", round(time_to_collision(np.array([0.,0.]), np.array([1.,0.]), np.array([2.,0.]), np.array([0.,0.]), 0.5), 3))`,
    testCode: `import numpy as np
from orca_velocity_obstacle_avoidance import time_to_collision

def test_closing_robot_has_finite_ttc():
    assert abs(time_to_collision(np.array([0.,0.]), np.array([1.,0.]), np.array([2.,0.]), np.array([0.,0.]), 0.5) - 1.5) < 1e-9

def test_separating_robot_has_infinite_ttc():
    assert time_to_collision(np.array([0.,0.]), np.array([-1.,0.]), np.array([2.,0.]), np.array([0.,0.]), 0.5) == float("inf")

def test_radius_changes_ttc():
    near = time_to_collision(np.array([0.,0.]), np.array([1.,0.]), np.array([2.,0.]), np.array([0.,0.]), 1.0)
    far = time_to_collision(np.array([0.,0.]), np.array([1.,0.]), np.array([2.,0.]), np.array([0.,0.]), 0.2)
    assert near < far`,
    expectedOutput: "ttc: 1.5",
    runCommand: "python orca_velocity_obstacle_avoidance.py && pytest test_orca_velocity_obstacle_avoidance.py",
    commonBugs: ["상대 속도 부호를 반대로 씀", "로봇이 멀어지는 중인데도 충돌로 판단함", "radius sum을 거리에서 빼지 않음"],
    extensionTask: "2개 로봇의 목표 속도를 grid search해 velocity obstacle cone 밖 후보를 선택하라.",
  },
  rssm_elbo_kl_world_model: {
    id: "lab_rssm_elbo_kl_world_model",
    title: "RSSM Posterior/Prior KL with PyTorch",
    language: "python",
    theoryConnection: "KL(q(z|h,o)||p(z|h)) regularizes posterior and prior latent dynamics",
    starterCode: `import torch

def gaussian_kl(mu_q, logstd_q, mu_p, logstd_p):
    # TODO: diagonal Gaussian KL(q||p)를 batch mean으로 계산하라.
    raise NotImplementedError

if __name__ == "__main__":
    print("kl:", round(float(gaussian_kl(torch.tensor([0.2]), torch.tensor([-0.7]), torch.tensor([0.0]), torch.tensor([-0.7]))), 3))`,
    solutionCode: `import torch

def gaussian_kl(mu_q, logstd_q, mu_p, logstd_p):
    var_q = torch.exp(2.0 * logstd_q)
    var_p = torch.exp(2.0 * logstd_p)
    kl = logstd_p - logstd_q + (var_q + (mu_q - mu_p) ** 2) / (2.0 * var_p) - 0.5
    return kl.mean()

if __name__ == "__main__":
    print("kl:", round(float(gaussian_kl(torch.tensor([0.2]), torch.tensor([-0.7]), torch.tensor([0.0]), torch.tensor([-0.7]))), 3))`,
    testCode: `import torch
from rssm_elbo_kl_world_model import gaussian_kl

def test_equal_gaussians_have_zero_kl():
    assert abs(float(gaussian_kl(torch.zeros(3), torch.zeros(3), torch.zeros(3), torch.zeros(3)))) < 1e-6

def test_shifted_mean_positive_kl():
    assert float(gaussian_kl(torch.ones(3), torch.zeros(3), torch.zeros(3), torch.zeros(3))) > 0

def test_kl_is_scalar():
    assert gaussian_kl(torch.zeros(2), torch.zeros(2), torch.zeros(2), torch.zeros(2)).ndim == 0`,
    expectedOutput: "kl: 0.08",
    runCommand: "python rssm_elbo_kl_world_model.py && pytest test_rssm_elbo_kl_world_model.py",
    commonBugs: ["q와 p의 방향을 뒤집음", "log std와 variance를 혼동함", "KL beta를 0으로 두어 prior/posterior drift를 방치함"],
    extensionTask: "posterior/prior KL과 reconstruction loss를 합쳐 RSSM ELBO curve를 plot하라.",
  },
};

const labFor = (topic: TopicSpec): CodeLab => {
  const customLab = customLabs[topic.id];
  if (customLab) return customLab;
  const [a, b, c] = topic.args;
  const [sa, sb, sc] = topic.sample;
  return {
    id: `lab_${topic.id}`,
    title: topic.labTitle,
    language: "python" as const,
    theoryConnection: topic.equation,
    starterCode: `import numpy as np

def evaluate_case(${a}, ${b}, ${c}):
    # TODO: ${topic.title}의 핵심 metric을 구현하라.
    raise NotImplementedError

if __name__ == "__main__":
    value = evaluate_case(${sa}, ${sb}, ${sc})
    print("metric:", round(float(value), 3))`,
    solutionCode: `import numpy as np

def evaluate_case(${a}, ${b}, ${c}):
    return float(${topic.codeExpression})

if __name__ == "__main__":
    value = evaluate_case(${sa}, ${sb}, ${sc})
    print("metric:", round(float(value), 3))`,
    testCode: `from ${topic.id} import evaluate_case
import numpy as np

def test_metric_is_finite():
    value = evaluate_case(${sa}, ${sb}, ${sc})
    assert np.isfinite(value)

def test_metric_is_deterministic():
    assert evaluate_case(${sa}, ${sb}, ${sc}) == evaluate_case(${sa}, ${sb}, ${sc})

def test_metric_is_float_castable():
    assert isinstance(float(evaluate_case(${sa}, ${sb}, ${sc})), float)`,
    expectedOutput: "metric: see run output",
    runCommand: `python ${topic.id}.py && pytest test_${topic.id}.py`,
    commonBugs: topic.commonBugs,
    extensionTask: topic.extensionTask,
  };
};

const makeSession = (topic: TopicSpec): Session =>
  makeAdvancedSession({
    id: topic.id,
    part: topic.part,
    title: topic.title,
    difficulty: "hard",
    estimatedMinutes: 95,
    prerequisites: topic.prerequisites,
    objectives: topic.objectives,
    definition: topic.definition,
    whyItMatters: topic.whyItMatters,
    intuition: topic.intuition,
    equations: [
      { label: "Core equation", expression: topic.equation, terms: topic.terms, explanation: "핵심 계산식이다." },
      { label: "Design rule", expression: topic.designEquation, terms: topic.terms, explanation: "파라미터를 고르는 설계식이다." },
      { label: "Failure gate", expression: topic.failureEquation, terms: topic.terms, explanation: "실패 또는 안전 gate를 정량화한다." },
    ],
    derivation: topic.derivation,
    handCalculation: {
      problem: topic.handProblem,
      given: topic.handGiven,
      steps: topic.handSteps,
      answer: topic.handAnswer,
    },
    robotApplication: topic.robotApplication,
    lab: labFor(topic),
    visualization: {
      id: topic.visualId,
      title: topic.visualTitle,
      equation: topic.equation,
      parameters: topic.visualParams,
      normalCase: topic.normalCase,
      failureCase: topic.failureCase,
    },
    quiz: {
      id: topic.id,
      ...topic.quiz,
    },
    wrongTagLabel: topic.wrongTagLabel,
    nextSessions: topic.nextSessions,
  });

const topics: TopicSpec[] = [
  {
    id: "geometric_vs_analytic_jacobian",
    part: "Part 2. 로봇 수학",
    title: "Geometric vs Analytic Jacobian 구분",
    prerequisites: ["robot_math_jacobian_velocity_kinematics", "robot_math_3d_rotation_so3"],
    objectives: ["twist Jacobian과 Euler-rate Jacobian을 구분한다.", "singularity가 analytic Jacobian에만 생기는 경우를 설명한다.", "로봇팔 제어에서 어떤 Jacobian을 써야 하는지 판단한다."],
    definition: "Geometric Jacobian은 spatial twist를, analytic Jacobian은 선택한 자세 좌표의 시간미분을 mapping한다.",
    whyItMatters: "6DOF 로봇팔에서 Euler angle error를 그대로 twist 제어기에 넣으면 orientation singularity와 gain 폭주가 생긴다.",
    intuition: "같은 회전을 표현해도 twist는 물리적 각속도이고 Euler rate는 좌표계 눈금의 변화량이다.",
    equation: "\\dot x_g=J_g(q)\\dot q,\\quad \\dot x_a=T(\\phi)^{-1}J_g(q)\\dot q",
    designEquation: "J_a=T^{-1}J_g",
    failureEquation: "\\det T(\\phi)\\to0 \\Rightarrow J_a\\text{ singular}",
    terms: [["J_g", "geometric Jacobian"], ["J_a", "analytic Jacobian"], ["T", "orientation rate transform"]],
    derivation: [["twist", "joint velocity를 spatial/angular velocity로 mapping한다."], ["coordinates", "Euler/RPY 같은 최소 좌표 rate로 다시 변환한다."], ["singularity", "T가 singular이면 물리 twist는 가능해도 analytic rate가 폭주한다."], ["controller", "task-space wrench/twist 제어에는 geometric Jacobian을 우선 사용한다."]],
    handProblem: "yaw-pitch-roll에서 pitch가 89도이면 analytic Jacobian을 그대로 inverse해도 되는가?",
    handGiven: { pitch_deg: 89, cos_pitch: 0.017 },
    handSteps: ["T^{-1} 항에 1/cos(pitch)가 포함된다.", "1/0.017≈58.8로 작은 오차가 크게 증폭된다.", "twist error 기반 geometric Jacobian으로 바꾼다."],
    handAnswer: "그대로 inverse하면 위험하다. geometric Jacobian 또는 quaternion error를 쓴다.",
    robotApplication: "MoveIt Servo나 operational-space control에서 end-effector twist command를 joint velocity로 바꿀 때 geometric Jacobian을 사용한다.",
    labTitle: "Geometric vs Analytic Jacobian Conversion",
    args: ["angular_velocity", "pitch_rad", "eps"],
    sample: [0.5, 0.3, 0.001],
    codeExpression: "angular_velocity / max(abs(np.cos(pitch_rad)), eps)",
    commonBugs: ["Euler rate를 angular velocity로 착각함", "T inverse singularity를 무시함", "body/world frame Jacobian을 섞음"],
    extensionTask: "pitch를 -89~89도로 sweep하고 analytic rate gain을 plot하라.",
    visualId: "vis_geometric_analytic_jacobian_compare",
    visualTitle: "Geometric vs Analytic Jacobian 비교",
    visualParams: [param("pitch_angle", "\\theta", -89, 89, 30, "Euler pitch 각도"), param("joint_velocity", "\\dot q", -2, 2, 0.5, "joint velocity"), param("singularity_margin", "\\epsilon", 0.001, 0.2, 0.02, "T inverse 보호 margin")],
    normalCase: "pitch가 0도 근처이면 geometric/analytic rate가 비슷하다.",
    failureCase: "pitch가 90도에 가까우면 analytic rate가 폭주한다.",
    quiz: {
      conceptQuestion: "Geometric Jacobian과 Analytic Jacobian의 차이는?",
      conceptAnswer: "Geometric은 twist를, Analytic은 Euler/RPY 같은 자세 좌표 rate를 mapping한다.",
      calculationQuestion: "pitch=89도에서 1/cos(pitch)가 큰 이유는?",
      calculationAnswer: "cos(89도)≈0.017이므로 inverse 변환 gain이 약 58.8로 커진다.",
      codeQuestion: "singularity 보호 한 줄은?",
      codeAnswer: "rate = omega / max(abs(np.cos(pitch)), eps)",
      debugQuestion: "특정 자세에서 orientation 제어가 튀면 무엇을 의심하는가?",
      debugAnswer: "Euler analytic Jacobian singularity, frame mismatch, quaternion sign discontinuity를 확인한다.",
      visualQuestion: "pitch 슬라이더가 90도에 가까워질 때 analytic rate 곡선은?",
      visualAnswer: "geometric twist는 유한하지만 analytic rate는 급격히 증가한다.",
      robotQuestion: "6DOF 팔 속도 제어에는 무엇을 쓰는가?",
      robotAnswer: "물리 twist command에는 geometric Jacobian이나 damped inverse를 사용한다.",
      designQuestion: "orientation controller 설계 원칙은?",
      designAnswer: "quaternion/log-map error, geometric Jacobian, singularity damping, frame 일관성을 함께 둔다.",
    },
    wrongTagLabel: "Geometric/Analytic Jacobian 혼동",
    nextSessions: ["spatial_rnea_6dof_backward_pass", "admittance_vs_impedance_control"],
  },
  {
    id: "spatial_rnea_6dof_backward_pass",
    part: "Part 3. 로봇 동역학과 제어",
    title: "6DOF Spatial RNEA Backward Pass",
    prerequisites: ["robot_dynamics_newton_euler_recursive", "geometric_vs_analytic_jacobian"],
    objectives: ["spatial velocity/acceleration wrench recursion을 설명한다.", "6DOF backward pass에서 joint torque를 projection한다.", "planar RNEA와 Pinocchio/KDL RNEA의 차이를 이해한다."],
    definition: "Spatial RNEA는 각 link의 6D motion vector와 force vector를 forward/backward로 전파해 inverse dynamics torque를 계산한다.",
    whyItMatters: "planar 예제만 알면 실제 UR/Franka 같은 6DOF 팔의 velocity product term과 wrench propagation을 검증할 수 없다.",
    intuition: "손끝 payload의 힘과 각 link 관성력이 부모 joint로 거슬러 올라가며 누적된다.",
    equation: "f_i=I_i a_i+v_i\\times^*I_i v_i+\\sum X_{j,i}^Tf_j",
    designEquation: "\\tau_i=S_i^Tf_i",
    failureEquation: "|\\tau_i|>\\tau_{max,i}\\Rightarrow saturation",
    terms: [["f_i", "spatial wrench"], ["S_i", "joint motion subspace"], ["X", "spatial transform"]],
    derivation: [["forward", "base에서 말단까지 v_i, a_i를 계산한다."], ["link wrench", "관성 wrench와 velocity product term을 만든다."], ["backward", "child wrench를 parent frame으로 변환해 더한다."], ["projection", "S_i^T f_i로 joint torque를 얻는다."]],
    handProblem: "joint subspace S=[0,0,1,0,0,0], f=[1,2,3,4,5,6]이면 tau는?",
    handGiven: { S_z: 1, f_z: 3 },
    handSteps: ["tau=S^T f", "z 회전축 성분만 projection", "tau=3"],
    handAnswer: "tau=3",
    robotApplication: "ros2_control hardware loop에서 feedforward torque를 Pinocchio rnea(model,data,q,v,a)와 비교 검증한다.",
    labTitle: "3-link Spatial RNEA Backward Pass",
    args: ["child_wrench", "lever_arm", "joint_axis"],
    sample: [12, 0.25, 1],
    codeExpression: "child_wrench * lever_arm * joint_axis",
    commonBugs: ["force transform 방향을 반대로 씀", "motion cross와 force cross를 혼동함", "S_i projection 없이 wrench norm을 torque로 씀"],
    extensionTask: "3-link chain에서 distal payload를 바꿔 proximal torque 증가를 표로 기록하라.",
    visualId: "vis_spatial_rnea_6dof_torque_chain",
    visualTitle: "6DOF RNEA Torque Propagation per Joint",
    visualParams: [param("payload_mass", "m_p", 0, 10, 2, "말단 payload"), param("joint_velocity", "\\dot q", 0, 5, 1, "velocity product term"), param("link_index", "i", 1, 6, 3, "관찰 joint")],
    normalCase: "말단 wrench가 부모 joint로 변환되어 torque limit 안에 유지된다.",
    failureCase: "payload와 velocity가 커지면 proximal joint torque가 먼저 limit을 넘는다.",
    quiz: {
      conceptQuestion: "실제 로봇팔 RNEA에서 velocity product term이 왜 planar 계산보다 크게 나오는가?",
      conceptAnswer: "6D angular/linear motion coupling과 cross product wrench 항이 모든 link frame에서 누적되기 때문이다.",
      calculationQuestion: "S=[0,0,1,0,0,0], f_z=3이면 tau는?",
      calculationAnswer: "tau=S^T f=3이다.",
      codeQuestion: "joint torque projection 한 줄은?",
      codeAnswer: "tau_i = float(S_i.T @ f_i)",
      debugQuestion: "Pinocchio와 직접 구현 torque가 다르면 무엇을 확인하는가?",
      debugAnswer: "frame transform 방향, inertia origin, gravity sign, S_i axis, velocity product term을 확인한다.",
      visualQuestion: "payload를 키우면 torque propagation 그래프는?",
      visualAnswer: "말단보다 proximal joint torque가 더 크게 증가한다.",
      robotQuestion: "6DOF 팔 feedforward torque 검증 절차는?",
      robotAnswer: "URDF inertial 확인, zero velocity gravity check, Pinocchio/KDL 비교, low-speed replay 순서다.",
      designQuestion: "실시간 RNEA를 넣을 때 필요한 safety gate는?",
      designAnswer: "torque saturation, rate limit, watchdog, measured current 비교, fallback gravity compensation을 둔다.",
    },
    wrongTagLabel: "6DOF RNEA spatial dynamics 오류",
    nextSessions: ["lqr_bryson_rule_pole_design", "admittance_vs_impedance_control"],
  },
  {
    id: "lqr_bryson_rule_pole_design",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Bryson Rule for LQR Q/R 선택",
    prerequisites: ["lqr_riccati", "state_space_model"],
    objectives: ["허용 상태 오차와 입력 한계로 Q/R을 초기화한다.", "Q/R 변화가 closed-loop pole에 미치는 영향을 설명한다.", "LQR gain 튜닝을 단위 기반으로 수행한다."],
    definition: "Bryson rule은 각 상태와 입력의 허용 최대값의 역제곱으로 LQR weight를 초기화하는 경험적 설계 규칙이다.",
    whyItMatters: "Q/R을 감으로 고르면 단위가 다른 위치, 속도, 전류 항이 섞여 실제 actuator saturation을 만든다.",
    intuition: "많이 벗어나면 안 되는 변수일수록 작은 허용값을 주고 큰 penalty를 부여한다.",
    equation: "Q_{ii}=1/x_{i,max}^2,\\quad R_{jj}=1/u_{j,max}^2",
    designEquation: "u=-Kx,\\quad K=R^{-1}B^TP",
    failureEquation: "|u|>u_{max}\\Rightarrow LQR\\ command\\ invalid",
    terms: [["Q", "state penalty"], ["R", "input penalty"], ["x_max", "허용 상태 오차"]],
    derivation: [["normalize", "상태를 허용 최대값으로 나눠 무차원화한다."], ["penalty", "무차원 오차 제곱합이 cost가 된다."], ["riccati", "CARE/DARE로 P와 K를 구한다."], ["check", "pole 위치와 입력 saturation을 함께 확인한다."]],
    handProblem: "허용 위치 오차 0.1m, 입력 한계 2N이면 Q_x와 R은?",
    handGiven: { x_max: 0.1, u_max: 2 },
    handSteps: ["Q=1/0.1^2=100", "R=1/2^2=0.25", "입력 한계 검증을 별도로 한다."],
    handAnswer: "Q_x=100, R=0.25",
    robotApplication: "mobile base lateral error LQR이나 arm joint-space LQR에서 단위별 허용 오차로 초기 gain을 잡는다.",
    labTitle: "LQR Bryson Rule Experiment",
    args: ["state_limit", "input_limit", "scale"],
    sample: [0.1, 2, 1],
    codeExpression: "scale / (state_limit ** 2) + 1.0 / (input_limit ** 2)",
    commonBugs: ["허용값이 아니라 측정값으로 Q를 만듦", "R을 너무 작게 해 saturation 유발", "pole만 보고 입력 크기를 확인하지 않음"],
    extensionTask: "x_max와 u_max를 sweep하며 pole real part와 max input을 비교하라.",
    visualId: "vis_lqr_bryson_poles",
    visualTitle: "LQR Bryson Rule Q/R to Pole Movement",
    visualParams: [param("state_error_limit", "x_{max}", 0.01, 1, 0.1, "허용 상태 오차"), param("input_limit", "u_{max}", 0.1, 10, 2, "허용 입력"), param("plant_damping", "\\zeta_p", 0, 2, 0.2, "plant damping")],
    normalCase: "Q/R이 단위 기반으로 정해지고 pole이 안정 영역에 있다.",
    failureCase: "R이 작아 입력이 커지고 actuator saturation으로 실제 응답이 망가진다.",
    quiz: {
      conceptQuestion: "Bryson rule로 Q와 R을 설계하라.",
      conceptAnswer: "각 상태와 입력의 허용 최대값을 정하고 Q_ii=1/x_max^2, R_jj=1/u_max^2로 초기화한다.",
      calculationQuestion: "x_max=0.1, u_max=2이면 Q와 R은?",
      calculationAnswer: "Q=100, R=0.25이다.",
      codeQuestion: "Bryson Q diagonal 한 줄은?",
      codeAnswer: "Q = np.diag(1.0 / np.square(x_limits))",
      debugQuestion: "LQR이 시뮬레이션에서만 좋고 로봇에서 포화되면?",
      debugAnswer: "R weight, actuator limit, state scaling, command clamp, anti-windup fallback을 확인한다.",
      visualQuestion: "state error limit을 줄이면 pole은?",
      visualAnswer: "Q가 커져 더 빠른 pole로 이동하지만 입력도 커진다.",
      robotQuestion: "허용 상태 오차를 어떻게 정하는가?",
      robotAnswer: "센서 노이즈, task tolerance, actuator limit, safety margin을 함께 보고 정한다.",
      designQuestion: "LQR tuning acceptance 기준은?",
      designAnswer: "settling time, overshoot, max input, saturation ratio, disturbance recovery를 모두 만족해야 한다.",
    },
    wrongTagLabel: "LQR Bryson rule/Q-R 설계 오류",
    nextSessions: ["mpc_soft_constraint_infeasibility", "back_calculation_antiwindup_control"],
  },
  {
    id: "back_calculation_antiwindup_control",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Back-calculation Anti-windup",
    prerequisites: ["antiwindup_derivative_kick_pid", "pid_control_v2"],
    objectives: ["clamping과 back-calculation anti-windup을 비교한다.", "Ka gain이 integral recovery에 주는 영향을 설명한다.", "ros2_control PID 설정과 연결한다."],
    definition: "Back-calculation은 saturated command와 raw PID command 차이를 적분기에 되먹임해 windup을 부드럽게 빼는 anti-windup 방식이다.",
    whyItMatters: "clamping만 알면 ros2_control의 tracking_time_constant나 back-calculation 계열 설정을 이해하기 어렵다.",
    intuition: "명령이 잘렸다면 잘린 만큼 적분기에도 알려줘서 다음 명령이 포화 밖으로 오래 밀려나지 않게 한다.",
    equation: "I_{k+1}=I_k+e\\Delta t+K_a(u_{sat}-u_{raw})\\Delta t",
    designEquation: "K_a\\approx 1/T_t",
    failureEquation: "K_a\\gg K_i\\Rightarrow integral\\ oscillation",
    terms: [["K_a", "back-calculation gain"], ["u_sat", "포화 후 명령"], ["u_raw", "포화 전 명령"]],
    derivation: [["raw", "PID가 u_raw를 만든다."], ["saturate", "actuator limit으로 u_sat를 적용한다."], ["feedback", "u_sat-u_raw를 적분기에 되먹인다."], ["tune", "Ka가 너무 크면 적분기가 반대로 진동한다."]],
    handProblem: "I=1, e=0.5, dt=0.1, Ka=2, u_raw=4, u_sat=2이면 다음 I는?",
    handGiven: { I: 1, e: 0.5, dt: 0.1, Ka: 2, u_raw: 4, u_sat: 2 },
    handSteps: ["e dt=0.05", "Ka(u_sat-u_raw)dt=2*(-2)*0.1=-0.4", "I_next=1+0.05-0.4=0.65"],
    handAnswer: "I_next=0.65",
    robotApplication: "joint velocity/effort PID에서 saturation recovery가 느릴 때 clamping과 back-calculation을 비교한다.",
    labTitle: "Back-calculation vs Clamping Anti-windup",
    args: ["integral", "raw_minus_sat", "ka"],
    sample: [1, 2, 0.2],
    codeExpression: "integral - ka * raw_minus_sat",
    commonBugs: ["u_raw-u_sat 부호를 반대로 씀", "Ka를 Ki와 같은 단위로 착각함", "포화가 없을 때도 back-calc를 적용함"],
    extensionTask: "Ka를 0~5로 sweep해 recovery time과 overshoot를 비교하라.",
    visualId: "vis_backcalc_clamping_integral_compare",
    visualTitle: "Back-calculation vs Clamping Integral 비교",
    visualParams: [param("backcalc_gain", "K_a", 0, 5, 1, "back-calculation gain"), param("integral_limit", "I_{max}", 0.1, 5, 2, "clamping limit"), param("saturation_limit", "u_{max}", 0.1, 2, 0.8, "actuator limit")],
    normalCase: "포화 후 integral이 부드럽게 회복되어 overshoot가 작다.",
    failureCase: "Ka가 너무 크면 integral이 반대 방향으로 튀며 진동한다.",
    quiz: {
      conceptQuestion: "back-calculation anti-windup에서 gain Ka를 Ki보다 크게 설정하면 어떤 일이 생기는가?",
      conceptAnswer: "포화 오차를 너무 강하게 되먹여 적분기가 반대로 튀고 limit cycle이나 느린 수렴이 생길 수 있다.",
      calculationQuestion: "I=1, e dt=0.05, Ka(u_sat-u_raw)dt=-0.4이면 I_next는?",
      calculationAnswer: "0.65이다.",
      codeQuestion: "back-calculation 업데이트 한 줄은?",
      codeAnswer: "I += error * dt + Ka * (u_sat - u_raw) * dt",
      debugQuestion: "포화 해제 후 slow recovery가 남으면?",
      debugAnswer: "Ka/tracking time constant, I limit, actuator limit 반영, derivative kick 방지를 확인한다.",
      visualQuestion: "Ka를 키우면 clamping 대비 integral 곡선은?",
      visualAnswer: "적절하면 빨리 빠지고, 과하면 overshoot와 진동이 생긴다.",
      robotQuestion: "ros2_control에서 어떤 로그를 본다?",
      robotAnswer: "raw command, saturated command, integral state, joint limit violation, recovery time을 본다.",
      designQuestion: "clamping과 back-calculation 선택 기준은?",
      designAnswer: "단순 안정성은 clamping, 부드러운 recovery와 actuator tracking은 back-calculation을 쓰되 Ka를 sweep 검증한다.",
    },
    wrongTagLabel: "Back-calculation anti-windup 오류",
    nextSessions: ["admittance_vs_impedance_control", "cpp_realtime_control_loop_jitter"],
  },
  {
    id: "admittance_vs_impedance_control",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Admittance vs Impedance Control 구분",
    prerequisites: ["impedance_control_contact_depth", "contact_dynamics_friction_cone_grasp"],
    objectives: ["힘센서 유무에 따라 admittance/impedance 가능성을 판단한다.", "각 제어기의 입력/출력 causality를 구분한다.", "contact task에서 stiffness와 virtual mass를 설계한다."],
    definition: "Impedance는 motion error로 force-like command를 만들고, admittance는 measured force로 motion command를 만든다.",
    whyItMatters: "힘센서 없는 로봇에서 admittance를 가정하면 측정되지 않은 힘으로 위치 명령을 만들게 되어 접촉 안정성이 깨진다.",
    intuition: "impedance는 스프링처럼 밀면 힘을 내고, admittance는 힘을 재서 얼마나 물러날지 정한다.",
    equation: "M_d\\ddot x+B_d\\dot x+K_d(x-x_d)=F_{ext}",
    designEquation: "\\ddot x=(F_{meas}-B_d\\dot x-K_d(x-x_d))/M_d",
    failureEquation: "F_{meas}\\ missing\\Rightarrow admittance\\ invalid",
    terms: [["F_meas", "측정 힘"], ["M_d", "virtual mass"], ["K_d", "virtual stiffness"]],
    derivation: [["impedance", "위치/속도 오차에서 힘 또는 토크를 만든다."], ["admittance", "측정 힘에서 목표 위치 변화를 만든다."], ["sensor", "force/torque sensor나 추정기가 없으면 admittance 입력이 없다."], ["stability", "sampling, delay, contact stiffness가 안정성을 좌우한다."]],
    handProblem: "힘센서 없는 position-controlled arm에서 admittance와 impedance 중 가능한 것은?",
    handGiven: { force_sensor: "none", position_control: "available" },
    handSteps: ["admittance 입력은 F_meas", "F_meas가 없으면 직접 구현 불가", "position loop 위 stiffness shaping 또는 impedance-like compliance를 쓴다."],
    handAnswer: "힘센서 없는 경우 admittance는 직접 불가하며 impedance/position compliance 쪽을 선택한다.",
    robotApplication: "Franka/KUKA처럼 torque/force sensing이 있으면 admittance가 가능하고, 저가 position arm은 impedance-like position compliance로 제한된다.",
    labTitle: "Admittance Control Simulation with Force Sensor",
    args: ["measured_force", "virtual_mass", "damping"],
    sample: [5, 2, 1],
    codeExpression: "(measured_force - damping) / max(virtual_mass, 1e-9)",
    commonBugs: ["힘센서 없이 admittance를 설계함", "force sign을 반대로 씀", "virtual mass를 너무 작게 잡아 가속도 폭주"],
    extensionTask: "force delay를 추가하고 admittance/impedance step response를 비교하라.",
    visualId: "vis_admittance_impedance_contact_response",
    visualTitle: "Admittance vs Impedance Contact Response",
    visualParams: [param("virtual_mass", "M_d", 0.1, 20, 2, "admittance virtual mass"), param("stiffness", "K_d", 1, 200, 50, "impedance stiffness"), param("force_sensor_delay", "T_d", 0, 0.2, 0.02, "force measurement delay")],
    normalCase: "센서와 damping이 충분하면 접촉 힘이 안정적으로 제한된다.",
    failureCase: "힘센서가 없거나 delay가 크면 admittance 명령이 진동한다.",
    quiz: {
      conceptQuestion: "힘센서 없는 로봇에서 impedance와 admittance 중 어느 것이 가능한가?",
      conceptAnswer: "admittance는 measured force가 필요하므로 직접 불가능하고, impedance 또는 position compliance를 써야 한다.",
      calculationQuestion: "F=5N, M=2kg, damping term=1N이면 가속도는?",
      calculationAnswer: "(5-1)/2=2 m/s^2이다.",
      codeQuestion: "admittance acceleration 한 줄은?",
      codeAnswer: "xddot = (F_meas - B * xdot - K * (x - xd)) / M",
      debugQuestion: "접촉 시 admittance가 떨리면?",
      debugAnswer: "force sensor delay/noise, virtual mass, damping, sign, sampling rate를 확인한다.",
      visualQuestion: "force delay를 키우면 응답은?",
      visualAnswer: "접촉 힘과 위치가 phase lag로 진동하기 쉬워진다.",
      robotQuestion: "position-only arm에서 fragile grasp를 하려면?",
      robotAnswer: "낮은 stiffness position compliance, current limit, tactile/force proxy, slow approach를 쓴다.",
      designQuestion: "admittance/impedance 선택 절차는?",
      designAnswer: "센서 유무, actuator interface, contact stiffness, delay, safety force limit을 먼저 본다.",
    },
    wrongTagLabel: "Admittance/Impedance causality 오류",
    nextSessions: ["clf_cbf_qp_priority_resolution", "spatial_rnea_6dof_backward_pass"],
  },
];

const moreTopics: TopicSpec[] = [
  {
    id: "clip_contrastive_temperature_loss",
    part: "Part 7. Physical AI / Embodied AI",
    title: "CLIP Contrastive Loss와 Temperature",
    prerequisites: ["vlm_architecture_to_vla_bridge", "vla_architecture_concepts"],
    objectives: ["CLIP image-text contrastive loss를 계산한다.", "temperature가 gradient scale에 미치는 영향을 설명한다.", "VLM grounding threshold와 연결한다."],
    definition: "CLIP loss는 image/text embedding cosine similarity matrix에 temperature scaling을 적용한 양방향 cross entropy다.",
    whyItMatters: "CLIP 수식을 모르면 VLM embedding space와 VLA grounding confidence가 왜 threshold로 gate되는지 이해가 피상적이다.",
    intuition: "정답 image-text pair는 가깝게, batch 안의 다른 pair는 멀게 밀어내는 분류 문제다.",
    equation: "L=\\frac12(CE(\\text{softmax}(S/\\tau),y)+CE(\\text{softmax}(S^T/\\tau),y))",
    designEquation: "S_{ij}=\\frac{v_i^Tt_j}{\\|v_i\\|\\|t_j\\|}",
    failureEquation: "\\tau\\downarrow\\Rightarrow gradient\\ spike",
    terms: [["S", "similarity matrix"], ["tau", "temperature"], ["CE", "cross entropy"]],
    derivation: [["normalize", "image/text embedding을 unit vector로 만든다."], ["similarity", "batch pairwise cosine matrix S를 만든다."], ["scale", "S/tau로 logit sharpness를 조절한다."], ["bidirectional", "image->text와 text->image CE를 평균낸다."]],
    handProblem: "positive logit 2, negative logit 0, tau=0.5이면 logit gap은?",
    handGiven: { positive: 2, negative: 0, tau: 0.5 },
    handSteps: ["scaled positive=4", "scaled negative=0", "gap=4"],
    handAnswer: "temperature가 작아져 gap이 4로 커진다.",
    robotApplication: "open-vocabulary pick에서 text prompt와 camera crop embedding score를 계산하고 낮은 confidence는 VLA action으로 넘기지 않는다.",
    labTitle: "CLIP-style Contrastive Loss in PyTorch/Numpy",
    args: ["positive_logit", "negative_logit", "temperature"],
    sample: [2, 0, 0.5],
    codeExpression: "-np.log(np.exp(positive_logit / temperature) / (np.exp(positive_logit / temperature) + np.exp(negative_logit / temperature)))",
    commonBugs: ["embedding normalize를 빼먹음", "temperature를 곱하고 나누는 방향을 혼동함", "한 방향 CE만 계산함"],
    extensionTask: "tau를 0.01~1로 sweep하고 positive gradient 크기를 비교하라.",
    visualId: "vis_clip_temperature_embedding",
    visualTitle: "CLIP Embedding Temperature Interactive",
    visualParams: [param("temperature", "\\tau", 0.01, 1, 0.07, "contrastive temperature"), param("positive_similarity", "s_+", -1, 1, 0.6, "positive pair cosine"), param("negative_similarity", "s_-", -1, 1, 0.1, "hard negative cosine")],
    normalCase: "positive pair probability가 높고 hard negative가 분리된다.",
    failureCase: "temperature가 너무 작으면 gradient가 불안정하고 hard negative에 과민해진다.",
    quiz: {
      conceptQuestion: "CLIP contrastive loss에서 temperature τ가 작아지면 gradient가 어떻게 변하는가?",
      conceptAnswer: "logit이 S/τ로 커져 softmax가 sharp해지고 hard negative에 대한 gradient가 커질 수 있다.",
      calculationQuestion: "positive=2, negative=0, tau=0.5이면 scaled gap은?",
      calculationAnswer: "(2-0)/0.5=4이다.",
      codeQuestion: "cosine similarity matrix 한 줄은?",
      codeAnswer: "S = image_emb @ text_emb.T",
      debugQuestion: "grounding이 불안정하면?",
      debugAnswer: "embedding normalization, tau, prompt ambiguity, threshold, negative examples를 확인한다.",
      visualQuestion: "tau를 낮추면 확률 분포는?",
      visualAnswer: "더 날카로워져 top pair는 커지고 hard negative 변화에 민감해진다.",
      robotQuestion: "VLA로 넘기기 전 CLIP score를 어떻게 쓴다?",
      robotAnswer: "confidence threshold와 ambiguity margin을 통과한 grounding만 action planner로 보낸다.",
      designQuestion: "open vocabulary pick 검증은?",
      designAnswer: "prompt set, distractor objects, threshold sweep, false pick rate, stop/escalate policy를 평가한다.",
    },
    wrongTagLabel: "CLIP contrastive loss/temperature 오류",
    nextSessions: ["llava_cross_attention_vla_grounding", "pi0_openvla_diffusion_token_policy"],
  },
  {
    id: "llava_cross_attention_vla_grounding",
    part: "Part 7. Physical AI / Embodied AI",
    title: "LLaVA Cross-attention에서 VLA Grounding까지",
    prerequisites: ["clip_contrastive_temperature_loss", "vlm_architecture_to_vla_bridge"],
    objectives: ["vision token과 language token의 attention 흐름을 설명한다.", "cross-attention score가 grounding에 미치는 영향을 계산한다.", "VLA action head 앞의 ambiguity gate를 설계한다."],
    definition: "LLaVA류 VLM은 image encoder feature를 language model token space에 연결하고 attention으로 시각 근거를 language/action decision에 주입한다.",
    whyItMatters: "cross-attention 구조를 모르면 VLM 답변과 로봇 action grounding 사이의 failure mode를 찾기 어렵다.",
    intuition: "언어 token이 이미지 patch 중 어떤 곳을 봐야 하는지 attention weight로 고르는 과정이다.",
    equation: "\\text{Attn}(Q,K,V)=\\text{softmax}(QK^T/\\sqrt d)V",
    designEquation: "a=\\pi_\\theta(h_{vision},h_{language},s_{robot})",
    failureEquation: "margin=s_1-s_2<\\tau_m\\Rightarrow ask/stop",
    terms: [["Q,K,V", "attention projections"], ["d", "head dimension"], ["margin", "top grounding gap"]],
    derivation: [["encode", "image patch를 vision token으로 만든다."], ["project", "vision token을 LLM hidden dimension으로 맞춘다."], ["attend", "language token이 relevant patch에 attention한다."], ["gate", "grounding margin이 낮으면 robot action을 막는다."]],
    handProblem: "top score 0.62, second 0.55, margin threshold 0.1이면 action을 내도 되는가?",
    handGiven: { top: 0.62, second: 0.55, threshold: 0.1 },
    handSteps: ["margin=0.07", "0.07<0.1", "ambiguous grounding"],
    handAnswer: "stop 또는 clarification으로 보낸다.",
    robotApplication: "pick the red cup 명령에서 crop grounding margin이 낮으면 gripper trajectory를 만들지 않고 사용자 확인을 요청한다.",
    labTitle: "LLaVA Cross-attention Grounding Margin",
    args: ["top_score", "second_score", "threshold"],
    sample: [0.62, 0.55, 0.1],
    codeExpression: "top_score - second_score - threshold",
    commonBugs: ["attention heatmap을 곧바로 causal evidence로 해석함", "top-1 score만 보고 ambiguity margin을 무시함", "robot state token 없이 image-language만으로 action을 냄"],
    extensionTask: "top-k object scores를 넣고 margin 기반 stop/escalate policy를 구현하라.",
    visualId: "vis_llava_cross_attention_grounding",
    visualTitle: "LLaVA Cross-attention Grounding",
    visualParams: [param("attention_temperature", "\\tau_a", 0.01, 2, 0.5, "attention sharpness"), param("grounding_margin", "m_g", 0, 1, 0.1, "top-k margin"), param("state_token_weight", "w_s", 0, 1, 0.3, "robot state token 영향")],
    normalCase: "명령 token attention이 올바른 object patch에 집중하고 margin이 충분하다.",
    failureCase: "두 물체 score margin이 작아 grounding ambiguity가 action 오류로 이어진다.",
    quiz: {
      conceptQuestion: "LLaVA cross-attention 구조가 VLA에 필요한 이유는?",
      conceptAnswer: "언어 명령이 어떤 vision token을 근거로 삼는지 action head 전에 연결해야 하기 때문이다.",
      calculationQuestion: "top=0.62, second=0.55, threshold=0.1이면?",
      calculationAnswer: "margin=0.07<threshold라 action을 막는다.",
      codeQuestion: "attention 핵심 한 줄은?",
      codeAnswer: "weights = softmax(Q @ K.T / np.sqrt(d))",
      debugQuestion: "VLM은 맞는 말을 하지만 로봇이 다른 물체를 집으면?",
      debugAnswer: "grounding margin, crop proposal, frame transform, action head token alignment를 확인한다.",
      visualQuestion: "attention temperature를 낮추면?",
      visualAnswer: "heatmap이 날카로워지지만 잘못된 patch에 과신할 수 있다.",
      robotQuestion: "ambiguous grounding에서 로봇은?",
      robotAnswer: "stop, ask clarification, human confirm, safe hover pose 중 하나로 간다.",
      designQuestion: "VLA grounding gate 설계는?",
      designAnswer: "top-k margin, confidence threshold, spatial consistency, robot reachability, collision check를 통과시킨다.",
    },
    wrongTagLabel: "LLaVA cross-attention/VLA grounding 오류",
    nextSessions: ["pi0_openvla_diffusion_token_policy", "robot_foundation_model_deployment"],
  },
  {
    id: "rssm_elbo_kl_world_model",
    part: "Part 7. Physical AI / Embodied AI",
    title: "RSSM ELBO Loss와 KL Divergence",
    prerequisites: ["dreamer_rssm_world_model_implementation", "rl_ppo_sac_reward_shaping"],
    objectives: ["RSSM prior/posterior 구조를 설명한다.", "ELBO reconstruction/reward/KL loss를 유도한다.", "KL collapse와 model exploitation을 진단한다."],
    definition: "RSSM은 deterministic hidden state와 stochastic latent를 결합하고 posterior-prior KL로 latent dynamics를 정렬하는 world model이다.",
    whyItMatters: "ELBO와 KL 항 없이 Dreamer를 배우면 latent가 observation reconstruction에만 맞거나 actor가 model error를 exploit한다.",
    intuition: "실제 관측으로 본 latent와 모델이 상상한 latent가 너무 멀어지지 않도록 붙잡는 손실이다.",
    equation: "L= L_{recon}+L_{reward}+\\beta KL(q(z_t|h_t,o_t)\\|p(z_t|h_t))",
    designEquation: "h_t=f(h_{t-1},z_{t-1},a_{t-1})",
    failureEquation: "KL\\to0\\ or\\ KL\\to\\infty\\Rightarrow latent\\ collapse/drift",
    terms: [["q", "posterior"], ["p", "prior"], ["KL", "latent regularizer"]],
    derivation: [["posterior", "현재 observation으로 z_t posterior를 만든다."], ["prior", "이전 latent/action만으로 z_t prior를 예측한다."], ["ELBO", "reconstruction likelihood와 KL regularizer를 합친다."], ["imagine", "actor는 prior dynamics 안에서 rollout하므로 KL 품질이 중요하다."]],
    handProblem: "KL weight가 0이면 latent space에 어떤 일이 생기는가?",
    handGiven: { beta: 0 },
    handSteps: ["posterior와 prior 정렬 penalty가 없다.", "imagination rollout prior가 observation posterior와 멀어진다.", "actor가 부정확한 latent dynamics를 exploit한다."],
    handAnswer: "latent drift/model exploitation 위험이 커진다.",
    robotApplication: "manipulation video logs로 world model을 학습할 때 prior/posterior KL과 rollout uncertainty를 safety gate로 사용한다.",
    labTitle: "RSSM Posterior/Prior KL Divergence",
    args: ["posterior_mean", "prior_mean", "posterior_std"],
    sample: [0.2, 0.0, 0.5],
    codeExpression: "0.5 * (((posterior_mean - prior_mean) / max(posterior_std, 1e-9)) ** 2)",
    commonBugs: ["posterior와 prior 인자를 뒤집음", "KL weight를 0으로 둬 latent drift를 방치함", "imagination horizon을 길게만 늘림"],
    extensionTask: "KL beta와 imagination horizon을 sweep해 reward prediction error를 비교하라.",
    visualId: "vis_rssm_latent_state_rollout",
    visualTitle: "RSSM Latent Trajectory vs State Trajectory",
    visualParams: [param("kl_beta", "\\beta", 0, 5, 1, "KL weight"), param("imagination_horizon", "H", 1, 50, 15, "latent rollout horizon"), param("model_uncertainty", "\\sigma_m", 0, 1, 0.2, "model uncertainty gate")],
    normalCase: "posterior와 prior가 정렬되고 rollout uncertainty가 낮게 유지된다.",
    failureCase: "KL이 무너지면 imagined trajectory가 실제 state와 빠르게 벌어진다.",
    quiz: {
      conceptQuestion: "RSSM에서 KL divergence 항이 없으면 latent space에 어떤 일이 생기는가?",
      conceptAnswer: "posterior와 prior가 정렬되지 않아 imagination rollout이 실제 observation latent와 drift한다.",
      calculationQuestion: "mean 차이 0.2, std 0.5이면 단순 KL quadratic은?",
      calculationAnswer: "0.5*(0.2/0.5)^2=0.08이다.",
      codeQuestion: "Gaussian KL의 핵심 항은?",
      codeAnswer: "kl = 0.5 * ((mu_q - mu_p) / sigma_q) ** 2",
      debugQuestion: "Dreamer에서 imagination reward만 높고 real rollout이 나쁘면?",
      debugAnswer: "KL, uncertainty, reward predictor error, horizon, ensemble disagreement를 확인한다.",
      visualQuestion: "horizon을 길게 하면?",
      visualAnswer: "model uncertainty와 latent-real drift가 누적된다.",
      robotQuestion: "world model action을 실제 로봇에 보내기 전 gate는?",
      robotAnswer: "uncertainty threshold, action limit, CBF, logged replay consistency를 통과해야 한다.",
      designQuestion: "RSSM 검증 순서는?",
      designAnswer: "one-step prediction, multi-step rollout, KL curve, reward error, uncertainty calibration, low-speed robot test 순서다.",
    },
    wrongTagLabel: "RSSM ELBO/KL world model 오류",
    nextSessions: ["pi0_openvla_diffusion_token_policy", "domain_randomization_adr_gap_design"],
  },
  {
    id: "pi0_openvla_diffusion_token_policy",
    part: "Part 7. Physical AI / Embodied AI",
    title: "π0/OpenVLA: Diffusion Policy vs Token Action",
    prerequisites: ["robot_foundation_model_deployment", "llava_cross_attention_vla_grounding"],
    objectives: ["diffusion action denoising과 token action decoding을 비교한다.", "inference latency와 action smoothness trade-off를 설명한다.", "robot foundation policy의 safety wrapper를 설계한다."],
    definition: "Diffusion policy는 noisy continuous action trajectory를 반복 denoise하고, token action policy는 discrete action token을 autoregressive하게 decode한다.",
    whyItMatters: "π0/OpenVLA 계열을 실제 제어 주기에 넣을 때 latency, smoothness, quantization, safety gate가 다르다.",
    intuition: "diffusion은 여러 번 다듬어 부드러운 경로를 만들고, token policy는 언어 모델처럼 다음 action symbol을 빠르게 고른다.",
    equation: "a_{k-1}=a_k-\\epsilon_\\theta(o,a_k,k)",
    designEquation: "T_{infer}=N_{steps}T_{net}+T_{post}",
    failureEquation: "T_{infer}>T_{control}\\Rightarrow stale\\ action",
    terms: [["a_k", "noisy action"], ["N_steps", "denoise steps"], ["T_infer", "inference latency"]],
    derivation: [["token", "action을 discrete token 또는 bin으로 encode한다."], ["diffusion", "continuous trajectory noise를 단계적으로 제거한다."], ["latency", "denoise step 수가 control period와 충돌한다."], ["safety", "출력 action은 limit/collision gate를 통과해야 한다."]],
    handProblem: "denoise 8 step, net 12ms이면 inference latency는?",
    handGiven: { steps: 8, net_ms: 12 },
    handSteps: ["T=8*12ms", "T=96ms", "50Hz control period 20ms보다 크다."],
    handAnswer: "96ms로 50Hz direct control에는 늦다.",
    robotApplication: "foundation policy를 shadow mode로 먼저 돌리고, action smoothing/latency budget/fallback controller를 붙인다.",
    labTitle: "π0-style Diffusion Policy Step",
    args: ["noisy_action", "predicted_noise", "step_size"],
    sample: [1.0, 0.3, 0.2],
    codeExpression: "noisy_action - step_size * predicted_noise",
    commonBugs: ["denoise step latency를 무시함", "token action quantization error를 clamp하지 않음", "safety wrapper 없이 바로 actuator로 보냄"],
    extensionTask: "denoise step 수와 action smoothness/latency를 표로 비교하라.",
    visualId: "vis_diffusion_policy_denoising",
    visualTitle: "Diffusion Policy Denoising Trajectory",
    visualParams: [param("denoise_steps", "N", 1, 32, 8, "denoising steps"), param("network_latency_ms", "T_{net}", 1, 50, 12, "single forward latency"), param("action_smoothness", "\\lambda_s", 0, 10, 1, "smoothness penalty")],
    normalCase: "denoise step이 budget 안에서 trajectory를 부드럽게 만든다.",
    failureCase: "step 수가 많아 stale action이 되고 fallback이 필요하다.",
    quiz: {
      conceptQuestion: "π0의 diffusion policy와 token action policy의 inference latency 차이는?",
      conceptAnswer: "diffusion은 여러 denoise step 때문에 latency가 커질 수 있고 token action은 decode step/sequence length에 좌우된다.",
      calculationQuestion: "8 step, step당 12ms이면?",
      calculationAnswer: "96ms이다.",
      codeQuestion: "한 denoise step은?",
      codeAnswer: "a = a - step_size * eps_theta(obs, a, k)",
      debugQuestion: "robot action이 늦게 따라오면?",
      debugAnswer: "inference latency, queue stale action, timestamp, denoise steps, fallback controller를 확인한다.",
      visualQuestion: "denoise step을 늘리면?",
      visualAnswer: "smoothness는 좋아질 수 있지만 latency가 증가한다.",
      robotQuestion: "foundation action 배포 전 필수 wrapper는?",
      robotAnswer: "action limit, collision check, CBF, watchdog, stale timestamp rejection이다.",
      designQuestion: "diffusion vs token 선택 기준은?",
      designAnswer: "control frequency, action continuity, hardware latency, dataset action representation, safety gate 비용으로 고른다.",
    },
    wrongTagLabel: "π0/OpenVLA action policy 오류",
    nextSessions: ["domain_randomization_adr_gap_design", "safety_watchdog_timer"],
  },
  {
    id: "ekf_chi_squared_outlier_rejection",
    part: "Part 4. 자율주행과 SLAM",
    title: "Chi-squared Outlier Rejection for EKF",
    prerequisites: ["ekf_observation_jacobian", "ukf_sigma_point_localization"],
    objectives: ["Mahalanobis distance와 chi-squared gate를 계산한다.", "outlier update를 reject하는 이유를 설명한다.", "EKF 발산 디버깅 절차를 세운다."],
    definition: "Chi-squared outlier rejection은 innovation의 Mahalanobis distance가 자유도별 임계값을 넘으면 measurement update를 적용하지 않는 gate다.",
    whyItMatters: "잘못된 GPS/landmark 관측을 EKF가 그대로 먹으면 covariance가 거짓으로 줄고 pose가 순간적으로 발산한다.",
    intuition: "예측 분포가 설명하기엔 너무 먼 관측은 센서 오류로 보고 버린다.",
    equation: "d^2=\\nu^TS^{-1}\\nu",
    designEquation: "d^2<\\chi^2_{k,\\alpha}",
    failureEquation: "d^2>\\chi^2\\Rightarrow reject\\ update",
    terms: [["nu", "innovation"], ["S", "innovation covariance"], ["chi2", "gate threshold"]],
    derivation: [["innovation", "z-h(x)를 계산한다."], ["covariance", "S=HPH^T+R를 만든다."], ["distance", "d^2=nu^T S^-1 nu를 계산한다."], ["gate", "자유도 k의 chi2 threshold와 비교한다."]],
    handProblem: "2D measurement에서 d^2=8, 95% threshold=5.99이면 update?",
    handGiven: { d2: 8, chi2_95: 5.99 },
    handSteps: ["8>5.99", "outlier로 판단", "update reject 또는 downweight"],
    handAnswer: "update를 적용하지 않는다.",
    robotApplication: "robot_localization GPS fusion, landmark EKF, visual odometry fusion에서 innovation gate 로그를 남긴다.",
    labTitle: "Chi-squared Outlier Rejection + EKF",
    args: ["innovation", "innovation_std", "chi2_threshold"],
    sample: [4, 1, 5.99],
    codeExpression: "(innovation / max(innovation_std, 1e-9)) ** 2 - chi2_threshold",
    commonBugs: ["Euclidean distance만 보고 covariance를 무시함", "threshold 자유도를 틀림", "reject 대신 covariance를 줄여버림"],
    extensionTask: "outlier ratio를 바꿔 EKF RMSE와 reject count를 비교하라.",
    visualId: "vis_chi_squared_outlier_boundary",
    visualTitle: "Chi-squared Outlier Boundary Interactive",
    visualParams: [param("mahalanobis_d2", "d^2", 0, 30, 5, "Mahalanobis distance"), param("measurement_dof", "k", 1, 6, 2, "measurement degree of freedom"), param("confidence_level", "\\alpha", 0.5, 0.999, 0.95, "gate confidence")],
    normalCase: "innovation ellipse 안의 관측만 update에 사용한다.",
    failureCase: "boundary 밖 outlier를 update하면 pose와 covariance가 발산한다.",
    quiz: {
      conceptQuestion: "이 Mahalanobis distance가 chi2 boundary를 넘으면 어떻게 하는가?",
      conceptAnswer: "measurement update를 reject하거나 robust weighting하고 로그에 outlier로 남긴다.",
      calculationQuestion: "d^2=8, threshold=5.99이면?",
      calculationAnswer: "8이 더 크므로 reject한다.",
      codeQuestion: "Mahalanobis distance 한 줄은?",
      codeAnswer: "d2 = float(nu.T @ np.linalg.inv(S) @ nu)",
      debugQuestion: "EKF innovation이 5σ를 넘었다면 update를 적용해야 하는가?",
      debugAnswer: "일반적으로 gate를 넘으면 적용하지 않고 sensor timestamp/frame/R 설정을 확인한다.",
      visualQuestion: "confidence level을 높이면 gate는?",
      visualAnswer: "ellipse가 커져 더 많은 관측을 받아들인다.",
      robotQuestion: "GPS jump가 들어오면?",
      robotAnswer: "innovation gate로 reject하고 covariance/R/timestamp를 기록한다.",
      designQuestion: "outlier rejection 설계 순서는?",
      designAnswer: "자유도 결정, chi2 threshold 선택, reject/downweight 정책, 로그/alert, fallback odometry를 둔다.",
    },
    wrongTagLabel: "EKF chi-squared outlier rejection 오류",
    nextSessions: ["ukf_alpha_beta_kappa_tuning", "isam2_incremental_factor_graph"],
  },
];

const remainingTopics: TopicSpec[] = [
  {
    id: "dh_craig_spong_convention_guard",
    part: "Part 2. 로봇 수학",
    title: "Craig/Spong DH Convention 혼용 방지",
    prerequisites: ["dh_parameter", "robot_math_homogeneous_transform_se3"],
    objectives: ["standard DH와 modified DH의 곱셈 순서를 구분한다.", "Craig/Spong convention 혼용이 FK pose를 어떻게 바꾸는지 계산한다.", "URDF frame과 DH table의 index convention을 문서화한다."],
    definition: "DH convention guard는 standard DH와 modified DH를 명시적으로 구분해 한 kinematic chain 안에서 Craig/Spong 표기와 index를 섞지 않도록 막는 검증 절차다.",
    whyItMatters: "교재 convention을 섞으면 FK가 거의 맞아 보이다가 특정 자세에서 tool frame이 크게 틀어져 IK, collision, calibration이 모두 흔들린다.",
    intuition: "같은 회전과 이동이라도 순서를 바꾸면 다른 문으로 나가는 것처럼, DH convention은 transform 곱셈 순서 자체를 정한다.",
    equation: "A_{std}=R_z(\\theta)T_z(d)T_x(a)R_x(\\alpha)",
    designEquation: "A_{mod}=R_x(\\alpha)T_x(a)R_z(\\theta)T_z(d)",
    failureEquation: "A_{std}\\ne A_{mod}\\Rightarrow convention\\ mixed",
    terms: [["theta", "joint angle"], ["a", "link length"], ["alpha", "link twist"]],
    derivation: [["standard", "Spong/Craig standard DH는 z transform 뒤 x transform을 적용한다."], ["modified", "Craig modified DH는 이전 x축 기준 transform 뒤 joint z transform을 둔다."], ["compare", "같은 숫자라도 일반적으로 A_std와 A_mod는 다르다."], ["guard", "파일마다 convention을 enum으로 두고 mixed value를 error로 처리한다."]],
    handProblem: "theta, d, a, alpha가 모두 일반값일 때 standard와 modified DH는 항상 같은가?",
    handGiven: { theta: 0.3, d: 0.2, a: 0.4, alpha: -0.5 },
    handSteps: ["matrix multiplication은 교환법칙이 성립하지 않는다.", "RzTzTxRx와 RxTxRzTz 순서가 다르다.", "따라서 일반적으로 pose가 다르다."],
    handAnswer: "같지 않다. convention을 섞으면 FK가 틀어진다.",
    robotApplication: "URDF에서 뽑은 frame과 교재 DH table을 비교할 때 convention column을 명시하고 golden FK pose regression test를 둔다.",
    labTitle: "Craig/Spong DH Convention Guard",
    args: ["theta", "link_length", "twist"],
    sample: [0.3, 0.4, -0.5],
    codeExpression: "abs(theta * link_length * np.sin(twist))",
    commonBugs: ["standard DH와 modified DH를 한 chain에서 섞음", "a_i/alpha_i index를 link i와 i-1 사이에서 바꿔 씀", "URDF optical/tool frame 보정을 DH table에 중복 반영함"],
    extensionTask: "같은 2-link arm을 standard/modified DH 두 방식으로 계산하고 FK pose regression test를 만든다.",
    visualId: "vis_dh_craig_spong_convention",
    visualTitle: "Craig/Spong DH Convention Difference",
    visualParams: [param("theta", "\\theta", -3.14, 3.14, 0.3, "joint angle"), param("link_length_a", "a", 0, 2, 0.4, "link length"), param("link_twist_alpha", "\\alpha", -3.14, 3.14, -0.5, "link twist")],
    normalCase: "한 convention으로 모든 link transform을 일관되게 계산한다.",
    failureCase: "standard와 modified를 섞으면 tool frame pose가 자세별로 달라진다.",
    quiz: {
      conceptQuestion: "Craig/Spong DH convention을 섞으면 왜 위험한가?",
      conceptAnswer: "transform 곱셈 순서와 parameter index가 달라 같은 숫자라도 서로 다른 FK pose를 만들기 때문이다.",
      calculationQuestion: "RzTzTxRx와 RxTxRzTz가 일반적으로 같은가?",
      calculationAnswer: "아니다. matrix multiplication은 교환법칙이 없어 일반적으로 다르다.",
      codeQuestion: "convention guard의 핵심은?",
      codeAnswer: "if convention not in {'standard','modified'}: raise ValueError(...)",
      debugQuestion: "FK가 특정 자세에서만 tool frame offset을 보이면?",
      debugAnswer: "DH convention, a/alpha index, URDF fixed joint/tool transform 중복 적용을 확인한다.",
      visualQuestion: "alpha를 0이 아닌 값으로 키우면 standard/modified pose 차이는?",
      visualAnswer: "rotation/translation 순서 차이가 드러나 pose 차이가 커진다.",
      robotQuestion: "실제 로봇에 DH table을 적용하기 전 무엇을 해야 하나?",
      robotAnswer: "URDF FK와 여러 golden joint pose에서 tool transform을 비교하고 convention을 명시한다.",
      designQuestion: "DH convention 안전 설계는?",
      designAnswer: "convention enum, golden FK tests, URDF comparison, frame diagram, tool offset 분리 문서화를 둔다.",
    },
    wrongTagLabel: "DH convention 혼용 오류",
    nextSessions: ["ik_solution_selection_joint_limit_continuity", "geometric_vs_analytic_jacobian"],
  },
  {
    id: "ik_solution_selection_joint_limit_continuity",
    part: "Part 2. 로봇 수학",
    title: "IK 복수해 선택: Joint Limit와 연속성",
    prerequisites: ["two_link_fk_ik", "null_space_redundancy_resolution"],
    objectives: ["elbow-up/down 같은 IK 복수해를 생성한다.", "joint limit과 이전 자세 연속성으로 해를 선택한다.", "solution flip과 FK 재검증 실패를 디버깅한다."],
    definition: "IK 복수해 선택은 도달 가능한 여러 joint 후보 중 joint limit, 이전 timestep과의 거리, collision/manipulability 비용을 최소화하는 해를 고르는 절차다.",
    whyItMatters: "첫 번째 IK 해를 그대로 쓰면 elbow flip, joint limit 접근, self-collision이 생겨 실제 로봇팔 trajectory가 끊긴다.",
    intuition: "목표는 같아도 팔꿈치가 위/아래로 갈 수 있으니, 지금 자세에서 가장 자연스럽고 안전한 쪽을 고른다.",
    equation: "q^*=\\arg\\min_q \\|q-q_{prev}\\|^2+w_l\\Phi_{limit}(q)",
    designEquation: "q_{min}\\le q\\le q_{max}",
    failureEquation: "\\Delta q\\gg threshold\\Rightarrow elbow\\ flip",
    terms: [["q_prev", "previous joint state"], ["Phi_limit", "joint limit penalty"], ["q*", "selected IK solution"]],
    derivation: [["candidates", "해석적 IK 또는 numerical IK로 후보를 만든다."], ["filter", "joint limit과 collision을 먼저 제거한다."], ["score", "이전 자세와의 거리와 limit center penalty를 계산한다."], ["verify", "선택한 q를 FK로 되돌려 task error를 확인한다."]],
    handProblem: "이전 q=[0,1]이고 후보 [0.1,1.1], [2.9,-2.8] 중 무엇을 고르는가?",
    handGiven: { q_prev: "[0,1]", candidate_a: "[0.1,1.1]", candidate_b: "[2.9,-2.8]" },
    handSteps: ["candidate_a가 이전 자세에 훨씬 가깝다.", "candidate_b는 큰 jump와 limit 위험이 있다.", "candidate_a 선택"],
    handAnswer: "[0.1,1.1]이 연속성과 limit 측면에서 안전하다.",
    robotApplication: "MoveIt/IKFast/custom DLS IK 결과를 controller로 보내기 전 joint limit, velocity continuity, collision cost로 후보를 정렬한다.",
    labTitle: "IK Multiple Solution Selection by Limits and Continuity",
    args: ["continuity_cost", "limit_margin", "collision_cost"],
    sample: [0.1, 0.5, 0.0],
    codeExpression: "continuity_cost + 1.0 / max(limit_margin, 1e-9) + collision_cost",
    commonBugs: ["elbow-up/down 첫 후보를 무조건 사용함", "limit 밖 해를 clamp한 뒤 FK error를 재검증하지 않음", "q wrap-around와 연속성을 고려하지 않아 갑자기 큰 joint jump가 생김"],
    extensionTask: "원형 target trajectory에서 복수 IK 후보를 만들고 continuity 선택 전후의 joint jump를 비교하라.",
    visualId: "vis_ik_solution_selection_limits",
    visualTitle: "IK Multiple Solution Selection by Limits",
    visualParams: [param("continuity_weight", "w_c", 0, 10, 1, "continuity cost weight"), param("joint_limit_margin", "m_q", 0.01, 1, 0.3, "distance to joint limit"), param("elbow_flip_threshold", "\\Delta q_{max}", 0.1, 6.28, 1.0, "allowed joint jump")],
    normalCase: "joint limit 안쪽에서 이전 자세와 연속적인 IK 해를 선택한다.",
    failureCase: "해 선택 기준이 없으면 elbow flip과 joint limit violation이 생긴다.",
    quiz: {
      conceptQuestion: "IK 복수해를 고를 때 첫 번째 해만 쓰면 왜 위험한가?",
      conceptAnswer: "joint limit, collision, 이전 자세 연속성을 무시해 elbow flip이나 unsafe posture가 생길 수 있다.",
      calculationQuestion: "이전 q와 가장 가까운 후보를 고르는 비용은?",
      calculationAnswer: "||q-q_prev||^2에 joint limit/collision penalty를 더해 최소값을 선택한다.",
      codeQuestion: "joint limit 후보 필터 한 줄은?",
      codeAnswer: "valid = np.all((q >= q_min) & (q <= q_max))",
      debugQuestion: "trajectory 중 팔꿈치가 갑자기 뒤집히면?",
      debugAnswer: "continuity cost, angle wrapping, candidate sorting, velocity limit을 확인한다.",
      visualQuestion: "continuity_weight를 키우면?",
      visualAnswer: "이전 자세와 가까운 해를 더 강하게 선호해 elbow flip이 줄어든다.",
      robotQuestion: "실제 팔에 IK 해를 보내기 전 검사는?",
      robotAnswer: "FK task error, joint/velocity/acceleration limit, collision, continuity를 확인한다.",
      designQuestion: "IK selection pipeline은?",
      designAnswer: "candidate generation, limit/collision filter, continuity scoring, FK verify, trajectory smoothing, fallback fail 순서다.",
    },
    wrongTagLabel: "IK 복수해 선택/연속성 오류",
    nextSessions: ["rank_nullity_pseudoinverse_ik", "jerk_continuous_quintic_trajectory"],
  },
  {
    id: "rank_nullity_pseudoinverse_ik",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Rank-nullity Theorem과 Rank-deficient Pseudo-inverse IK",
    prerequisites: ["svd_condition_number", "null_space_redundancy_resolution"],
    objectives: ["rank-nullity theorem으로 IK 자유도를 계산한다.", "rank-deficient Jacobian에서 pseudo-inverse 해가 unique하지 않은 이유를 설명한다.", "null-space projection으로 secondary objective를 넣는다."],
    definition: "Rank-nullity theorem은 rank(J)+dim(null(J))=n을 보장하며, rank-deficient Jacobian에서는 null space 방향으로 움직여도 task velocity가 변하지 않아 IK 해가 무한히 많다.",
    whyItMatters: "로봇팔 singularity나 redundant arm IK에서 minimum-norm 해만 보면 elbow posture, joint limit 회피, manipulability 개선을 설계할 수 없다.",
    intuition: "손끝 속도를 그대로 두면서 팔꿈치만 움직일 수 있는 숨은 자유도가 null space다.",
    equation: "\\dot q=J^+\\dot x+(I-J^+J)z",
    designEquation: "rank(J)+nullity(J)=n",
    failureEquation: "rank(J)<m\\Rightarrow task\\ direction\\ lost",
    terms: [["J", "Jacobian"], ["J^+", "Moore-Penrose pseudo-inverse"], ["z", "secondary objective"]],
    derivation: [["rank", "SVD singular value로 task를 움직일 수 있는 독립 방향 수를 센다."], ["nullity", "joint dimension n에서 rank를 빼 null space 차원을 얻는다."], ["minimum norm", "J^+xdot은 가장 작은 norm의 한 해다."], ["family", "(I-J^+J)z를 더해도 Jdq는 변하지 않아 해가 무한히 많다."]],
    handProblem: "J가 1x3이고 rank=1이면 nullity는?",
    handGiven: { n: 3, rank: 1 },
    handSteps: ["rank-nullity: rank+nullity=n", "nullity=3-1", "=2"],
    handAnswer: "nullity=2이며 task를 바꾸지 않는 joint motion이 2차원 존재한다.",
    robotApplication: "7DOF Franka 팔에서 손끝 pose를 유지하며 elbow를 joint limit 밖으로 밀어내는 secondary objective를 넣는다.",
    labTitle: "Rank-deficient Jacobian Null-space IK",
    args: ["rank", "joint_dim", "secondary_gain"],
    sample: [1, 3, 0.5],
    codeExpression: "(joint_dim - rank) * secondary_gain",
    commonBugs: ["rank-deficient에서도 IK 해가 하나라고 생각함", "null-space motion을 task-space에 직접 더함", "pseudo-inverse damping 없이 singularity에서 inverse를 계산함"],
    extensionTask: "rank-deficient 3DOF Jacobian에서 z 방향을 바꿔도 Jdq가 같은지 확인하라.",
    visualId: "vis_rank_nullity_nullspace_ik",
    visualTitle: "Rank-deficient IK Null-space Projection",
    visualParams: [param("jacobian_rank", "rank(J)", 0, 3, 1, "Jacobian rank"), param("joint_dimension", "n", 1, 7, 3, "joint dimension"), param("secondary_gain", "k_0", 0, 2, 0.5, "null-space posture gain")],
    normalCase: "null-space projection을 더해도 end-effector task velocity가 유지된다.",
    failureCase: "projector가 틀리면 secondary motion이 task error를 만든다.",
    quiz: {
      conceptQuestion: "rank-deficient Jacobian에서 IK 해가 unique하지 않은 이유는?",
      conceptAnswer: "null space 방향 motion은 Jdq=0이므로 task를 바꾸지 않는 자유도가 남아 해가 무한히 많다.",
      calculationQuestion: "n=3, rank=1이면 nullity는?",
      calculationAnswer: "3-1=2이다.",
      codeQuestion: "null-space projector 한 줄은?",
      codeAnswer: "N = np.eye(J.shape[1]) - np.linalg.pinv(J) @ J",
      debugQuestion: "secondary objective를 넣자 손끝이 움직이면?",
      debugAnswer: "projector 차원, pseudo-inverse damping, J @ N ≈ 0 여부를 확인한다.",
      visualQuestion: "secondary_gain을 키우면?",
      visualAnswer: "정상 projector에서는 elbow/posture만 더 움직이고 task velocity는 유지된다.",
      robotQuestion: "7DOF 팔에서 null space를 어디에 쓰나?",
      robotAnswer: "joint limit 회피, elbow posture, manipulability maximization에 쓴다.",
      designQuestion: "redundant IK 설계 절차는?",
      designAnswer: "task Jacobian rank 확인, damped pseudo-inverse, null-space objective, joint limit clamp, task error regression test 순서다.",
    },
    wrongTagLabel: "Rank-nullity/null-space IK 오류",
    nextSessions: ["geometric_vs_analytic_jacobian", "spatial_rnea_6dof_backward_pass"],
  },
  {
    id: "kkt_osqp_active_constraints",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "KKT Multiplier와 OSQP Active Constraint",
    prerequisites: ["convex_qp_lagrange_duality", "cbf_qp_safety_filter"],
    objectives: ["KKT complementarity로 active constraint를 판정한다.", "OSQP dual variable result.y를 해석한다.", "CBF-QP에서 어떤 safety constraint가 실제로 걸렸는지 로그로 확인한다."],
    definition: "KKT multiplier는 constraint가 최적해에서 얼마나 강하게 작동하는지 나타내며, complementarity lambda_i g_i(x)=0으로 active/inactive constraint를 구분한다.",
    whyItMatters: "CBF-QP나 MPC가 안전하게 동작하는지 확인하려면 solver success만이 아니라 어떤 constraint가 active였는지 dual variable로 설명할 수 있어야 한다.",
    intuition: "벽에 닿지 않은 constraint는 힘을 내지 않고, 벽에 닿은 constraint만 양의 multiplier로 제어 명령을 밀어낸다.",
    equation: "\\lambda_i g_i(x)=0,\\quad \\lambda_i\\ge0",
    designEquation: "\\lambda_i>\\epsilon\\Rightarrow constraint_i\\ active",
    failureEquation: "active\\ safety\\ constraint\\ missing\\Rightarrow unsafe\\ QP",
    terms: [["lambda", "KKT multiplier"], ["g_i", "inequality constraint"], ["y", "OSQP dual variable"]],
    derivation: [["stationarity", "objective gradient와 constraint gradient의 균형을 세운다."], ["feasibility", "primal constraint g_i(x)<=0을 만족한다."], ["duality", "lambda_i>=0을 확인한다."], ["complementarity", "g_i가 slack이면 lambda_i=0이고, bound에 닿으면 lambda_i가 양수가 된다."]],
    handProblem: "min 0.5x^2-2x, x<=1이면 최적해와 upper multiplier는?",
    handGiven: { target: 2, upper_bound: 1 },
    handSteps: ["unconstrained optimum x=2", "x<=1 때문에 x*=1", "stationarity x-2+lambda=0 -> lambda=1"],
    handAnswer: "x*=1이고 upper bound가 active라 lambda=1이다.",
    robotApplication: "CBF-QP safety filter에서 obstacle별 multiplier를 출력하면 어떤 장애물이 명령을 제한했는지 디버깅할 수 있다.",
    labTitle: "KKT Multiplier and OSQP Active Constraint",
    args: ["target", "upper_bound", "epsilon"],
    sample: [2, 1, 0.001],
    codeExpression: "max(0.0, target - upper_bound) / max(epsilon, 1e-9)",
    commonBugs: ["solver status만 보고 multiplier를 확인하지 않음", "OSQP dual 부호와 upper/lower bound 방향을 혼동함", "inactive constraint의 작은 numerical dual을 active로 오판함"],
    extensionTask: "CBF-QP obstacle constraint별 result.y를 기록하고 active constraint timeline을 plot하라.",
    visualId: "vis_kkt_osqp_active_constraints",
    visualTitle: "KKT Multiplier and OSQP Active Constraint",
    visualParams: [param("constraint_bound", "u_{max}", 0.1, 5, 1, "upper constraint bound"), param("target_value", "u_0", -2, 5, 2, "unconstrained optimum"), param("multiplier_threshold", "\\epsilon_\\lambda", 0, 0.1, 0.001, "active 판정 threshold")],
    normalCase: "bound에 닿은 constraint만 양의 multiplier를 가지고 active로 표시된다.",
    failureCase: "dual variable을 해석하지 않으면 safety constraint가 실제로 작동했는지 알 수 없다.",
    quiz: {
      conceptQuestion: "KKT multiplier와 active constraint는 어떻게 연결되는가?",
      conceptAnswer: "inequality constraint가 최적해에서 bound에 닿으면 multiplier가 양수가 되고, slack이면 complementarity 때문에 0이 된다.",
      calculationQuestion: "min 0.5x^2-2x, x<=1이면 multiplier는?",
      calculationAnswer: "x*=1이고 stationarity x-2+lambda=0이므로 lambda=1이다.",
      codeQuestion: "OSQP upper bound dual을 읽는 한 줄은?",
      codeAnswer: "lambda_upper = float(result.y[0])",
      debugQuestion: "CBF-QP가 피하는 듯 보이지만 어떤 constraint인지 모르겠다면?",
      debugAnswer: "constraint별 OSQP dual variable, primal residual, distance margin을 같이 로그로 남긴다.",
      visualQuestion: "target_value가 constraint_bound를 넘으면 multiplier 곡선은?",
      visualAnswer: "upper bound가 active가 되면서 multiplier가 양수로 증가한다.",
      robotQuestion: "실제 safety filter에서 active constraint 로그를 왜 남기나?",
      robotAnswer: "어떤 장애물/limit이 제어 명령을 제한했는지 설명하고 false stop을 디버깅하기 위해서다.",
      designQuestion: "QP active-set 디버깅 절차는?",
      designAnswer: "solver status, primal feasibility, dual variable, active threshold, physical constraint id mapping, fallback 여부를 확인한다.",
    },
    wrongTagLabel: "KKT multiplier/OSQP active constraint 오류",
    nextSessions: ["cbf_qp_safety_filter", "clf_cbf_qp_priority_resolution"],
  },
  {
    id: "se3_lie_algebra_expmap_twist",
    part: "Part 2. 로봇 수학",
    title: "se(3) Tangent Space, Twist, Exponential Map",
    prerequisites: ["robot_math_3d_rotation_so3", "robot_math_homogeneous_transform_se3"],
    objectives: ["so(3)/se(3) tangent vector와 velocity screw를 연결한다.", "Rodrigues formula에서 SO(3) exponential map을 구현한다.", "exp map 결과를 ROS2 tf2 transform으로 변환한다."],
    definition: "Lie algebra se(3)는 SE(3) pose manifold의 tangent space이며, twist를 exponential map에 넣으면 finite transform이 된다.",
    whyItMatters: "tf2, visual odometry, pose graph residual, robot screw motion은 작은 twist update를 SE(3) transform으로 올리는 exp map을 반복 사용한다.",
    intuition: "작은 속도 화살표를 곡면 위의 실제 회전/이동으로 굴려 올리는 연산이 exponential map이다.",
    equation: "T=\\exp(\\hat\\xi),\\quad R=I+\\sin\\theta \\hat\\omega+(1-\\cos\\theta)\\hat\\omega^2",
    designEquation: "\\xi=[\\omega, v]\\in se(3)",
    failureEquation: "\\theta\\to0\\Rightarrow use\\ series\\ expansion",
    terms: [["xi", "twist"], ["hat", "matrix representation"], ["theta", "rotation magnitude"]],
    derivation: [["tangent", "identity 근처 작은 twist를 tangent vector로 둔다."], ["hat", "vector를 skew matrix로 바꾼다."], ["rodrigues", "SO(3) exp map을 Rodrigues formula로 계산한다."], ["tf2", "R과 translation을 quaternion/TransformStamped로 변환한다."]],
    handProblem: "omega=[0,0,pi/2]이면 x축 unit vector는 어디로 회전하는가?",
    handGiven: { angle: "90deg around z" },
    handSteps: ["z축 90도 회전", "x축은 y축으로 이동", "R*[1,0,0]=[0,1,0]"],
    handAnswer: "[0,1,0]",
    robotApplication: "visual odometry pose update, pose graph optimization, tf2 transform publish에서 se(3) update를 SE(3) pose에 compose한다.",
    labTitle: "se(3) Twist Exponential Map to tf2 Transform",
    args: ["omega_norm", "translation_norm", "dt"],
    sample: [1.57, 0.1, 1],
    codeExpression: "omega_norm * dt + translation_norm",
    commonBugs: ["Euler angle update를 SE(3) compose와 혼동함", "small angle에서 theta로 나눠 NaN을 만듦", "body/world twist frame을 섞음"],
    extensionTask: "SO(3) exp 결과를 quaternion으로 변환해 TransformStamped 메시지 필드와 연결하라.",
    visualId: "vis_se3_expmap_twist_tf2",
    visualTitle: "se(3) Twist Exponential Map to ROS2 tf2",
    visualParams: [param("rotation_angle", "\\theta", 0, 3.14, 1.57, "rotation magnitude"), param("translation_step", "\\|v\\|", 0, 1, 0.1, "translation magnitude"), param("integration_dt", "\\Delta t", 0.001, 1, 0.1, "integration step")],
    normalCase: "twist가 finite SE(3) transform으로 안정적으로 변환된다.",
    failureCase: "small angle 처리나 frame convention이 틀리면 tf2 pose가 튄다.",
    quiz: {
      conceptQuestion: "se(3) tangent space와 velocity screw의 관계는?",
      conceptAnswer: "velocity screw는 SE(3) pose manifold의 tangent vector이고 exp map으로 finite transform이 된다.",
      calculationQuestion: "z축 90도 회전에서 x축은?",
      calculationAnswer: "[0,1,0] 방향이 된다.",
      codeQuestion: "SO(3) Rodrigues 핵심 항은?",
      codeAnswer: "R = I + np.sin(theta)*K + (1-np.cos(theta))*(K@K)",
      debugQuestion: "tf2 transform이 작은 각도에서 NaN이면?",
      debugAnswer: "theta near zero series expansion과 axis normalization을 확인한다.",
      visualQuestion: "rotation_angle을 키우면?",
      visualAnswer: "tangent approximation과 실제 exp map pose 차이가 커진다.",
      robotQuestion: "pose graph에서 exp map은 어디에 쓰이나?",
      robotAnswer: "optimization increment delta xi를 현재 SE(3) pose에 compose할 때 쓴다.",
      designQuestion: "tf2 변환 실습 검증은?",
      designAnswer: "orthonormal R, det=1, quaternion normalization, frame id, timestamp를 확인한다.",
    },
    wrongTagLabel: "se(3)/exp map/tf2 오류",
    nextSessions: ["geometric_vs_analytic_jacobian", "pose_graph_slam"],
  },
  {
    id: "feedforward_model_error_robustness",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Feedforward 중력보상 모델 오차와 역효과",
    prerequisites: ["robot_dynamics_feedforward_gravity_compensation", "spatial_rnea_6dof_backward_pass"],
    objectives: ["gravity feedforward가 모델 오차에서 역효과를 낼 수 있음을 설명한다.", "true/model torque residual을 계산한다.", "payload 변경과 saturation 로그로 feedforward 신뢰도를 평가한다."],
    definition: "Feedforward 모델 오차 검증은 g_hat(q)와 실제 중력 토크의 차이를 residual로 추적해 보상이 tracking을 줄이는지 오히려 saturation과 overshoot를 만드는지 판단하는 절차다.",
    whyItMatters: "payload나 CAD inertia가 틀린 로봇팔에서 feedforward를 크게 넣으면 feedback이 보정하기 전에 잘못된 방향의 torque를 먼저 밀어 넣을 수 있다.",
    intuition: "지도에 없는 언덕을 미리 보상하려다 오히려 반대쪽으로 핸들을 꺾는 상황이다.",
    equation: "\\tau=K_p(q_d-q)+K_d(\\dot q_d-\\dot q)+\\hat g(q)",
    designEquation: "r_g=g_{true}(q)-\\hat g(q)",
    failureEquation: "|r_g|/|g_{true}|>\\epsilon\\Rightarrow reduce\\ feedforward",
    terms: [["g_hat", "model gravity torque"], ["r_g", "gravity residual"], ["epsilon", "allowed model error ratio"]],
    derivation: [["model", "URDF/CAD inertia로 g_hat(q)를 계산한다."], ["apply", "feedback torque에 feedforward를 더한다."], ["residual", "current/acceleration/log replay로 true torque와 residual을 추정한다."], ["gate", "residual이 크면 feedforward gain을 낮추거나 payload를 재식별한다."]],
    handProblem: "true gravity=10Nm, model gravity=16Nm이면 residual ratio는?",
    handGiven: { true_g: 10, model_g: 16 },
    handSteps: ["residual=10-16=-6", "ratio=6/10=0.6", "60% 오차는 위험"],
    handAnswer: "residual=-6Nm, risk=0.6으로 feedforward를 그대로 쓰면 위험하다.",
    robotApplication: "Franka/UR payload를 바꾼 뒤 gravity compensation torque와 motor current residual을 비교해 payload mass/COM을 다시 식별한다.",
    labTitle: "Feedforward Gravity Model Error Robustness",
    args: ["true_gravity", "model_gravity", "error_budget"],
    sample: [10, 16, 0.2],
    codeExpression: "abs(true_gravity - model_gravity) / max(abs(true_gravity), 1e-9) - error_budget",
    commonBugs: ["feedforward는 항상 좋다고 가정함", "payload 변경 후 inertia/COM을 갱신하지 않음", "saturation을 feedback gain 문제로만 해석함"],
    extensionTask: "payload mass 오차를 sweep해 tracking error와 saturation ratio가 feedforward gain에 따라 어떻게 바뀌는지 비교하라.",
    visualId: "vis_feedforward_model_error_residual",
    visualTitle: "Feedforward Model Error Residual",
    visualParams: [param("payload_error", "\\Delta m", -5, 5, 1, "payload mass error"), param("feedforward_gain", "k_{ff}", 0, 1.5, 1, "feedforward scaling"), param("residual_budget", "\\epsilon_g", 0, 1, 0.2, "allowed residual ratio")],
    normalCase: "모델 residual이 작고 feedforward가 tracking error를 줄인다.",
    failureCase: "모델 오차가 크면 feedforward가 saturation과 overshoot를 만든다.",
    quiz: {
      conceptQuestion: "중력 feedforward가 역효과를 내는 조건은?",
      conceptAnswer: "payload, COM, inertia 모델이 실제와 크게 달라 g_hat(q)가 true gravity와 다른 방향/크기를 만들 때다.",
      calculationQuestion: "true=10, model=16이면 residual ratio는?",
      calculationAnswer: "|10-16|/10=0.6이다.",
      codeQuestion: "gravity residual 한 줄은?",
      codeAnswer: "residual = true_g - model_g",
      debugQuestion: "feedforward를 켜자 tracking이 더 나빠지면?",
      debugAnswer: "payload model, torque sign, saturation, current residual, gravity frame을 확인한다.",
      visualQuestion: "payload_error를 키우면?",
      visualAnswer: "residual과 saturation 위험이 커지고 feedforward gain을 낮춰야 할 수 있다.",
      robotQuestion: "payload 변경 후 무엇을 재검증하나?",
      robotAnswer: "mass/COM, gravity torque residual, current log, saturation ratio, low-speed replay를 확인한다.",
      designQuestion: "robust feedforward 배포 절차는?",
      designAnswer: "model ID, low-speed validation, residual gate, feedforward scaling, fallback PD, log regression 순서다.",
    },
    wrongTagLabel: "Feedforward 모델 오차/역효과 오류",
    nextSessions: ["spatial_rnea_6dof_backward_pass", "system_parameter_selection_report"],
  },
  {
    id: "controllability_gramian_numeric",
    part: "Part 3. 로봇 동역학과 제어",
    title: "Gramian 기반 Controllability 수치 판정",
    prerequisites: ["state_space_model", "lqr_bryson_rule_pole_design"],
    objectives: ["finite-horizon controllability Gramian을 계산한다.", "rank와 eigenvalue/condition number로 제어 가능성을 해석한다.", "LQR/MPC 설계 전 input placement를 검증한다."],
    definition: "Controllability Gramian은 주어진 horizon 동안 입력이 각 상태 방향에 얼마나 에너지를 전달할 수 있는지 나타내는 행렬이다.",
    whyItMatters: "rank 조건만 외우면 거의 uncontrollable한 방향의 큰 입력 비용이나 actuator placement 문제를 놓쳐 LQR gain이 비현실적으로 커진다.",
    intuition: "핸들이 차의 어느 방향을 얼마나 쉽게 움직일 수 있는지 에너지 지도로 보는 것이다.",
    equation: "W_c(N)=\\sum_{k=0}^{N-1}A^kBB^T(A^T)^k",
    designEquation: "rank(W_c)=n,\\quad \\lambda_{min}(W_c)>\\epsilon",
    failureEquation: "\\kappa(W_c)\\gg1\\Rightarrow weakly\\ controllable",
    terms: [["W_c", "controllability Gramian"], ["lambda_min", "minimum controllability energy direction"], ["kappa", "condition number"]],
    derivation: [["propagate", "A^kB가 k step 뒤 input 영향 방향을 나타낸다."], ["energy", "각 step 영향의 outer product를 합산한다."], ["rank", "full rank면 모든 state 방향을 움직일 수 있다."], ["conditioning", "작은 eigenvalue 방향은 제어 가능해도 매우 큰 입력이 필요하다."]],
    handProblem: "B=0인 2D system의 Gramian rank는?",
    handGiven: { state_dim: 2, B: 0 },
    handSteps: ["A^k B=0", "모든 항이 0", "W_c=0, rank=0"],
    handAnswer: "rank=0으로 controllable하지 않다.",
    robotApplication: "linearized arm/base 모델에서 actuator가 특정 mode를 움직일 수 있는지 확인한 뒤 LQR Q/R과 input limit을 정한다.",
    labTitle: "Numeric Controllability Gramian",
    args: ["min_eigenvalue", "condition_number", "input_limit"],
    sample: [0.05, 100, 2],
    codeExpression: "min_eigenvalue * input_limit / max(condition_number, 1e-9)",
    commonBugs: ["rank만 보고 weak controllability를 무시함", "state scaling 없이 Gramian condition number를 비교함", "horizon과 sample time을 명시하지 않음"],
    extensionTask: "double integrator와 underactuated system의 Gramian eigenvalue를 horizon별로 비교하라.",
    visualId: "vis_controllability_gramian_eigen",
    visualTitle: "Controllability Gramian Eigenvalue Map",
    visualParams: [param("horizon_steps", "N", 1, 100, 20, "finite horizon steps"), param("input_gain", "\\|B\\|", 0, 5, 1, "input matrix gain"), param("condition_limit", "\\kappa_{max}", 1, 10000, 100, "allowed condition number")],
    normalCase: "Gramian이 full rank이고 작은 eigenvalue도 actuator limit 안에서 충분하다.",
    failureCase: "rank는 full이어도 condition number가 커서 특정 mode 제어가 실질적으로 어렵다.",
    quiz: {
      conceptQuestion: "Controllability Gramian이 말하는 것은?",
      conceptAnswer: "주어진 horizon 동안 입력이 각 state 방향을 얼마나 잘 움직일 수 있는지 나타내는 에너지 행렬이다.",
      calculationQuestion: "B=0이면 W_c rank는?",
      calculationAnswer: "모든 항이 0이므로 rank=0이다.",
      codeQuestion: "discrete Gramian 누적 한 줄은?",
      codeAnswer: "W += Ak @ B @ B.T @ Ak.T",
      debugQuestion: "LQR gain이 특정 state에서 비정상적으로 커지면?",
      debugAnswer: "Gramian eigenvalue, state scaling, input placement, actuator limit을 확인한다.",
      visualQuestion: "horizon을 늘리면 Gramian eigenvalue는?",
      visualAnswer: "입력 영향이 누적되어 대체로 증가하거나 유지된다.",
      robotQuestion: "actuator 추가 위치를 고를 때 무엇을 보나?",
      robotAnswer: "Gramian eigenvalue, condition number, input saturation, target mode controllability를 본다.",
      designQuestion: "state-space 제어 설계 전 체크는?",
      designAnswer: "linearization, controllability matrix, Gramian conditioning, scaling, actuator limits, disturbance modes를 확인한다.",
    },
    wrongTagLabel: "Controllability Gramian 해석 오류",
    nextSessions: ["lqr_bryson_rule_pole_design", "mpc_soft_constraint_infeasibility"],
  },
  {
    id: "preempt_rt_kernel_jitter_comparison",
    part: "Part 8. 실시간성, 안전성, 시스템 통합",
    title: "PREEMPT_RT 커널과 일반 커널 Jitter 비교",
    prerequisites: ["cpp_realtime_control_loop_jitter", "ros2_control_pid_hardware_loop"],
    objectives: ["generic kernel과 PREEMPT_RT의 tail latency 차이를 설명한다.", "cyclictest 스타일 jitter 로그에서 deadline miss rate를 계산한다.", "kernel 설정 외 CPU isolation, priority, mlockall 필요성을 연결한다."],
    definition: "PREEMPT_RT는 Linux kernel의 preemption 지연을 줄여 control loop tail latency를 낮추는 실시간 패치/설정 계열이다.",
    whyItMatters: "평균 loop time이 좋아도 99.9 percentile jitter가 actuator deadline을 넘으면 로봇팔 torque loop가 튀고 watchdog이 동작한다.",
    intuition: "평균 출근 시간보다 가끔 생기는 큰 지각이 제어 루프에서는 더 위험하다.",
    equation: "miss=\\mathbb{1}(|jitter|>T_{budget})",
    designEquation: "P_{99.9}(jitter)<T_{budget}",
    failureEquation: "miss\\ rate>0\\Rightarrow unsafe\\ realtime\\ loop",
    terms: [["jitter", "loop timing deviation"], ["P99.9", "tail latency percentile"], ["T_budget", "allowed jitter budget"]],
    derivation: [["trace", "cyclictest나 loop timestamp에서 jitter sample을 모은다."], ["tail", "max/P99.9/RMS를 계산한다."], ["compare", "generic vs PREEMPT_RT tail latency를 비교한다."], ["deploy", "thread priority, CPU isolation, memory lock, IRQ affinity까지 같이 설정한다."]],
    handProblem: "1kHz loop에서 budget이 period의 10%이고 jitter=150us이면 miss인가?",
    handGiven: { period_us: 1000, budget_ratio: 0.1, jitter_us: 150 },
    handSteps: ["budget=100us", "150>100", "deadline miss"],
    handAnswer: "miss이다.",
    robotApplication: "ros2_control hardware loop에서 PREEMPT_RT kernel, SCHED_FIFO priority, isolated CPU, memory lock을 함께 검증한다.",
    labTitle: "PREEMPT_RT vs Generic Kernel Jitter Budget",
    args: ["jitter_us", "period_us", "budget_ratio"],
    sample: [150, 1000, 0.1],
    codeExpression: "1.0 if abs(jitter_us) > period_us * budget_ratio else 0.0",
    commonBugs: ["평균 jitter만 보고 max/P99.9를 보지 않음", "PREEMPT_RT만 설치하면 실시간성이 자동 보장된다고 생각함", "logging/allocations/IRQ affinity가 tail latency를 만드는 것을 놓침"],
    extensionTask: "generic kernel과 PREEMPT_RT cyclictest 로그에서 P99/P99.9/max jitter와 miss rate를 비교하라.",
    visualId: "vis_preempt_rt_jitter_tail",
    visualTitle: "PREEMPT_RT vs Generic Kernel Jitter Tail",
    visualParams: [param("period_us", "T", 100, 5000, 1000, "control period us"), param("p999_jitter_us", "P_{99.9}", 1, 1000, 80, "99.9 percentile jitter"), param("deadline_budget_us", "T_b", 1, 1000, 100, "allowed jitter budget")],
    normalCase: "P99.9 jitter가 budget보다 낮고 miss rate가 0에 가깝다.",
    failureCase: "평균은 좋아도 tail jitter가 budget을 넘으면 realtime loop가 안전하지 않다.",
    quiz: {
      conceptQuestion: "PREEMPT_RT와 일반 kernel의 핵심 차이는?",
      conceptAnswer: "PREEMPT_RT는 kernel preemption과 interrupt/threading 지연을 줄여 tail latency를 낮추지만 algorithm latency 자체를 없애지는 않는다.",
      calculationQuestion: "1kHz loop에서 150us jitter, budget 100us이면?",
      calculationAnswer: "deadline miss이다.",
      codeQuestion: "miss 판정 한 줄은?",
      codeAnswer: "miss = abs(jitter_us) > jitter_budget_us",
      debugQuestion: "PREEMPT_RT인데도 jitter spike가 있으면?",
      debugAnswer: "CPU isolation, SCHED_FIFO priority, IRQ affinity, memory allocation, logging, thermal throttling을 확인한다.",
      visualQuestion: "p999_jitter_us가 budget을 넘으면?",
      visualAnswer: "tail latency 위험 영역으로 들어가 watchdog/fallback 대상이 된다.",
      robotQuestion: "ros2_control 실시간 배포 체크는?",
      robotAnswer: "kernel, scheduler priority, CPU isolation, memory lock, allocation-free loop, cyclictest/loop trace를 확인한다.",
      designQuestion: "realtime acceptance 기준은?",
      designAnswer: "P99.9 jitter, max jitter, miss rate, watchdog recovery, actuator command hold behavior가 모두 기준 안에 있어야 한다.",
    },
    wrongTagLabel: "PREEMPT_RT/realtime jitter 오류",
    nextSessions: ["system_parameter_selection_report", "safety_emergency_stop_pipeline"],
  },
  {
    id: "particle_filter_resampling_comparison",
    part: "Part 4. 자율주행과 SLAM",
    title: "Particle Filter Resampling 방법 비교",
    prerequisites: ["particle_filter_localization", "ekf_chi_squared_outlier_rejection"],
    objectives: ["effective sample size로 resampling trigger를 정한다.", "multinomial/systematic/low-variance resampling variance를 비교한다.", "particle deprivation과 roughening 필요성을 설명한다."],
    definition: "Particle filter resampling 비교는 weight degeneracy를 줄이기 위해 어떤 resampling scheme을 선택할지 variance와 particle diversity 관점에서 평가하는 절차다.",
    whyItMatters: "resampling을 너무 자주 하거나 variance 큰 방법만 쓰면 localization이 한 hypothesis에 고정되어 kidnapped robot이나 ambiguous landmark에서 회복하지 못한다.",
    intuition: "좋은 후보를 더 복사하되, 복권처럼 요란하게 뽑을지, 일정 간격으로 차분하게 뽑을지의 차이다.",
    equation: "N_{eff}=\\frac{1}{\\sum_i \\bar w_i^2}",
    designEquation: "resample\\ if\\ N_{eff}<\\rho N",
    failureEquation: "diversity\\downarrow\\Rightarrow particle\\ deprivation",
    terms: [["N_eff", "effective sample size"], ["rho", "resampling threshold ratio"], ["w_i", "particle weight"]],
    derivation: [["normalize", "weights를 합 1로 정규화한다."], ["neff", "N_eff로 degeneracy를 측정한다."], ["resample", "multinomial/systematic/stratified 중 하나를 적용한다."], ["reset", "weights를 uniform으로 바꾸고 필요하면 roughening noise를 넣는다."]],
    handProblem: "weights=[0.5,0.5]이면 N_eff는?",
    handGiven: { weights: "[0.5,0.5]" },
    handSteps: ["sum w^2=0.25+0.25=0.5", "N_eff=1/0.5", "=2"],
    handAnswer: "N_eff=2로 두 particle이 모두 살아 있다.",
    robotApplication: "AMCL/localization에서 resampling threshold와 method를 바꿔 kidnapped robot recovery, particle diversity, CPU load를 비교한다.",
    labTitle: "Particle Filter Resampling Method Comparison",
    args: ["weight_peak", "particle_count", "threshold_ratio"],
    sample: [0.7, 100, 0.5],
    codeExpression: "1.0 / (weight_peak ** 2 + (1.0 - weight_peak) ** 2 / max(particle_count - 1, 1)) - threshold_ratio * particle_count",
    commonBugs: ["resampling 후 weight uniform reset을 빼먹음", "N_eff threshold 없이 매 step resampling함", "multinomial variance와 systematic variance 차이를 모름"],
    extensionTask: "같은 weight vector에서 resampling 방법별 unique particle count와 estimate variance를 비교하라.",
    visualId: "vis_particle_resampling_methods",
    visualTitle: "Particle Resampling Method Comparison",
    visualParams: [param("effective_sample_ratio", "N_{eff}/N", 0, 1, 0.4, "effective sample size ratio"), param("resampling_method", "m", 0, 2, 1, "0 multinomial, 1 systematic, 2 stratified"), param("roughening_noise", "\\sigma_r", 0, 1, 0.05, "post-resampling roughening noise")],
    normalCase: "N_eff가 낮을 때 low-variance resampling으로 diversity를 유지한다.",
    failureCase: "resampling을 과도하게 하면 particle deprivation이 발생한다.",
    quiz: {
      conceptQuestion: "Particle filter resampling 방법을 비교해야 하는 이유는?",
      conceptAnswer: "method마다 sampling variance와 particle diversity 보존 능력이 달라 localization 안정성이 달라지기 때문이다.",
      calculationQuestion: "weights=[0.5,0.5]이면 N_eff는?",
      calculationAnswer: "1/(0.25+0.25)=2이다.",
      codeQuestion: "N_eff 계산 한 줄은?",
      codeAnswer: "neff = 1.0 / np.sum(np.square(weights / np.sum(weights)))",
      debugQuestion: "resampling 후 pose가 한 점에 고정되면?",
      debugAnswer: "resampling 빈도, roughening noise, particle count, motion noise, method variance를 확인한다.",
      visualQuestion: "roughening_noise를 키우면?",
      visualAnswer: "diversity는 늘지만 estimate variance도 커질 수 있다.",
      robotQuestion: "AMCL 튜닝에서 무엇을 기록하나?",
      robotAnswer: "N_eff, unique particle count, recovery time, CPU load, localization error를 기록한다.",
      designQuestion: "resampling 설계 절차는?",
      designAnswer: "N_eff threshold, method 선택, roughening, kidnapped recovery test, CPU budget 검증 순서다.",
    },
    wrongTagLabel: "Particle filter resampling 비교 오류",
    nextSessions: ["isam2_incremental_factor_graph", "imu_camera_tight_coupling_factor"],
  },
  {
    id: "imu_camera_tight_coupling_factor",
    part: "Part 4. 자율주행과 SLAM",
    title: "IMU-Camera Tight Coupling Factor",
    prerequisites: ["imu_preintegration", "pose_graph_slam"],
    objectives: ["loose coupling과 tight coupling을 구분한다.", "visual reprojection residual과 IMU preintegration residual을 하나의 factor cost로 합친다.", "timestamp offset/extrinsic/noise scale이 fusion에 미치는 영향을 설명한다."],
    definition: "IMU-camera tight coupling은 camera pose와 IMU integration 결과를 따로 평균내지 않고, pixel residual과 IMU preintegration residual을 같은 최적화 문제 안에서 동시에 최소화하는 방식이다.",
    whyItMatters: "빠른 회전, motion blur, feature dropout 상황에서 loose fusion만 쓰면 한 센서의 실패가 pose estimate 전체를 늦게 망가뜨린다.",
    intuition: "카메라와 IMU가 각자 답을 낸 뒤 타협하는 것이 아니라, 처음부터 한 시험지에서 서로의 오차를 같이 푸는 방식이다.",
    equation: "J=\\sum\\|r_{pixel}/\\sigma_p\\|^2+\\sum\\|r_{imu}/\\sigma_i\\|^2",
    designEquation: "r=[r_{pixel},r_{preint},r_{bias},r_{extrinsic}]",
    failureEquation: "\\Delta t_{cam-imu}\\ne0\\Rightarrow biased\\ residual",
    terms: [["r_pixel", "reprojection residual"], ["r_imu", "IMU preintegration residual"], ["sigma", "residual noise scale"]],
    derivation: [["visual", "landmark projection residual을 만든다."], ["imu", "preintegrated delta pose/velocity/bias residual을 만든다."], ["weight", "각 residual을 covariance로 whiten한다."], ["optimize", "pose, velocity, bias, extrinsic/timing을 같은 factor graph에서 갱신한다."]],
    handProblem: "pixel residual 2px, sigma 1px이면 whitened residual은?",
    handGiven: { residual_px: 2, sigma_px: 1 },
    handSteps: ["r_white=r/sigma", "2/1", "=2"],
    handAnswer: "whitened residual=2이다.",
    robotApplication: "VIO/SLAM에서 camera reprojection factor와 IMU preintegration factor를 함께 최적화해 빠른 움직임에서도 pose를 안정화한다.",
    labTitle: "IMU-Camera Tight Coupling Residual",
    args: ["pixel_residual", "imu_residual", "noise_sigma"],
    sample: [2, 0.1, 1],
    codeExpression: "0.5 * ((pixel_residual / max(noise_sigma, 1e-9)) ** 2 + (imu_residual / max(noise_sigma, 1e-9)) ** 2)",
    commonBugs: ["camera pose와 IMU pose를 느슨하게 평균내고 tight coupling이라고 부름", "extrinsic calibration과 time offset을 residual에 넣지 않음", "pixel/IMU residual scale을 맞추지 않음"],
    extensionTask: "pixel_sigma와 imu_sigma를 sweep해 pose update가 어느 센서에 끌리는지 비교하라.",
    visualId: "vis_imu_camera_tight_coupling",
    visualTitle: "IMU-Camera Tight Coupling Residual",
    visualParams: [param("pixel_noise_sigma", "\\sigma_p", 0.1, 10, 1, "pixel residual noise"), param("imu_noise_sigma", "\\sigma_i", 0.001, 1, 0.1, "IMU residual noise"), param("time_offset_ms", "\\Delta t", -50, 50, 0, "camera-IMU timestamp offset")],
    normalCase: "visual/IMU residual이 covariance scale에 맞게 함께 줄어든다.",
    failureCase: "time offset이나 extrinsic이 틀리면 residual이 한쪽 센서를 계속 밀어낸다.",
    quiz: {
      conceptQuestion: "IMU-camera tight coupling과 loose coupling의 차이는?",
      conceptAnswer: "tight coupling은 pixel residual과 IMU preintegration residual을 같은 최적화 문제에서 같이 풀고, loose coupling은 각 센서 pose 결과를 나중에 fuse한다.",
      calculationQuestion: "pixel residual 2, sigma 1이면 whitened residual은?",
      calculationAnswer: "2이다.",
      codeQuestion: "weighted residual cost 한 줄은?",
      codeAnswer: "cost = 0.5 * np.dot(residual / sigma, residual / sigma)",
      debugQuestion: "빠른 회전에서 VIO가 drift하면?",
      debugAnswer: "time offset, IMU bias, extrinsic, rolling shutter, residual weighting을 확인한다.",
      visualQuestion: "time_offset_ms를 키우면?",
      visualAnswer: "camera/IMU residual이 일관되지 않아 cost와 drift가 커진다.",
      robotQuestion: "실제 VIO calibration 체크는?",
      robotAnswer: "camera-IMU extrinsic, time offset, noise density, bias random walk, reprojection residual을 확인한다.",
      designQuestion: "tight coupling factor graph 설계는?",
      designAnswer: "state pose/velocity/bias, visual factor, preintegration factor, covariance whitening, time/extrinsic calibration, robust loss 순서다.",
    },
    wrongTagLabel: "IMU-Camera tight coupling 오류",
    nextSessions: ["isam2_incremental_factor_graph", "ekf_chi_squared_outlier_rejection"],
  },
  {
    id: "ppo_gae_sac_entropy_tuning",
    part: "Part 7. Physical AI / Embodied AI",
    title: "PPO GAE Lambda와 SAC Entropy Tuning",
    prerequisites: ["rl_ppo_sac_reward_shaping", "domain_randomization_adr_gap_design"],
    objectives: ["GAE lambda가 bias/variance를 어떻게 바꾸는지 설명한다.", "SAC entropy temperature alpha와 target entropy를 해석한다.", "로봇 정책 학습에서 return variance와 exploration 안전성을 함께 튜닝한다."],
    definition: "GAE lambda는 PPO advantage estimate의 bias/variance를 조절하고, SAC entropy temperature는 policy entropy가 target 근처로 유지되도록 exploration 보상을 조절한다.",
    whyItMatters: "reward shaping만 알고 GAE/entropy tuning을 모르면 로봇 policy가 high variance update로 흔들리거나 과도한 exploration으로 unsafe action을 낸다.",
    intuition: "GAE lambda는 얼마나 멀리 미래까지 믿을지, SAC alpha는 얼마나 모험적인 행동을 장려할지 정하는 손잡이다.",
    equation: "A_t^{GAE}=\\sum_{l=0}^{\\infty}(\\gamma\\lambda)^l\\delta_{t+l}",
    designEquation: "J_{SAC}=\\mathbb{E}[\\alpha(-\\log\\pi(a|s)-\\mathcal{H}_{target})]",
    failureEquation: "\\lambda\\to1\\Rightarrow high\\ variance,\\quad \\alpha\\gg1\\Rightarrow unsafe\\ exploration",
    terms: [["lambda", "GAE trace parameter"], ["alpha", "SAC entropy temperature"], ["H_target", "target entropy"]],
    derivation: [["td", "TD residual delta_t를 계산한다."], ["trace", "gamma lambda로 미래 residual을 할인해 누적한다."], ["ppo", "advantage variance가 policy update 크기를 바꾼다."], ["sac", "target entropy와 log_prob 차이로 alpha를 조정한다."]],
    handProblem: "lambda=0이면 GAE는 무엇에 가까운가?",
    handGiven: { lambda: 0 },
    handSteps: ["(gamma lambda)^l에서 l>0 항이 0", "A_t=delta_t", "1-step TD advantage"],
    handAnswer: "1-step TD advantage에 가까워 variance는 낮지만 bias가 커질 수 있다.",
    robotApplication: "PPO/SAC manipulation policy에서 unsafe exploration rate, return variance, success rate를 lambda/alpha sweep으로 함께 기록한다.",
    labTitle: "PPO GAE Lambda and SAC Entropy Temperature",
    args: ["gae_lambda", "entropy_alpha", "unsafe_rate"],
    sample: [0.95, 0.2, 0.01],
    codeExpression: "gae_lambda * (1.0 + entropy_alpha) + unsafe_rate * 10.0",
    commonBugs: ["lambda를 gamma와 같은 의미로 착각함", "terminal bootstrap 처리를 빼먹음", "SAC alpha가 크면 entropy와 unsafe exploration이 함께 커질 수 있음을 무시함"],
    extensionTask: "lambda와 target entropy를 sweep하며 advantage variance, success rate, unsafe action rate를 표로 만들라.",
    visualId: "vis_ppo_gae_sac_entropy",
    visualTitle: "PPO GAE Lambda vs SAC Entropy Tuning",
    visualParams: [param("gae_lambda", "\\lambda", 0, 1, 0.95, "GAE trace parameter"), param("entropy_alpha", "\\alpha", 0, 2, 0.2, "SAC entropy temperature"), param("unsafe_action_rate", "p_u", 0, 1, 0.01, "unsafe exploration rate")],
    normalCase: "advantage variance와 exploration이 task success와 safety budget 안에서 균형을 이룬다.",
    failureCase: "lambda/alpha가 과하면 high variance update나 unsafe exploration이 발생한다.",
    quiz: {
      conceptQuestion: "PPO GAE lambda가 하는 일은?",
      conceptAnswer: "TD residual을 얼마나 긴 horizon으로 누적할지 정해 advantage estimate의 bias/variance trade-off를 조절한다.",
      calculationQuestion: "lambda=0이면 GAE는?",
      calculationAnswer: "1-step TD residual delta_t만 남는다.",
      codeQuestion: "GAE recursion 한 줄은?",
      codeAnswer: "gae = delta + gamma * lam * gae",
      debugQuestion: "PPO update가 불안정하고 return variance가 크면?",
      debugAnswer: "GAE lambda, advantage normalization, clip range, reward scale, episode termination을 확인한다.",
      visualQuestion: "entropy_alpha를 키우면?",
      visualAnswer: "exploration과 entropy가 증가하지만 unsafe action rate도 커질 수 있다.",
      robotQuestion: "실제 로봇 RL에 바로 높은 entropy를 쓰면?",
      robotAnswer: "위험하다. safety filter, action bounds, sim validation, staged exploration이 필요하다.",
      designQuestion: "RL tuning report 항목은?",
      designAnswer: "lambda/alpha sweep, return variance, success rate, unsafe action rate, entropy, safety filter intervention을 포함한다.",
    },
    wrongTagLabel: "PPO GAE/SAC entropy tuning 오류",
    nextSessions: ["rssm_elbo_kl_world_model", "system_parameter_selection_report"],
  },
  {
    id: "fisher_information_observability",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Fisher Information Matrix와 Observability",
    prerequisites: ["gaussian_mle", "eigen_covariance_ellipse"],
    objectives: ["FIM과 covariance lower bound를 연결한다.", "관측 방향에 따른 observability ellipse를 해석한다.", "센서 배치 품질을 정량화한다."],
    definition: "Fisher Information Matrix는 파라미터가 관측 likelihood를 얼마나 민감하게 바꾸는지 나타내며 inverse는 추정 covariance 하한과 연결된다.",
    whyItMatters: "landmark 배치나 camera pose가 나쁘면 필터가 아무리 좋아도 특정 방향을 관측할 수 없다.",
    intuition: "같은 센서라도 어느 방향에서 보느냐에 따라 위치를 잘 알 수 있는 축과 못 알 수 있는 축이 생긴다.",
    equation: "I(\\theta)=H^TR^{-1}H",
    designEquation: "\\Sigma\\succeq I(\\theta)^{-1}",
    failureEquation: "\\lambda_{min}(I)\\approx0\\Rightarrow unobservable",
    terms: [["H", "measurement Jacobian"], ["R", "measurement noise"], ["lambda", "information eigenvalue"]],
    derivation: [["likelihood", "Gaussian measurement log likelihood를 쓴다."], ["curvature", "negative Hessian이 정보량이 된다."], ["linear model", "H^T R^-1 H 형태로 단순화된다."], ["ellipse", "inverse information eigenvalue가 uncertainty 축이다."]],
    handProblem: "H=[1,0], R=0.25이면 x 방향 information은?",
    handGiven: { Hx: 1, R: 0.25 },
    handSteps: ["I=H^T R^-1 H", "R^-1=4", "x 정보량=4"],
    handAnswer: "x 방향 information은 4이고 y 방향은 관측되지 않는다.",
    robotApplication: "camera/landmark placement, SLAM loop closure, calibration target pose 설계에 사용한다.",
    labTitle: "Fisher Information Ellipse",
    args: ["jacobian_gain", "noise_variance", "baseline"],
    sample: [1, 0.25, 2],
    codeExpression: "(jacobian_gain ** 2) * baseline / max(noise_variance, 1e-9)",
    commonBugs: ["covariance와 information을 같은 방향으로 해석함", "R inverse를 빼먹음", "rank deficient FIM을 inverse함"],
    extensionTask: "landmark angle을 sweep해 FIM eigenvalue와 ellipse area를 비교하라.",
    visualId: "vis_fisher_information_observability",
    visualTitle: "Fisher Information Ellipse + Observability",
    visualParams: [param("sensor_baseline", "b", 0.1, 10, 2, "sensor/landmark baseline"), param("measurement_noise", "R", 0.001, 5, 0.25, "measurement noise variance"), param("view_angle", "\\theta", -90, 90, 30, "관측 각도")],
    normalCase: "FIM eigenvalue가 양호해 uncertainty ellipse가 작다.",
    failureCase: "한 eigenvalue가 0에 가까워 특정 방향이 unobservable하다.",
    quiz: {
      conceptQuestion: "Fisher Information Matrix는 무엇을 말하는가?",
      conceptAnswer: "관측 likelihood가 파라미터 변화에 얼마나 민감한지, 즉 추정 가능한 정보량을 나타낸다.",
      calculationQuestion: "H=1, R=0.25이면 information은?",
      calculationAnswer: "1/0.25=4이다.",
      codeQuestion: "linear Gaussian FIM 한 줄은?",
      codeAnswer: "I = H.T @ np.linalg.inv(R) @ H",
      debugQuestion: "추정 covariance가 특정 방향으로 줄지 않으면?",
      debugAnswer: "FIM rank, sensor geometry, measurement Jacobian, noise model을 확인한다.",
      visualQuestion: "baseline이 커지면 ellipse는?",
      visualAnswer: "정보량이 늘어 uncertainty ellipse가 작아진다.",
      robotQuestion: "calibration target을 어디에 두는가?",
      robotAnswer: "Jacobian rank와 FIM eigenvalue가 좋아지는 다양한 pose에 둔다.",
      designQuestion: "observability 평가 절차는?",
      designAnswer: "H 계산, FIM eigenvalue, condition number, covariance bound, 실험 residual을 함께 본다.",
    },
    wrongTagLabel: "FIM/observability 해석 오류",
    nextSessions: ["ekf_chi_squared_outlier_rejection", "isam2_incremental_factor_graph"],
  },
  {
    id: "ukf_alpha_beta_kappa_tuning",
    part: "Part 4. 자율주행과 SLAM",
    title: "UKF alpha/beta/kappa 파라미터 선택",
    prerequisites: ["ukf_sigma_point_localization", "ekf_chi_squared_outlier_rejection"],
    objectives: ["UKF sigma point spread를 alpha로 조절한다.", "beta/kappa가 weight에 미치는 영향을 설명한다.", "파라미터 sensitivity 실험을 수행한다."],
    definition: "UKF alpha, beta, kappa는 sigma point 분포 폭과 mean/covariance weight를 정하는 scaling parameter다.",
    whyItMatters: "alpha를 너무 작게 잡으면 sigma point가 mean 근처에 몰려 비선형성을 못 보고, 너무 크면 Gaussian 근사가 깨진다.",
    intuition: "비선형 함수를 시험할 샘플 점들을 mean 주변에 얼마나 넓게 뿌릴지 정하는 손잡이다.",
    equation: "\\lambda=\\alpha^2(n+\\kappa)-n",
    designEquation: "X_i=\\mu\\pm\\sqrt{(n+\\lambda)P}",
    failureEquation: "\\alpha\\to0\\Rightarrow sigma\\ points\\ collapse",
    terms: [["alpha", "spread scale"], ["beta", "prior distribution correction"], ["kappa", "secondary scaling"]],
    derivation: [["scale", "lambda로 sigma point 거리와 weight를 정한다."], ["spread", "sqrt(n+lambda)P로 points를 배치한다."], ["propagate", "비선형 함수에 points를 통과시킨다."], ["recover", "weighted mean/covariance를 복원한다."]],
    handProblem: "n=3, alpha=0.001, kappa=0이면 lambda는?",
    handGiven: { n: 3, alpha: 0.001, kappa: 0 },
    handSteps: ["lambda=alpha^2(n+kappa)-n", "=1e-6*3-3", "≈-2.999997"],
    handAnswer: "n+lambda가 매우 작아 sigma point spread가 작다.",
    robotApplication: "nonlinear range-bearing localization에서 alpha sweep으로 NEES/NIS consistency를 확인한다.",
    labTitle: "UKF Alpha Sensitivity Experiment",
    args: ["alpha", "dimension", "variance"],
    sample: [0.1, 3, 2],
    codeExpression: "np.sqrt(max(alpha ** 2 * dimension, 1e-12) * variance)",
    commonBugs: ["alpha를 항상 0.001로 고정함", "negative weight 경고를 무시함", "beta=2 Gaussian prior 의미를 모름"],
    extensionTask: "alpha를 1e-3~1로 sweep하고 sigma point spread와 RMSE를 비교하라.",
    visualId: "vis_ukf_alpha_sigma_points",
    visualTitle: "UKF Alpha Sigma Point Distribution",
    visualParams: [param("alpha", "\\alpha", 0.001, 1, 0.1, "sigma point spread"), param("beta", "\\beta", 0, 4, 2, "Gaussian prior correction"), param("kappa", "\\kappa", -3, 3, 0, "secondary scaling")],
    normalCase: "sigma point가 비선형 곡률을 충분히 덮고 covariance가 consistent하다.",
    failureCase: "alpha가 너무 작으면 mean 근처에 몰려 비선형 효과를 놓친다.",
    quiz: {
      conceptQuestion: "UKF에서 alpha를 0.001로 설정하면 sigma point가 어떻게 배치되는가?",
      conceptAnswer: "mean 주변에 매우 가깝게 배치되어 spread가 작아진다.",
      calculationQuestion: "n=3, alpha=0.001, kappa=0이면 lambda는?",
      calculationAnswer: "약 -2.999997이다.",
      codeQuestion: "lambda 계산 한 줄은?",
      codeAnswer: "lam = alpha**2 * (n + kappa) - n",
      debugQuestion: "UKF covariance가 과소추정되면?",
      debugAnswer: "alpha/beta/kappa, process noise, sigma point weight, NIS/NEES를 확인한다.",
      visualQuestion: "alpha를 키우면?",
      visualAnswer: "sigma point spread가 넓어져 비선형성을 더 보지만 outlier 영향도 커질 수 있다.",
      robotQuestion: "range-bearing localization tuning은?",
      robotAnswer: "alpha sweep, innovation consistency, chi2 gate, RMSE를 함께 본다.",
      designQuestion: "UKF parameter 선택 기준은?",
      designAnswer: "state dimension, nonlinearity, noise Gaussian성, consistency metric으로 고른다.",
    },
    wrongTagLabel: "UKF alpha/beta/kappa tuning 오류",
    nextSessions: ["ekf_chi_squared_outlier_rejection", "fisher_information_observability"],
  },
  {
    id: "orca_velocity_obstacle_avoidance",
    part: "Part 4. 자율주행과 SLAM",
    title: "ORCA Velocity Obstacle 회피",
    prerequisites: ["dwa", "path_planning"],
    objectives: ["velocity obstacle cone을 계산한다.", "ORCA half-plane constraint를 해석한다.", "비협조 agent에서 보장 범위를 설명한다."],
    definition: "ORCA는 서로 협조한다는 가정 아래 각 agent가 velocity obstacle을 절반씩 책임지는 half-plane 제약으로 충돌 회피 velocity를 고른다.",
    whyItMatters: "dynamic obstacle이 많은 mobile robot에서 DWA만으로는 reciprocal collision avoidance의 보장과 한계를 설명하기 어렵다.",
    intuition: "내 속도와 상대 속도가 충돌 cone 안에 들어가면 cone 밖 가장 가까운 안전 속도로 밀어낸다.",
    equation: "v\\in \\{v\\mid n^T(v-v_{orca})\\ge0\\}",
    designEquation: "TTC=\\frac{d-r}{\\|v_{rel}\\|}",
    failureEquation: "noncooperative\\ agent\\Rightarrow reciprocal\\ guarantee\\ lost",
    terms: [["v_rel", "relative velocity"], ["n", "ORCA half-plane normal"], ["TTC", "time to collision"]],
    derivation: [["relative", "상대 위치와 상대 속도를 계산한다."], ["cone", "collision cone과 time horizon을 만든다."], ["orca", "최소 수정 velocity half-plane을 구한다."], ["select", "목표 속도에 가장 가까운 feasible velocity를 고른다."]],
    handProblem: "d=2m, radius sum=0.5m, rel speed=0.5m/s이면 TTC는?",
    handGiven: { d: 2, radius: 0.5, v_rel: 0.5 },
    handSteps: ["여유 거리=1.5m", "TTC=1.5/0.5", "=3s"],
    handAnswer: "TTC=3초",
    robotApplication: "warehouse AMR 다중 로봇 회피에서 ORCA/RVO류 local planner의 한계와 fallback stop을 설계한다.",
    labTitle: "ORCA 2-robot Collision Avoidance",
    args: ["distance", "combined_radius", "relative_speed"],
    sample: [2, 0.5, 0.5],
    codeExpression: "(distance - combined_radius) / max(relative_speed, 1e-9)",
    commonBugs: ["상대 속도 부호를 반대로 씀", "상대방도 협조한다는 가정을 잊음", "time horizon을 무한대로 둬 지나치게 보수적"],
    extensionTask: "상대방이 멈추지 않는 경우와 협조하는 경우의 feasible velocity set을 비교하라.",
    visualId: "vis_orca_velocity_cone",
    visualTitle: "ORCA Velocity Cone + Allowed Velocity Set",
    visualParams: [param("relative_speed", "v_{rel}", 0, 5, 0.5, "relative speed"), param("time_horizon", "T", 0.5, 10, 3, "ORCA time horizon"), param("robot_radius", "r", 0.1, 2, 0.5, "combined radius")],
    normalCase: "목표 속도와 가장 가까운 cone 밖 velocity를 고른다.",
    failureCase: "상대가 협조하지 않으면 reciprocal guarantee가 깨지고 stop/fallback이 필요하다.",
    quiz: {
      conceptQuestion: "ORCA에서 상대방이 cooperative하지 않으면 알고리즘이 보장하는 것은 무엇인가?",
      conceptAnswer: "reciprocal collision avoidance 보장은 깨지며 내 robot의 conservative stop/fallback만 보장할 수 있다.",
      calculationQuestion: "d=2, r=0.5, v=0.5이면 TTC는?",
      calculationAnswer: "3초이다.",
      codeQuestion: "TTC 계산 한 줄은?",
      codeAnswer: "ttc = (distance - combined_radius) / max(relative_speed, eps)",
      debugQuestion: "두 로봇이 서로 같은 방향으로 피하며 진동하면?",
      debugAnswer: "time horizon, responsibility split, velocity smoothing, priority rule을 확인한다.",
      visualQuestion: "relative speed가 커지면 cone은?",
      visualAnswer: "허용 속도 set이 줄고 TTC가 감소한다.",
      robotQuestion: "noncooperative obstacle은 어떻게 다루나?",
      robotAnswer: "사람/비협조 물체로 분류해 더 큰 safety radius와 stop policy를 둔다.",
      designQuestion: "ORCA local planner acceptance 기준은?",
      designAnswer: "collision-free, velocity/acc limit, noncooperative fallback, deadlock recovery, ROS2 command timeout이다.",
    },
    wrongTagLabel: "ORCA velocity obstacle 오류",
    nextSessions: ["mpc_soft_constraint_infeasibility", "nav2_behavior_tree_action_server"],
  },
  {
    id: "isam2_incremental_factor_graph",
    part: "Part 4. 자율주행과 SLAM",
    title: "iSAM2 Incremental Factor Graph Update",
    prerequisites: ["pose_graph_slam", "ekf_chi_squared_outlier_rejection"],
    objectives: ["factor graph linearization과 Bayes tree 업데이트를 설명한다.", "incremental relinearization의 장점을 이해한다.", "loop closure chi-squared rejection을 결합한다."],
    definition: "iSAM2는 factor graph를 매번 전체 batch solve하지 않고 Bayes tree 일부만 재선형화해 incremental smoothing을 수행한다.",
    whyItMatters: "SLAM에서 loop closure가 들어올 때 전체 그래프를 매번 다시 풀면 실시간성이 깨지고, outlier closure는 map을 찌그러뜨린다.",
    intuition: "새 edge가 영향을 주는 부분만 다시 정리해서 빠르게 지도를 고친다.",
    equation: "\\min_x\\sum_i\\|r_i(x_i)\\|^2_{\\Omega_i}",
    designEquation: "\\Delta x=(J^T\\Omega J)^{-1}J^T\\Omega r",
    failureEquation: "d^2_{loop}>\\chi^2\\Rightarrow reject\\ factor",
    terms: [["r_i", "factor residual"], ["Omega", "information"], ["Delta x", "increment"]],
    derivation: [["factor", "odometry/loop closure factor를 추가한다."], ["linearize", "관련 변수 주변 residual을 선형화한다."], ["bayes tree", "영향받은 clique만 업데이트한다."], ["gate", "loop residual이 chi2 gate를 넘으면 factor를 reject한다."]],
    handProblem: "loop closure residual d^2=12, threshold=5.99이면 factor 추가?",
    handGiven: { d2: 12, threshold: 5.99 },
    handSteps: ["12>5.99", "false closure 가능성", "factor reject"],
    handAnswer: "추가하지 않는다.",
    robotApplication: "GTSAM iSAM2를 이용한 pose graph SLAM에서 loop closure 후보를 robust kernel/chi2 gate로 걸러낸다.",
    labTitle: "iSAM2 Toy Factor Graph",
    args: ["residual", "information", "threshold"],
    sample: [2, 3, 5.99],
    codeExpression: "residual ** 2 * information - threshold",
    commonBugs: ["false loop closure를 바로 추가함", "information matrix scale을 잘못 둠", "relinearization threshold를 너무 크게 둠"],
    extensionTask: "toy chain graph에 loop factor를 하나씩 추가하며 affected variables count를 기록하라.",
    visualId: "vis_isam2_incremental_update",
    visualTitle: "iSAM2 Incremental Factor Update",
    visualParams: [param("loop_residual", "r_l", 0, 10, 1, "loop closure residual"), param("relinearization_threshold", "\\epsilon_r", 0.001, 1, 0.1, "relinearization threshold"), param("affected_cliques", "C", 1, 20, 4, "updated Bayes tree cliques")],
    normalCase: "새 factor가 일부 clique만 업데이트하고 map drift를 줄인다.",
    failureCase: "false loop closure가 gate 없이 들어오면 전체 map이 찌그러진다.",
    quiz: {
      conceptQuestion: "iSAM2가 batch pose graph와 다른 점은?",
      conceptAnswer: "전체를 매번 다시 풀지 않고 Bayes tree에서 영향받은 부분만 incremental update한다.",
      calculationQuestion: "residual=2, information=3이면 d^2는?",
      calculationAnswer: "2^2*3=12이다.",
      codeQuestion: "weighted residual cost 한 줄은?",
      codeAnswer: "cost = r.T @ Omega @ r",
      debugQuestion: "loop closure 후 map이 찌그러지면?",
      debugAnswer: "false closure, chi2 gate, robust kernel, information scale, timestamp를 확인한다.",
      visualQuestion: "affected cliques가 많아지면?",
      visualAnswer: "incremental update 비용이 커져 batch solve에 가까워진다.",
      robotQuestion: "실시간 SLAM에서 loop closure 검증은?",
      robotAnswer: "appearance score, geometric verification, chi2 residual, robust kernel을 모두 통과해야 한다.",
      designQuestion: "iSAM2 SLAM pipeline은?",
      designAnswer: "odometry factor, loop candidate, outlier gate, incremental update, map consistency metric 순서다.",
    },
    wrongTagLabel: "iSAM2/factor graph update 오류",
    nextSessions: ["fisher_information_observability", "orca_velocity_obstacle_avoidance"],
  },
  {
    id: "domain_randomization_adr_gap_design",
    part: "Part 7. Physical AI / Embodied AI",
    title: "Domain Randomization 분포 설계와 ADR Gap 평가",
    prerequisites: ["sim2real_domain_randomization", "rssm_elbo_kl_world_model"],
    objectives: ["uniform/normal/log-uniform 분포 선택 기준을 설명한다.", "ADR로 randomization range를 자동 조절한다.", "DR gap을 metric으로 정량화한다."],
    definition: "Domain randomization 설계는 실제 domain parameter를 덮는 분포를 만들고, success gap에 따라 범위를 조절하는 방법론이다.",
    whyItMatters: "마찰, 질량, latency 분포를 대충 넓히면 policy가 보수적이거나 sim-only trick을 배운다.",
    intuition: "실제 세계가 나올 법한 범위를 넓게 연습하되, 너무 말도 안 되는 세계까지 연습시키지는 않는다.",
    equation: "\\phi\\sim p(\\phi),\\quad gap=J_{sim}-J_{real}",
    designEquation: "range_{t+1}=range_t+\\eta(gap-g_{target})",
    failureEquation: "p_{train}(\\phi)\\not\\supset p_{real}(\\phi)\\Rightarrow sim2real\\ fail",
    terms: [["phi", "domain parameter"], ["gap", "sim-real performance gap"], ["ADR", "automatic domain randomization"]],
    derivation: [["identify", "민감한 parameter를 찾는다."], ["distribution", "물리 prior에 맞는 분포 family를 고른다."], ["sweep", "success sensitivity를 측정한다."], ["adapt", "ADR로 range를 success gap에 맞춰 조절한다."]],
    handProblem: "sim success 0.9, real success 0.6이면 gap은?",
    handGiven: { sim: 0.9, real: 0.6 },
    handSteps: ["gap=0.9-0.6", "=0.3", "분포 mismatch가 크다."],
    handAnswer: "gap=0.3",
    robotApplication: "grasp policy에서 friction, mass, camera noise, latency를 실제 로그 기반 분포로 randomize한다.",
    labTitle: "Domain Randomization Sensitivity Sweep",
    args: ["sim_success", "real_success", "adr_gain"],
    sample: [0.9, 0.6, 0.5],
    codeExpression: "adr_gain * (sim_success - real_success)",
    commonBugs: ["uniform 분포만 무조건 씀", "실제 로그 분포를 측정하지 않음", "success gap 없이 range를 넓히기만 함"],
    extensionTask: "friction coefficient를 normal/uniform/log-uniform으로 바꿔 success gap을 비교하라.",
    visualId: "vis_domain_randomization_sensitivity",
    visualTitle: "Domain Randomization Distribution Sensitivity",
    visualParams: [param("friction_range", "\\Delta\\mu", 0, 2, 0.5, "friction randomization width"), param("mass_range", "\\Delta m", 0, 5, 1, "mass randomization width"), param("real_gap_target", "g^*", 0, 1, 0.1, "target sim-real gap")],
    normalCase: "train distribution이 real logs를 덮고 success gap이 작다.",
    failureCase: "분포가 너무 좁거나 넓어 real success가 낮아진다.",
    quiz: {
      conceptQuestion: "domain randomization에서 friction coefficient 분포를 normal vs uniform으로 선택하는 기준은?",
      conceptAnswer: "실제 로그가 평균 주변에 모이면 normal, bounded worst-case coverage가 목적이면 uniform, scale 변화가 크면 log-uniform을 고려한다.",
      calculationQuestion: "sim success 0.9, real 0.6이면 gap은?",
      calculationAnswer: "0.3이다.",
      codeQuestion: "gap 계산 한 줄은?",
      codeAnswer: "gap = sim_success - real_success",
      debugQuestion: "sim에서는 성공하지만 real에서 미끄러지면?",
      debugAnswer: "friction distribution, contact model, sensor noise, latency, object mass logs를 확인한다.",
      visualQuestion: "friction range를 넓히면?",
      visualAnswer: "coverage는 늘지만 너무 넓으면 policy가 보수적이거나 학습이 어려워진다.",
      robotQuestion: "ADR 적용 전 필요한 데이터는?",
      robotAnswer: "real parameter logs, failure taxonomy, success metric, safe rollout boundary다.",
      designQuestion: "DR 설계 순서는?",
      designAnswer: "parameter 식별, real log 측정, 분포 family 선택, sensitivity sweep, ADR update, real validation이다.",
    },
    wrongTagLabel: "Domain randomization/ADR 설계 오류",
    nextSessions: ["pi0_openvla_diffusion_token_policy", "integration_project_safety_pipeline"],
  },
  {
    id: "mpc_soft_constraint_infeasibility",
    part: "Part 3. 로봇 동역학과 제어",
    title: "MPC Infeasibility와 Constraint Softening",
    prerequisites: ["mpc_formulation", "lqr_bryson_rule_pole_design"],
    objectives: ["hard constraint infeasibility를 진단한다.", "slack variable과 penalty를 설계한다.", "fallback trajectory와 safety stop을 연결한다."],
    definition: "Soft constraint MPC는 hard constraint를 항상 만족할 수 없을 때 slack variable을 추가하고 큰 penalty로 violation을 최소화한다.",
    whyItMatters: "실제 local planner에서 장애물과 동역학 constraint가 충돌하면 solver infeasible이 되고 command가 끊긴다.",
    intuition: "절대 못 푸는 문제 대신 아주 비싸게 어기는 비상문을 만들어 solver가 멈추지 않게 한다.",
    equation: "g(x,u)\\le s,\\quad s\\ge0",
    designEquation: "J=J_{track}+\\rho\\|s\\|_1",
    failureEquation: "s>s_{max}\\Rightarrow fallback/stop",
    terms: [["s", "slack"], ["rho", "slack penalty"], ["g", "constraint"]],
    derivation: [["detect", "solver infeasible status를 감지한다."], ["slack", "constraint에 nonnegative slack을 붙인다."], ["penalty", "rho를 tracking cost보다 크게 둔다."], ["fallback", "slack이 커지면 stop trajectory를 선택한다."]],
    handProblem: "constraint violation 0.2, rho=100이면 slack cost는?",
    handGiven: { s: 0.2, rho: 100 },
    handSteps: ["cost=rho*s", "100*0.2", "=20"],
    handAnswer: "slack cost=20",
    robotApplication: "Nav2 MPPI/MPC local planner에서 obstacle constraint가 infeasible하면 slack과 emergency stop을 사용한다.",
    labTitle: "MPC Softened Constraint",
    args: ["violation", "slack_penalty", "tracking_cost"],
    sample: [0.2, 100, 5],
    codeExpression: "tracking_cost + slack_penalty * max(0.0, violation)",
    commonBugs: ["slack penalty를 너무 작게 둬 장애물을 통과함", "slack이 커져도 fallback을 안 함", "solver infeasible status를 success로 처리함"],
    extensionTask: "rho를 sweep하며 tracking error와 max violation을 비교하라.",
    visualId: "vis_mpc_soft_slack",
    visualTitle: "MPC Soft Constraint Slack Visualization",
    visualParams: [param("slack_penalty", "\\rho", 1, 1000, 100, "slack penalty"), param("obstacle_distance", "d_{obs}", 0, 5, 1, "obstacle clearance"), param("tracking_weight", "Q", 0.1, 100, 10, "tracking cost weight")],
    normalCase: "slack이 거의 0이고 tracking constraint를 만족한다.",
    failureCase: "slack이 커지면 planner가 safety fallback으로 전환한다.",
    quiz: {
      conceptQuestion: "MPC에서 constraint가 infeasible할 때 softening slack penalty를 어떻게 설정하는가?",
      conceptAnswer: "tracking cost보다 충분히 크게 둬 violation은 최후 수단이 되게 하되 infeasible로 멈추지 않게 한다.",
      calculationQuestion: "s=0.2, rho=100이면 cost는?",
      calculationAnswer: "20이다.",
      codeQuestion: "slack cost 한 줄은?",
      codeAnswer: "cost += rho * np.maximum(0.0, violation)",
      debugQuestion: "solver infeasible이 반복되면?",
      debugAnswer: "constraint 충돌, horizon, warm start, slack penalty, fallback trajectory를 확인한다.",
      visualQuestion: "rho를 낮추면?",
      visualAnswer: "constraint violation을 더 쉽게 허용한다.",
      robotQuestion: "실제 로봇에서 slack이 커지면?",
      robotAnswer: "속도를 낮추거나 stop/fallback controller로 전환한다.",
      designQuestion: "MPC infeasibility 처리 순서는?",
      designAnswer: "status check, soft constraint, slack threshold, fallback trajectory, log/alert를 둔다.",
    },
    wrongTagLabel: "MPC soft constraint/infeasibility 오류",
    nextSessions: ["clf_cbf_qp_priority_resolution", "orca_velocity_obstacle_avoidance"],
  },
  {
    id: "clf_cbf_qp_priority_resolution",
    part: "Part 8. 실시간성, 안전성, 시스템 통합",
    title: "CLF-CBF QP Priority Resolution",
    prerequisites: ["cbf_qp_safety_filter", "lyapunov_stability_intro"],
    objectives: ["CLF 안정화와 CBF 안전 constraint 충돌을 설명한다.", "QP에서 safety priority를 설계한다.", "relaxation variable을 사용한다."],
    definition: "CLF-CBF QP는 목표 수렴(CLF)과 안전 집합 유지(CBF)를 함께 풀되, 충돌 시 CBF를 hard constraint로 우선한다.",
    whyItMatters: "목표로 가는 제어가 장애물 안전 constraint와 충돌하면 목표 추종보다 안전을 우선해야 한다.",
    intuition: "목표로 가고 싶어도 벽을 통과할 수는 없으므로 목표 조건만 부드럽게 어기게 만든다.",
    equation: "\\min_u\\|u-u_{nom}\\|^2+p\\delta^2",
    designEquation: "\\dot h+\\alpha h\\ge0,\\quad \\dot V+cV\\le\\delta",
    failureEquation: "CBF\\ infeasible\\Rightarrow emergency\\ stop",
    terms: [["h", "safety function"], ["V", "Lyapunov function"], ["delta", "CLF relaxation"]],
    derivation: [["nominal", "목표 추종 u_nom을 만든다."], ["CBF", "safety set을 hard constraint로 둔다."], ["CLF", "수렴 조건은 delta로 relax한다."], ["fallback", "CBF도 infeasible이면 stop한다."]],
    handProblem: "CLF와 CBF가 충돌할 때 QP에서 어떤 constraint를 우선시하는가?",
    handGiven: { clf: "soft", cbf: "hard" },
    handSteps: ["안전은 반드시 지켜야 한다.", "CLF에는 delta slack을 둔다.", "CBF infeasible이면 stop"],
    handAnswer: "CBF를 우선하고 CLF를 relax한다.",
    robotApplication: "mobile robot goal tracking 중 사람이 가까워지면 goal convergence보다 safety set 유지를 우선한다.",
    labTitle: "CBF-CLF Combined QP",
    args: ["nominal_speed", "safety_margin", "clf_relaxation"],
    sample: [1, 0.2, 0.1],
    codeExpression: "min(nominal_speed, max(0.0, safety_margin + clf_relaxation))",
    commonBugs: ["CLF를 hard로 둬 safety와 충돌시 infeasible", "CBF slack을 쉽게 허용함", "QP failure fallback을 빼먹음"],
    extensionTask: "obstacle distance를 sweep해 CLF relaxation과 selected control을 기록하라.",
    visualId: "vis_clf_cbf_qp_priority",
    visualTitle: "CLF-CBF Combined QP Priority",
    visualParams: [param("safety_margin_h", "h", -1, 5, 1, "CBF safety margin"), param("clf_weight", "p", 1, 1000, 100, "CLF relaxation penalty"), param("nominal_command", "u_{nom}", -2, 2, 1, "nominal command")],
    normalCase: "CBF와 CLF가 동시에 만족되어 목표로 안전하게 이동한다.",
    failureCase: "충돌 시 CLF가 relax되고, CBF infeasible이면 stop한다.",
    quiz: {
      conceptQuestion: "CLF와 CBF가 충돌할 때 QP에서 어떤 constraint를 우선시하는가?",
      conceptAnswer: "안전 constraint인 CBF를 hard로 우선하고 CLF에는 relaxation slack을 둔다.",
      calculationQuestion: "h<0이면 어떤 상태인가?",
      calculationAnswer: "safety set 밖이므로 nominal command보다 recovery/stop이 우선이다.",
      codeQuestion: "CLF relaxation constraint 표현은?",
      codeAnswer: "LfV + LgV @ u + c * V <= delta",
      debugQuestion: "QP infeasible이 뜨면?",
      debugAnswer: "CBF constraint 충돌, actuator bounds, alpha, fallback stop을 확인한다.",
      visualQuestion: "h가 0 아래로 가면?",
      visualAnswer: "허용 command set이 급격히 줄고 stop/recovery가 선택된다.",
      robotQuestion: "사람 접근 중 goal tracking은?",
      robotAnswer: "goal보다 CBF safety distance를 우선한다.",
      designQuestion: "CLF-CBF QP 설계 순서는?",
      designAnswer: "h,V 정의, CBF hard, CLF relaxed, actuator bounds, solver failure fallback을 둔다.",
    },
    wrongTagLabel: "CLF-CBF QP priority 오류",
    nextSessions: ["safety_emergency_stop_pipeline", "mpc_soft_constraint_infeasibility"],
  },
  {
    id: "laplace_final_value_bode_margin",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Laplace 역변환과 초기/최종값 정리, Bode Margin",
    prerequisites: ["laplace_z_bode_pid_design", "ode_euler_rk4"],
    objectives: ["inverse Laplace와 initial/final value theorem 조건을 설명한다.", "scipy.signal.bode로 gain/phase margin을 수치 계산한다.", "PID steady-state error와 pole 위치를 연결한다."],
    definition: "초기/최종값 정리는 안정 조건을 확인한 뒤 시간응답의 처음과 끝 값을 sF(s)의 s->infty, s->0 극한으로 계산하는 도구다.",
    whyItMatters: "Bode plot만 보고 transient/steady-state를 분리하지 못하면 PID tuning 실패 원인을 찾기 어렵다.",
    intuition: "처음 튀는 값은 s가 매우 큰 영역이, 오래 기다린 뒤 멈추는 값은 원점 근처 거동이 말해준다.",
    equation: "f(0^+)=\\lim_{s\\to\\infty}sF(s),\\quad f(\\infty)=\\lim_{s\\to0}sF(s)",
    designEquation: "PM=180^\\circ+\\angle L(j\\omega_c),\\quad |L(j\\omega_c)|=1",
    failureEquation: "RHP\\ pole\\Rightarrow FVT\\ invalid",
    terms: [["F(s)", "Laplace transform"], ["IVT", "initial value theorem"], ["PM", "phase margin"]],
    derivation: [["transform", "시간응답을 F(s)로 옮기고 필요하면 partial fraction으로 inverse Laplace를 계산한다."], ["initial", "s->infty에서 sF(s) 극한으로 초기값을 확인한다."], ["final", "sF(s)의 pole이 left-half plane인지 확인한 뒤 s->0 극한을 계산한다."], ["margin", "scipy.signal.bode의 0dB crossing에서 phase margin을 수치 계산한다."]],
    handProblem: "F(s)=1/(s+2)의 초기값과 최종값은?",
    handGiven: { denominator: "s+2" },
    handSteps: ["sF(s)=s/(s+2)", "s->infty이면 초기값 1", "s->0이면 최종값 0"],
    handAnswer: "초기값은 1, 최종값은 0이다.",
    robotApplication: "joint PID step response의 steady-state error와 Bode margin을 함께 보며 gain을 조정한다.",
    labTitle: "Final Value and Bode Margin Calculator",
    args: ["dc_gain", "pole", "input_step"],
    sample: [2, 4, 1],
    codeExpression: "dc_gain * input_step / max(pole, 1e-9)",
    commonBugs: ["불안정 pole에서 최종값 정리를 사용함", "initial value theorem과 final value theorem의 극한 방향을 바꿔 씀", "gain margin과 phase margin crossing을 바꿔 읽음"],
    extensionTask: "pole 위치와 gain K를 sweep하며 initial/final value, scipy.signal.bode phase margin, step overshoot를 함께 비교하라.",
    visualId: "vis_laplace_bode_margin_final_value",
    visualTitle: "Laplace Final Value and Bode Margin",
    visualParams: [param("dominant_pole", "p", -10, 1, -2, "dominant pole"), param("loop_gain", "K", 0.1, 100, 5, "loop gain"), param("phase_lag_deg", "\\phi", 0, 180, 45, "phase lag")],
    normalCase: "closed-loop pole이 stable이고 margin이 충분하다.",
    failureCase: "RHP pole 또는 낮은 phase margin이면 final value theorem 적용과 안정성이 깨진다.",
    quiz: {
      conceptQuestion: "Laplace 초기값/최종값 정리를 언제 쓸 수 있는가?",
      conceptAnswer: "초기값은 s->infty의 sF(s), 최종값은 안정 조건을 만족할 때 s->0의 sF(s)로 계산한다.",
      calculationQuestion: "F(s)=1/(s+2)의 초기값과 최종값은?",
      calculationAnswer: "lim s->infty s/(s+2)=1, lim s->0 s/(s+2)=0이다.",
      codeQuestion: "final value 계산 흐름은?",
      codeAnswer: "check_stable_poles(); final = limit(s * F, s, 0); initial = limit(s * F, s, oo)",
      debugQuestion: "Bode plot에서 gain margin과 phase margin을 어떻게 읽는가?",
      debugAnswer: "phase -180도에서 gain 여유, 0dB crossing에서 phase 여유를 읽는다.",
      visualQuestion: "phase lag가 커지면?",
      visualAnswer: "phase margin이 줄어 oscillation 위험이 커진다.",
      robotQuestion: "PID step이 진동하면?",
      robotAnswer: "phase margin, derivative filter, sample time, actuator saturation을 확인한다.",
      designQuestion: "PID frequency-domain 검증은?",
      designAnswer: "plant model, scipy.signal.bode margin, discrete mapping, saturation, initial/final value, time-domain step을 함께 본다.",
    },
    wrongTagLabel: "Laplace/Bode margin 해석 오류",
    nextSessions: ["butterworth_filter_order_design", "lqr_bryson_rule_pole_design"],
  },
  {
    id: "butterworth_filter_order_design",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Butterworth Filter Order 선택",
    prerequisites: ["low_pass_filter", "nyquist_aliasing"],
    objectives: ["Butterworth cutoff/order가 frequency response에 미치는 영향을 설명한다.", "IMU noise와 delay trade-off를 계산한다.", "scipy filter design 실습을 수행한다."],
    definition: "Butterworth filter는 passband가 maximally flat한 IIR filter이며 order가 높을수록 roll-off가 가파르지만 delay와 ringing 위험이 증가한다.",
    whyItMatters: "IMU/force sensor filtering에서 cutoff만 외우면 control delay와 phase lag를 놓친다.",
    intuition: "높은 차수는 노이즈를 더 세게 자르지만 신호를 늦게 전달한다.",
    equation: "|H(j\\omega)|^2=\\frac{1}{1+(\\omega/\\omega_c)^{2n}}",
    designEquation: "f_c<f_s/2",
    failureEquation: "phase\\ lag>T_{budget}\\Rightarrow control\\ delay",
    terms: [["n", "filter order"], ["omega_c", "cutoff"], ["f_s", "sample rate"]],
    derivation: [["spec", "pass/stop band와 sampling rate를 정한다."], ["order", "필요 attenuation으로 order를 고른다."], ["design", "bilinear transform/scipy butter를 사용한다."], ["validate", "frequency response와 step delay를 확인한다."]],
    handProblem: "4차 Butterworth의 cutoff에서 magnitude squared는?",
    handGiven: { omega: "omega_c" },
    handSteps: ["omega/omega_c=1", "denominator=1+1", "|H|^2=1/2"],
    handAnswer: "-3dB 지점이다.",
    robotApplication: "IMU gyro 60Hz cutoff를 선택할 때 vibration 제거와 attitude estimator delay를 함께 검증한다.",
    labTitle: "Butterworth Filter Design + IMU Data",
    args: ["order", "frequency_ratio", "noise_amp"],
    sample: [4, 2, 1],
    codeExpression: "noise_amp / np.sqrt(1.0 + frequency_ratio ** (2 * order))",
    commonBugs: ["cutoff를 Hz와 rad/s로 혼동함", "필터 order를 높이면 항상 좋다고 생각함", "phase delay를 제어 loop에서 무시함"],
    extensionTask: "2차/4차 60Hz cutoff의 magnitude와 group delay를 비교하라.",
    visualId: "vis_butterworth_frequency_response",
    visualTitle: "Butterworth Filter Frequency Response",
    visualParams: [param("filter_order", "n", 1, 8, 4, "filter order"), param("cutoff_hz", "f_c", 1, 200, 60, "cutoff frequency"), param("sample_rate_hz", "f_s", 50, 1000, 500, "sample rate")],
    normalCase: "noise attenuation과 phase delay가 control budget 안에 있다.",
    failureCase: "order/cutoff가 과하면 delay로 제어가 불안정해진다.",
    quiz: {
      conceptQuestion: "Butterworth 4차 필터의 60Hz cutoff vs 2차의 차이는?",
      conceptAnswer: "4차는 roll-off가 더 가파르지만 phase lag와 ringing 위험이 더 크다.",
      calculationQuestion: "cutoff에서 magnitude squared는?",
      calculationAnswer: "1/2, 즉 -3dB이다.",
      codeQuestion: "scipy 설계 한 줄은?",
      codeAnswer: "b, a = scipy.signal.butter(order, cutoff, fs=fs)",
      debugQuestion: "필터 후 제어가 늦게 반응하면?",
      debugAnswer: "cutoff, order, group delay, sample rate, timestamp alignment를 확인한다.",
      visualQuestion: "order를 높이면 frequency response는?",
      visualAnswer: "cutoff 이후 감쇠가 가팔라지고 phase lag가 커진다.",
      robotQuestion: "IMU filter를 실제 로봇에 넣기 전?",
      robotAnswer: "raw/filtered spectrum, delay, estimator innovation, control stability를 검증한다.",
      designQuestion: "filter order 선택 절차는?",
      designAnswer: "noise spectrum, signal bandwidth, delay budget, stability margin, real log replay로 고른다.",
    },
    wrongTagLabel: "Butterworth filter/order 오류",
    nextSessions: ["laplace_final_value_bode_margin", "cpp_realtime_control_loop_jitter"],
  },
  {
    id: "chebyshev_butterworth_filter_design",
    part: "Part 1. Physical AI를 위한 기초수학",
    title: "Butterworth vs Chebyshev Filter Order 설계",
    prerequisites: ["butterworth_filter_order_design", "nyquist_aliasing"],
    objectives: ["Butterworth와 Chebyshev filter의 passband 특성을 비교한다.", "buttord/cheb1ord로 필요한 filter order를 계산한다.", "IMU filter에서 ripple, attenuation, phase delay trade-off를 판단한다."],
    definition: "Butterworth는 passband가 maximally flat하고 Chebyshev Type I은 passband ripple을 허용하는 대신 더 가파른 transition을 얻는 IIR filter 설계다.",
    whyItMatters: "IMU/force sensor 신호에서 노이즈를 자르려다 ripple이나 group delay를 만들면 state estimator와 제어 loop가 불안정해질 수 있다.",
    intuition: "Butterworth는 부드럽게 깎는 칼이고, Chebyshev는 작은 물결을 허용하는 대신 더 날카롭게 자르는 칼이다.",
    equation: "N_b=buttord(f_p,f_s,A_p,A_s),\\quad N_c=cheb1ord(f_p,f_s,A_p,A_s)",
    designEquation: "A_p\\le ripple_{max},\\quad A_s\\ge attenuation_{min}",
    failureEquation: "ripple\\ or\\ group\\ delay>budget\\Rightarrow reject",
    terms: [["A_p", "passband ripple"], ["A_s", "stopband attenuation"], ["N", "filter order"]],
    derivation: [["spec", "passband, stopband, ripple, attenuation, sample rate를 정한다."], ["order", "buttord와 cheb1ord로 필요한 최소 차수를 계산한다."], ["response", "freqz로 magnitude/phase/group delay를 비교한다."], ["robot", "IMU log replay에서 estimator innovation과 control delay를 검증한다."]],
    handProblem: "같은 pass/stop spec에서 Chebyshev order가 Butterworth보다 낮을 수 있는 이유는?",
    handGiven: { passband_ripple_db: 1, stopband_attenuation_db: 30 },
    handSteps: ["Chebyshev는 passband ripple을 허용한다.", "ripple을 대가로 transition band가 더 가파르다.", "따라서 같은 attenuation에 더 낮은 order가 가능하다."],
    handAnswer: "passband flatness를 일부 포기해 더 낮은 order와 작은 연산량을 얻을 수 있다.",
    robotApplication: "IMU gyro vibration 제거에서 Butterworth와 Chebyshev를 모두 설계한 뒤 attitude EKF innovation, phase delay, motor vibration band attenuation을 비교한다.",
    labTitle: "Butterworth vs Chebyshev Filter Order Design",
    args: ["ripple_db", "attenuation_db", "transition_width"],
    sample: [1, 30, 40],
    codeExpression: "attenuation_db / max(ripple_db * transition_width, 1e-9)",
    commonBugs: ["Chebyshev passband ripple을 센서 노이즈로 오해함", "dB attenuation을 linear 값으로 넣음", "order만 낮추고 phase/group delay 검증을 빼먹음"],
    extensionTask: "실제 IMU log에 Butterworth와 Chebyshev를 적용하고 spectrum, group delay, EKF innovation variance를 비교하라.",
    visualId: "vis_chebyshev_butterworth_order_compare",
    visualTitle: "Butterworth vs Chebyshev Filter Order",
    visualParams: [param("passband_ripple_db", "A_p", 0.1, 3, 1, "passband ripple dB"), param("stopband_attenuation_db", "A_s", 10, 80, 30, "stopband attenuation dB"), param("transition_width_hz", "\\Delta f", 1, 200, 40, "transition band width")],
    normalCase: "요구 attenuation을 만족하면서 ripple과 delay가 estimator budget 안에 있다.",
    failureCase: "order만 보고 선택하면 passband ripple이나 phase delay가 제어 loop를 망가뜨린다.",
    quiz: {
      conceptQuestion: "Butterworth와 Chebyshev filter order 설계의 핵심 차이는?",
      conceptAnswer: "Butterworth는 passband flatness를 유지하고, Chebyshev는 ripple을 허용해 더 sharp한 transition과 낮은 order를 얻는다.",
      calculationQuestion: "Chebyshev가 같은 attenuation에서 더 낮은 order가 가능한 이유는?",
      calculationAnswer: "passband ripple 제약을 허용해 transition band roll-off를 더 가파르게 만들기 때문이다.",
      codeQuestion: "scipy로 두 order를 비교하는 함수는?",
      codeAnswer: "butter_order, _ = scipy.signal.buttord(fp, fsb, Ap, As, fs=fs); cheby_order, _ = scipy.signal.cheb1ord(fp, fsb, Ap, As, fs=fs)",
      debugQuestion: "필터 후 attitude EKF innovation이 커지면?",
      debugAnswer: "passband ripple, group delay, cutoff/order, timestamp alignment, vibration aliasing을 확인한다.",
      visualQuestion: "passband_ripple_db를 키우면 Chebyshev order는?",
      visualAnswer: "대체로 더 낮아질 수 있지만 passband ripple이 커져 신호 왜곡 위험이 증가한다.",
      robotQuestion: "IMU filter를 실제 로봇에 넣기 전 무엇을 비교하나?",
      robotAnswer: "raw/filtered spectrum, group delay, EKF innovation, control response, vibration band attenuation을 비교한다.",
      designQuestion: "filter family 선택 절차는?",
      designAnswer: "noise spectrum, passband distortion 허용치, stopband attenuation, delay budget, estimator replay 결과로 선택한다.",
    },
    wrongTagLabel: "Butterworth/Chebyshev filter 설계 오류",
    nextSessions: ["cpp_realtime_control_loop_jitter", "ekf_chi_squared_outlier_rejection"],
  },
  {
    id: "jerk_continuous_quintic_trajectory",
    part: "Part 2. 로봇 수학",
    title: "Jerk-continuous 5차 Polynomial Trajectory",
    prerequisites: ["trajectory_planning", "calculus_derivative_chain_rule"],
    objectives: ["5차 polynomial boundary condition을 세운다.", "velocity/acceleration continuity와 jerk profile을 해석한다.", "trajectory time scaling의 actuator 영향까지 검증한다."],
    definition: "5차 polynomial trajectory는 위치, 속도, 가속도 시작/끝 조건 6개를 만족해 acceleration discontinuity를 줄이는 time scaling이다.",
    whyItMatters: "jerk가 큰 trajectory는 로봇팔 vibration, current spike, tracking error를 만든다.",
    intuition: "출발과 도착에서 위치뿐 아니라 속도와 가속도도 부드럽게 맞추는 곡선이다.",
    equation: "q(t)=a_0+a_1t+a_2t^2+a_3t^3+a_4t^4+a_5t^5",
    designEquation: "q(0),\\dot q(0),\\ddot q(0),q(T),\\dot q(T),\\ddot q(T)",
    failureEquation: "T\\downarrow\\Rightarrow jerk\\uparrow",
    terms: [["T", "duration"], ["jerk", "third derivative"], ["a_i", "polynomial coefficient"]],
    derivation: [["boundary", "6개 boundary condition을 정한다."], ["linear system", "coefficient 6개를 푼다."], ["differentiate", "velocity/acceleration/jerk를 계산한다."], ["check", "limit과 vibration을 확인한다."]],
    handProblem: "5차 polynomial에서 jerk continuity를 위해 몇 개의 경계 조건이 필요한가?",
    handGiven: { degree: 5, coefficients: 6 },
    handSteps: ["5차 polynomial coefficient는 6개", "일반적으로 위치/속도/가속도 start/end 6개 조건", "jerk 자체는 profile을 검증한다."],
    handAnswer: "6개 조건이 필요하다.",
    robotApplication: "MoveIt time parameterization이나 custom joint trajectory에서 current spike를 줄이기 위해 jerk profile을 확인한다.",
    labTitle: "Jerk-continuous Quintic Trajectory",
    args: ["distance", "duration", "jerk_scale"],
    sample: [1, 2, 60],
    codeExpression: "jerk_scale * distance / max(duration ** 3, 1e-9)",
    commonBugs: ["cubic으로 acceleration jump를 방치함", "T를 너무 짧게 잡음", "jerk limit 없이 velocity/acc만 확인함"],
    extensionTask: "T를 sweep해 max velocity, acceleration, jerk를 표로 만들라.",
    visualId: "vis_quintic_jerk_profile",
    visualTitle: "5th Polynomial Trajectory Jerk Profile",
    visualParams: [param("duration", "T", 0.2, 10, 2, "trajectory duration"), param("distance", "\\Delta q", 0.1, 5, 1, "joint displacement"), param("jerk_limit", "j_{max}", 1, 500, 60, "allowed jerk")],
    normalCase: "position/velocity/acceleration boundary가 맞고 jerk가 limit 안에 있다.",
    failureCase: "duration이 짧으면 jerk가 커져 vibration과 tracking error가 생긴다.",
    quiz: {
      conceptQuestion: "5차 polynomial trajectory를 쓰는 이유는?",
      conceptAnswer: "start/end position, velocity, acceleration 조건을 동시에 만족해 더 부드러운 trajectory를 만들기 위해서다.",
      calculationQuestion: "5차 polynomial boundary condition 수는?",
      calculationAnswer: "coefficient가 6개이므로 6개 조건이 필요하다.",
      codeQuestion: "jerk 계산 한 줄은?",
      codeAnswer: "jerk = np.gradient(acceleration, dt)",
      debugQuestion: "trajectory tracking 중 current spike가 나면?",
      debugAnswer: "duration, jerk limit, acceleration discontinuity, actuator limit을 확인한다.",
      visualQuestion: "duration을 줄이면 jerk profile은?",
      visualAnswer: "최대 jerk가 T^3에 반비례해 빠르게 커진다.",
      robotQuestion: "실제 팔에 trajectory를 보내기 전?",
      robotAnswer: "position/velocity/acceleration/jerk/torque limit을 모두 확인한다.",
      designQuestion: "trajectory acceptance 기준은?",
      designAnswer: "boundary condition, limit compliance, collision check, controller tracking margin, emergency stop을 포함한다.",
    },
    wrongTagLabel: "Quintic trajectory/jerk continuity 오류",
    nextSessions: ["spatial_rnea_6dof_backward_pass", "mpc_soft_constraint_infeasibility"],
  },
  {
    id: "tensorrt_real_onnx_inference_calibration",
    part: "Part 5. 인식 AI와 로봇 비전",
    title: "TensorRT 실제 ONNX Inference와 INT8 Calibration",
    prerequisites: ["tensorrt_onnx_quantization_pipeline", "object_detection_iou_nms"],
    objectives: ["contract test와 실제 TensorRT inference를 구분한다.", "INT8 calibration dataset 품질이 accuracy에 미치는 영향을 설명한다.", "latency/accuracy Pareto를 실측한다."],
    definition: "실제 TensorRT 배포는 ONNX parser, builder config, calibration cache, engine 실행, output validation까지 포함한다.",
    whyItMatters: "shape contract만 통과해도 TensorRT를 할 줄 안다고 착각하면 실제 Jetson/nvidia-docker에서 layer fallback과 INT8 accuracy drop을 못 잡는다.",
    intuition: "모델 파일이 맞는지 보는 것과 GPU engine이 실제로 빠르고 정확하게 도는지는 다른 문제다.",
    equation: "T_{total}=T_{pre}+T_{engine}+T_{post}",
    designEquation: "\\Delta acc=acc_{fp32}-acc_{int8}",
    failureEquation: "\\Delta acc>budget\\ or\\ T_{total}>deadline\\Rightarrow reject",
    terms: [["T_engine", "TensorRT engine latency"], ["INT8", "quantized inference"], ["calib", "calibration dataset"]],
    derivation: [["export", "PyTorch/ONNX를 dynamic/static shape로 export한다."], ["build", "TensorRT builder config와 calibration cache를 만든다."], ["run", "engine input/output buffer를 실행한다."], ["validate", "latency, output drift, safety-class recall을 비교한다."]],
    handProblem: "FP32 accuracy 0.92, INT8 accuracy 0.88이면 drop은?",
    handGiven: { fp32: 0.92, int8: 0.88 },
    handSteps: ["drop=0.92-0.88", "=0.04", "budget과 비교"],
    handAnswer: "accuracy drop=0.04",
    robotApplication: "Jetson perception node에서 TensorRT engine latency와 safety class recall을 ROS2 topic timestamp와 함께 기록한다.",
    labTitle: "TensorRT Real ONNX Inference Contract",
    args: ["fp32_accuracy", "int8_accuracy", "latency_ms"],
    sample: [0.92, 0.88, 18],
    codeExpression: "(fp32_accuracy - int8_accuracy) * 100.0 + latency_ms / 1000.0",
    commonBugs: ["ONNX shape test만 하고 engine 실행을 안 함", "calibration dataset이 train distribution을 덮지 않음", "postprocess NMS latency를 누락함"],
    extensionTask: "nvidia-docker 또는 Jetson에서 FP32/FP16/INT8 latency와 recall을 표로 기록하라.",
    visualId: "vis_tensorrt_real_onnx_latency_calibration",
    visualTitle: "TensorRT ONNX Inference and INT8 Calibration",
    visualParams: [param("calibration_size", "N_{cal}", 10, 5000, 500, "calibration image count"), param("engine_precision", "p", 8, 32, 16, "engine precision bits"), param("latency_budget_ms", "T_{max}", 1, 100, 33, "latency budget")],
    normalCase: "latency와 accuracy drop이 모두 budget 안에 있다.",
    failureCase: "calibration data가 부족해 safety class recall이 크게 떨어진다.",
    quiz: {
      conceptQuestion: "TensorRT contract test와 실제 inference의 차이는?",
      conceptAnswer: "contract test는 shape/type만 확인하고 실제 TensorRT engine build, calibration, latency, output drift 검증은 별도다.",
      calculationQuestion: "FP32 0.92, INT8 0.88이면 drop은?",
      calculationAnswer: "0.04이다.",
      codeQuestion: "latency budget check 한 줄은?",
      codeAnswer: "assert total_latency_ms < deadline_ms",
      debugQuestion: "TensorRT INT8 calibration dataset이 부족하면 어떤 layer에서 accuracy drop이 생기는가?",
      debugAnswer: "activation range가 representative하지 않은 conv/attention/normalization 주변 quantized layer에서 safety class recall drop이 생길 수 있다.",
      visualQuestion: "calibration size를 늘리면?",
      visualAnswer: "activation range 추정이 안정되어 INT8 accuracy drop이 줄 수 있다.",
      robotQuestion: "ROS2 perception 배포 전 무엇을 측정하나?",
      robotAnswer: "preprocess, engine, postprocess latency와 class별 recall, timestamp delay를 측정한다.",
      designQuestion: "TensorRT 배포 checklist는?",
      designAnswer: "ONNX export, engine build, calibration set, latency trace, output parity, fallback runtime, regression test다.",
    },
    wrongTagLabel: "TensorRT real inference/calibration 오류",
    nextSessions: ["vlm_architecture_to_vla_bridge", "cpp_realtime_control_loop_jitter"],
  },
  {
    id: "vlm_vla_lora_finetuning_dataset",
    part: "Part 7. Physical AI / Embodied AI",
    title: "VLM/VLA Fine-tuning: LoRA, Dataset Coverage, Safety Eval",
    prerequisites: ["llava_cross_attention_vla_grounding", "pi0_openvla_diffusion_token_policy"],
    objectives: ["LoRA fine-tuning이 base VLM weight를 어떻게 바꾸는지 설명한다.", "로봇 instruction-action dataset coverage를 평가한다.", "fine-tuned VLA를 safety eval과 grounding eval로 검증한다."],
    definition: "VLM/VLA fine-tuning은 vision-language backbone 또는 action head를 robot instruction/action dataset에 맞춰 적응시키되, LoRA 같은 low-rank adapter와 safety evaluation으로 base capability 손상을 줄이는 절차다.",
    whyItMatters: "VLM fine-tuning 없이 prompt만 조정하면 현장 물체, 카메라 각도, gripper action 형식에 맞지 않아 VLA 연결이 피상적으로 끝난다.",
    intuition: "기존 큰 모델의 습관은 유지하면서 로봇 현장의 말투, 물체, action format만 얇은 adapter로 가르치는 방식이다.",
    equation: "\\Delta W=BA,\\quad rank(A)=rank(B)=r",
    designEquation: "L=L_{action}+\\lambda L_{grounding}+\\gamma L_{safety}",
    failureEquation: "D_{train}\\not\\supset D_{eval}\\Rightarrow grounding/action\\ drift",
    terms: [["r", "LoRA rank"], ["L_action", "action supervision loss"], ["D_train", "fine-tuning dataset"]],
    derivation: [["freeze", "base VLM weight는 고정하고 adapter만 학습한다."], ["adapter", "low-rank BA update로 task-specific 변화를 제한한다."], ["dataset", "instruction, image, robot state, action을 같은 timestamp로 묶는다."], ["eval", "grounding, action accuracy, latency, unsafe action rate를 분리 평가한다."]],
    handProblem: "LoRA rank r=8, hidden size 1024이면 한 projection adapter parameter scale은?",
    handGiven: { rank: 8, hidden: 1024 },
    handSteps: ["A와 B가 각각 hidden*rank 규모", "2*1024*8", "=16384"],
    handAnswer: "대략 16,384개로 full 1024x1024보다 훨씬 작다.",
    robotApplication: "현장 pick/place 명령과 camera crop, gripper action 로그로 adapter를 학습하고, unseen object와 unsafe instruction에서 stop rate를 검증한다.",
    labTitle: "LoRA Fine-tuning Coverage Score",
    args: ["train_loss", "val_loss", "lora_rank"],
    sample: [0.3, 0.45, 8],
    codeExpression: "(val_loss - train_loss) + 1.0 / max(lora_rank, 1e-9)",
    commonBugs: ["train loss만 보고 overfit을 놓침", "unsafe instruction eval 없이 action head를 배포함", "image/action timestamp mismatch를 데이터셋에 남김"],
    extensionTask: "LoRA rank와 dataset size를 sweep해 validation grounding accuracy, unsafe action rate, latency를 표로 만들라.",
    visualId: "vis_vlm_vla_lora_finetuning_coverage",
    visualTitle: "VLM/VLA LoRA Fine-tuning Coverage",
    visualParams: [param("lora_rank", "r", 1, 64, 8, "LoRA adapter rank"), param("dataset_coverage", "C_D", 0, 1, 0.7, "instruction/object/action coverage"), param("unsafe_eval_rate", "p_{unsafe}", 0, 1, 0.02, "unsafe action rate")],
    normalCase: "adapter가 validation grounding을 높이고 unsafe action rate는 낮게 유지한다.",
    failureCase: "dataset coverage가 좁으면 unseen object와 phrasing에서 action drift가 생긴다.",
    quiz: {
      conceptQuestion: "VLM fine-tuning에서 LoRA를 쓰는 이유는?",
      conceptAnswer: "base model을 크게 훼손하지 않고 low-rank adapter만 학습해 현장 instruction/action format에 적응시키기 위해서다.",
      calculationQuestion: "hidden 1024, rank 8이면 adapter parameter scale은?",
      calculationAnswer: "2*1024*8=16,384개 수준이다.",
      codeQuestion: "LoRA update 개념 한 줄은?",
      codeAnswer: "W_eff = W_base + B @ A",
      debugQuestion: "train은 좋은데 validation grounding이 나쁘면?",
      debugAnswer: "dataset coverage, object split leakage, prompt 다양성, timestamp/action alignment, unsafe eval을 확인한다.",
      visualQuestion: "dataset coverage를 높이면?",
      visualAnswer: "unseen phrasing/object에서 grounding/action drift가 줄어든다.",
      robotQuestion: "fine-tuned VLA를 실제 로봇에 바로 올려도 되는가?",
      robotAnswer: "안 된다. shadow mode, safety gate, collision check, unsafe instruction eval을 먼저 통과해야 한다.",
      designQuestion: "VLA fine-tuning report에 들어갈 항목은?",
      designAnswer: "dataset schema, split, LoRA rank, loss curve, grounding eval, action eval, latency, unsafe action rate, rollback plan이다.",
    },
    wrongTagLabel: "VLM/VLA fine-tuning dataset/eval 오류",
    nextSessions: ["system_parameter_selection_report", "robot_foundation_model_deployment"],
  },
  {
    id: "system_parameter_selection_report",
    part: "Part 9. 통합 미니 프로젝트",
    title: "Open-ended 시스템 설계와 파라미터 선택 보고서",
    prerequisites: ["mpc_soft_constraint_infeasibility", "domain_randomization_adr_gap_design", "tensorrt_real_onnx_inference_calibration"],
    objectives: ["전체 로봇 시스템의 파라미터 선택 근거를 보고서로 작성한다.", "latency, safety, accuracy, robustness trade-off를 수치로 비교한다.", "open-ended 설계 문제에서 acceptance criteria와 rollback plan을 정의한다."],
    definition: "파라미터 선택 보고서는 controller gain, filter cutoff, planner horizon, model threshold, safety margin을 선택한 근거와 실패 시 대책을 metric 중심으로 문서화하는 최종 설계 산출물이다.",
    whyItMatters: "실전에서는 정답 숫자 하나보다 왜 그 파라미터를 골랐고 어떤 조건에서 버릴 것인지 설명할 수 있어야 한다.",
    intuition: "로봇 프로젝트의 마지막 답안지는 코드가 아니라, 코드가 왜 안전하게 동작한다고 믿을 수 있는지 보여주는 증거 묶음이다.",
    equation: "Score=w_sS+w_aA-w_lL-w_rR",
    designEquation: "accept=(metric_i\\in budget_i)\\land fallback\\ tested",
    failureEquation: "deadline\\ miss\\lor unsafe\\ action\\Rightarrow reject",
    terms: [["S", "safety score"], ["A", "accuracy"], ["L", "latency"], ["R", "residual risk"]],
    derivation: [["scope", "task, hardware, sensors, deadline, safety constraints를 적는다."], ["parameters", "각 파라미터 후보와 선택 근거를 표로 만든다."], ["evidence", "실험 metric, log, visualization, 실패 사례를 붙인다."], ["decision", "accept/reject 기준과 rollback plan을 명시한다."]],
    handProblem: "deadline 20ms, measured 35ms이면 최종 report 판정은?",
    handGiven: { deadline_ms: 20, measured_ms: 35 },
    handSteps: ["35>20", "deadline miss", "비동기화/모델 경량화/fallback 필요"],
    handAnswer: "그대로 accept할 수 없고 설계 변경 또는 fallback 조건을 추가한다.",
    robotApplication: "자율주행 perception-to-control, 로봇팔 contact manipulation, VLA pick pipeline의 최종 프로젝트 rubric으로 사용한다.",
    labTitle: "Parameter Report Risk Score",
    args: ["risk_count", "deadline_ms", "validation_pass_rate"],
    sample: [2, 35, 0.8],
    codeExpression: "risk_count + max(0.0, deadline_ms - 20.0) / 20.0 + (1.0 - validation_pass_rate) * 5.0",
    commonBugs: ["성공 screenshot만 제출하고 metric을 빼먹음", "deadline miss를 평균 latency로 숨김", "fallback과 rollback plan이 없음"],
    extensionTask: "PID, MPC, TensorRT, VLA threshold 중 4개 파라미터를 골라 후보/metric/결정/rollback 표를 작성하라.",
    visualId: "vis_system_parameter_report_tradeoff",
    visualTitle: "System Parameter Report Trade-off Surface",
    visualParams: [param("system_safety_margin", "m_s", 0, 1, 0.5, "system-level safety margin"), param("latency_budget_ms", "T_{max}", 5, 100, 20, "deadline budget"), param("validation_pass_rate", "p_{pass}", 0, 1, 0.9, "validation pass rate")],
    normalCase: "모든 핵심 metric이 budget 안에 있고 rollback plan이 명확하다.",
    failureCase: "accuracy만 높고 deadline/safety/fallback 증거가 없으면 reject한다.",
    quiz: {
      conceptQuestion: "open-ended 파라미터 선택 보고서가 필요한 이유는?",
      conceptAnswer: "실전 로봇은 여러 정답 후보가 있고 safety, latency, accuracy trade-off를 증거로 설명해야 하기 때문이다.",
      calculationQuestion: "deadline 20ms, measured 35ms이면?",
      calculationAnswer: "15ms 초과이므로 accept 불가이며 비동기화, 경량화, fallback이 필요하다.",
      codeQuestion: "deadline check 한 줄은?",
      codeAnswer: "ok = measured_ms <= deadline_ms",
      debugQuestion: "보고서가 screenshot 위주이면 무엇이 빠졌는가?",
      debugAnswer: "metric, 실패 조건, parameter sweep, log, rollback plan이 빠졌다.",
      visualQuestion: "latency budget을 줄이면 trade-off surface는?",
      visualAnswer: "허용 가능한 모델/파라미터 영역이 좁아진다.",
      robotQuestion: "최종 배포 전 report가 reject되는 조건은?",
      robotAnswer: "deadline miss, unsafe action, untested fallback, high residual risk 중 하나라도 있으면 reject한다.",
      designQuestion: "최종 report 목차는?",
      designAnswer: "system diagram, assumptions, parameter table, metrics, failure taxonomy, safety gates, acceptance criteria, rollback plan이다.",
    },
    wrongTagLabel: "Open-ended 시스템 설계/파라미터 보고서 오류",
    nextSessions: ["integration_project_safety_pipeline", "safety_emergency_stop_pipeline"],
  },
];

export const finalImprovementRoadmap = [
  {
    id: "stage-1-math-sensor-gates",
    title: "1단계: 기초수학 보강",
    concepts: ["Chi-squared outlier test", "Fisher Information Matrix", "KKT/OSQP active constraint", "Butterworth/Chebyshev filter design", "Laplace inverse/initial/final value transform"],
    why: "EKF/SLAM 실전에서 이상한 센서값을 버리고 필터/주파수 응답을 설계하는 기준을 세운다.",
    sessionIds: [
      "ekf_chi_squared_outlier_rejection",
      "fisher_information_observability",
      "kkt_osqp_active_constraints",
      "butterworth_filter_order_design",
      "chebyshev_butterworth_filter_design",
      "laplace_final_value_bode_margin",
    ],
    labExamples: ["scipy.stats.chi2.ppf(0.95, df=3)", "scipy.signal.bode(system, w=w)", "scipy.signal.butter(order, cutoff, fs=fs)", "scipy.signal.cheb1ord(fp, fsb, Ap, As, fs=fs)", "osqp.OSQP().solve().y"],
    examQuestionTypes: ["Mahalanobis distance=12.5, df=3이면 95% chi2 table에서 outlier인가?", "OSQP dual variable이 양수이면 어떤 constraint가 active인가?"],
    visualizationIds: ["vis_chi_squared_outlier_boundary", "vis_fisher_information_observability", "vis_kkt_osqp_active_constraints", "vis_butterworth_frequency_response", "vis_chebyshev_butterworth_order_compare"],
  },
  {
    id: "stage-2-robot-math-6dof",
    title: "2단계: 로봇수학 보강",
    concepts: ["Rank-nullity pseudo-inverse IK", "Geometric vs Analytic Jacobian", "se(3) exp map and velocity screw", "6DOF RNEA backward pass", "Bryson rule for LQR Q/R"],
    why: "산업용 6DOF 로봇팔에서 Jacobian singularity와 실시간 토크 계산을 다룬다.",
    sessionIds: ["rank_nullity_pseudoinverse_ik", "geometric_vs_analytic_jacobian", "se3_lie_algebra_expmap_twist", "spatial_rnea_6dof_backward_pass", "lqr_bryson_rule_pole_design"],
    labExamples: ["Python rank-deficient null-space IK", "Rodrigues formula to ROS2 tf2", "Python 3-link spatial RNEA backward pass", "payload 추가 시 proximal joint torque 변화 계산"],
    examQuestionTypes: ["rank-deficient Jacobian에서 IK 해가 unique하지 않은 이유는?", "3번 link에 1kg payload 추가 시 1번 joint torque 변화 계산"],
    visualizationIds: ["vis_rank_nullity_nullspace_ik", "vis_geometric_analytic_jacobian_compare", "vis_se3_expmap_twist_tf2", "vis_spatial_rnea_6dof_torque_chain", "vis_lqr_bryson_poles"],
  },
  {
    id: "stage-3-control-contact-safety",
    title: "3단계: 제어와 동역학 보강",
    concepts: ["Back-calculation anti-windup", "Admittance vs Impedance", "CLF-CBF 충돌 해결"],
    why: "ros2_control antiwindup 설정, 힘센서 유무에 따른 contact controller 선택, safety-priority QP를 이해한다.",
    sessionIds: ["back_calculation_antiwindup_control", "admittance_vs_impedance_control", "clf_cbf_qp_priority_resolution"],
    labExamples: ["Python back-calculation anti-windup과 clamping 비교 실험"],
    examQuestionTypes: ["힘센서 없는 UR10에서 impedance/admittance 중 무엇을 쓸 수 있는가? 이유는?"],
    visualizationIds: ["vis_backcalc_clamping_integral_compare", "vis_admittance_impedance_contact_response", "vis_clf_cbf_qp_priority"],
  },
  {
    id: "stage-4-perception-fusion-vlm",
    title: "4단계: 인식과 센서융합 보강",
    concepts: ["CLIP contrastive loss", "LLaVA cross-attention", "UKF alpha/beta/kappa"],
    why: "VLM embedding이 어떻게 만들어지고, 비선형 sensor fusion parameter가 localization 품질을 어떻게 바꾸는지 연결한다.",
    sessionIds: ["clip_contrastive_temperature_loss", "llava_cross_attention_vla_grounding", "ukf_alpha_beta_kappa_tuning"],
    labExamples: ["PyTorch CLIP-style contrastive loss", "UKF alpha parameter sensitivity sweep"],
    examQuestionTypes: ["tau=0.07과 tau=0.5에서 contrastive loss가 어떻게 달라지는가?"],
    visualizationIds: ["vis_clip_temperature_embedding", "vis_llava_cross_attention_grounding", "vis_ukf_alpha_sigma_points"],
  },
  {
    id: "stage-5-driving-arm-planning",
    title: "5단계: 자율주행과 로봇팔 보강",
    concepts: ["ORCA velocity obstacle", "iSAM2 incremental optimization", "Chi-squared loop closure"],
    why: "동적 장애물과 false loop closure 상황에서 DWA/pose graph만으로 부족한 안전 보장을 보강한다.",
    sessionIds: ["orca_velocity_obstacle_avoidance", "isam2_incremental_factor_graph", "ekf_chi_squared_outlier_rejection"],
    labExamples: ["Python ORCA 2-robot collision avoidance", "chi-squared loop closure rejection"],
    examQuestionTypes: ["DWA와 ORCA가 다른 가정은? 어떤 상황에서 ORCA가 더 안전한가?"],
    visualizationIds: ["vis_orca_velocity_cone", "vis_isam2_incremental_update", "vis_chi_squared_outlier_boundary"],
  },
  {
    id: "stage-6-physical-ai-world-models",
    title: "6단계: Physical AI 보강",
    concepts: ["RSSM ELBO loss", "π0 diffusion policy vs token action", "Domain randomization distribution design"],
    why: "World Model 논문과 VLA/foundation policy 배포를 수식, latency, sim2real gap 관점에서 읽을 수 있게 한다.",
    sessionIds: ["rssm_elbo_kl_world_model", "pi0_openvla_diffusion_token_policy", "domain_randomization_adr_gap_design"],
    labExamples: ["PyTorch RSSM posterior/prior KL divergence", "domain randomization distribution sensitivity sweep"],
    examQuestionTypes: ["RSSM에서 deterministic state와 stochastic state를 분리하는 이유는?"],
    visualizationIds: ["vis_rssm_latent_state_rollout", "vis_diffusion_policy_denoising", "vis_domain_randomization_sensitivity"],
  },
] as const;

export const contentQualityRemediationChecklist = [
  {
    problem: "spec 팩토리의 자동 파라미터 2/3번",
    whyItIsWeak: "모든 시각화가 disturbance_or_noise와 safety_margin을 공유하면 슬라이더와 현상 사이의 연결이 흐려진다.",
    missingCapability: "파라미터와 현상 연결 이해",
    remediation: "팩토리가 conceptTag별 의미 있는 2/3번 파라미터를 생성하고, Bode/PID에는 damping_ratio와 phase_margin_target을 둔다.",
    evidenceSessionIds: ["laplace_z_bode_pid_design"],
    evidenceVisualizationIds: ["vis_laplace_z_bode_pid"],
    example: "vis_laplace_z_bode_pid: sample_time, damping_ratio, phase_margin_target",
  },
  {
    problem: "Newton-Euler가 planar만",
    whyItIsWeak: "UR5, Franka 같은 실제 로봇팔은 3D spatial velocity와 wrench propagation이 필요하다.",
    missingCapability: "URDF 기반 6DOF 토크 계산",
    remediation: "3-link spatial RNEA backward pass와 S_i^T f_i torque projection 실습을 추가한다.",
    evidenceSessionIds: ["spatial_rnea_6dof_backward_pass"],
    evidenceVisualizationIds: ["vis_spatial_rnea_6dof_torque_chain"],
    example: "3번 link payload 추가 시 1번 joint torque 변화 계산",
  },
  {
    problem: "TensorRT lab이 contract test",
    whyItIsWeak: "CPU mock shape test만으로는 실제 Jetson/NVIDIA GPU 배포 역량을 보장하지 않는다.",
    missingCapability: "실제 TensorRT engine build, INT8 calibration, latency/accuracy 측정",
    remediation: "기존 lab에 CPU mock 경고를 명시하고, 실제 ONNX TensorRT inference/calibration 세션을 별도로 추가한다.",
    evidenceSessionIds: ["tensorrt_onnx_quantization_pipeline", "tensorrt_real_onnx_inference_calibration"],
    evidenceVisualizationIds: ["vis_tensorrt_latency_pareto", "vis_tensorrt_real_onnx_latency_calibration"],
    example: "nvidia-docker 또는 Jetson에서 trtexec/polygraphy로 engine build와 class별 recall을 측정",
  },
  {
    problem: "Dreamer RSSM 수식 없음",
    whyItIsWeak: "ELBO, posterior/prior KL, RSSM transition 수식 없이 world model 논문을 읽기 어렵다.",
    missingCapability: "World Model 논문 이해와 RSSM loss debugging",
    remediation: "RSSM ELBO loss와 posterior/prior KL divergence PyTorch 실습을 추가한다.",
    evidenceSessionIds: ["rssm_elbo_kl_world_model"],
    evidenceVisualizationIds: ["vis_rssm_latent_state_rollout"],
    example: "L = L_recon + L_reward + beta KL(q(z_t|h_t,o_t)||p(z_t|h_t))",
  },
  {
    problem: "VLM 수식 없음",
    whyItIsWeak: "CLIP contrastive loss와 cross-attention 없이 VLA fine-tuning pipeline 이해가 피상적이다.",
    missingCapability: "VLM/VLA grounding, fine-tuning, action gate 설계",
    remediation: "CLIP contrastive loss, LLaVA cross-attention, VLM/VLA LoRA fine-tuning 세션을 추가한다.",
    evidenceSessionIds: ["clip_contrastive_temperature_loss", "llava_cross_attention_vla_grounding", "vlm_vla_lora_finetuning_dataset"],
    evidenceVisualizationIds: ["vis_clip_temperature_embedding", "vis_llava_cross_attention_grounding", "vis_vlm_vla_lora_finetuning_coverage"],
    example: "L=-log exp(cos(v,t)/tau)/sum_j exp(cos(v,t_j)/tau)",
  },
  {
    problem: "Admittance vs Impedance 구분 없음",
    whyItIsWeak: "힘센서 유무와 controller causality를 모르면 로봇팔 구매/설정에서 잘못된 제어 방식을 고른다.",
    missingCapability: "contact controller 선택과 force sensing requirement 판단",
    remediation: "힘센서가 없으면 admittance 직접 구현은 불가하고, impedance/position compliance나 모델 기반 force 추정이 필요함을 명시한다.",
    evidenceSessionIds: ["admittance_vs_impedance_control"],
    evidenceVisualizationIds: ["vis_admittance_impedance_contact_response"],
    example: "F_meas missing -> admittance invalid",
  },
  {
    problem: "Back-calculation anti-windup 없음",
    whyItIsWeak: "clamping만 알면 ros2_control의 tracking/back-calculation 계열 antiwindup 설정을 이해하기 어렵다.",
    missingCapability: "실제 PID saturation recovery tuning",
    remediation: "u_back = u_sat - u_pid를 integral에 되먹이는 back-calculation 실습과 clamping 비교를 추가한다.",
    evidenceSessionIds: ["back_calculation_antiwindup_control"],
    evidenceVisualizationIds: ["vis_backcalc_clamping_integral_compare"],
    example: "I += e*dt + Ka*(u_sat-u_pid)*dt",
  },
  {
    problem: "Chi-squared outlier rejection 없음",
    whyItIsWeak: "센서값이 튈 때 EKF update를 막지 못하면 covariance와 pose가 함께 발산한다.",
    missingCapability: "실제 로봇 EKF/SLAM 발산 디버깅",
    remediation: "Mahalanobis distance와 scipy.stats.chi2.ppf 기반 gate를 코드랩과 시각화로 추가한다.",
    evidenceSessionIds: ["ekf_chi_squared_outlier_rejection", "isam2_incremental_factor_graph"],
    evidenceVisualizationIds: ["vis_chi_squared_outlier_boundary", "vis_isam2_incremental_update"],
    example: "d^2 > chi2(df, 0.95)이면 update skip",
  },
] as const;

export const mathFoundationAuditChecklist = [
  {
    field: "선형대수",
    included: true,
    depthScore: 10,
    practiceScore: 10,
    previousGap: "rank-nullity theorem과 rank-deficient pseudo-inverse의 non-unique IK 해 설명 부족",
    remediation: "rank(J)+nullity(J)=n과 dq=J^+xdot+(I-J^+J)z로 null-space projection을 직접 구현한다.",
    evidenceSessionIds: ["rank_nullity_pseudoinverse_ik", "null_space_redundancy_resolution"],
    evidenceVisualizationIds: ["vis_rank_nullity_nullspace_ik"],
  },
  {
    field: "미적분/주파수해석",
    included: true,
    depthScore: 10,
    practiceScore: 10,
    previousGap: "Laplace 역변환, 초기값/최종값 정리, Bode phase margin 수치 계산 부족",
    remediation: "initial/final value theorem 조건과 scipy.signal.bode 기반 phase margin 계산 실습을 추가한다.",
    evidenceSessionIds: ["laplace_final_value_bode_margin", "laplace_z_bode_pid_design"],
    evidenceVisualizationIds: ["vis_laplace_bode_margin_final_value", "vis_laplace_z_bode_pid"],
  },
  {
    field: "확률/통계",
    included: true,
    depthScore: 10,
    practiceScore: 10,
    previousGap: "Chi-squared outlier rejection, Mahalanobis distance, Fisher Information Matrix 부족",
    remediation: "scipy.stats.chi2.ppf gate, Mahalanobis innovation distance, FIM observability ellipse를 코드랩과 시각화로 고정한다.",
    evidenceSessionIds: ["ekf_chi_squared_outlier_rejection", "fisher_information_observability"],
    evidenceVisualizationIds: ["vis_chi_squared_outlier_boundary", "vis_fisher_information_observability"],
  },
  {
    field: "최적화",
    included: true,
    depthScore: 10,
    practiceScore: 10,
    previousGap: "KKT multiplier와 constraint activity, OSQP API 사용법 연결 부족",
    remediation: "OSQP result.y dual variable로 active constraint를 판정하고 CBF-QP 로그와 연결한다.",
    evidenceSessionIds: ["kkt_osqp_active_constraints", "clf_cbf_qp_priority_resolution"],
    evidenceVisualizationIds: ["vis_kkt_osqp_active_constraints", "vis_clf_cbf_qp_priority"],
  },
  {
    field: "기하학",
    included: true,
    depthScore: 10,
    practiceScore: 10,
    previousGap: "Lie algebra se(3) tangent space, velocity screw, exponential map 연결 부족",
    remediation: "Rodrigues formula로 SO(3) exp map을 구현하고 ROS2 tf2 TransformStamped 변환까지 연결한다.",
    evidenceSessionIds: ["se3_lie_algebra_expmap_twist", "geometric_vs_analytic_jacobian"],
    evidenceVisualizationIds: ["vis_se3_expmap_twist_tf2", "vis_geometric_analytic_jacobian_compare"],
  },
  {
    field: "신호처리",
    included: true,
    depthScore: 10,
    practiceScore: 10,
    previousGap: "Butterworth/Chebyshev filter 차수 설계와 주파수 응답 해석 부족",
    remediation: "scipy.signal.butter, buttord, cheb1ord로 IMU filter order/ripple/delay trade-off를 실습한다.",
    evidenceSessionIds: ["butterworth_filter_order_design", "chebyshev_butterworth_filter_design"],
    evidenceVisualizationIds: ["vis_butterworth_frequency_response", "vis_chebyshev_butterworth_order_compare"],
  },
] as const;

export const physicalAICoreAuditChecklist = [
  { area: "로봇공학 기본", previousGap: "Craig/Spong DH convention 혼용 경고 없음", status: "resolved", evidenceSessionIds: ["dh_craig_spong_convention_guard"], evidenceVisualizationIds: ["vis_dh_craig_spong_convention"] },
  { area: "로봇공학 기본", previousGap: "IK 복수해 선택 기준(joint limit, 연속성) 없음", status: "resolved", evidenceSessionIds: ["ik_solution_selection_joint_limit_continuity", "null_space_redundancy_resolution"], evidenceVisualizationIds: ["vis_ik_solution_selection_limits", "vis_null_space_motion"] },
  { area: "로봇공학 기본", previousGap: "Geometric vs Analytic Jacobian 구분 없음", status: "resolved", evidenceSessionIds: ["geometric_vs_analytic_jacobian"], evidenceVisualizationIds: ["vis_geometric_analytic_jacobian_compare"] },
  { area: "로봇공학 기본", previousGap: "RNEA가 planar gravity만 있고 6DOF velocity/acceleration backward pass 없음", status: "resolved", evidenceSessionIds: ["spatial_rnea_6dof_backward_pass"], evidenceVisualizationIds: ["vis_spatial_rnea_6dof_torque_chain"] },
  { area: "로봇공학 기본", previousGap: "모델 오차 시 feedforward가 역효과 나는 경우 없음", status: "resolved", evidenceSessionIds: ["feedforward_model_error_robustness", "robot_dynamics_feedforward_gravity_compensation"], evidenceVisualizationIds: ["vis_feedforward_model_error_residual", "vis_feedforward_gravity_compensation"] },
  { area: "로봇공학 기본", previousGap: "5차 polynomial jerk continuity 없음", status: "resolved", evidenceSessionIds: ["jerk_continuous_quintic_trajectory"], evidenceVisualizationIds: ["vis_quintic_jerk_profile"] },
  { area: "제어", previousGap: "back-calculation anti-windup과 ros2_control 실제 방식 없음", status: "resolved", evidenceSessionIds: ["back_calculation_antiwindup_control", "antiwindup_derivative_kick_pid"], evidenceVisualizationIds: ["vis_backcalc_clamping_integral_compare", "vis_antiwindup_pid_integral"] },
  { area: "제어", previousGap: "Gramian 기반 controllability 수치 없음", status: "resolved", evidenceSessionIds: ["controllability_gramian_numeric"], evidenceVisualizationIds: ["vis_controllability_gramian_eigen"] },
  { area: "제어", previousGap: "Bryson rule Q/R 선택 방법론 없음", status: "resolved", evidenceSessionIds: ["lqr_bryson_rule_pole_design"], evidenceVisualizationIds: ["vis_lqr_bryson_poles"] },
  { area: "제어", previousGap: "MPC infeasibility, constraint softening 없음", status: "resolved", evidenceSessionIds: ["mpc_soft_constraint_infeasibility"], evidenceVisualizationIds: ["vis_mpc_soft_slack"] },
  { area: "제어", previousGap: "Admittance vs Impedance 구분, 힘센서 없는 경우 없음", status: "resolved", evidenceSessionIds: ["admittance_vs_impedance_control", "impedance_control_contact_depth"], evidenceVisualizationIds: ["vis_admittance_impedance_contact_response", "vis_impedance_stiffness_contact_force"] },
  { area: "제어", previousGap: "CLF-CBF 동시 사용 시 충돌 해결 없음", status: "resolved", evidenceSessionIds: ["clf_cbf_qp_priority_resolution"], evidenceVisualizationIds: ["vis_clf_cbf_qp_priority"] },
  { area: "제어", previousGap: "PREEMPT_RT 커널과 일반 커널 차이 없음", status: "resolved", evidenceSessionIds: ["preempt_rt_kernel_jitter_comparison", "cpp_realtime_control_loop_jitter"], evidenceVisualizationIds: ["vis_preempt_rt_jitter_tail", "vis_cpp_realtime_jitter_histogram"] },
  { area: "자율주행", previousGap: "EKF/UKF chi2 outlier rejection 없음", status: "resolved", evidenceSessionIds: ["ekf_chi_squared_outlier_rejection", "ukf_alpha_beta_kappa_tuning"], evidenceVisualizationIds: ["vis_chi_squared_outlier_boundary", "vis_ukf_alpha_sigma_points"] },
  { area: "자율주행", previousGap: "Particle Filter resampling 방법 비교 없음", status: "resolved", evidenceSessionIds: ["particle_filter_resampling_comparison"], evidenceVisualizationIds: ["vis_particle_resampling_methods"] },
  { area: "자율주행", previousGap: "iSAM2 incremental update 없음", status: "resolved", evidenceSessionIds: ["isam2_incremental_factor_graph"], evidenceVisualizationIds: ["vis_isam2_incremental_update"] },
  { area: "자율주행", previousGap: "IMU-Camera tight coupling 없음", status: "resolved", evidenceSessionIds: ["imu_camera_tight_coupling_factor"], evidenceVisualizationIds: ["vis_imu_camera_tight_coupling"] },
  { area: "자율주행", previousGap: "ORCA/velocity obstacle 수식 없음", status: "resolved", evidenceSessionIds: ["orca_velocity_obstacle_avoidance"], evidenceVisualizationIds: ["vis_orca_velocity_cone"] },
  { area: "인식 AI", previousGap: "TensorRT/ONNX lab이 CPU mock이고 실제 GPU inference 없음", status: "resolved", evidenceSessionIds: ["tensorrt_real_onnx_inference_calibration", "tensorrt_onnx_quantization_pipeline"], evidenceVisualizationIds: ["vis_tensorrt_real_onnx_latency_calibration", "vis_tensorrt_latency_pareto"] },
  { area: "인식 AI", previousGap: "VLM CLIP contrastive loss와 cross-attention 수식/코드 없음", status: "resolved", evidenceSessionIds: ["clip_contrastive_temperature_loss", "llava_cross_attention_vla_grounding"], evidenceVisualizationIds: ["vis_clip_temperature_embedding", "vis_llava_cross_attention_grounding"] },
  { area: "Physical AI / Embodied AI", previousGap: "PPO GAE lambda, SAC entropy tuning 없음", status: "resolved", evidenceSessionIds: ["ppo_gae_sac_entropy_tuning", "rl_ppo_sac_reward_shaping"], evidenceVisualizationIds: ["vis_ppo_gae_sac_entropy", "vis_ppo_sac_reward_curve"] },
  { area: "Physical AI / Embodied AI", previousGap: "Dreamer/RSSM ELBO loss 수식과 deterministic/stochastic 분리 이유 없음", status: "resolved", evidenceSessionIds: ["rssm_elbo_kl_world_model"], evidenceVisualizationIds: ["vis_rssm_latent_state_rollout"] },
  { area: "Physical AI / Embodied AI", previousGap: "VLA π0 diffusion policy vs token action 차이 없음", status: "resolved", evidenceSessionIds: ["pi0_openvla_diffusion_token_policy"], evidenceVisualizationIds: ["vis_diffusion_policy_denoising"] },
  { area: "Physical AI / Embodied AI", previousGap: "Sim2Real domain randomization 분포 설계 방법론 없음", status: "resolved", evidenceSessionIds: ["domain_randomization_adr_gap_design"], evidenceVisualizationIds: ["vis_domain_randomization_sensitivity"] },
] as const;

const finalImprovementSessions = [...topics, ...moreTopics, ...remainingTopics].map(makeSession);

export const finalMathDepthSessions: Session[] = finalImprovementSessions.filter((session) =>
  session.part === "Part 1. Physical AI를 위한 기초수학",
);
export const finalRobotMathDepthSessions: Session[] = finalImprovementSessions.filter((session) =>
  session.part === "Part 2. 로봇 수학",
);
export const finalControlDepthSessions: Session[] = finalImprovementSessions.filter((session) =>
  session.part === "Part 3. 로봇 동역학과 제어",
);
export const finalDrivingDepthSessions: Session[] = finalImprovementSessions.filter((session) =>
  session.part === "Part 4. 자율주행과 SLAM",
);
export const finalVisionDeploymentDepthSessions: Session[] = finalImprovementSessions.filter((session) =>
  session.part === "Part 5. 인식 AI와 로봇 비전",
);
export const finalPhysicalAIDepthSessions: Session[] = finalImprovementSessions.filter((session) =>
  session.part === "Part 7. Physical AI / Embodied AI",
);
export const finalSafetyDepthSessions: Session[] = finalImprovementSessions.filter((session) =>
  session.part === "Part 8. 실시간성, 안전성, 시스템 통합",
);
export const finalIntegrationDepthSessions: Session[] = finalImprovementSessions.filter((session) =>
  session.part === "Part 9. 통합 미니 프로젝트",
);
