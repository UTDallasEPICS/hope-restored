cd webcomponent && pnpm i && echo -e "a\n" | pnpm approve-builds && pnpm run build
cd ../admin && pnpm i && echo -e "a\n" | pnpm approve-builds && pnpm prisma generate && pnpm run build
cd ..
rm -rf ./.output
rm -rf ./admin/.output/public/webcomponent
cp -r webcomponent/dist ./admin/.output/public/webcomponent
cp -r ./admin/.output ./.output
