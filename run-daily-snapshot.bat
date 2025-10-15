@echo off
cd /d "C:\Users\ashiv\Documents\EPICS_Github\hope-restored"

:: Ensure Node and tsx are available in PATH
call npx tsx admin\prisma\dailyInventorySnapshot.ts

:: Optional: Keep the window open to see output (helpful for debugging)
pause