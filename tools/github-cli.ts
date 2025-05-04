#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const program = new Command();

// Check if GitHub CLI is installed
function checkGitHubCLI(): boolean {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install GitHub CLI based on platform
function installGitHubCLI() {
  const spinner = ora('Installing GitHub CLI...').start();
  const platform = process.platform;
  
  try {
    if (platform === 'darwin') {
      // macOS
      execSync('brew install gh', { stdio: 'ignore' });
    } else if (platform === 'linux') {
      // Linux - using curl installer for better compatibility
      execSync('curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh -y', { stdio: 'ignore' });
    } else if (platform === 'win32') {
      // Windows
      execSync('winget install --id GitHub.cli', { stdio: 'ignore' });
    } else {
      spinner.fail(`Unsupported platform: ${platform}`);
      return false;
    }
    
    spinner.succeed('GitHub CLI installed successfully');
    return true;
  } catch (error) {
    spinner.fail('Failed to install GitHub CLI');
    console.error(chalk.red(`Error: ${error}`));
    console.log(chalk.yellow('Please install GitHub CLI manually: https://cli.github.com/'));
    return false;
  }
}

// Run GitHub CLI command with real-time output
function runGitHubCommand(args: string[]) {
  const gh = spawn('gh', args, { stdio: 'inherit' });
  return new Promise<void>((resolve, reject) => {
    gh.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    gh.on('error', (error) => {
      reject(error);
    });
  });
}

// Authentication command
program
  .command('auth')
  .description('Manage GitHub authentication')
  .option('-l, --login', 'Log in to GitHub')
  .option('-s, --status', 'View authentication status')
  .option('-r, --refresh', 'Refresh stored authentication credentials')
  .option('-o, --logout', 'Log out of GitHub')
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    if (options.login) {
      console.log(chalk.blue('Logging in to GitHub...'));
      try {
        await runGitHubCommand(['auth', 'login']);
        console.log(chalk.green('Successfully logged in to GitHub!'));
      } catch (error) {
        console.error(chalk.red(`Authentication failed: ${error}`));
        process.exit(1);
      }
    } else if (options.status) {
      console.log(chalk.blue('Checking authentication status...'));
      try {
        await runGitHubCommand(['auth', 'status']);
      } catch (error) {
        console.error(chalk.red(`Failed to get status: ${error}`));
        process.exit(1);
      }
    } else if (options.refresh) {
      console.log(chalk.blue('Refreshing authentication credentials...'));
      try {
        await runGitHubCommand(['auth', 'refresh']);
        console.log(chalk.green('Successfully refreshed credentials!'));
      } catch (error) {
        console.error(chalk.red(`Failed to refresh credentials: ${error}`));
        process.exit(1);
      }
    } else if (options.logout) {
      console.log(chalk.blue('Logging out from GitHub...'));
      try {
        await runGitHubCommand(['auth', 'logout']);
        console.log(chalk.green('Successfully logged out from GitHub!'));
      } catch (error) {
        console.error(chalk.red(`Failed to log out: ${error}`));
        process.exit(1);
      }
    } else {
      program.commands.find(cmd => cmd.name() === 'auth')?.help();
    }
  });

// Create PR command
program
  .command('pr-create')
  .description('Create a pull request')
  .option('-t, --title <title>', 'Pull request title')
  .option('-b, --body <body>', 'Pull request body')
  .option('-B, --base <branch>', 'Base branch name')
  .option('-d, --draft', 'Create draft pull request', false)
  .option('-f, --fill', 'Use commit info for title/body', false)
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    console.log(chalk.blue('Creating pull request...'));
    
    const args = ['pr', 'create'];
    
    if (options.title) {
      args.push('--title', options.title);
    }
    
    if (options.body) {
      args.push('--body', options.body);
    }
    
    if (options.base) {
      args.push('--base', options.base);
    }
    
    if (options.draft) {
      args.push('--draft');
    }
    
    if (options.fill) {
      args.push('--fill');
    }
    
    try {
      await runGitHubCommand(args);
      console.log(chalk.green('Pull request created successfully!'));
    } catch (error) {
      console.error(chalk.red(`Failed to create pull request: ${error}`));
      process.exit(1);
    }
  });

