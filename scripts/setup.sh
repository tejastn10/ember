#!/bin/bash

# Setup script for Ember project
# This script creates all necessary directories and ensures proper permissions

set -e

echo "🚀 Setting up Ember project..."

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Create /var/log/nestjs if we have permissions, otherwise use local logs
if [ -w /var/log ] 2>/dev/null; then
    echo "📁 Creating system logs directory..."
    mkdir -p /var/log/nestjs
    chmod 755 /var/log/nestjs
else
    echo "⚠️  Cannot create /var/log/nestjs (no permissions), using local logs directory"
    mkdir -p logs/nestjs
fi

# Create other necessary directories
echo "📁 Creating other directories..."
mkdir -p dist
mkdir -p coverage
mkdir -p node_modules/.cache

# Set proper permissions for log directories
echo "🔧 Setting permissions..."
chmod -R 755 logs 2>/dev/null || true

# Create .gitkeep files to ensure directories are tracked but contents are ignored
echo "📝 Creating .gitkeep files..."
touch logs/.gitkeep
[ -d logs/nestjs ] && touch logs/nestjs/.gitkeep

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Directories created:"
echo "  - logs/ (local logs)"
[ -d /var/log/nestjs ] && echo "  - /var/log/nestjs (system logs)" || echo "  - logs/nestjs/ (fallback for system logs)"
echo "  - dist/ (build output)"
echo "  - coverage/ (test coverage)"
echo ""
echo "🎯 You can now run: npm run dev"