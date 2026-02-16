# Contributing to CDN-OrPaynter-AI

Thank you for considering contributing to CDN-OrPaynter-AI! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment.

## How to Contribute

### Reporting Issues

- Check if the issue already exists in the [issue tracker](https://github.com/orpaynter/CDN-OrPaynter-AI/issues)
- Use a clear and descriptive title
- Provide detailed steps to reproduce the issue
- Include relevant code samples, error messages, or screenshots

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Write clear, concise commit messages
   - Keep changes focused and atomic

3. **Test your changes**

   ```bash
   # Check code formatting
   npx prettier --check .

   # Run linting (if available)
   npm run lint

   # Test the build
   npm run build

   # Test locally
   npm run dev
   ```

4. **Format your code**

   ```bash
   npx prettier --write .
   ```

5. **Commit your changes**

   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Use the PR template
   - Provide a clear description of your changes
   - Link related issues
   - Wait for review and address feedback

## Branch Protection Rules

This repository uses branch protection rules for the `main` branch:

- ✅ Pull requests require at least 1 approval
- ✅ All CI checks must pass before merging
- ✅ Branches must be up to date before merging
- ✅ All conversations must be resolved
- ✅ Force pushes are blocked
- ✅ Direct pushes to main are blocked

See [BRANCH_RULESET.md](BRANCH_RULESET.md) for details.

## CI/CD Pipeline

All pull requests trigger automated checks:

### Quality Checks

- **Prettier** - Code formatting verification
- Ensures consistent code style across the project

### Build

- **Next.js Build** - Verifies the application builds successfully
- May require environment variables for full functionality

### Security Audit

- **npm audit** - Checks for dependency vulnerabilities
- Critical vulnerabilities will fail the build

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Netlify CLI (for local development with edge functions)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/orpaynter/CDN-OrPaynter-AI.git
   cd CDN-OrPaynter-AI
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**

   ```bash
   # Using Next.js directly
   npm run dev

   # Or using Netlify CLI (recommended for edge functions)
   netlify dev
   ```

4. **Open your browser**
   - Navigate to http://localhost:3000 (or http://localhost:8888 if using Netlify CLI)

## Code Style

This project uses:

- **Prettier** for code formatting
- **ESLint** for code quality (via Next.js)
- **Tailwind CSS** for styling

### Formatting

Always format your code before committing:

```bash
npx prettier --write .
```

### Configuration Files

- `.prettierrc` - Prettier configuration
- `.eslintrc.json` - ESLint configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Project Structure

```
.
├── .github/              # GitHub configuration
│   ├── workflows/        # CI/CD workflows
│   ├── BRANCH_RULESET.md # Branch protection documentation
│   └── SETUP_GUIDE.md    # Ruleset setup guide
├── app/                  # Next.js app directory
├── components/           # React components
├── data/                 # Static data files
├── netlify/              # Netlify-specific functions
├── public/               # Static assets
├── styles/               # Global styles
└── middleware.js         # Next.js middleware
```

## Commit Message Guidelines

Write clear and meaningful commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and PRs when relevant

**Examples:**

```
✅ Add user authentication feature
✅ Fix navigation menu on mobile devices
✅ Update documentation for API endpoints
✅ Refactor data fetching logic for better performance
```

## Testing

- Manually test your changes in the browser
- Ensure the application builds without errors
- Test on different screen sizes for responsive changes
- Verify no console errors or warnings

## Documentation

- Update README.md if you change functionality
- Add comments for complex logic
- Update API documentation if you modify endpoints
- Keep documentation in sync with code changes

## Need Help?

- Check existing [issues](https://github.com/orpaynter/CDN-OrPaynter-AI/issues)
- Read the [README.md](../README.md)
- Review [BRANCH_RULESET.md](BRANCH_RULESET.md)
- Contact repository maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to CDN-OrPaynter-AI! 🚀
