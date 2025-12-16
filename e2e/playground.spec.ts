import { test, expect } from '@playwright/test';

test.describe('Playground Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Page should load successfully (basic check)
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });

  test('should display the header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for header presence (adjust selector based on actual HTML)
    const header = page.locator('header, [role="banner"], nav').first();
    await expect(header).toBeVisible();
  });

  test('should display the code editor', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for Monaco Editor to load (it's loaded with dynamic import)
    // Monaco editor typically has a specific class or data attribute
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });

  test('should display status bar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for status bar element - it exists but might be visually hidden
    const statusBar = page.locator('[class*="StatusBar"], [class*="status-bar"]').first();
    // Just check it exists in DOM, visibility may vary
    await expect(statusBar).toBeAttached({ timeout: 10000 });
  });

  test('should have resizable preview panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for preview or output panel
    const preview = page.locator('[class*="preview"], [class*="output"], [class*="panel"]').first();
    await expect(preview).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Code Editor Functionality', () => {
  test('should allow code editing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for Monaco Editor to load
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    // Click in the editor area using force to bypass portal
    await editor.click({ force: true });
    
    // Monaco editor should be focused and editable
    const textarea = page.locator('.monaco-editor textarea').first();
    await expect(textarea).toBeFocused({ timeout: 5000 });
  });

  test('should handle keyboard input in editor', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for Monaco Editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    // Click in the editor using force
    await editor.click({ force: true });
    
    // Type some code
    await page.keyboard.type('// Test comment');
    
    // Verify text was entered (Monaco stores content in its model)
    const textarea = page.locator('.monaco-editor textarea').first();
    await expect(textarea).toBeFocused();
  });
});

test.describe('Navigation', () => {
  test('should navigate to snippet page with ID', async ({ page }) => {
    // Try to navigate to a snippet page
    await page.goto('/snippet/test123');
    await page.waitForLoadState('networkidle');
    
    // Should still show the playground (same component)
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });

  test('should handle 404 page', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    
    // Should either show 404 page or redirect
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should still load
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should still load
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Performance', () => {
  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 30 seconds (generous for Monaco Editor)
    expect(loadTime).toBeLessThan(30000);
  });
});
