# Prompts

This directory contains markdown prompt files used by templates to guide LLM generation.

## Structure

Prompts are organized by template:
- `blog-post/` — Prompts for the Blog Post template
- `product-guide/` — Prompts for the Product Guide template
- Add more directories for your custom templates

## Creating a Custom Prompt

A good prompt file has this structure:

```markdown
# [Template Name]: [Chapter Name]

**Role:** What role/expertise should the LLM take on?

**Objective:** What specific task should be accomplished?

**Guidelines:**
- Guideline 1
- Guideline 2
- Guideline 3

**Tone:** How should the content sound?

**Format:** What format should the output be in (e.g., markdown, plain text)?

**Common Mistakes to Avoid:**
- Mistake 1
- Mistake 2
```

## Best Practices

1. **Be specific** — Vague prompts produce vague output
   - ✗ "Write a good introduction"
   - ✓ "Write an engaging introduction under 200 words that starts with a hook and ends with a transition"

2. **Give context** — Help the LLM understand the purpose
   - Include target audience
   - Mention tone/style preferences
   - Explain what comes before/after this section

3. **Provide examples** — Show what good output looks like
   - Good: "Start with a question like 'Did you know...?'"
   - Bad: "Start with something interesting"

4. **List constraints** — Be clear about length, format, etc.
   - Word count: "Keep under 200 words"
   - Format: "Use markdown with ## subheadings"
   - Structure: "Include 3-5 main sections"

5. **Explain the "why"** — Help the LLM understand importance
   - "This is the opening section—make readers want to continue"
   - "Use simple language because the audience is non-technical"

## Using File References in Templates

In your template JSON, reference the prompt file:

```json
{
  "chapters": [
    {
      "id": "intro",
      "title": "Introduction",
      "prompt": "prompts/my-template/introduction.md"
    }
  ]
}
```

The path is relative to the `backend/` directory.

## Backward Compatibility

You can still use inline prompts (strings) in templates—they work alongside file references:

```json
{
  "prompt": "Write a quick summary"
}
```

The system detects if it's a file reference (ends with `.md`) or inline text, and handles both.

## Tips for Better Output

1. **Use role-playing** — Start with "You are a..." to set expertise
2. **Be conversational** — Write prompts like you're talking to a colleague
3. **Anticipate problems** — Include "Common Mistakes to Avoid"
4. **Structure visually** — Use markdown formatting, lists, bold text
5. **Test iteratively** — Try different wordings, see what produces better output

## File Naming

- Use lowercase with hyphens: `introduction.md`, `getting-started.md`
- Group related chapters in directories named after the template
- Keep names short but descriptive
