#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to run a command with status
run_command() {
    description=$1
    command=$2
    
    print_color "$BLUE" "\n→ ${description}..."
    
    if eval "$command"; then
        print_color "$GREEN" "✓ ${description} completed"
        return 0
    else
        print_color "$RED" "✗ ${description} failed"
        return 1
    fi
}

# Main script
print_color "$CYAN" "${BOLD}🚀 Database Reset and Seed Script${NC}"
print_color "$GRAY" "\nThis script will:"
print_color "$GRAY" "1. Reset the Supabase database"
print_color "$GRAY" "2. Seed test users"
print_color "$GRAY" "3. Seed brand from brand-info.ts"
print_color "$GRAY" "4. Seed content types"
print_color "$GRAY" "5. Seed SEO project"

# Check for flags
WITH_BLOG=false
WITH_TRANSLATIONS=false

for arg in "$@"
do
    case $arg in
        --with-blog)
            WITH_BLOG=true
            print_color "$GRAY" "5. Seed blog posts (--with-blog flag detected)"
            ;;
        --with-translations)
            WITH_TRANSLATIONS=true
            print_color "$GRAY" "6. Import translations (--with-translations flag detected)"
            ;;
        --help)
            print_color "$CYAN" "\nUsage: $0 [options]"
            print_color "$GRAY" "\nOptions:"
            print_color "$GRAY" "  --with-blog         Also seed blog posts"
            print_color "$GRAY" "  --with-translations Also import translations"
            print_color "$GRAY" "  --help             Show this help message"
            exit 0
            ;;
    esac
done

print_color "$YELLOW" "\n⚠️  This will DELETE all existing data!"
print_color "$GRAY" "Starting in 3 seconds... (Press Ctrl+C to cancel)"
sleep 3

# Step 1: Reset database
if ! run_command "Resetting database" "supabase db reset"; then
    print_color "$RED" "\n❌ Database reset failed. Aborting."
    exit 1
fi

# Step 2: Seed users
if ! run_command "Seeding users" "npx tsx scripts/seed-users.ts --env dev"; then
    print_color "$YELLOW" "\n⚠️  User seeding failed, but continuing..."
fi

# Step 3: Seed brand
if ! run_command "Seeding brand" "npx tsx scripts/seed-brand.ts"; then
    print_color "$YELLOW" "\n⚠️  Brand seeding failed, but continuing..."
fi

# Step 4: Seed content types
if ! run_command "Seeding content types" "npx tsx scripts/seed-content-types.ts"; then
    print_color "$YELLOW" "\n⚠️  Content types seeding failed, but continuing..."
fi

# Step 5: Seed SEO project
if ! run_command "Seeding SEO project" "npx tsx scripts/seed-seo-project.ts"; then
    print_color "$YELLOW" "\n⚠️  SEO project seeding failed, but continuing..."
fi

# Step 6: Optionally seed blog
if [ "$WITH_BLOG" = true ]; then
    if ! run_command "Seeding blog posts" "npx tsx scripts/seed-blog.ts --env dev"; then
        print_color "$YELLOW" "\n⚠️  Blog seeding failed, but continuing..."
    fi
fi

# Step 7: Optionally import translations
if [ "$WITH_TRANSLATIONS" = true ]; then
    if ! run_command "Importing translations" "npx tsx scripts/import-translations.ts --env dev"; then
        print_color "$YELLOW" "\n⚠️  Translation import failed, but continuing..."
    fi
fi

# Summary
print_color "$GREEN" "\n✨ Database setup complete!"
print_color "$CYAN" "\nSummary:"
print_color "$GRAY" "- Database has been reset"
print_color "$GRAY" "- Test users have been created"
print_color "$GRAY" "- Brand has been configured"
print_color "$GRAY" "- Content types have been configured"
print_color "$GRAY" "- SEO project has been created"

if [ "$WITH_BLOG" = true ]; then
    print_color "$GRAY" "- Blog posts have been seeded"
fi

if [ "$WITH_TRANSLATIONS" = true ]; then
    print_color "$GRAY" "- Translations have been imported"
fi

print_color "$YELLOW" "\n📝 Note: To create an admin user, run:"
print_color "$GRAY" "npm run make-admin <email>"

print_color "$CYAN" "\n🎉 You can now start the development server:"
print_color "$GRAY" "npm run dev\n"