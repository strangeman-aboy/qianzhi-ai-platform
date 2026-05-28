#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const os = require("os");

const baseUrl = (process.argv[2] || process.env.QIANZHI_QA_URL || "http://127.0.0.1:8107").replace(/\/+$/, "");
const screenshotEnabled = process.argv.includes("--screenshots");
const screenshotDir = path.resolve("docs", "qa");
const edgeCandidates = [
    process.env.QIANZHI_BROWSER,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
].filter(Boolean);

const routes = ["home", "market", "tasks", "security", "creators"];
const themes = ["light", "dark"];
const viewports = [
    { name: "desktop", width: 1180, height: 900 },
    { name: "mobile", width: 390, height: 844 }
];

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

async function scanPage(page, label) {
    return page.evaluate((scanLabel) => {
        const viewportWidth = document.documentElement.clientWidth;
        const scrollOverflow = Math.max(0, document.documentElement.scrollWidth - viewportWidth);
        const visibleElements = [...document.querySelectorAll("body *")].filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none"
                && style.visibility !== "hidden"
                && rect.width > 0
                && rect.height > 0;
        });

        const viewportOverflow = visibleElements
            .map((element) => {
                const rect = element.getBoundingClientRect();
                const overLeft = rect.left < -2;
                const overRight = rect.right > viewportWidth + 2;
                if (!overLeft && !overRight) return null;
                return {
                    tag: element.tagName.toLowerCase(),
                    cls: String(element.className || "").slice(0, 80),
                    text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
                    left: Math.round(rect.left),
                    right: Math.round(rect.right),
                    width: Math.round(rect.width)
                };
            })
            .filter(Boolean)
            .slice(0, 12);

        const clippedText = visibleElements
            .filter((element) => element.matches("button, a, input, textarea, select, .btn, .filter-btn, .task-filter, .stat-card, .agent-card, .task-card, .evidence-input-row"))
            .map((element) => {
                const overflowX = element.scrollWidth - element.clientWidth;
                const overflowY = element.scrollHeight - element.clientHeight;
                if (overflowX <= 2 && overflowY <= 2) return null;
                return {
                    tag: element.tagName.toLowerCase(),
                    cls: String(element.className || "").slice(0, 80),
                    text: (element.textContent || element.value || "").trim().replace(/\s+/g, " ").slice(0, 80),
                    overflowX,
                    overflowY
                };
            })
            .filter(Boolean)
            .slice(0, 12);

        const left = document.querySelector(".hero-left-stack")?.getBoundingClientRect();
        const right = document.querySelector(".hero-right-stack")?.getBoundingClientRect();
        const homeBalance = left && right
            ? {
                leftHeight: Math.round(left.height),
                rightHeight: Math.round(right.height),
                delta: Math.round(Math.abs(left.height - right.height))
            }
            : null;

        return {
            label: scanLabel,
            route: location.hash || "#home",
            theme: document.documentElement.dataset.theme || "light",
            viewportWidth,
            scrollOverflow,
            viewportOverflow,
            clippedText,
            homeBalance
        };
    }, label);
}

function summarize(results) {
    const failures = [];
    for (const result of results) {
        if (result.scrollOverflow > 2) {
            failures.push(`${result.label}: document overflows horizontally by ${result.scrollOverflow}px`);
        }
        if (result.viewportOverflow.length) {
            failures.push(`${result.label}: ${result.viewportOverflow.length} visible elements exceed viewport`);
        }
        if (result.clippedText.length) {
            failures.push(`${result.label}: ${result.clippedText.length} controls or text containers clip content`);
        }
        if (result.label.includes("desktop-light-home") && result.homeBalance && result.homeBalance.delta > 260) {
            failures.push(`${result.label}: home columns differ by ${result.homeBalance.delta}px`);
        }
    }
    return failures;
}

async function main() {
    const { chromium } = loadPlaywright();
    const executablePath = await firstExistingPath(edgeCandidates);
    if (!executablePath) {
        throw new Error("No Edge or Chrome executable found. Set QIANZHI_BROWSER to a Chromium executable.");
    }

    if (screenshotEnabled) {
        await fs.mkdir(screenshotDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: true, executablePath });
    const results = [];

    for (const viewport of viewports) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
        for (const theme of themes) {
            for (const route of routes) {
                await page.goto(`${baseUrl}/index.html#${route}`, { waitUntil: "networkidle" });
                await page.evaluate((value) => {
                    document.documentElement.dataset.theme = value;
                    localStorage.setItem("qianzhi-theme", value);
                    window.scrollTo(0, 0);
                }, theme);
                await page.waitForTimeout(120);
                const label = `${viewport.name}-${theme}-${route}`;
                results.push(await scanPage(page, label));
                if (screenshotEnabled) {
                    await page.screenshot({ path: path.join(screenshotDir, `${label}.png`), fullPage: true });
                }
            }
        }
        await page.close();
    }

    const modalPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await modalPage.goto(`${baseUrl}/index.html#tasks`, { waitUntil: "networkidle" });
    await modalPage.evaluate(() => {
        document.documentElement.dataset.theme = "light";
        localStorage.setItem("qianzhi-theme", "light");
        window.openSubmissionModal?.("QZ-1025");
    });
    await modalPage.waitForTimeout(180);
    results.push(await scanPage(modalPage, "mobile-light-submission-modal"));
    if (screenshotEnabled) {
        await modalPage.screenshot({ path: path.join(screenshotDir, "mobile-light-submission-modal.png"), fullPage: true });
    }

    await modalPage.evaluate(() => {
        window.closeModal?.();
        window.openDisputeModal?.("QZ-1025");
    });
    await modalPage.waitForTimeout(180);
    results.push(await scanPage(modalPage, "mobile-light-dispute-modal"));
    if (screenshotEnabled) {
        await modalPage.screenshot({ path: path.join(screenshotDir, "mobile-light-dispute-modal.png"), fullPage: true });
    }
    await modalPage.close();

    await browser.close();

    const failures = summarize(results);
    console.log(JSON.stringify({ baseUrl, checked: results.length, failures, results }, null, 2));
    if (failures.length) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(`visual qa failed: ${error.message}`);
    process.exit(1);
});
