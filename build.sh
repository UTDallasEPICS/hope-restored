pnpm run -r build
rm -rf ./.output
rm -rf ./admin/.output/public/webcomponent
cp -r webcomponent/dist ./admin/.output/public/webcomponent
cp -r ./admin/.output ./.output
