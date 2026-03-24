from config import settings
from typing import AsyncGenerator
from openai import AsyncOpenAI, OpenAI

async def generate_chapter(prompt: str, context: str) -> AsyncGenerator[str, None]:
    """
    Generate a chapter using the configured LLM provider.

    Args:
        prompt: The user's prompt for chapter generation
        context: The content from data sources

    Yields:
        str: Streamed chunks of generated content
    """

    if settings.LLM_PROVIDER == "openrouter":
        async for chunk in _generate_openrouter(prompt, context):
            yield chunk
    elif settings.LLM_PROVIDER == "openai":
        async for chunk in _generate_openai(prompt, context):
            yield chunk
    else:
        raise ValueError(f"Unknown LLM provider: {settings.LLM_PROVIDER}")

async def _generate_openrouter(prompt: str, context: str) -> AsyncGenerator[str, None]:
    """Generate using OpenRouter API with OpenAI SDK"""
    client = AsyncOpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1"
    )

    system_message = "You are a helpful assistant writing chapters for documents."
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

    system_message = "You are a helpful assistant writing chapters for documents."
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
