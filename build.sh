cd webcomponent && echo -e "a\n" | pnpm approve-builds && pnpm i && pnpm run build
cd ../admin && echo -e "a\n" | pnpm approve-builds && pnpm i && pnpm run build
cd ..
cp webcomponent/dist ./admin/.output/public/webcomponent
cp ./admin/.output ./.output
