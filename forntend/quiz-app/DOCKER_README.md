Quick Docker notes

Build the image (from project root where `Dockerfile` is):

```bash
docker build -t quiz-app:latest .
```

Run locally:

```bash
docker run --rm -p 8080:80 quiz-app:latest
```

Runtime env override (no rebuild):
- Replace `public/env.js` on the server image or mount a file at runtime:

```bash
docker run --rm -p 8080:80 -v $(pwd)/deploy/env.js:/usr/share/nginx/html/env.js quiz-app:latest
```

Example `env.js` content to point to production API:

```js
window.__env = {
  API_BASE: 'https://api.example.com'
};
```

Notes:
- This Dockerfile serves the static client build. If you need SSR (server-side rendering), I can add an alternate Dockerfile that runs the Node server from `dist/quiz-app/server`.
- Make sure the `ng build` output path (`dist/quiz-app`) matches your project — adjust the Dockerfile if your build outputs elsewhere.
