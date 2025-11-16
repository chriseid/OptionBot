import json
import os
from typing import List
from fastapi import HTTPException, status


def read_json_file(file_path: str) -> List[dict]:
    """Read JSON data from file. Returns empty list if file doesn't exist or is invalid."""
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def write_json_file(file_path: str, data: List[dict]) -> None:
    """Write JSON data to file atomically (writes to temp file then renames)."""
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Write to temp file first, then rename (atomic operation)
        temp_file = file_path + '.tmp'
        with open(temp_file, 'w') as f:
            json.dump(data, f, indent=2)
        os.replace(temp_file, file_path)
    except IOError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file {file_path}: {str(e)}"
        )

