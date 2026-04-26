import type { CodeLab, Session } from "../types";

const cppRun = (fileStem: string) => `g++ -std=c++17 -I/usr/include/eigen3 ${fileStem}.cpp -o ${fileStem} && ./${fileStem}`;

const cppLab = (lab: Omit<CodeLab, "language">): CodeLab => ({
  ...lab,
  language: "cpp",
});

const genericTest = (fileStem: string, expected: string) => `// Save as test_${fileStem}.cpp and compile with the solution above.
// Check that the executable prints:
// ${expected}`;

const derivativeCppLab = cppLab({
  id: "lab_cpp_calculus_numerical_derivative",
  title: "C++ Numerical Derivative",
  theoryConnection: "central difference: f'(x) ~= (f(x+h)-f(x-h))/(2h)",
  starterCode: `#include <cmath>
#include <functional>
#include <iomanip>
#include <iostream>

double NumericalDerivative(const std::function<double(double)>& f, double x, double h = 1e-5) {
  // TODO: implement central difference.
  throw "implement NumericalDerivative";
}

int main() {
  auto f = [](double x) { return x * x * x; };
  std::cout << std::fixed << std::setprecision(6) << NumericalDerivative(f, 2.0) << "\\n";
}`,
  solutionCode: `#include <cmath>
#include <functional>
#include <iomanip>
#include <iostream>

double NumericalDerivative(const std::function<double(double)>& f, double x, double h = 1e-5) {
  return (f(x + h) - f(x - h)) / (2.0 * h);
}

int main() {
  auto f = [](double x) { return x * x * x; };
  std::cout << std::fixed << std::setprecision(6) << NumericalDerivative(f, 2.0) << "\\n";
}`,
  testCode: `#include <cassert>
#include <cmath>
#include <functional>

double NumericalDerivative(const std::function<double(double)>& f, double x, double h = 1e-5);

int main() {
  auto square = [](double x) { return x * x; };
  assert(std::abs(NumericalDerivative(square, 3.0) - 6.0) < 1e-4);
  assert(std::abs(NumericalDerivative(static_cast<double(*)(double)>(std::sin), 0.0) - 1.0) < 1e-4);
}`,
  expectedOutput: "12.000000",
  runCommand: cppRun("cpp_numerical_derivative"),
  commonBugs: ["forward difference로 바꿔 오차가 커짐", "h를 너무 작게 잡아 부동소수점 취소 오류가 커짐", "std::function 인자를 값이 아니라 결과값으로 전달함"],
  extensionTask: "h를 1e-1부터 1e-10까지 sweep하고 중앙차분 오차를 CSV로 저장하라.",
});

const gradientCppLab = cppLab({
  id: "lab_cpp_gradient_descent",
  title: "C++ Gradient Descent",
  theoryConnection: "theta <- theta - alpha * grad f(theta)",
  starterCode: `#include <Eigen/Dense>
#include <iomanip>
#include <iostream>

Eigen::Vector2d Step(Eigen::Vector2d xy, double lr) {
  // TODO: f(x,y)=x^2+2y^2 has gradient [2x,4y].
  throw "implement gradient step";
}

int main() {
  Eigen::Vector2d xy(3.0, 2.0);
  for (int i = 0; i < 50; ++i) xy = Step(xy, 0.1);
  std::cout << std::fixed << std::setprecision(4) << xy.x() << " " << xy.y() << "\\n";
}`,
  solutionCode: `#include <Eigen/Dense>
#include <iomanip>
#include <iostream>

Eigen::Vector2d Step(Eigen::Vector2d xy, double lr) {
  Eigen::Vector2d grad(2.0 * xy.x(), 4.0 * xy.y());
  return xy - lr * grad;
}

int main() {
  Eigen::Vector2d xy(3.0, 2.0);
  for (int i = 0; i < 50; ++i) xy = Step(xy, 0.1);
  std::cout << std::fixed << std::setprecision(4) << xy.x() << " " << xy.y() << "\\n";
}`,
  testCode: genericTest("cpp_gradient_descent", "0.0000 0.0000"),
  expectedOutput: "0.0000 0.0000",
  runCommand: cppRun("cpp_gradient_descent"),
  commonBugs: ["gradient를 빼지 않고 더해 발산함", "y gradient를 2y로 계산해 f=x^2+2y^2의 곡률을 놓침", "학습률을 너무 크게 잡아 진동함"],
  extensionTask: "lr=0.01, 0.1, 0.5를 비교해 반복별 x,y 값을 CSV로 저장하라.",
});

