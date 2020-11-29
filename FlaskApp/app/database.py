from azure.cosmos import exceptions, CosmosClient, PartitionKey
from app.config import Config

class Database:
    endpoint = Config.cosmosURL
    key = Config.cosmosKey
    client = CosmosClient(endpoint, key)
    database_name = Config.cosmosDB
    database = client.get_database_client(database_name)

class Client(Database):
    
    def __init__(self, containerName):
        self._name = containerName
        self._container = self.database.get_container_client(self._name)
        
    def _get_container(self):
        return self._container
    
    def _set_container(self):
        self._container = self.database.get_container_client(self._name)
    
    # Allows class.container to return the container
    container = property(_get_container, _set_container)
