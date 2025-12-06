cd webcomponent && pnpm install && echo -e "a\n" | pnpm approve-builds && pnpm run build
cd ../admin && pnpm install && echo -e "a\n" | pnpm approve-builds && pnpm run build
cd ..
cp webcomponent/dist ./admin/.output/public/webcomponent
cp ./admin/.output ./.output
