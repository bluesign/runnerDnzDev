# E2E Tests

This directory contains end-to-end tests for the Cadence Playground application using Playwright.

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Structure

- `playground.spec.ts` - Tests for the main playground functionality including:
  - Homepage loading
  - Code editor functionality
  - Navigation
  - Responsive design
  - Performance

- `advanced.spec.ts` - Advanced feature tests including:
  - Syntax highlighting
  - Code editing operations
  - User interactions
  - Accessibility
  - Error handling
  - Browser compatibility

## Writing Tests

Tests use Playwright's testing framework. Each test should:
1. Navigate to the page under test
2. Wait for critical elements to load
3. Perform interactions
4. Assert expected outcomes

Example:
```typescript
test('should load the homepage successfully', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Cadence|Playground/i);
});
```

## Configuration

Test configuration is defined in `playwright.config.ts` at the root level. Key settings:
- Base URL: `http://localhost:3000`
- Browser: Chromium (Desktop Chrome)
- Automatic dev server startup before tests
- HTML reporter for test results

## CI/CD Integration

On CI environments, tests will:
- Retry failed tests up to 2 times
- Run sequentially (workers: 1)
- Fail if `test.only` is found in code
- Not reuse existing dev server

## Troubleshooting

### Tests timing out
- Increase timeout in test or config
- Check if dev server is running
- Verify network connectivity

### Monaco Editor not loading
- Tests wait up to 15 seconds for Monaco Editor
- Check browser console for errors
- Verify Monaco webpack plugin configuration

### Flaky tests
- Use proper waiting strategies (waitForLoadState, waitForSelector)
- Avoid hard-coded timeouts where possible
- Use Playwright's auto-waiting features