// List PR command
program
  .command('pr-list')
  .description('List and filter pull requests')
  .option('-s, --state <state>', 'Filter by state: open, closed, merged, all', 'open')
  .option('-l, --limit <number>', 'Maximum number of items to fetch', '30')
  .option('-a, --assignee <login>', 'Filter by assignee')
  .option('-A, --author <login>', 'Filter by author')
  .option('-B, --base <branch>', 'Filter by base branch')
  .option('-w, --web', 'Open list in the browser', false)
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    console.log(chalk.blue('Listing pull requests...'));
    
    const args = ['pr', 'list'];
    
    args.push('--state', options.state);
    args.push('--limit', options.limit);
    
    if (options.assignee) {
      args.push('--assignee', options.assignee);
    }
    
    if (options.author) {
      args.push('--author', options.author);
    }
    
    if (options.base) {
      args.push('--base', options.base);
    }
    
    if (options.web) {
      args.push('--web');
    }
    
    try {
      await runGitHubCommand(args);
    } catch (error) {
      console.error(chalk.red(`Failed to list pull requests: ${error}`));
      process.exit(1);
    }
  });

// View PR command
program
  .command('pr-view')
  .description('View pull request details')
  .argument('[number]', 'PR number or URL, if omitted the PR from the current branch is displayed')
  .option('-w, --web', 'Open in web browser', false)
  .action(async (number, options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    console.log(chalk.blue(`Viewing pull request${number ? ` #${number}` : ' from current branch'}...`));
    
    const args = ['pr', 'view'];
    
    if (number) {
      args.push(number);
    }
    
    if (options.web) {
      args.push('--web');
    }
    
    try {
      await runGitHubCommand(args);
    } catch (error) {
      console.error(chalk.red(`Failed to view pull request: ${error}`));
      process.exit(1);
    }
  });

// Create issue command
program
  .command('issue-create')
  .description('Create a new issue')
  .option('-t, --title <title>', 'Issue title')
  .option('-b, --body <body>', 'Issue body')
  .option('-a, --assignee <login>', 'Assign people by their login')
  .option('-l, --label <name>', 'Add labels by name', (val, acc: string[] = []) => [...acc, val], [])
  .option('-p, --project <name>', 'Add issue to project')
  .option('-m, --milestone <name>', 'Add issue to milestone')
  .option('-w, --web', 'Open new issue in the web browser', false)
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    console.log(chalk.blue('Creating issue...'));
    
    const args = ['issue', 'create'];
    
    if (options.title) {
      args.push('--title', options.title);
    }
    
    if (options.body) {
      args.push('--body', options.body);
    }
    
    if (options.assignee) {
      args.push('--assignee', options.assignee);
    }
    
    if (options.label && options.label.length > 0) {
      options.label.forEach((label: string) => {
        args.push('--label', label);
      });
    }
    
    if (options.project) {
      args.push('--project', options.project);
    }
    
    if (options.milestone) {
      args.push('--milestone', options.milestone);
    }
    
    if (options.web) {
      args.push('--web');
    }
    
    try {
      await runGitHubCommand(args);
      console.log(chalk.green('Issue created successfully!'));
    } catch (error) {
      console.error(chalk.red(`Failed to create issue: ${error}`));
      process.exit(1);
    }
  });