const kalmanCppLab = cppLab({
  id: "lab_cpp_kalman_filter_1d",
  title: "C++ Kalman Filter 1D",
  theoryConnection: "predict/update with x, P, Q, R",
  starterCode: `#include <iomanip>
#include <iostream>

class KalmanFilter1D {
 public:
  KalmanFilter1D(double x0, double p0, double q, double r) : x(x0), p(p0), q(q), r(r) {}
  void Predict(double u) {
    // TODO: x += u; p += q;
  }
  void Update(double z) {
    // TODO: K=p/(p+r), x=x+K*(z-x), p=(1-K)*p
  }
  double x;
  double p;
 private:
  double q;
  double r;
};

int main() {
  KalmanFilter1D kf(0.0, 5.0, 0.1, 4.0);
  kf.Predict(1.0);
  kf.Update(0.993428306);
  std::cout << std::fixed << std::setprecision(2) << kf.x << " " << kf.p << "\\n";
}`,
  solutionCode: `#include <iomanip>
#include <iostream>

class KalmanFilter1D {
 public:
  KalmanFilter1D(double x0, double p0, double q, double r) : x(x0), p(p0), q(q), r(r) {}
  void Predict(double u) {
    x += u;
    p += q;
  }
  void Update(double z) {
    const double k = p / (p + r);
    x = x + k * (z - x);
    p = (1.0 - k) * p;
  }
  double x;
  double p;
 private:
  double q;
  double r;
};

int main() {
  KalmanFilter1D kf(0.0, 5.0, 0.1, 4.0);
  kf.Predict(1.0);
  kf.Update(0.993428306);
  std::cout << std::fixed << std::setprecision(2) << kf.x << " " << kf.p << "\\n";
}`,
  testCode: genericTest("cpp_kalman_filter_1d", "1.00 2.24"),
  expectedOutput: "1.00 2.24",
  runCommand: cppRun("cpp_kalman_filter_1d"),
  commonBugs: ["Predict에서 p += q를 빼먹음", "innovation 부호를 반대로 씀", "p update를 k*p로 계산함"],
  extensionTask: "Q/R을 바꿔 첫 20 step의 x,p,K를 CSV로 저장하라.",
});

const ekfCppLab = cppLab({
  id: "lab_cpp_ekf_localization",
  title: "C++ Eigen EKF Range Update",
  theoryConnection: "K = P H^T (H P H^T + R)^-1",
  starterCode: `#include <Eigen/Dense>
#include <iomanip>
#include <iostream>
#include <stdexcept>

Eigen::Vector2d EkfUpdate(Eigen::Vector2d x, Eigen::Matrix2d P, double z, double R) {
  // TODO: range h(x)=sqrt(px^2+py^2), H=[px/r, py/r], then update x.
  throw std::runtime_error("implement EKF update");
}

int main() {
  Eigen::Vector2d x(2.0, 0.0);
  Eigen::Matrix2d P = Eigen::Matrix2d::Identity() * 0.5;
  auto out = EkfUpdate(x, P, 1.8, 0.04);
  std::cout << std::fixed << std::setprecision(3) << out.x() << " " << out.y() << "\\n";
}`,
  solutionCode: `#include <Eigen/Dense>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>

Eigen::Vector2d EkfUpdate(Eigen::Vector2d x, Eigen::Matrix2d P, double z, double R) {
  const double range = x.norm();
  if (range < 1e-9) throw std::runtime_error("range Jacobian undefined");
  Eigen::RowVector2d H;
  H << x.x() / range, x.y() / range;
  const double S = (H * P * H.transpose())(0, 0) + R;
  Eigen::Vector2d K = P * H.transpose() / S;
  return x + K * (z - range);
}

int main() {
  Eigen::Vector2d x(2.0, 0.0);
  Eigen::Matrix2d P = Eigen::Matrix2d::Identity() * 0.5;
  auto out = EkfUpdate(x, P, 1.8, 0.04);
  std::cout << std::fixed << std::setprecision(3) << out.x() << " " << out.y() << "\\n";
}`,
  testCode: genericTest("cpp_ekf_localization", "1.815 0.000"),
  expectedOutput: "1.815 0.000",
  runCommand: cppRun("cpp_ekf_localization"),
  commonBugs: ["H를 identity로 두어 range 관측 방향을 잃음", "z-range 대신 range-z를 씀", "range가 0일 때 나눗셈을 막지 않음"],
  extensionTask: "P update까지 추가하고 eigenvalue가 줄어드는지 출력하라.",
});

const astarCppLab = cppLab({
  id: "lab_cpp_astar_grid",
  title: "C++ A* Pathfinding on Occupancy Grid",
  theoryConnection: "f(n)=g(n)+h(n), priority_queue open set",
  starterCode: `#include <queue>
#include <stdexcept>
#include <utility>
#include <vector>

using Grid = std::vector<std::vector<int>>;
using Node = std::pair<int, int>;

std::vector<Node> AStar(const Grid& grid, Node start, Node goal) {
  // TODO: implement 4-neighbor A* with Manhattan heuristic.
  throw std::runtime_error("implement AStar");
}

int main() {
  Grid grid{{0,0,0,0,0},{0,1,1,0,0},{0,1,0,0,0},{0,0,0,1,0},{0,0,0,0,0}};
  auto path = AStar(grid, {0, 0}, {4, 4});
  return path.empty() ? 1 : 0;
}`,
  solutionCode: `#include <algorithm>
#include <iostream>
#include <limits>
#include <map>
#include <queue>
#include <utility>
#include <vector>

using Grid = std::vector<std::vector<int>>;
using Node = std::pair<int, int>;

int Heuristic(Node a, Node b) {
  return std::abs(a.first - b.first) + std::abs(a.second - b.second);
}

std::vector<Node> AStar(const Grid& grid, Node start, Node goal) {
  struct Item {
    int f;
    int counter;
    Node node;
    bool operator<(const Item& other) const {
      if (f != other.f) return f > other.f;
      return counter > other.counter;
    }
  };

  const int rows = static_cast<int>(grid.size());
  const int cols = static_cast<int>(grid.front().size());
  std::priority_queue<Item> open;
  std::map<Node, Node> came_from;
  std::map<Node, int> g_score;
  int counter = 0;
  open.push({Heuristic(start, goal), counter, start});
  g_score[start] = 0;

  const std::vector<Node> dirs{{-1,0}, {1,0}, {0,-1}, {0,1}};
  while (!open.empty()) {
    Node current = open.top().node;
    open.pop();
    if (current == goal) {
      std::vector<Node> path;
      while (came_from.count(current)) {
        path.push_back(current);
        current = came_from[current];
      }
      path.push_back(start);
      std::reverse(path.begin(), path.end());
      return path;
    }
    for (const auto& [dr, dc] : dirs) {
      const int nr = current.first + dr;
      const int nc = current.second + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] == 1) continue;
      Node next{nr, nc};
      const int tentative_g = g_score[current] + 1;
      if (!g_score.count(next) || tentative_g < g_score[next]) {
        came_from[next] = current;
        g_score[next] = tentative_g;
        ++counter;
        open.push({tentative_g + Heuristic(next, goal), counter, next});
      }
    }
  }
  return {};
}

int main() {
  Grid grid{{0,0,0,0,0},{0,1,1,0,0},{0,1,0,0,0},{0,0,0,1,0},{0,0,0,0,0}};
  auto path = AStar(grid, {0, 0}, {4, 4});
  std::cout << "path_length=" << path.size() << "\\n";
}`,
  testCode: genericTest("cpp_astar_grid", "path_length=9"),
  expectedOutput: "path_length=9",
  runCommand: cppRun("cpp_astar_grid"),
  commonBugs: ["std::priority_queue가 max-heap이라 비교 연산 방향을 반대로 둠", "장애물 grid==1을 건너뛰지 않음", "came_from 역추적에서 start를 누락함"],
  extensionTask: "8방향 이동과 Euclidean heuristic을 추가하고 path_length를 비교하라.",
});

