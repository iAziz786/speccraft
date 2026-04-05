# SpecCraft

> Spec-driven development for AI coding assistants

[![Version](https://img.shields.io/npm/v/@speccraft/cli)](https://www.npmjs.com/package/@speccraft/cli)
[![License](https://img.shields.io/npm/l/@speccraft/cli)](LICENSE)

SpecCraft brings structure to AI-assisted development by adding a lightweight "spec layer" to your workflow. Before any code is written, you and your AI assistant align on what to build through structured specifications.

## 🚀 Quick Start

```bash
# Install the CLI
bun install -g @speccraft/cli

# Initialize in your project
cd your-project
speccraft init

# Create your first spec
speccraft propose add-dark-mode --description "Add dark mode toggle"

# Generate tasks
speccraft tasks add-dark-mode

# View all specs
speccraft list
```

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@speccraft/cli` | [![npm](https://img.shields.io/npm/v/@speccraft/cli)](https://www.npmjs.com/package/@speccraft/cli) | CLI tool for spec-driven development |
| `@speccraft/core` | [![npm](https://img.shields.io/npm/v/@speccraft/core)](https://www.npmjs.com/package/@speccraft/core) | Core library for spec management |

## 🎯 Philosophy

- **Fluid not rigid** — Update specs anytime, no phase gates
- **Iterative not waterfall** — Build, test, refine continuously
- **Easy not complex** — Simple CLI commands, minimal ceremony
- **Built for brownfield** — Works with existing projects
- **Scalable** — From personal projects to enterprise teams

## 📚 Documentation

Visit our [documentation site](https://speccraft.dev) for:
- [Getting Started](https://speccraft.dev/quickstart)
- [CLI Reference](https://speccraft.dev/cli/commands)
- [Core Concepts](https://speccraft.dev/concepts/spec-driven-development)

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/iAziz786/speccraft.git
cd speccraft

# Install dependencies
bun install

# Run tests
bun test

# Build CLI
bun run build:cli

# Run CLI locally
./speccraft --help
```

## 📄 License

MIT © [Aziz](https://github.com/iAziz786)

---

<p align="center">Built with 💜 for developers who value clarity</p>