// List issues command
program
  .command('issue-list')
  .description('List and filter issues')
  .option('-s, --state <state>', 'Filter by state: open, closed, all', 'open')
  .option('-l, --limit <number>', 'Maximum number of issues to fetch', '30')
  .option('-a, --assignee <login>', 'Filter by assignee')
  .option('-A, --author <login>', 'Filter by author')
  .option('-L, --label <name>', 'Filter by label', (val, acc: string[] = []) => [...acc, val], [])
  .option('-m, --milestone <name>', 'Filter by milestone')
  .option('-w, --web', 'Open list in the browser', false)
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    console.log(chalk.blue('Listing issues...'));
    
    const args = ['issue', 'list'];
    
    args.push('--state', options.state);
    args.push('--limit', options.limit);
    
    if (options.assignee) {
      args.push('--assignee', options.assignee);
    }
    
    if (options.author) {
      args.push('--author', options.author);
    }
    
    if (options.label && options.label.length > 0) {
      options.label.forEach((label: string) => {
        args.push('--label', label);
      });
    }
    
    if (options.milestone) {
      args.push('--milestone', options.milestone);
    }
    
    if (options.web) {
      args.push('--web');
    }
    
    try {
      await runGitHubCommand(args);
    } catch (error) {
      console.error(chalk.red(`Failed to list issues: ${error}`));
      process.exit(1);
    }
  });

// Release command
program
  .command('release-create')
  .description('Create a new release')
  .argument('<tag>', 'Tag name for the release')
  .option('-t, --title <title>', 'Release title')
  .option('-n, --notes <text>', 'Release notes')
  .option('-F, --notes-file <file>', 'Read release notes from file')
  .option('-d, --draft', 'Save release as draft instead of publishing', false)
  .option('-p, --prerelease', 'Mark release as prerelease', false)
  .option('-g, --generate-notes', 'Automatically generate release notes', false)
  .action(async (tag, options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    console.log(chalk.blue(`Creating release with tag ${tag}...`));
    
    const args = ['release', 'create', tag];
    
    if (options.title) {
      args.push('--title', options.title);
    }
    
    if (options.notes) {
      args.push('--notes', options.notes);
    }
    
    if (options.notesFile) {
      args.push('--notes-file', options.notesFile);
    }
    
    if (options.draft) {
      args.push('--draft');
    }
    
    if (options.prerelease) {
      args.push('--prerelease');
    }
    
    if (options.generateNotes) {
      args.push('--generate-notes');
    }
    
    try {
      await runGitHubCommand(args);
      console.log(chalk.green('Release created successfully!'));
    } catch (error) {
      console.error(chalk.red(`Failed to create release: ${error}`));
      process.exit(1);
    }
  });

// List releases command
program
  .command('release-list')
  .description('List releases in a repository')
  .option('-l, --limit <number>', 'Maximum number of releases to fetch', '30')
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    console.log(chalk.blue('Listing releases...'));
    
    const args = ['release', 'list'];
    args.push('--limit', options.limit);
    
    try {
      await runGitHubCommand(args);
    } catch (error) {
      console.error(chalk.red(`Failed to list releases: ${error}`));
      process.exit(1);
    }
  });

// Repository commands
program
  .command('repo')
  .description('Manage repositories')
  .option('-c, --create <name>', 'Create a new repository')
  .option('-d, --description <text>', 'Repository description')
  .option('-h, --homepage <url>', 'Repository homepage URL')
  .option('-p, --private', 'Make the repository private', false)
  .option('-t, --team <name>', 'The name of the organization team to grant access to')
  .option('-v, --view <owner/name>', 'View repository details')
  .option('-w, --web', 'Open in web browser', false)
  .option('-l, --list', 'List your repositories', false)
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    if (options.create) {
      console.log(chalk.blue(`Creating repository: ${options.create}...`));
      
      const args = ['repo', 'create', options.create];
      
      if (options.description) {
        args.push('--description', options.description);
      }
      
      if (options.homepage) {
        args.push('--homepage', options.homepage);
      }
      
      if (options.private) {
        args.push('--private');
      } else {
        args.push('--public');
      }
      
      if (options.team) {
        args.push('--team', options.team);
      }
      
      try {
        await runGitHubCommand(args);
        console.log(chalk.green('Repository created successfully!'));
      } catch (error) {
        console.error(chalk.red(`Failed to create repository: ${error}`));
        process.exit(1);
      }
    } else if (options.view) {
      console.log(chalk.blue(`Viewing repository: ${options.view}...`));
      
      const args = ['repo', 'view', options.view];
      
      if (options.web) {
        args.push('--web');
      }
      
      try {
        await runGitHubCommand(args);
      } catch (error) {
        console.error(chalk.red(`Failed to view repository: ${error}`));
        process.exit(1);
      }
    } else if (options.list) {
      console.log(chalk.blue('Listing repositories...'));
      
      try {
        await runGitHubCommand(['repo', 'list']);
      } catch (error) {
        console.error(chalk.red(`Failed to list repositories: ${error}`));
        process.exit(1);
      }
    } else {
      program.commands.find(cmd => cmd.name() === 'repo')?.help();
    }
  });

