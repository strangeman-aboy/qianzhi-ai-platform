#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const os = require("os");

const frontendUrl = (process.argv[2] || process.env.QIANZHI_FRONTEND_URL || "http://127.0.0.1:8120").replace(/\/+$/, "");
const apiBase = (process.argv[3] || process.env.QIANZHI_API_BASE || "http://127.0.0.1:8080").replace(/\/+$/, "");
const edgeCandidates = [
    process.env.QIANZHI_BROWSER,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
].filter(Boolean);

function loadPlaywright() {
    try {
        return require("playwright");
    } catch (error) {
        const pnpmRoot = path.join(
            os.homedir(),
            ".cache",
            "codex-runtimes",
            "codex-primary-runtime",
            "dependencies",
            "node",
            "node_modules",
            ".pnpm"
        );
        return require(path.join(pnpmRoot, "playwright@1.60.0", "node_modules", "playwright"));
    }
}

async function firstExistingPath(candidates) {
    for (const item of candidates) {
        try {
            await fs.access(item);
            return item;
        } catch {
            // Try next candidate.
        }
    }
    return "";
}

async function installBackendConfigRoute(page) {
    await page.route("**/scripts/config.js", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/javascript; charset=utf-8",
            body: `window.QIANZHI_CONFIG = {
    apiBase: ${JSON.stringify(apiBase)},
    apiMode: 'required',
    environmentName: '本地 Java 后端'
};`
        });
    });
}

async function gotoRoute(page, routeName) {
    await page.goto(`${frontendUrl}/index.html#${routeName}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(250);
}

function assert(condition, message, failures) {
    if (!condition) failures.push(message);
}

async function textOf(page, selector) {
    const element = page.locator(selector).first();
    if (!(await element.count())) return "";
    return (await element.textContent()) || "";
}

async function main() {
    const { chromium } = loadPlaywright();
    const executablePath = await firstExistingPath(edgeCandidates);
    if (!executablePath) {
        throw new Error("No Edge or Chrome executable found. Set QIANZHI_BROWSER to a Chromium executable.");
    }

    const browser = await chromium.launch({ headless: true, executablePath });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await installBackendConfigRoute(page);

    const failures = [];
    const checks = [];

    await gotoRoute(page, "home");
    await page.waitForFunction(() => {
        const banner = document.querySelector("#environmentBanner");
        return banner && (
            banner.textContent.includes("本地 Java 后端 API")
            || banner.textContent.includes("API 必连失败")
        );
    }, null, { timeout: 10000 }).catch(() => {});

    const environmentText = await textOf(page, "#environmentBanner");
    assert(environmentText.includes("本地 Java 后端 API"), "environment banner should identify the Java backend", failures);
    assert(environmentText.includes("真实后端校验"), "environment banner should show backend-verified transaction flow", failures);
    assert(!environmentText.includes("API 必连失败"), "environment banner should not show required API failure", failures);
    checks.push({ route: "home", environmentText: environmentText.replace(/\s+/g, " ").trim() });

    await gotoRoute(page, "market");
    const agentCards = await page.locator(".agent-card").count();
    const marketText = await page.locator("body").textContent();
    assert(agentCards > 0, "market should render agent cards from the backend", failures);
    assert((marketText || "").includes("创作者"), "market should keep creator-owned Agent positioning visible", failures);
    checks.push({ route: "market", agentCards });

    await gotoRoute(page, "tasks");
    const taskItems = await page.locator(".task-item").count();
    const tasksText = await page.locator("body").textContent();
    assert(taskItems > 0, "tasks should render backend task items", failures);
    assert((tasksText || "").includes("API 状态机"), "tasks should show that task flow is backed by API state checks", failures);
    checks.push({ route: "tasks", taskItems });

    await gotoRoute(page, "security");
    const securityText = await page.locator("body").textContent();
    assert((securityText || "").includes("真实后端接入就绪"), "security page should render backend readiness panel", failures);
    assert((securityText || "").includes("任务状态机"), "security page should include task state-machine readiness", failures);
    checks.push({ route: "security", readinessPanel: (securityText || "").includes("真实后端接入就绪") });

    await browser.close();

    const result = {
        frontendUrl,
        apiBase,
        checkedAt: new Date().toISOString(),
        failures,
        checks
    };
    console.log(JSON.stringify(result, null, 2));
    if (failures.length) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(`frontend-backend qa failed: ${error.message}`);
    process.exit(1);
});
