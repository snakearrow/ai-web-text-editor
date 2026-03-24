from abc import ABC, abstractmethod
from typing import Any, Dict

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

# Registry of available data sources
# Maps pythonInterface strings like "data_sources.research::fetch_data" to actual implementations
DATA_SOURCE_REGISTRY: Dict[str, DataSourceInterface] = {
    "data_sources.research::fetch_data": ResearchDataSource(),
    "data_sources.citations::fetch_citations": CitationsDataSource(),
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
