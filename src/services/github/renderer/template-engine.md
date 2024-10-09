# Template Engine

A simple template engine designed for GitHub webhook.

it looks like this:

```ts
render('hello {{name}}', { name: 'henry' });
```

but it can let you write GitHub markdown dialect more easy and elegant.

it can render `sender`/`repository`/`issue`/`release`... url, such as:

```ts
render('hello {{issue|link}}', eventPayload);
```

it will renderer as:

```md
hello [issueName](https://issue.internal)
```
