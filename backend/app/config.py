"""
Configuration management using Pydantic Settings
All configuration values are loaded from environment variables
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database URLs
    postgres_url: str = "postgresql://postgres:postgres@postgres:5432/openclaims"
    redis_url: str = "redis://redis:6379/0"
    neo4j_uri: str = "bolt://neo4j:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"
    
    # AWS Configuration
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: Optional[str] = None
    # Claude Sonnet 4.6 with cross-region inference (Feb 2026 - newest model)
    bedrock_model_id: str = "us.anthropic.claude-sonnet-4-6"
    
    # Application Settings
    app_name: str = "OpenClaims API"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
