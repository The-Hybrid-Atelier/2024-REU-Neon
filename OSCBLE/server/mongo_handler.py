# mongo_handler.py

import pymongo
from typing import List, Dict
from mongo_config import URI

class MongoHandler:
    def __init__(self, config, uri: str = URI):
        self.client = pymongo.MongoClient(uri)
        self.db = self.client[config["db_name"]]
        self.collection = self.db[config["collection_name"]]

    def insert_documents(self, documents: List[Dict]) -> int:
        """Insert multiple documents into the collection."""
        result = self.collection.insert_many(documents)
        return len(result.inserted_ids)

    def read_all_documents(self) -> List[Dict]:
        """Return all documents in the collection."""
        return list(self.collection.find())

    def count_documents(self) -> int:
        """Return the number of documents in the collection."""
        return self.collection.count_documents({})
