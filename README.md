# howcani 🤖💭

[![npm version](https://badge.fury.io/js/howcani.svg)](https://www.npmjs.com/package/howcani)

A CLI tool that translates your natural language questions into terminal commands using AI. Because remembering command syntax is hard, and asking for help should be easy.

> Fun fact: This tool was inspired by countless hours of Googling "how to tar a file" and "git revert last commit" over and over again. Now you can just ask! 🎯

## Examples

Here are some real questions and their answers:

```bash
howcani find all files modified in the last 24 hours
> find . -type f -mtime -1

howcani create a new branch and switch to it
> git checkout -b new-branch

howcani compress an entire directory
> tar -czf archive.tar.gz directory/

howcani find the process using port 3000
> lsof -i :3000
```

## Features

- 🤖 Uses OpenAI's gpt-4o model to understand your questions
- 💡 Generates precise, executable commands
- 🌐 OS-aware command generation
- 🎨 Beautiful terminal output
- 🔑 Bring Your Own API Key - uses your OpenAI account

## Installation

### Via npm (recommended)

```bash
# Install globally from npm
npm install -g howcani
```

### Build from source

```bash
# Clone the repository
git clone https://github.com/zanderiscoding/howcani
cd howcani

# Install dependencies
npm install

# Link the package globally
npm link
```

## Setup

1. Get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys)
2. Set your API key:
```bash
howcani set-key <key>
```

## Usage

Just ask your question in plain English:
```bash
howcani find all JavaScript files recursively
```

Choose what to do with the command:
- Execute it
- Get an explanation
- Cancel

## Commands

```bash
howcani <question>           # Get a command for your question
howcani set-key <key>        # Set your OpenAI API key
howcani unset-key            # Remove your OpenAI API key
howcani set-os <os>          # Set your OS for accurate commands
howcani --help               # Show help message
```

## Requirements

- Node.js 14.x or higher
- An OpenAI API key

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT

## Contact me
I'm on X @zanderiscoding