#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

async function runCommand(command: string, description: string) {
  console.log(chalk.blue(`\n→ ${description}...`));
  
  try {
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(chalk.gray(stdout));
    }
    
    if (stderr && !stderr.includes('WARN:')) {
      console.error(chalk.yellow(stderr));
    }
    
    console.log(chalk.green(`✓ ${description} completed`));
    return true;
  } catch (error: any) {
    console.error(chalk.red(`✗ ${description} failed:`));
    console.error(chalk.red(error.message));
    if (error.stdout) console.log(chalk.gray(error.stdout));
    if (error.stderr) console.error(chalk.yellow(error.stderr));
    return false;
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n🚀 Database Reset and Seed Script\n'));
  console.log(chalk.gray('This script will:'));
  console.log(chalk.gray('1. Reset the Supabase database'));
  console.log(chalk.gray('2. Seed test users'));
  console.log(chalk.gray('3. Seed content types'));
  console.log(chalk.gray('4. (Optional) Seed blog posts'));
  
  // Check if we should include blog seeding
  const args = process.argv.slice(2);
  const includeBlog = args.includes('--with-blog');
  const importTranslations = args.includes('--with-translations');
  
  if (includeBlog) {
    console.log(chalk.gray('5. Seed blog posts (--with-blog flag detected)'));
  }
  
  if (importTranslations) {
    console.log(chalk.gray('6. Import translations (--with-translations flag detected)'));
  }
  
  console.log(chalk.yellow('\n⚠️  This will DELETE all existing data!\n'));
  
  // Add a delay to allow user to cancel
  console.log(chalk.gray('Starting in 3 seconds... (Press Ctrl+C to cancel)'));
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  let success = true;
  
  // Step 1: Reset database
  success = await runCommand(
    'supabase db reset',
    'Resetting database'
  );
  
  if (!success) {
    console.error(chalk.red('\n❌ Database reset failed. Aborting.'));
    process.exit(1);
  }
  
  // Step 2: Seed users
  success = await runCommand(
    'npx tsx scripts/seed-users.ts --env dev',
    'Seeding users'
  );
  
  if (!success) {
    console.error(chalk.yellow('\n⚠️  User seeding failed, but continuing...'));
  }
  
  // Step 3: Seed content types
  success = await runCommand(
    'npx tsx scripts/seed-content-types.ts',
    'Seeding content types'
  );
  
  if (!success) {
    console.error(chalk.yellow('\n⚠️  Content types seeding failed, but continuing...'));
  }
  
  // Step 4: Optionally seed blog
  if (includeBlog) {
    success = await runCommand(
      'npx tsx scripts/seed-blog.ts --env dev',
      'Seeding blog posts'
    );
    
    if (!success) {
      console.error(chalk.yellow('\n⚠️  Blog seeding failed, but continuing...'));
    }
  }
  
  // Step 5: Optionally import translations
  if (importTranslations) {
    success = await runCommand(
      'npx tsx scripts/import-translations.ts --env dev',
      'Importing translations'
    );
    
    if (!success) {
      console.error(chalk.yellow('\n⚠️  Translation import failed, but continuing...'));
    }
  }
  
  console.log(chalk.bold.green('\n✨ Database setup complete!\n'));
  console.log(chalk.cyan('Summary:'));
  console.log(chalk.gray('- Database has been reset'));
  console.log(chalk.gray('- Test users have been created'));
  console.log(chalk.gray('- Content types have been configured'));
  
  if (includeBlog) {
    console.log(chalk.gray('- Blog posts have been seeded'));
  }
  
  if (importTranslations) {
    console.log(chalk.gray('- Translations have been imported'));
  }
  
  console.log(chalk.yellow('\n📝 Note: To create an admin user, run:'));
  console.log(chalk.gray('npm run make-admin <email>'));
  
  console.log(chalk.cyan('\n🎉 You can now start the development server:'));
  console.log(chalk.gray('npm run dev\n'));
}

// Run the script
main().catch(error => {
  console.error(chalk.red('\n❌ Unexpected error:'), error);
  process.exit(1);
});