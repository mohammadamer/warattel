import json
import os
import sqlite3
from pathlib import Path

from .schemas import AuthCredentials, Goal, RecitationResult


class Repository:
    def __init__(self, database_url: str | None = None) -> None:
        configured_path = database_url or os.getenv('WARATTEL_DB_PATH', 'data/warattel.db')
        self.database_path = Path(configured_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.executescript(
                '''
                CREATE TABLE IF NOT EXISTS goals (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    type TEXT NOT NULL,
                    target TEXT NOT NULL,
                    duration_minutes INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS recitations (
                    id TEXT PRIMARY KEY,
                    passage TEXT NOT NULL,
                    audio_uri TEXT NOT NULL,
                    status TEXT NOT NULL,
                    accuracy INTEGER,
                    confidence TEXT,
                    summary TEXT NOT NULL,
                    issues_json TEXT NOT NULL
                );
                '''
            )

    def create_user(self, user_id: str, credentials: AuthCredentials, password_hash: str) -> None:
        with self._connect() as connection:
            connection.execute(
                'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
                (user_id, credentials.email.lower(), password_hash),
            )

    def get_user(self, email: str) -> tuple[str, str] | None:
        with self._connect() as connection:
            row = connection.execute(
                'SELECT id, password_hash FROM users WHERE email = ?', (email.lower(),)
            ).fetchone()
        return (row['id'], row['password_hash']) if row else None

    def create_goal(self, goal: Goal) -> Goal:
        with self._connect() as connection:
            connection.execute(
                'INSERT INTO goals (id, title, type, target, duration_minutes) VALUES (?, ?, ?, ?, ?)',
                (goal.id, goal.title, goal.type, goal.target, goal.duration_minutes),
            )
        return goal

    def list_goals(self) -> list[Goal]:
        with self._connect() as connection:
            rows = connection.execute('SELECT * FROM goals ORDER BY rowid').fetchall()
        return [Goal(**dict(row)) for row in rows]

    def get_goal(self, goal_id: str) -> Goal | None:
        with self._connect() as connection:
            row = connection.execute('SELECT * FROM goals WHERE id = ?', (goal_id,)).fetchone()
        return Goal(**dict(row)) if row else None

    def create_recitation(self, result: RecitationResult) -> RecitationResult:
        with self._connect() as connection:
            connection.execute(
                '''
                INSERT INTO recitations
                    (id, passage, audio_uri, status, accuracy, confidence, summary, issues_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    result.id,
                    result.passage,
                    result.audio_uri,
                    result.status,
                    result.accuracy,
                    result.confidence,
                    result.summary,
                    json.dumps([issue.model_dump() for issue in result.issues]),
                ),
            )
        return result

    def get_recitation(self, recitation_id: str) -> RecitationResult | None:
        with self._connect() as connection:
            row = connection.execute(
                'SELECT * FROM recitations WHERE id = ?', (recitation_id,)
            ).fetchone()
        if row is None:
            return None
        data = dict(row)
        data['issues'] = json.loads(data.pop('issues_json'))
        return RecitationResult(**data)

    def update_recitation(self, result: RecitationResult) -> RecitationResult:
        with self._connect() as connection:
            connection.execute(
                '''
                UPDATE recitations
                SET status = ?, accuracy = ?, confidence = ?, summary = ?, issues_json = ?
                WHERE id = ?
                ''',
                (
                    result.status,
                    result.accuracy,
                    result.confidence,
                    result.summary,
                    json.dumps([issue.model_dump() for issue in result.issues]),
                    result.id,
                ),
            )
        return result