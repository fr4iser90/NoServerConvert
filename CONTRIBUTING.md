# Contributing to NoServerConvert

Thank you for your interest in contributing to NoServerConvert! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Describe expected and actual behavior
- Include browser version and OS
- Add screenshots if relevant

### Suggesting Features
- Use the GitHub issue tracker
- Describe the feature in detail
- Explain why it would be useful
- Include any relevant examples

### Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

## Development Setup

### Prerequisites
- Node.js (v18 or later)
- npm (v9 or later)
- Modern web browser
- Git

### Setup Steps
```bash
# Clone repository
git clone https://github.com/fr4iser/NoServerConvert.git
cd NoServerConvert

# Install dependencies
npm install

# Start development server
npm run dev
```

## Coding Standards

### TypeScript
- Use strict mode
- Define types for all variables
- Use interfaces for objects
- Document complex types

### Vue Components
- Use Composition API
- Follow single responsibility principle
- Use TypeScript
- Document props and emits

### Git Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

## Testing

### Writing Tests
- Unit tests for utilities
- Component tests for Vue components
- E2E tests for critical paths
- Test coverage requirements (TODO)

### Running Tests
```bash
# Run unit tests
npm run test:unit

# Run component tests
npm run test:component

# Run E2E tests
npm run test:e2e
```

## Documentation

### Code Documentation
- Document complex functions
- Add JSDoc comments
- Keep README updated
- Update architecture docs

### User Documentation
- Keep user guide updated
- Add screenshots for new features
- Update FAQ
- Document known issues

## Review Process

1. Pull request submitted
2. Automated checks run
3. Code review by maintainers
4. Changes requested if needed
5. Approved and merged

## Getting Help

- Open an issue
- Join discussions
- Check documentation
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 