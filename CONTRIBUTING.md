# Contributing to APPI VPN

Thank you for your interest in contributing to APPI VPN!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `pnpm test`
6. Run lint: `pnpm lint`
7. Commit your changes: `git commit -m 'feat(scope): add amazing feature'`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

## Development Setup

```bash
pnpm install
cp .env.example .env.development
docker compose up -d
pnpm dev
```

## Code Standards

- Use TypeScript strict mode
- Never use `any`
- Follow SOLID principles
- Write tests for new features
- Keep functions short and focused
- Use meaningful variable names
- Add JSDoc comments for public APIs

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope):` - New feature
- `fix(scope):` - Bug fix
- `docs(scope):` - Documentation
- `style(scope):` - Formatting (no code change)
- `refactor(scope):` - Code refactoring
- `test(scope):` - Tests
- `chore(scope):` - Build process/tooling

Examples:
```
feat(auth): implement google oauth login
fix(api): resolve subscription validation bug
docs(readme): update installation guide
```

## Branch Strategy

- `main` - Production ready code
- `development` - Integration branch
- `feature/*` - New features
- `hotfix/*` - Emergency fixes

## Pull Request Requirements

- [ ] Code follows project style guidelines
- [ ] Tests pass
- [ ] Lint passes
- [ ] Type check passes
- [ ] Documentation updated (if applicable)
- [ ] No secrets or credentials committed
- [ ] PR template completed

## Questions?

Open an issue or contact the team.
