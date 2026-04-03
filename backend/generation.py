from config import settings
from typing import AsyncGenerator, Union
from openai import AsyncOpenAI, OpenAI
from prompts_loader import load_prompt

async def generate_chapter(prompt: Union[str, dict], context: str) -> AsyncGenerator[str, None]:
    """
    Generate a chapter using the configured LLM provider.

    Args:
        prompt: The user's prompt (can be file reference, inline text, or dict structure)
        context: The content from data sources

    Yields:
        str: Streamed chunks of generated content
    """
    # Load prompt from file or use inline
    full_prompt = load_prompt(prompt)

    if settings.LLM_PROVIDER == "openrouter":
        async for chunk in _generate_openrouter(full_prompt, context):
            yield chunk
    elif settings.LLM_PROVIDER == "openai":
        async for chunk in _generate_openai(full_prompt, context):
            yield chunk
    else:
        raise ValueError(f"Unknown LLM provider: {settings.LLM_PROVIDER}")

async def _generate_openrouter(prompt: str, context: str) -> AsyncGenerator[str, None]:
    """Generate using OpenRouter API with OpenAI SDK"""
    client = AsyncOpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1"
    )

    system_message = "You are a helpful assistant writing chapters for documents. Answer in the same language as the original text."
    user_message = f"{prompt}\n\nContext:\n{context}"

    stream = await client.chat.completions.create(
        model=settings.LLM_MODEL,
        max_tokens=4096,
        stream=True,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ]
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta

async def _generate_openai(prompt: str, context: str) -> AsyncGenerator[str, None]:
    """Generate using OpenAI API"""
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    system_message = "You are a helpful assistant writing chapters for documents. Answer in the same language as the original text."
    user_message = f"{prompt}\n\nContext:\n{context}"

    stream = await client.chat.completions.create(
        model=settings.LLM_MODEL,
        max_tokens=4096,
        stream=True,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ]
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