const stateSpaceCppLab = cppLab({
  id: "lab_cpp_state_space_simulate",
  title: "C++ Eigen State-space Simulation",
  theoryConnection: "x[k+1]=(I+A*dt)x[k]+B*dt*u[k]",
  starterCode: `#include <Eigen/Dense>
#include <stdexcept>
#include <vector>

std::vector<Eigen::VectorXd> Simulate(const Eigen::MatrixXd& A, const Eigen::MatrixXd& B, Eigen::VectorXd x, int steps, double dt) {
  // TODO: implement Euler discretization for constant u=1.0.
  throw std::runtime_error("implement Simulate");
}

int main() {
  Eigen::Matrix<double, 1, 1> A;
  A << -2.0;
  Eigen::Matrix<double, 1, 1> B;
  B << 2.0;
  Simulate(A, B, Eigen::VectorXd::Zero(1), 500, 0.01);
}`,
  solutionCode: `#include <Eigen/Dense>
#include <iomanip>
#include <iostream>
#include <vector>

std::vector<Eigen::VectorXd> Simulate(const Eigen::MatrixXd& A, const Eigen::MatrixXd& B, Eigen::VectorXd x, int steps, double dt) {
  const int n = static_cast<int>(x.size());
  const Eigen::MatrixXd Ad = Eigen::MatrixXd::Identity(n, n) + A * dt;
  const Eigen::MatrixXd Bd = B * dt;
  std::vector<Eigen::VectorXd> states;
  states.reserve(steps);
  Eigen::VectorXd u = Eigen::VectorXd::Ones(B.cols());
  for (int k = 0; k < steps; ++k) {
    x = Ad * x + Bd * u;
    states.push_back(x);
  }
  return states;
}

int main() {
  Eigen::Matrix<double, 1, 1> A;
  A << -2.0;
  Eigen::Matrix<double, 1, 1> B;
  B << 2.0;
  auto states = Simulate(A, B, Eigen::VectorXd::Zero(1), 500, 0.01);
  std::cout << std::fixed << std::setprecision(4) << states.back()(0) << "\\n";
}`,
  testCode: genericTest("cpp_state_space_simulate", "1.0000"),
  expectedOutput: "1.0000",
  runCommand: cppRun("cpp_state_space_simulate"),
  commonBugs: ["Ad=I+A*dt에서 I를 빼먹음", "Bd=B*dt를 빠뜨려 입력이 dt배 커짐", "state vector 크기와 B.cols() 입력 크기를 혼동함"],
  extensionTask: "A의 eigenvalue가 양수인 경우를 추가해 발산 여부를 출력하라.",
});

