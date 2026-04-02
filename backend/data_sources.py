from abc import ABC, abstractmethod
from typing import Any, Dict
import requests
from bs4 import BeautifulSoup

class DataSourceInterface(ABC):
    """Base interface for all data sources"""

    @abstractmethod
    def fetch(self, **kwargs) -> str:
        """
        Fetch data from the source.

        Args:
            **kwargs: Parameters specified in the template's dataSource.parameters

        Returns:
            str: The fetched content as a string
        """
        pass

# Example data source implementations
class ResearchDataSource(DataSourceInterface):
    def fetch(self, topic: str = "", **kwargs) -> str:
        """Fetch research data for a topic"""
        # TODO: Implement actual data fetching
        return f"Research data for topic: {topic}"

class CitationsDataSource(DataSourceInterface):
    def fetch(self, limit: int = 50, **kwargs) -> str:
        """Fetch citations"""
        # TODO: Implement actual citation fetching
        return f"Fetched {limit} citations"

class WebpageDataSource(DataSourceInterface):
    def fetch(self, url: str = "", **kwargs) -> str:
        """
        Fetch and parse HTML content from a webpage.

        Args:
            url: The URL to fetch

        Returns:
            str: Extracted text content from the webpage
        """
        if not url:
            raise ValueError("URL parameter is required")

        try:
            # Fetch the webpage
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            # Parse HTML and extract text
            soup = BeautifulSoup(response.content, 'html.parser')

            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            # Get text
            text = soup.get_text()

            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)

            return text
        except requests.RequestException as e:
            raise ValueError(f"Failed to fetch URL '{url}': {str(e)}")

# Registry of available data sources
# Maps pythonInterface strings like "data_sources.research::fetch_data" to actual implementations
DATA_SOURCE_REGISTRY: Dict[str, DataSourceInterface] = {
    "data_sources.research::fetch_data": ResearchDataSource(),
    "data_sources.citations::fetch_citations": CitationsDataSource(),
    "data_sources.web::fetch_html_content": WebpageDataSource(),
}

def get_data_source(interface: str) -> DataSourceInterface:
    """Get a data source by interface string"""
    if interface not in DATA_SOURCE_REGISTRY:
        raise ValueError(f"Data source not found: {interface}")
    return DATA_SOURCE_REGISTRY[interface]

def load_data(interface: str, parameters: Dict[str, Any]) -> str:
    """Load data from a data source"""
    source = get_data_source(interface)
    return source.fetch(**parameters)
