from pathlib import Path
from typing import Union

# Path to prompts directory
PROMPTS_DIR = Path(__file__).parent / "prompts"


def load_prompt(prompt_ref: Union[str, dict]) -> str:
    """
    Load a prompt from a file reference or return inline prompt text.

    Args:
        prompt_ref: Either a string (file path relative to prompts dir, or inline text)
                   or a dict with prompt structure

    Returns:
        str: The full prompt text
    """
    # Handle dict-based prompts (for future structured prompts)
    if isinstance(prompt_ref, dict):
        return _format_dict_prompt(prompt_ref)

    # Handle file references (e.g., "blog-post/introduction.md")
    if prompt_ref.endswith(".md"):
        file_path = PROMPTS_DIR / prompt_ref
        if not file_path.exists():
            raise FileNotFoundError(f"Prompt file not found: {file_path}")
        with open(file_path, "r") as f:
            return f.read()

    # Return as-is if it's an inline prompt
    return prompt_ref


def _format_dict_prompt(prompt_dict: dict) -> str:
    """Format a structured prompt dict into readable text."""
    lines = []

    if "title" in prompt_dict:
        lines.append(f"# {prompt_dict['title']}\n")

    if "role" in prompt_dict:
        lines.append(f"**Role:** {prompt_dict['role']}\n")

    if "objective" in prompt_dict:
        lines.append(f"**Objective:** {prompt_dict['objective']}\n")

    if "guidelines" in prompt_dict:
        lines.append("**Guidelines:**")
        for guideline in prompt_dict["guidelines"]:
            lines.append(f"- {guideline}")
        lines.append("")

    if "format" in prompt_dict:
        lines.append(f"**Format:** {prompt_dict['format']}\n")

    if "context" in prompt_dict:
        lines.append(f"**Context:** {prompt_dict['context']}\n")

    return "\n".join(lines)