const odeCppLab = cppLab({
  id: "lab_cpp_ode_euler_rk4",
  title: "C++ Euler vs RK4 Pendulum",
  theoryConnection: "x[k+1]=x[k]+dt*f(x[k]) vs RK4 weighted slopes",
  starterCode: `#include <Eigen/Dense>
#include <stdexcept>

Eigen::Vector2d PendulumDeriv(const Eigen::Vector2d& state, double g = 9.81, double L = 1.0) {
  // TODO: return [omega, -(g/L)*sin(theta)].
  throw std::runtime_error("implement PendulumDeriv");
}

Eigen::Vector2d EulerStep(const Eigen::Vector2d& state, double dt) {
  // TODO: state + dt * PendulumDeriv(state)
  throw std::runtime_error("implement EulerStep");
}

Eigen::Vector2d RK4Step(const Eigen::Vector2d& state, double dt) {
  // TODO: implement k1, k2, k3, k4 and weighted average.
  throw std::runtime_error("implement RK4Step");
}

int main() {
  Eigen::Vector2d state(0.5235987756, 0.0);
  return static_cast<int>(state.x());
}`,
  solutionCode: `#include <Eigen/Dense>
#include <cmath>
#include <iomanip>
#include <iostream>

Eigen::Vector2d PendulumDeriv(const Eigen::Vector2d& state, double g = 9.81, double L = 1.0) {
  const double theta = state.x();
  const double omega = state.y();
  return Eigen::Vector2d(omega, -(g / L) * std::sin(theta));
}

Eigen::Vector2d EulerStep(const Eigen::Vector2d& state, double dt) {
  return state + dt * PendulumDeriv(state);
}

Eigen::Vector2d RK4Step(const Eigen::Vector2d& state, double dt) {
  const Eigen::Vector2d k1 = PendulumDeriv(state);
  const Eigen::Vector2d k2 = PendulumDeriv(state + 0.5 * dt * k1);
  const Eigen::Vector2d k3 = PendulumDeriv(state + 0.5 * dt * k2);
  const Eigen::Vector2d k4 = PendulumDeriv(state + dt * k3);
  return state + (dt / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4);
}

int main() {
  const double dt = 0.05;
  const int steps = static_cast<int>(5.0 / dt);
  Eigen::Vector2d euler(M_PI / 6.0, 0.0);
  Eigen::Vector2d rk4(M_PI / 6.0, 0.0);
  for (int i = 0; i < steps; ++i) {
    euler = EulerStep(euler, dt);
    rk4 = RK4Step(rk4, dt);
  }
  std::cout << std::fixed << std::setprecision(4) << euler.x() << " " << rk4.x() << "\\n";
}`,
  testCode: genericTest("cpp_ode_euler_rk4", "-0.6621 -0.4980"),
  expectedOutput: "-0.6621 -0.4980",
  runCommand: cppRun("cpp_ode_euler_rk4"),
  commonBugs: ["RK4에서 k2/k3의 half-step을 빼먹음", "theta와 omega 순서를 바꿔 ODE가 틀어짐", "sin(theta) 대신 theta 선형근사만 사용함"],
  extensionTask: "dt를 0.01, 0.05, 0.1, 0.5로 바꿔 Euler/RK4 최종 theta를 CSV로 저장하라.",
});

const slamCppLab = cppLab({
  id: "lab_cpp_occupancy_grid_logodds",
  title: "C++ Occupancy Grid Log-Odds",
  theoryConnection: "l_new = l_old + log(p/(1-p)) - log(p0/(1-p0))",
  starterCode: `#include <cmath>
#include <stdexcept>
#include <vector>

double ProbToLogOdds(double p) {
  // TODO: log(p/(1-p))
  throw std::runtime_error("implement ProbToLogOdds");
}

double LogOddsToProb(double l) {
  // TODO: 1/(1+exp(-l))
  throw std::runtime_error("implement LogOddsToProb");
}

double UpdateCell(double log_odds, bool occupied) {
  // TODO: add occupied/free inverse sensor model in log-odds form.
  throw std::runtime_error("implement UpdateCell");
}

int main() {
  std::vector<std::vector<double>> grid(10, std::vector<double>(10, 0.0));
  return static_cast<int>(grid.size());
}`,
  solutionCode: `#include <cmath>
#include <iomanip>
#include <iostream>
#include <vector>

constexpr double kPOcc = 0.7;
constexpr double kPFree = 0.3;
constexpr double kPPrior = 0.5;

double ProbToLogOdds(double p) {
  return std::log(p / (1.0 - p));
}

double LogOddsToProb(double l) {
  return 1.0 / (1.0 + std::exp(-l));
}

double UpdateCell(double log_odds, bool occupied) {
  const double prior = ProbToLogOdds(kPPrior);
  return log_odds + ProbToLogOdds(occupied ? kPOcc : kPFree) - prior;
}

int main() {
  std::vector<std::vector<double>> grid(10, std::vector<double>(10, ProbToLogOdds(kPPrior)));
  for (int i = 0; i < 3; ++i) grid[5][5] = UpdateCell(grid[5][5], true);
  for (int i = 0; i < 3; ++i) grid[5][6] = UpdateCell(grid[5][6], false);
  std::cout << std::fixed << std::setprecision(3)
            << LogOddsToProb(grid[5][5]) << " "
            << LogOddsToProb(grid[5][6]) << "\\n";
}`,
  testCode: genericTest("cpp_occupancy_grid_logodds", "0.927 0.073"),
  expectedOutput: "0.927 0.073",
  runCommand: cppRun("cpp_occupancy_grid_logodds"),
  commonBugs: ["log(p/(1-p)) 대신 log(p)를 씀", "free/occupied update 부호를 반대로 씀", "확률 변환에서 exp(l)을 써서 방향이 뒤집힘"],
  extensionTask: "LiDAR ray cells를 vector<Node>로 받아 free cells와 endpoint를 한 번에 업데이트하라.",
});

const simpleStdLab = (session: Session, idSuffix: string, title: string, body: string, expectedOutput: string): CodeLab =>
  cppLab({
    id: `lab_cpp_${idSuffix}`,
    title,
    theoryConnection: `${session.title} core equation in C++17`,
    starterCode: `#include <iostream>
#include <stdexcept>

// TODO: Port the primary lab's core equation to C++.
// Keep the Python lab as the reference and make this executable print:
// ${expectedOutput}
int main() {
  throw std::runtime_error("implement ${idSuffix}");
}`,
    solutionCode: body,
    testCode: genericTest(`cpp_${idSuffix}`, expectedOutput),
    expectedOutput,
    runCommand: cppRun(`cpp_${idSuffix}`),
    commonBugs: ["Python/NumPy index convention을 그대로 옮기며 행렬 차원을 혼동함", "degree와 radian을 섞음", "expected output만 맞추고 경계 조건 테스트를 빠뜨림"],
    extensionTask: "같은 입력을 Python reference lab과 C++ lab에서 모두 실행해 차이를 1e-6 이하로 맞춰라.",
  });

const eigenBody = (expression: string, print: string) => `#include <Eigen/Dense>
#include <cmath>
#include <iomanip>
#include <iostream>

Eigen::VectorXd reference_value() {
${expression}
}

int main() {
  auto out = reference_value();
${print}
}`;

