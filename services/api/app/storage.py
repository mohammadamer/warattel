import os
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO, Literal


@dataclass(frozen=True)
class StorageSnapshot:
    mode: Literal['local', 's3']
    bucket: str | None
    public_base_url: str
    is_ready: bool


class LocalAudioStorage:
    def __init__(self, base_dir: str | Path | None = None) -> None:
        self.base_dir = Path(base_dir or os.getenv('WARATTEL_AUDIO_DIR', 'data/audio'))
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_upload(self, filename: str, content: BinaryIO, content_type: str | None = None) -> str:
        target_path = self.base_dir / filename
        target_path.parent.mkdir(parents=True, exist_ok=True)
        content.seek(0)
        with target_path.open('wb') as output:
            output.write(content.read())
        return str(target_path)

    def get_public_url(self, filename: str) -> str:
        return f'/media/{filename}'


class S3AudioStorage:
    def __init__(self, bucket_name: str | None = None, region: str | None = None, endpoint_url: str | None = None) -> None:
        self.bucket_name = bucket_name or os.getenv('AWS_S3_BUCKET')
        self.region = region or os.getenv('AWS_REGION')
        self.endpoint_url = endpoint_url or os.getenv('AWS_S3_ENDPOINT_URL')
        self.is_ready = bool(self.bucket_name)

    def save_upload(self, filename: str, content: BinaryIO, content_type: str | None = None) -> str:
        if not self.is_ready:
            raise RuntimeError('S3 storage is not configured')
        try:
            import boto3
        except ImportError as error:
            raise RuntimeError('boto3 is required for S3 storage') from error

        client = boto3.client(
            's3',
            region_name=self.region,
            endpoint_url=self.endpoint_url,
        )
        content.seek(0)
        client.upload_fileobj(content, self.bucket_name, filename, ExtraArgs={'ContentType': content_type or 'application/octet-stream'})
        return f's3://{self.bucket_name}/{filename}'

    def get_public_url(self, filename: str) -> str:
        if self.endpoint_url:
            return f'{self.endpoint_url.rstrip("/")}/{self.bucket_name}/{filename}'
        if self.region:
            return f'https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{filename}'
        return f'https://{self.bucket_name}.s3.amazonaws.com/{filename}'


def get_storage_backend() -> LocalAudioStorage | S3AudioStorage:
    bucket_name = os.getenv('AWS_S3_BUCKET')
    if bucket_name:
        return S3AudioStorage(bucket_name=bucket_name)
    return LocalAudioStorage()


def detect_storage_status() -> StorageSnapshot:
    bucket_name = os.getenv('AWS_S3_BUCKET')
    if bucket_name:
        backend = S3AudioStorage(bucket_name=bucket_name)
        return StorageSnapshot(
            mode='s3',
            bucket=bucket_name,
            public_base_url=backend.get_public_url(''),
            is_ready=backend.is_ready,
        )
    backend = LocalAudioStorage()
    return StorageSnapshot(
        mode='local',
        bucket=None,
        public_base_url=backend.get_public_url(''),
        is_ready=True,
    )
