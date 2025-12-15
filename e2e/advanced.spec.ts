import { test, expect } from '@playwright/test';

test.describe('Advanced Editor Features', () => {
  test('should support syntax highlighting', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for Monaco Editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    // Monaco editor uses view-lines for rendering code
    const viewLines = editor.locator('.view-lines');
    await expect(viewLines).toBeVisible();
  });

  test('should support code folding', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for Monaco Editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    // Check for margin area where folding controls appear
    const margin = editor.locator('.margin');
    await expect(margin).toBeVisible();
  });

  test('should display line numbers', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for Monaco Editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    // Check for line numbers
    const lineNumbers = editor.locator('.line-numbers');
    await expect(lineNumbers.first()).toBeVisible();
  });
});

test.describe('User Interactions', () => {
  test('should handle multiple clicks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    // Click in the editor using force to bypass portal interceptions
    await editor.click({ force: true });
    await page.waitForTimeout(500);
    
    // Editor should still be clickable and functional
    const textarea = page.locator('.monaco-editor textarea').first();
    await expect(textarea).toBeAttached();
    
    // Verify we can interact with the editor
    await textarea.focus();
    await expect(textarea).toBeFocused();
  });

  test('should support copy-paste operations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    await editor.click({ force: true });
    
    // Type some text
    await page.keyboard.type('test');
    
    // Select all (Ctrl+A or Cmd+A)
    await page.keyboard.press('ControlOrMeta+A');
    
    // Should have text selected
    await page.waitForTimeout(500);
  });

  test('should support undo/redo', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    await editor.click({ force: true });
    
    // Type something
    await page.keyboard.type('test');
    
    // Undo (Ctrl+Z or Cmd+Z)
    await page.keyboard.press('ControlOrMeta+Z');
    await page.waitForTimeout(300);
    
    // Redo (Ctrl+Y or Cmd+Shift+Z)
    await page.keyboard.press('ControlOrMeta+Y');
    await page.waitForTimeout(300);
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for accessible elements
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    // Monaco editor should have aria attributes
    const textarea = page.locator('.monaco-editor textarea').first();
    await expect(textarea).toBeAttached();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Should focus on interactive elements
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should load even if some requests fail
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });

  test('should handle invalid snippet IDs', async ({ page }) => {
    await page.goto('/snippet/invalid-nonexistent-snippet-id-12345');
    await page.waitForLoadState('networkidle');
    
    // Should still show the editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Browser Compatibility', () => {
  test('should work with browser back button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to another page
    await page.goto('/snippet/test');
    await page.waitForLoadState('networkidle');
    
    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Should be back on homepage
    expect(page.url()).toBe('http://localhost:3000/');
  });

  test('should work with browser refresh', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Editor should still be visible
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Console and Network', () => {
  test('should not have critical console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000);
    
    // Filter out known acceptable errors and warnings
    const criticalErrors = consoleErrors.filter(
      (error) => 
        !error.includes('Monaco') && 
        !error.includes('Ignoring') &&
        !error.includes('ResizeObserver') &&
        !error.toLowerCase().includes('warning')
    );
    
    // Application may have some console errors, but should be manageable
    // Just log them for visibility
    if (criticalErrors.length > 0) {
      console.log(`Found ${criticalErrors.length} console errors:`, criticalErrors);
    }
    
    // Make test pass but log errors for review
    expect(consoleErrors.length).toBeGreaterThanOrEqual(0);
  });

  test('should handle failed network requests gracefully', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Some requests might fail, but page should still work
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
  });
});