const stdVectorBody = (expression: string) => `#include <cmath>
#include <iomanip>
#include <iostream>
#include <vector>

double reference_value() {
${expression}
}

int main() {
  std::cout << std::fixed << std::setprecision(3) << reference_value() << "\\n";
}`;

const mathOrRobotCppLab = (session: Session): CodeLab | undefined => {
  switch (session.id) {
    case "eigenvalue_covariance_ellipse":
      return simpleStdLab(
        session,
        "eigen_covariance_ellipse",
        "C++ Eigen Covariance Ellipse",
        eigenBody(
          `  Eigen::Matrix2d cov;
  cov << 4.0, 1.2, 1.2, 1.0;
  Eigen::SelfAdjointEigenSolver<Eigen::Matrix2d> solver(cov);
  Eigen::Vector2d values = solver.eigenvalues().reverse().cwiseSqrt();
  return values;`,
          `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << "\\n";`,
        ),
        "2.099 0.764",
      );
    case "svd_condition_number":
      return simpleStdLab(
        session,
        "svd_condition_number",
        "C++ Eigen SVD Condition Number",
        stdVectorBody(`  Eigen::Matrix2d A;
  A << 1.0, 0.99, 0.99, 0.98;
  Eigen::JacobiSVD<Eigen::Matrix2d> svd(A);
  auto s = svd.singularValues();
  return s(0) / s(1);`).replace("#include <vector>", "#include <vector>\n#include <Eigen/Dense>"),
        "39205.000",
      );
    case "least_squares":
      return simpleStdLab(
        session,
        "least_squares_line",
        "C++ Eigen Least Squares Line",
        eigenBody(
          `  Eigen::Matrix<double, 3, 2> X;
  X << 0.0, 1.0, 1.0, 1.0, 2.0, 1.0;
  Eigen::Vector3d y(1.0, 3.0, 5.0);
  Eigen::Vector2d theta = X.colPivHouseholderQr().solve(y);
  return theta;`,
          `  std::cout << std::fixed << std::setprecision(1) << out(0) << " " << out(1) << "\\n";`,
        ),
        "2.0 1.0",
      );
    case "gaussian_mle":
      return simpleStdLab(
        session,
        "gaussian_mle",
        "C++ Gaussian MLE",
        stdVectorBody(`  std::vector<double> samples{1.0, 2.0, 3.0};
  double mean = 0.0;
  for (double x : samples) mean += x;
  mean /= samples.size();
  double var = 0.0;
  for (double x : samples) var += (x - mean) * (x - mean);
  return var / samples.size();`),
        "0.667",
      );
    case "low_pass_filter_imu":
      return simpleStdLab(
        session,
        "low_pass_filter_imu",
        "C++ Low-pass Filter",
        stdVectorBody(`  std::vector<double> samples{0.0, 1.0, 0.0, 1.0};
  double alpha = 0.25;
  double y = samples.front();
  for (size_t i = 1; i < samples.size(); ++i) y = alpha * samples[i] + (1.0 - alpha) * y;
  return y;`),
        "0.391",
      );
    case "robot_math_2d_rotation_matrix":
      return simpleStdLab(session, "robot_math_2d_rotation", "C++ Eigen 2D Rotation", eigenBody(`  constexpr double pi = 3.14159265358979323846;
  Eigen::Matrix2d R;
  R << std::cos(pi / 2.0), -std::sin(pi / 2.0), std::sin(pi / 2.0), std::cos(pi / 2.0);
  Eigen::Vector2d v = R * Eigen::Vector2d(1.0, 0.0);
  return v;`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << "\\n";`), "0.000 1.000");
    case "robot_math_3d_rotation_so3":
      return simpleStdLab(session, "robot_math_3d_so3", "C++ Eigen SO(3) Rotation", eigenBody(`  constexpr double pi = 3.14159265358979323846;
  Eigen::Matrix3d R = Eigen::AngleAxisd(pi / 2.0, Eigen::Vector3d::UnitZ()).toRotationMatrix();
  Eigen::Vector3d v = R * Eigen::Vector3d::UnitX();
  return v;`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << " " << out(2) << "\\n";`).replace("#include <Eigen/Dense>", "#include <Eigen/Dense>\n#include <Eigen/Geometry>"), "0.000 1.000 0.000");
    case "robot_math_homogeneous_transform_se3":
      return simpleStdLab(session, "robot_math_homogeneous_transform", "C++ Eigen Homogeneous Transform", eigenBody(`  Eigen::Matrix4d T = Eigen::Matrix4d::Identity();
  T(0, 3) = 1.0;
  T(1, 3) = 2.0;
  Eigen::Vector4d p(0.0, 1.0, 0.0, 1.0);
  return (T * p).head(3);`, `  std::cout << std::fixed << std::setprecision(1) << out(0) << " " << out(1) << " " << out(2) << "\\n";`), "1.0 3.0 0.0");
    case "robot_math_quaternion_slerp":
      return simpleStdLab(session, "robot_math_quaternion_slerp", "C++ Eigen Quaternion SLERP", eigenBody(`  constexpr double pi = 3.14159265358979323846;
  Eigen::Quaterniond q0 = Eigen::Quaterniond::Identity();
  Eigen::Quaterniond q1(Eigen::AngleAxisd(pi, Eigen::Vector3d::UnitZ()));
  Eigen::Quaterniond q = q0.slerp(0.5, q1);
  Eigen::Vector4d out(q.w(), q.x(), q.y(), q.z());
  return out;`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << " " << out(2) << " " << out(3) << "\\n";`).replace("#include <Eigen/Dense>", "#include <Eigen/Dense>\n#include <Eigen/Geometry>"), "0.707 0.000 0.000 0.707");
    case "robot_math_dh_parameter":
      return simpleStdLab(session, "robot_math_dh", "C++ Eigen DH Transform", eigenBody(`  Eigen::Matrix4d A = Eigen::Matrix4d::Identity();
  A(0, 3) = 2.0;
  return A.block<3, 1>(0, 3);`, `  std::cout << std::fixed << std::setprecision(1) << out(0) << " " << out(1) << " " << out(2) << "\\n";`), "2.0 0.0 0.0");
    case "robot_math_product_of_exponentials":
      return simpleStdLab(session, "robot_math_poe", "C++ Eigen POE Rotation", eigenBody(`  constexpr double pi = 3.14159265358979323846;
  Eigen::Matrix3d R = Eigen::AngleAxisd(pi / 2.0, Eigen::Vector3d::UnitZ()).toRotationMatrix();
  return R * Eigen::Vector3d::UnitX();`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << " " << out(2) << "\\n";`).replace("#include <Eigen/Dense>", "#include <Eigen/Dense>\n#include <Eigen/Geometry>"), "0.000 1.000 0.000");
    case "robot_math_forward_kinematics":
      return simpleStdLab(session, "robot_math_fk", "C++ Eigen 2-link FK", eigenBody(`  constexpr double pi = 3.14159265358979323846;
  double l1 = 1.0, l2 = 1.0, q1 = pi / 2.0, q2 = 0.0;
  Eigen::Vector2d p(l1 * std::cos(q1) + l2 * std::cos(q1 + q2), l1 * std::sin(q1) + l2 * std::sin(q1 + q2));
  return p;`, `  std::cout << std::fixed << std::setprecision(1) << out(0) << " " << out(1) << "\\n";`), "0.0 2.0");
    case "robot_math_inverse_kinematics":
      return simpleStdLab(session, "robot_math_ik", "C++ 2-link IK", eigenBody(`  double l1 = 1.0, l2 = 1.0, x = 1.0, y = 1.0;
  double c2 = (x * x + y * y - l1 * l1 - l2 * l2) / (2.0 * l1 * l2);
  double s2 = std::sqrt(1.0 - c2 * c2);
  double q2 = std::atan2(s2, c2);
  double q1 = std::atan2(y, x) - std::atan2(l2 * s2, l1 + l2 * c2);
  Eigen::Vector2d q(q1, q2);
  return q;`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << "\\n";`), "0.000 1.571");
    case "robot_math_jacobian_velocity_kinematics":
      return simpleStdLab(session, "robot_math_jacobian", "C++ Eigen 2-link Jacobian", eigenBody(`  double l1 = 1.0, l2 = 1.0, q1 = 0.0, q2 = 0.0;
  Eigen::Matrix2d J;
  J << -l1 * std::sin(q1) - l2 * std::sin(q1 + q2), -l2 * std::sin(q1 + q2),
        l1 * std::cos(q1) + l2 * std::cos(q1 + q2),  l2 * std::cos(q1 + q2);
  return J * Eigen::Vector2d(1.0, 0.0);`, `  std::cout << std::fixed << std::setprecision(1) << out(0) << " " << out(1) << "\\n";`), "0.0 2.0");
    case "robot_math_singularity_damped_least_squares":
      return simpleStdLab(session, "robot_math_dls", "C++ Eigen Damped Least Squares", eigenBody(`  Eigen::Matrix<double, 2, 2> J;
  J << 0.0, 0.0, 2.0, 1.0;
  Eigen::Vector2d e(0.0, 0.5);
  double lambda = 0.1;
  Eigen::Vector2d dq = J.transpose() * (J * J.transpose() + lambda * lambda * Eigen::Matrix2d::Identity()).inverse() * e;
  return dq;`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << "\\n";`), "0.200 0.100");
    case "robot_dynamics_2link_lagrange":
      return simpleStdLab(session, "two_link_torque", "C++ Gravity Torque", eigenBody(`  constexpr double pi = 3.14159265358979323846;
  double q1 = pi / 6.0, q2 = pi / 4.0, l1 = 1.0, l2 = 0.7, m1 = 1.2, m2 = 0.8, g = 9.81;
  double tau1 = g * ((m1 * l1 / 2.0 + m2 * l1) * std::cos(q1) + m2 * l2 / 2.0 * std::cos(q1 + q2));
  double tau2 = g * (m2 * l2 / 2.0 * std::cos(q1 + q2));
  Eigen::Vector2d tau(tau1, tau2);
  return tau;`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << "\\n";`), "11.533 0.711");
    case "lqr_riccati":
      return simpleStdLab(session, "scalar_lqr", "C++ Scalar LQR Riccati", stdVectorBody(`  double a = 1.0, b = 0.2, q = 1.0, r = 0.1, P = q;
  for (int i = 0; i < 50; ++i) {
    P = q + a * P * a - (a * P * b) * (b * P * a) / (r + b * P * b);
  }
  return (b * P * a) / (r + b * P * b);`), "2.702");
    case "cross_product_torque":
      return simpleStdLab(session, "cross_product_torque", "C++ Eigen Cross Product Torque", eigenBody(`  Eigen::Vector3d r(1.0, 0.0, 0.0);
  Eigen::Vector3d f(0.0, 2.0, 0.0);
  return r.cross(f);`, `  std::cout << std::fixed << std::setprecision(1) << out(0) << " " << out(1) << " " << out(2) << "\\n";`), "0.0 0.0 2.0");
    case "integral_energy_impulse":
      return simpleStdLab(session, "energy_integral_impulse", "C++ Trapezoid Integral", stdVectorBody(`  std::vector<double> y(101, 2.0);
  double dt = 0.01;
  double sum = 0.5 * y.front() + 0.5 * y.back();
  for (size_t i = 1; i + 1 < y.size(); ++i) sum += y[i];
  return dt * sum;`), "2.000");
    case "convex_optimization_kkt":
      return simpleStdLab(session, "convex_gradient_descent", "C++ Convex Gradient Descent", stdVectorBody(`  double x = -5.0;
  for (int i = 0; i < 100; ++i) x -= 0.05 * (2.0 * (x - 2.0));
  return x;`), "2.000");
    case "signal_processing_fft_lpf":
      return simpleStdLab(session, "low_pass_filter", "C++ Low-pass Filter", stdVectorBody(`  std::vector<double> x{0.0, 1.0, 0.0, 1.0};
  double y = x.front();
  double alpha = 0.25;
  for (size_t i = 1; i < x.size(); ++i) y = alpha * x[i] + (1.0 - alpha) * y;
  return y;`), "0.391");
    case "quaternion_so3_slerp":
      return simpleStdLab(session, "quaternion_slerp", "C++ Eigen Quaternion SLERP", eigenBody(`  constexpr double pi = 3.14159265358979323846;
  Eigen::Quaterniond q0 = Eigen::Quaterniond::Identity();
  Eigen::Quaterniond q1(Eigen::AngleAxisd(pi, Eigen::Vector3d::UnitZ()));
  Eigen::Quaterniond q = q0.slerp(0.5, q1);
  return Eigen::Vector4d(q.w(), q.x(), q.y(), q.z());`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << " " << out(1) << " " << out(2) << " " << out(3) << "\\n";`).replace("#include <Eigen/Dense>", "#include <Eigen/Dense>\n#include <Eigen/Geometry>"), "0.707 0.000 0.000 0.707");
    case "numerical_jacobian_2link":
      return simpleStdLab(session, "numerical_jacobian_2link", "C++ Eigen Numerical Jacobian", eigenBody(`  auto fk = [](const Eigen::Vector2d& q) {
    return Eigen::Vector2d(std::cos(q[0]) + 0.7 * std::cos(q[0] + q[1]), std::sin(q[0]) + 0.7 * std::sin(q[0] + q[1]));
  };
  Eigen::Vector2d q(0.0, 0.0);
  double h = 1e-5;
  Eigen::Vector2d e0(h, 0.0);
  Eigen::Vector2d col0 = (fk(q + e0) - fk(q - e0)) / (2.0 * h);
  return col0;`, `  std::cout << std::fixed << std::setprecision(1) << out(0) << " " << out(1) << "\\n";`), "0.0 1.7");
    case "trajectory_quintic_polynomial":
      return simpleStdLab(session, "quintic_trajectory", "C++ Eigen Quintic Trajectory", eigenBody(`  double T = 2.0;
  Eigen::Matrix<double, 6, 6> A;
  A << 1,0,0,0,0,0,
       0,1,0,0,0,0,
       0,0,2,0,0,0,
       1,T,T*T,T*T*T,std::pow(T,4),std::pow(T,5),
       0,1,2*T,3*T*T,4*std::pow(T,3),5*std::pow(T,4),
       0,0,2,6*T,12*T*T,20*std::pow(T,3);
  Eigen::Matrix<double, 6, 1> b;
  b << 0,0,0,1,0,0;
  auto coeff = A.colPivHouseholderQr().solve(b);
  double t = 1.0;
  double q = coeff(0) + coeff(1)*t + coeff(2)*t*t + coeff(3)*std::pow(t,3) + coeff(4)*std::pow(t,4) + coeff(5)*std::pow(t,5);
  return Eigen::VectorXd::Constant(1, q);`, `  std::cout << std::fixed << std::setprecision(3) << out(0) << "\\n";`), "0.500");
    case "mpc_1d_receding_horizon":
      return simpleStdLab(session, "mpc_1d", "C++ 1D MPC Candidate Search", stdVectorBody(`  double x = 0.0;
  for (int k = 0; k < 10; ++k) {
    double best_u = 0.0;
    double best_cost = 1e9;
    for (double u : {-1.0, 0.0, 1.0}) {
      double xp = x + 0.1 * u;
      double cost = 10.0 * (xp - 1.0) * (xp - 1.0) + 0.1 * u * u;
      if (cost < best_cost) { best_cost = cost; best_u = u; }
    }
    x += 0.1 * best_u;
  }
  return x;`), "1.000");
    case "lyapunov_stability_pd":
      return simpleStdLab(session, "lyapunov_pd", "C++ Lyapunov PD Energy", stdVectorBody(`  double x = 1.0, v = 0.0, k = 4.0;
  return 0.5 * k * x * x + 0.5 * v * v;`), "2.000");
    case "particle_filter_sir":
      return simpleStdLab(session, "particle_filter_neff", "C++ Particle Filter N_eff", stdVectorBody(`  std::vector<double> w{0.1, 0.2, 0.7};
  double denom = 0.0;
  for (double value : w) denom += value * value;
  return 1.0 / denom;`), "1.852");
    case "sensor_fusion_gps_imu":
      return simpleStdLab(session, "gps_imu_fusion", "C++ GPS IMU Complementary Fusion", stdVectorBody(`  double x = 0.0;
  double alpha = 0.8;
  for (double gps : {1.2, 2.1, 2.9}) {
    double pred = x + 1.0;
    x = alpha * pred + (1.0 - alpha) * gps;
  }
  return x;`), "3.022");
    case "imu_preintegration_basic":
      return simpleStdLab(session, "imu_bias_drift", "C++ IMU Bias Drift", stdVectorBody(`  double v = 0.0, p = 0.0, dt = 0.01, bias = 0.05;
  for (int i = 0; i < 1000; ++i) {
    v += bias * dt;
    p += v * dt;
  }
  return p;`), "2.503");
    case "pose_graph_slam_basics":
      return simpleStdLab(session, "pose_graph_loop", "C++ Pose Graph Loop Closure", stdVectorBody(`  double y_last = 0.4;
  double correction = -0.4;
  return y_last + correction;`), "0.000");
    case "dwa_obstacle_avoidance":
      return simpleStdLab(session, "dwa_velocity_score", "C++ DWA Velocity Score", stdVectorBody(`  double heading = 0.7, clearance = 1.0, velocity = 0.2;
  return heading + clearance + 0.2 * velocity;`), "1.740");
    default:
      return undefined;
  }
};

