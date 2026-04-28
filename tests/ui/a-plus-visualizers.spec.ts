import { expect, test, type Page } from "@playwright/test";

async function gotoApp(page: Page) {
  await page.goto("/");
  const closeOnboarding = page.getByLabel("온보딩 닫기");
  if (await closeOnboarding.isVisible().catch(() => false)) {
    await closeOnboarding.click();
  }
}

test("A+ 보강 세션과 주요 visualizer가 렌더링된다", async ({ page }) => {
  await gotoApp(page);
  await expect(page.getByRole("heading", { name: /Physical AI를 위한 기초수학|Part/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /0\. 한눈에 보는 결론/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /1\. 공통 선수지식/ })).toHaveCount(0);

  await page.locator("button.module-button").filter({ hasText: "Part 5." }).click();
  await page.locator(".section-select select").selectOption("opencv_threshold_contour_basics");
  await expect(page.getByRole("heading", { name: "OpenCV: Threshold·Contour", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("OpenCV Threshold / Contour")).toBeVisible();
  await expect(page.locator("svg.plot").first()).toBeVisible();

  await page.locator(".section-select select").selectOption("pose_estimation_pnp_6d");
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("PnP 6D Pose")).toBeVisible();

  await page.locator("button.module-button").filter({ hasText: "Part 6." }).click();
  await page.locator(".section-select select").selectOption("robot_foundation_model_deployment");
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("Robot Foundation Model Pipeline")).toBeVisible();

  await page.locator("button.module-button").filter({ hasText: "Part 7." }).click();
  await page.locator(".section-select select").selectOption("cpp_eigen_ik_2link");
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("Three.js 3D Robot Arm FK")).toBeVisible();
  await expect(page.locator(".visual-panel canvas").first()).toBeVisible();
});

test("맞춤 재시험이 오답 개념 태그를 기반으로 문제 큐를 만든다", async ({ page }) => {
  await gotoApp(page);
  await page.locator("button.module-button").filter({ hasText: "Part 1." }).click();
  await page.locator(".section-select select").selectOption("backprop_chain_rule_numpy");
  await page.getByRole("tab", { name: "시험" }).click();

  await page.getByRole("button", { name: "채점하기" }).click();
  await expect(page.getByText(/맞춤 재시험/).first()).toBeVisible();
  await page.getByRole("button", { name: "약점 문제만 다시 풀기" }).click();
  await expect(page.getByText(/맞춤 재시험 · .*문항/)).toBeVisible();
});

test("v9 약점 폐쇄 세션과 인터랙티브 시각화 스펙이 렌더링된다", async ({ page }) => {
  await gotoApp(page);
  await page.locator("button.module-button").filter({ hasText: "Part 2." }).click();
  await page.locator(".section-select select").selectOption("null_space_redundancy_resolution");
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("Null Space Arm Posture Motion")).toBeVisible();
  await expect(page.locator(".visualization-spec-card input[type='range']")).toHaveCount(3);

  await page.locator("button.module-button").filter({ hasText: "Part 6." }).click();
  await page.locator(".section-select select").selectOption("dagger_dataset_aggregation_imitation_learning");
  await page.getByRole("tab", { name: "실습" }).click();
  await expect(page.getByText("DAgger Dataset Aggregation Loop")).toBeVisible();
});