// Workflow commands
program
  .command('workflow')
  .description('Manage GitHub Actions workflows')
  .option('-l, --list', 'List workflows', false)
  .option('-r, --run <workflow>', 'Run a workflow by name or ID')
  .option('-v, --view <workflow>', 'View a specific workflow')
  .option('-e, --enable <workflow>', 'Enable a workflow by name or ID')
  .option('-d, --disable <workflow>', 'Disable a workflow by name or ID')
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }
    
    if (options.list) {
      console.log(chalk.blue('Listing workflows...'));
      
      try {
        await runGitHubCommand(['workflow', 'list']);
      } catch (error) {
        console.error(chalk.red(`Failed to list workflows: ${error}`));
        process.exit(1);
      }
    } else if (options.run) {
      console.log(chalk.blue(`Running workflow: ${options.run}...`));
      
      try {
        await runGitHubCommand(['workflow', 'run', options.run]);
        console.log(chalk.green('Workflow run initiated successfully!'));
      } catch (error) {
        console.error(chalk.red(`Failed to run workflow: ${error}`));
        process.exit(1);
      }
    } else if (options.view) {
      console.log(chalk.blue(`Viewing workflow: ${options.view}...`));
      
      try {
        await runGitHubCommand(['workflow', 'view', options.view]);
      } catch (error) {
        console.error(chalk.red(`Failed to view workflow: ${error}`));
        process.exit(1);
      }
    } else if (options.enable) {
      console.log(chalk.blue(`Enabling workflow: ${options.enable}...`));
      
      try {
        await runGitHubCommand(['workflow', 'enable', options.enable]);
        console.log(chalk.green('Workflow enabled successfully!'));
      } catch (error) {
        console.error(chalk.red(`Failed to enable workflow: ${error}`));
        process.exit(1);
      }
    } else if (options.disable) {
      console.log(chalk.blue(`Disabling workflow: ${options.disable}...`));
      
      try {
        await runGitHubCommand(['workflow', 'disable', options.disable]);
        console.log(chalk.green('Workflow disabled successfully!'));
      } catch (error) {
        console.error(chalk.red(`Failed to disable workflow: ${error}`));
        process.exit(1);
      }
    } else {
      program.commands.find(cmd => cmd.name() === 'workflow')?.help();
    }
  });