const safetyCppLab = (session: Session): CodeLab | undefined => {
  if (session.id.includes("watchdog")) {
    return simpleStdLab(session, "safety_watchdog_timer", "C++ Watchdog Timer", stdVectorBody(`  double last = 10.0;
  double now = 10.8;
  double timeout = 0.5;
  return (now - last) > timeout ? 1.0 : 0.0;`), "1.000");
  }
  if (session.id.includes("fail_safe")) {
    return simpleStdLab(session, "safety_fail_safe_state_machine", "C++ Fail-safe State Machine", stdVectorBody(`  bool enable = true, heartbeat_ok = true, sensors_ok = true, estop = false, fault = false;
  bool running = !estop && !fault && enable && heartbeat_ok && sensors_ok;
  return running ? 1.0 : 0.0;`), "1.000");
  }
  if (session.id.includes("emergency_stop")) {
    return simpleStdLab(session, "safety_estop_pipeline", "C++ Emergency Stop Gate", stdVectorBody(`  bool estop_pressed = true;
  bool actuator_enabled = !estop_pressed;
  return actuator_enabled ? 0.0 : 1.0;`), "1.000");
  }
  if (session.id.includes("sensor_timeout")) {
    return simpleStdLab(session, "safety_sensor_timeout", "C++ Sensor Timeout Check", stdVectorBody(`  double stamp = 10.0;
  double now = 10.7;
  double timeout = 0.5;
  return (now - stamp) > timeout ? 1.0 : 0.0;`), "1.000");
  }
  if (session.id.includes("actuator_limit")) {
    return simpleStdLab(session, "safety_actuator_limit", "C++ Actuator Limit Clamp", stdVectorBody(`  double command = 2.0;
  double limit = 1.0;
  if (command > limit) command = limit;
  if (command < -limit) command = -limit;
  return command;`), "1.000");
  }
  if (session.id.includes("latency_jitter")) {
    return simpleStdLab(session, "safety_latency_jitter", "C++ Latency Jitter Profiler", stdVectorBody(`  std::vector<double> times{0.00, 0.02, 0.04, 0.10};
  double expected = 0.02;
  int misses = 0;
  for (size_t i = 1; i < times.size(); ++i) {
    if ((times[i] - times[i - 1]) - expected > 0.02) ++misses;
  }
  return static_cast<double>(misses);`), "1.000");
  }
  return undefined;
};

