you can see live at https://run.dnz.dev 

UI is mostly fork of https://github.com/x1unix/go-playground with heavy modifications

## Development

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm run start
```

### Testing

This project includes end-to-end (e2e) tests using Playwright.

#### Run E2E Tests

```bash
npm run test:e2e
```

#### Run E2E Tests with UI Mode (Recommended for Development)

```bash
npm run test:e2e:ui
```

#### Run E2E Tests in Headed Mode

```bash
npm run test:e2e:headed
```

#### Debug E2E Tests

```bash
npm run test:e2e:debug
```

#### View Test Report

```bash
npm run test:e2e:report
```

For more information about the tests, see the [e2e/README.md](e2e/README.md) file.
