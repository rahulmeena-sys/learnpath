---
name: learnpath-book-content
description: Generate LearnPath book, framework, or course content packages from book notes, chapter notes, or a title. Use when creating mobile-friendly summaries, lessons, tasks, reflections, quizzes, and JSON for the LearnPath Admin ingest screen.
---

# LearnPath Book Content

Create concise, practical learning content for the LearnPath app. Output valid JSON only when asked to generate a package for ingestion.

## Workflow

1. Identify the source: book title, author, chapter notes, excerpts, or Rahul's product notes.
2. Extract 4-6 core ideas that can become short lessons.
3. Turn each idea into one lesson with one practical takeaway.
4. Add a challenge or reflection to every lesson.
5. Add a simple quiz when the lesson has a testable idea.
6. Return a JSON package that matches the schema below.

## Voice

- Clear, direct, and practical.
- Mobile-friendly: short paragraphs, no dense essays.
- Motivating without hype.
- Beginner-friendly unless Rahul asks for advanced depth.
- Respect copyright: do not reproduce long passages from books.

## Lesson Rules

- One lesson equals one key idea.
- Target 3-7 minutes per lesson.
- Use 3-5 sections per lesson.
- Prefer section types: `text`, `insight`, `challenge`, `reflection`, `quote`.
- Use quotes sparingly and keep them short.
- Every lesson must have `key_idea`, `sections`, and `summary`.
- Every quiz needs 4 options and a zero-based `correct` index.

## JSON Schema

Return one JSON object:

```json
{
  "book": {
    "type": "book",
    "title": "Book Title",
    "author": "Author Name",
    "cover_color": "#6366f1",
    "accent_color": "#818cf8",
    "description": "Short app-facing description.",
    "difficulty": "beginner",
    "estimated_minutes": 25,
    "xp_reward": 200,
    "goals": ["productivity", "mindset"],
    "is_premium": false,
    "status": "published"
  },
  "lessons": [
    {
      "title": "Lesson Title",
      "order_index": 1,
      "type": "text",
      "estimated_minutes": 5,
      "xp_reward": 30,
      "body": {
        "key_idea": "One sentence key idea.",
        "sections": [
          { "type": "text", "content": "Short explanation." },
          { "type": "insight", "content": "Practical insight." },
          { "type": "challenge", "content": "Small action the user can take today." }
        ],
        "quiz": {
          "question": "Simple question?",
          "options": ["A", "B", "C", "D"],
          "correct": 1
        },
        "summary": "One sentence recap."
      }
    }
  ]
}
```

## Validation Checklist

Before final output:

- JSON parses without comments or trailing commas.
- `book.title`, `book.author`, and `book.description` are present.
- `book.difficulty` is `beginner`, `intermediate`, or `advanced`.
- `book.goals` is an array of lowercase tags.
- `lessons` has at least 4 items.
- Lesson `order_index` values start at 1 and increase by 1.
- Every section has a valid `type`.
- No lesson depends on another app feature that does not exist yet.
