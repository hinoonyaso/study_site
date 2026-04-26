import { expect, test } from "@playwright/test";

test("A+ 보강 세션과 주요 visualizer가 렌더링된다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Physical AI를 위한 기초수학|Part/ }).first()).toBeVisible();

  await page.getByRole("button", { name: /Part 5\. 인식 AI와 로봇 비전/ }).click();
  await page.locator(".section-select select").selectOption("opencv_threshold_contour_basics");
  await expect(page.getByRole("heading", { name: "OpenCV 기초: Threshold, Contour, Bounding Box", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("OpenCV Threshold / Contour")).toBeVisible();
  await expect(page.locator("svg.plot").first()).toBeVisible();

  await page.locator(".section-select select").selectOption("pose_estimation_pnp_6d");
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("PnP 6D Pose")).toBeVisible();

  await page.getByRole("button", { name: /Part 7\. Physical AI/ }).click();
  await page.locator(".section-select select").selectOption("robot_foundation_model_deployment");
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("Robot Foundation Model Pipeline")).toBeVisible();

  await page.getByRole("button", { name: /Part C\+\+\. C\+\+ 로봇SW 기초/ }).click();
  await page.locator(".section-select select").selectOption("cpp_eigen_ik_2link");
  await page.getByRole("tab", { name: "시각화" }).click();
  await expect(page.getByText("Three.js 3D Robot Arm FK")).toBeVisible();
  await expect(page.locator(".visual-panel canvas").first()).toBeVisible();
});

test("adaptive retry가 오답 conceptTag를 기반으로 문제 큐를 만든다", async ({ page }) => {
  await page.goto("/");
  await page.locator("button.module-button").filter({ hasText: "Part 1. Physical AI를 위한 기초수학" }).click();
  await page.locator(".section-select select").selectOption("backprop_chain_rule_numpy");
  await page.getByRole("tab", { name: "시험" }).click();

  await page.getByRole("button", { name: "채점하기" }).click();
  await expect(page.getByText(/Adaptive retry/).first()).toBeVisible();
  await page.getByRole("button", { name: "약점 문제만 다시 풀기" }).click();
  await expect(page.getByText(/Adaptive retry queue/)).toBeVisible();
});
