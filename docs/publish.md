git status --short

npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run build

git add .
git commit -m "Publish latest webshop updates"
git push origin main

npx prisma migrate deploy

vercel deploy --prod

git status --short