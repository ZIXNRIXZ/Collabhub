@echo off
echo Fixing Prisma permission issues...

cd backend

echo Cleaning up Prisma cache...
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma

echo Reinstalling Prisma...
npm uninstall prisma @prisma/client
npm install prisma @prisma/client

echo Generating Prisma client...
npx prisma generate

echo Running database migrations...
npx prisma migrate dev --name init

echo Prisma setup complete!
pause 