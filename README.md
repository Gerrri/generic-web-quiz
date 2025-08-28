# Angular Quiz (Docker + JSON)

## Voraussetzungen
- Node 20, yarn 1.x
- Docker

## Entwicklung
```bash
yarn
yarn start
# -> http://localhost:4200
```

## Produktion
```bash
docker build -t quiz-web:latest .
docker run --rm -p 8080:80 quiz-web:latest

# Mit eigener questions.json
docker run --rm -p 8080:80   -v $(pwd)/questions.json:/usr/share/nginx/html/assets/questions.json:ro   quiz-web:latest
```

## JSON Schema
```ts
interface Quiz {
  title?: string;
  questions: Array<{
    id: string;
    text: string;
    answers: Array<{
      id: string;
      text: string;
      correct: boolean;
    }>; // 2–4 Elemente, genau 1 korrekt (siehe Validierung)
  }>;
}
```
