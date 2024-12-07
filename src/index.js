#!/usr/bin/env node --no-deprecation

import { Command } from 'commander';
import chalk from 'chalk';
import enquirer from 'enquirer';
import clipboardy from 'clipboardy';
import { setApiKey, getApiKey, clearApiKey, setOS, getOS } from './config.js';
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
        const prompt = createPrompt(question, os);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
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
                    model: "gpt-4o",
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
    .description('AI help for terminal commands')
    .version('1.0.0');

program
    .argument('[question...]', 'Your question about what command to use')
    .option('-e, --explain', 'Include explanation with the command')
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
    .action(() => {
        clearApiKey();
        console.log(chalk.green('✓ API key removed!'));
        process.exit(0);
    });

program
    .command('set-os')
    .description('Set your operating system (e.g., windows, macos, linux)')
    .argument('<os>', 'Your OS - can be any value, common examples: windows, macos, linux')
    .action((os) => {
        setOS(os.toLowerCase());
        console.log(chalk.green(`✓ OS set to: ${os.toLowerCase()}`));
    });

program.parse(); 