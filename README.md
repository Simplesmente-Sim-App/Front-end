# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv create --template minimal --types ts --add prettier eslint vitest="usages:component,unit" playwright sveltekit-adapter="adapter:vercel" mdsvex paraglide="languageTags:en, es, pt-br+demo:no" storybook --install pnpm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Lighthouse

Para avaliar a página com os arquivos otimizados de produção:

```sh
pnpm preview:production
```

Abra `http://127.0.0.1:4173/` em um perfil do Chrome sem extensões e execute o Lighthouse.
Esse comando faz um novo build antes de iniciar o preview. O servidor `pnpm dev`
na porta 5173 inclui ferramentas de desenvolvimento, módulos sem minificação e
atualização de CSS em tempo real, o que altera as medições de desempenho e layout.

Os cabeçalhos de cache definidos em `vercel.json` são aplicados pela Vercel;
o preview local do Vite não reproduz esses cabeçalhos.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