// Task management command
program
  .command('tasks')
  .description('List and manage tasks from GitHub Projects and Issues')
  .option('-p, --project <id>', 'Specify project ID or number to list tasks from')
  .option('-r, --repository <owner/repo>', 'Specify repository in owner/repo format (default: current repository)')
  .option('-s, --status <status>', 'Filter by status (open, closed, all)', 'open')
  .option('-l, --label <name>', 'Filter by label', (val, acc: string[] = []) => [...acc, val], [])
  .option('-a, --assignee <login>', 'Filter by assignee')
  .option('-L, --limit <number>', 'Maximum number of tasks to fetch', '30')
  .option('-f, --format <format>', 'Output format: table, json, or simple', 'table')
  .option('-w, --web', 'Open tasks in the web browser', false)
  .action(async (options) => {
    if (!checkGitHubCLI() && !installGitHubCLI()) {
      return;
    }

    console.log(chalk.blue('Fetching tasks...'));
    
    try {
      // Check if user is authenticated
      try {
        const authCheckProcess = execSync('gh auth status', { stdio: 'pipe' });
        console.log(chalk.green('✓ Authenticated with GitHub'));
        
        // Continue with authenticated gh commands
        // If a project ID is specified, use project item-list
        if (options.project) {
          const args = ['project', 'item-list', options.project];
          
          if (options.limit) {
            args.push('--limit', options.limit);
          }

          if (options.web) {
            args.push('--web');
          }

          if (options.format === 'json') {
            args.push('--json', 'title,body,status,updatedAt,url');
          }

          console.log(chalk.yellow('Fetching tasks from project...'));
          await runGitHubCommand(args);
        } 
        // Otherwise, list issues which can be considered tasks
        else {
          const args = ['issue', 'list'];
          
          if (options.repository) {
            args.push('--repo', options.repository);
          }

          args.push('--state', options.status);
          args.push('--limit', options.limit);
          
          if (options.assignee) {
            args.push('--assignee', options.assignee);
          }
          
          if (options.label && options.label.length > 0) {
            options.label.forEach((label: string) => {
              args.push('--label', label);
            });
          }
          
          if (options.web) {
            args.push('--web');
          }

          if (options.format === 'json') {
            args.push('--json', 'title,number,state,updatedAt,url,labels,assignees');
          }

          console.log(chalk.yellow('Fetching issues as tasks...'));
          await runGitHubCommand(args);
        }
      } catch (authError) {
        console.log(chalk.yellow('Not authenticated with GitHub.'));
        console.log(chalk.yellow('To authenticate, run: npm run github -- auth --login'));
        
        if (!options.repository) {
          console.error(chalk.red('When not authenticated, you must specify a repository with -r/--repository'));
          process.exit(1);
        }
        
        // For public repositories, use GitHub REST API directly with fetch
        if (options.repository) {
          console.log(chalk.yellow('Attempting to fetch public repository issues without authentication...'));
          
          try {
            // Build a query string for the GitHub API request
            let apiEndpoint = `https://api.github.com/repos/${options.repository}/issues?state=${options.status}&per_page=${options.limit}`;
            
            if (options.assignee) {
              apiEndpoint += `&assignee=${options.assignee}`;
            }
            
            if (options.label && options.label.length > 0) {
              apiEndpoint += `&labels=${options.label.join(',')}`;
            }
            
            // Use fetch API to get issues
            const response = await fetch(apiEndpoint, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-CLI-Tool'
              }
            });
            
            if (!response.ok) {
              throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
            }
            
            const issues = await response.json();
            
            // Format can be 'json' or other
            if (options.format === 'json') {
              console.log(JSON.stringify(issues, null, 2));
            } else {
              if (issues.length === 0) {
                console.log(chalk.yellow('No issues found matching your criteria.'));
              } else {
                console.log(chalk.green(`Found ${issues.length} issues:`));
                
                // Format as a simple table
                issues.forEach((issue: any) => {
                  const labels = issue.labels.map((l: any) => typeof l === 'object' ? l.name : l).join(', ');
                  const assignees = issue.assignees.map((a: any) => a.login).join(', ');
                  
                  console.log(
                    chalk.blue(`#${issue.number}`) + 
                    ' ' + 
                    chalk.white(issue.title) +
                    ' ' + 
                    (labels ? chalk.yellow(`[${labels}]`) : '') +
                    ' ' + 
                    (assignees ? chalk.green(`@${assignees}`) : '')
                  );
                });
              }
            }
          } catch (apiError) {
            console.error(chalk.red(`Failed to fetch issues: ${apiError}`));
            console.log(chalk.yellow('This may be due to rate limiting or if the repository is private.'));
            console.log(chalk.yellow('Please authenticate with: npm run github -- auth --login'));
            process.exit(1);
          }
        }
      }
      
      console.log(chalk.green('Tasks fetched successfully!'));
    } catch (error) {
      console.error(chalk.red(`Failed to fetch tasks: ${error}`));
      process.exit(1);
    }
  });

program.version('1.0.0');
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
} 