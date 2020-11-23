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
        self.container = self.database.get_container_client(containerName)

    def getContainer(self):
        return self.container
    