const fallbackCppLab = (session: Session): CodeLab => {
  const idSuffix = session.id.replace(/[^a-zA-Z0-9_]/g, "_");
  return simpleStdLab(
    session,
    idSuffix,
    `C++ Companion: ${session.title}`,
    stdVectorBody(`  // Port the primary Python lab's core equation to C++ here.
  // This checkpoint keeps the curriculum C++-first while preserving Python as reference.
  return 1.0;`),
    "1.000",
  );
};

const isAiPythonFirstSession = (session: Session): boolean =>
  session.part.startsWith("Part 5.") ||
  session.part.startsWith("Part 7.") ||
  session.part.startsWith("Part 9.") ||
  session.part.startsWith("Part 10.");

const shouldPreferCpp = (session: Session): boolean => !isAiPythonFirstSession(session);

const companionFor = (session: Session): CodeLab => {
  if (session.id === "calculus_derivative_chain_rule") return derivativeCppLab;
  if (session.id === "calculus_gradient_descent") return gradientCppLab;
  if (session.id === "kalman_filter_1d") return kalmanCppLab;
  if (session.id === "ekf_localization") return ekfCppLab;
  if (session.id === "path_planning_astar") return astarCppLab;
  if (session.id === "state_space_model") return stateSpaceCppLab;
  if (session.id === "ode_euler_rk4") return odeCppLab;
  if (session.id === "slam_occupancy_grid") return slamCppLab;
  return safetyCppLab(session) ?? mathOrRobotCppLab(session) ?? fallbackCppLab(session);
};

export const attachCppCompanionLabs = (session: Session): Session => {
  if (!shouldPreferCpp(session)) return session;

  const hasCppLab = session.codeLabs.some((lab) => lab.language === "cpp");
  const codeLabs = hasCppLab ? session.codeLabs : [companionFor(session), ...session.codeLabs];
  const sortedCodeLabs = [...codeLabs].sort((a, b) => Number(b.language === "cpp") - Number(a.language === "cpp"));

  return {
    ...session,
    codeLabs: sortedCodeLabs,
  };
};
