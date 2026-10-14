import json
import os
from typing import List, Optional
from ..schemas.debug import HistorySessionModel

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "..", "..", ".data", "history.json")

class HistoryService:
    def __init__(self):
        self._ensure_file()

    def _ensure_file(self):
        folder = os.path.dirname(HISTORY_FILE)
        if not os.path.exists(folder):
            os.makedirs(folder, exist_ok=True)
        if not os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump([], f)

    def get_all(self) -> List[HistorySessionModel]:
        self._ensure_file()
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [HistorySessionModel(**item) for item in data]
        except Exception:
            return []

    def get_by_id(self, session_id: str) -> Optional[HistorySessionModel]:
        items = self.get_all()
        for item in items:
            if item.id == session_id:
                return item
        return None

    def add(self, session: HistorySessionModel) -> HistorySessionModel:
        items = self.get_all()
        items.insert(0, session)
        if len(items) > 100:
            items = items[:100]
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump([item.model_dump() for item in items], f, indent=2)
        return session

    def delete(self, session_id: str) -> bool:
        items = self.get_all()
        filtered = [item for item in items if item.id != session_id]
        if len(filtered) < len(items):
            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump([item.model_dump() for item in filtered], f, indent=2)
            return True
        return False

    def clear(self) -> None:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

history_service = HistoryService()
