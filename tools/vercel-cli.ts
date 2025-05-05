#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const program = new Command();

// Check if vercel CLI is installed
function checkVercelCLI(): boolean {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install Vercel CLI if not installed
function installVercelCLI() {
  const spinner = ora('Installing Vercel CLI...').start();
  try {
    execSync('npm install -g vercel', { stdio: 'ignore' });
    spinner.succeed('Vercel CLI installed successfully');
    return true;
  } catch (error) {
    spinner.fail('Failed to install Vercel CLI');
    console.error(chalk.red(`Error: ${error}`));
    return false;
  }
}

// Run Vercel command with real-time output
function runVercelCommand(args: string[]) {
  const vercel = spawn('vercel', args, { stdio: 'inherit' });
  return new Promise<void>((resolve, reject) => {
    vercel.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    vercel.on('error', (error) => {
      reject(error);
    });
  });
}

// Deploy command
program
  .command('deploy')
  .description('Deploy the application to Vercel')
  .option('-e, --environment <environment>', 'Deployment environment: production, preview, or development', 'preview')
  .option('-p, --project <name>', 'Project name (defaults to directory name)')
  .option('--prod', 'Deploy to production (shorthand for -e production)', false)
  .action(async (options) => {
    if (!checkVercelCLI() && !installVercelCLI()) {
      return;
    }

    const environment = options.prod ? 'production' : options.environment;
    const projectName = options.project || path.basename(process.cwd());
    
    console.log(chalk.blue(`Deploying ${projectName} to ${environment} environment...`));
    
    const args = ['deploy'];
    
    if (environment === 'production') {
      args.push('--prod');
    }
    
    if (options.project) {
      args.push('--name', options.project);
    }
    
    try {
      await runVercelCommand(args);
      console.log(chalk.green('Deployment successful!'));
    } catch (error) {
      console.error(chalk.red(`Deployment failed: ${error}`));
      process.exit(1);
    }
  });

// List deployments command
program
  .command('list')
  .description('List recent deployments')
  .option('-n, --count <number>', 'Number of deployments to show', '5')
  .action(async (options) => {
    if (!checkVercelCLI() && !installVercelCLI()) {
      return;
    }
    
    console.log(chalk.blue(`Listing recent deployments...`));
    
    try {
      await runVercelCommand(['list', '--limit', options.count]);
    } catch (error) {
      console.error(chalk.red(`Failed to list deployments: ${error}`));
      process.exit(1);
    }
  });

// Logs command
program
  .command('logs')
  .description('Show logs for the current project')
  .option('-f, --follow', 'Follow logs in real time', false)
  .option('-d, --deployment <id>', 'Deployment ID')
  .action(async (options) => {
    if (!checkVercelCLI() && !installVercelCLI()) {
      return;
    }
    
    console.log(chalk.blue(`Fetching logs...`));
    
    const args = ['logs'];
    
    if (options.follow) {
      args.push('--follow');
    }
    
    if (options.deployment) {
      args.push(options.deployment);
    }
    
    try {
      await runVercelCommand(args);
    } catch (error) {
      console.error(chalk.red(`Failed to fetch logs: ${error}`));
      process.exit(1);
    }
  });

// Domains command
program
  .command('domains')
  .description('Manage domains for your Vercel projects')
  .option('-a, --add <domain>', 'Add a domain')
  .option('-r, --remove <domain>', 'Remove a domain')
  .option('-l, --list', 'List all domains', false)
  .action(async (options) => {
    if (!checkVercelCLI() && !installVercelCLI()) {
      return;
    }
    
    if (options.add) {
      console.log(chalk.blue(`Adding domain ${options.add}...`));
      try {
        await runVercelCommand(['domains', 'add', options.add]);
        console.log(chalk.green('Domain added successfully!'));
      } catch (error) {
        console.error(chalk.red(`Failed to add domain: ${error}`));
        process.exit(1);
      }
    } else if (options.remove) {
      console.log(chalk.blue(`Removing domain ${options.remove}...`));
      try {
        await runVercelCommand(['domains', 'rm', options.remove, '--yes']);
        console.log(chalk.green('Domain removed successfully!'));
      } catch (error) {
        console.error(chalk.red(`Failed to remove domain: ${error}`));
        process.exit(1);
      }
    } else if (options.list) {
      console.log(chalk.blue(`Listing domains...`));
      try {
        await runVercelCommand(['domains', 'ls']);
      } catch (error) {
        console.error(chalk.red(`Failed to list domains: ${error}`));
        process.exit(1);
      }
    } else {
      program.commands.find(cmd => cmd.name() === 'domains')?.help();
    }
  });

// Environment variables command
program
  .command('env')
  .description('Manage environment variables')
  .option('-a, --add <key=value>', 'Add an environment variable')
  .option('-r, --remove <key>', 'Remove an environment variable')
  .option('-l, --list', 'List all environment variables', false)
  .option('-e, --environment <environment>', 'Environment: development, preview, or production', 'development')
  .action(async (options) => {
    if (!checkVercelCLI() && !installVercelCLI()) {
      return;
    }
    
    if (options.add) {
      const [key, value] = options.add.split('=');
      if (!key || !value) {
        console.error(chalk.red('Invalid format. Use key=value'));
        process.exit(1);
      }
      
      console.log(chalk.blue(`Adding environment variable ${key}...`));
      try {
        await runVercelCommand(['env', 'add', key, options.environment, '--value', value]);
        console.log(chalk.green('Environment variable added successfully!'));
      } catch (error) {
        console.error(chalk.red(`Failed to add environment variable: ${error}`));
        process.exit(1);
      }
    } else if (options.remove) {
      console.log(chalk.blue(`Removing environment variable ${options.remove}...`));
      try {
        await runVercelCommand(['env', 'rm', options.remove, '--yes']);
        console.log(chalk.green('Environment variable removed successfully!'));
      } catch (error) {
        console.error(chalk.red(`Failed to remove environment variable: ${error}`));
        process.exit(1);
      }
    } else if (options.list) {
      console.log(chalk.blue(`Listing environment variables...`));
      try {
        await runVercelCommand(['env', 'ls']);
      } catch (error) {
        console.error(chalk.red(`Failed to list environment variables: ${error}`));
        process.exit(1);
      }
    } else {
      program.commands.find(cmd => cmd.name() === 'env')?.help();
    }
  });

// Promote to production command
program
  .command('promote')
  .description('Promote a deployment to production')
  .argument('<url-or-id>', 'Deployment URL or ID to promote')
  .action(async (deploymentId) => {
    if (!checkVercelCLI() && !installVercelCLI()) {
      return;
    }
    
    console.log(chalk.blue(`Promoting deployment ${deploymentId} to production...`));
    
    try {
      await runVercelCommand(['promote', deploymentId]);
      console.log(chalk.green('Deployment promoted to production successfully!'));
    } catch (error) {
      console.error(chalk.red(`Failed to promote deployment: ${error}`));
      process.exit(1);
    }
  });

program.version('1.0.0');
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
} 