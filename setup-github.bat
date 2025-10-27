@echo off
echo ====================================
echo GitHub Integration Setup
echo ====================================
echo.

echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding GitHub remote...
git remote add origin https://github.com/SilverReferencement/simulateur-pppt.git

echo.
echo Step 3: Fetching from remote...
git fetch origin

echo.
echo Step 4: Setting up tracking...
git branch -M main
git branch --set-upstream-to=origin/main main

echo.
echo Step 5: Creating .gitignore...
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo *.log >> .gitignore

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To sync your script.js with GitHub:
echo 1. Make changes to script.js
echo 2. Run update.bat
echo.
echo The script will:
echo - Archive old version to OLD folder
echo - Push new version to GitHub
echo.
pause
