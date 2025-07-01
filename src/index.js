#!/usr/bin/env node --no-deprecation

import { Command } from 'commander';
import chalk from 'chalk';
import enquirer from 'enquirer';
import clipboardy from 'clipboardy';
import { setApiKey, getApiKey, clearApiKey, setOS, getOS, setModel, getModel, getSavedModels } from './config.js';
import OpenAI from 'openai';
import { createPrompt, parseResponse, createExplanationPrompt } from './prompt.js';
import { exec } from 'child_process';

const program = new Command();

async function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout || stderr);
        });
    });
}

async function handleCommand(question, options) {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.log(chalk.yellow('API key not found. Please set it first using set-key'));
            process.exit(1);
        }

        const openai = new OpenAI({ apiKey });
        const os = getOS();
        const model = getModel();
        const prompt = createPrompt(question, os);
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: prompt
        });

        const result = parseResponse(completion, options.explain);

        console.log(chalk.cyan(result));
        
        if (options.explain) {
            console.log(chalk.gray('\nExplanation:'));
            console.log(chalk.gray(result.split('\n').slice(1).join('\n')));
        }

        const response = await enquirer.prompt({
            type: 'select',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'Execute this command',
                'Copy to clipboard',
                'Explain',
                'Cancel'
            ]
        });

        switch (response.action) {
            case 'Execute this command':
                console.log(chalk.yellow('\nExecuting command...'));
                try {
                    const output = await executeCommand(result);
                    console.log(output);
                } catch (error) {
                    console.error(chalk.red('Error executing command:', error.message));
                }
                break;
            case 'Copy to clipboard':
                await clipboardy.write(result);
                console.log(chalk.green('Command copied to clipboard!'));
                break;
            case 'Explain':
                const explanationPrompt = createExplanationPrompt(result);
                const explanationCompletion = await openai.chat.completions.create({
                    model: model,
                    messages: explanationPrompt
                });
                console.log(chalk.gray('\nExplanation:'));
                console.log(chalk.gray(explanationCompletion.choices[0].message.content));
                break;
            default:
                console.log(chalk.yellow('Operation cancelled'));
        }
        process.exit(0);
    } catch (error) {
        console.error(chalk.red('Error:', error.message));
        process.exit(1);
    }
}

program
    .name('howcani')
    .description(chalk.cyan('AI-powered help for terminal commands'))
    .version('1.1.2')
    .addHelpText('before', `
${chalk.bold('🤖 howcani')} - Get AI help for terminal commands

${chalk.dim('Examples:')}
  $ howcani find all files modified in the last 24 hours
  $ howcani create a new branch and switch to it
  $ howcani compress an entire directory
  $ howcani find the process using port 3000
`)
    .addHelpText('after', `
${chalk.dim('Quick Tips:')}
  - Questions should be clear and specific
  - Commands are OS-aware based on your set OS
  - You can execute or get explanations for any command
  - Use set-os to ensure commands match your system

${chalk.dim('Need more help?')} Visit: ${chalk.blue('https://github.com/zanderiscoding/howcani')}
`);

program
    .argument('[question...]', 'Your question about what command to use')
    .action(async (args, options) => {
        if (args.length > 0) {
            await handleCommand(args.join(' '), options);
        } else {
            program.help();
        }
    });

program
    .command('set-key')
    .description('Set your OpenAI API key')
    .argument('<key>', 'Your OpenAI API key')
    .usage('<key>')
    .addHelpText('after', `
${chalk.dim('Example:')}
  $ howcani set-key sk-...your-key-here...`)
    .action(async (key) => {
        try {
            setApiKey(key);
        } catch (error) {
            console.error(chalk.red('Error setting API key:', error.message));
        }
    });

program
    .command('unset-key')
    .description('Remove the saved OpenAI API key')
    .addHelpText('after', `
${chalk.dim('Use this to:')}
  - Remove your API key for security
  - Switch to a different API key`)
    .action(() => {
        clearApiKey();
        console.log(chalk.green('✓ API key removed!'));
        process.exit(0);
    });

program
    .command('set-os')
    .description('Set your operating system for accurate commands')
    .argument('<os>', 'Your OS (windows, macos, linux)')
    .usage('<os>')
    .addHelpText('after', `
${chalk.dim('Examples:')}
  $ howcani set-os windows
  $ howcani set-os macos
  $ howcani set-os linux`)
    .action((os) => {
        setOS(os.toLowerCase());
        console.log(chalk.green(`✓ OS set to: ${os.toLowerCase()}`));
    });

program
    .command('view-model')
    .description('View the currently configured OpenAI model')
    .addHelpText('after', `
${chalk.dim('Shows:')}
  - Current model in use
  - All saved models`)
    .action(() => {
        const currentModel = getModel();
        const savedModels = getSavedModels();
        
        console.log(chalk.cyan('Current Model:'));
        console.log(chalk.green(`  ${currentModel}`));
        console.log(chalk.cyan('\nSaved Models:'));
        savedModels.forEach(model => {
            const indicator = model === currentModel ? chalk.green('→ ') : '  ';
            console.log(`${indicator}${model}`);
        });
        process.exit(0);
    });

program
    .command('set-model')
    .description('Set the OpenAI model to use')
    .argument('[model]', 'Model name (optional - if not provided, shows interactive selection)')
    .usage('[model]')
    .addHelpText('after', `
${chalk.dim('Examples:')}
  $ howcani set-model gpt-4o-mini
  $ howcani set-model gpt-3.5-turbo
  $ howcani set-model             # Interactive selection`)
    .action(async (model) => {
        if (model) {
            // Direct model setting
            setModel(model);
        } else {
            // Interactive model selection
            const savedModels = getSavedModels();
            const currentModel = getModel();
            
            console.log(chalk.dim('Tip: Run "howcani set-model <model-name>" to add a custom model\n'));
            
            const choices = savedModels.map(m => ({
                name: m === currentModel ? `→ ${m}` : `  ${m}`,
                value: m
            }));
            
            const response = await enquirer.prompt({
                type: 'select',
                name: 'selectedModel',
                message: 'Select an OpenAI model:',
                choices: choices
            });
            
            setModel(response.selectedModel);
        }
    });

program.parse(); 