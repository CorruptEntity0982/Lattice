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
    
    # AWS Configuration (S3 for document storage)
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: Optional[str] = None
    
    # AWS Bedrock - COMMENTED OUT (using OpenAI instead)
    # bedrock_model_id: str = "anthropic.claude-haiku-4-5-20251001-v1:0"
    
    # OpenAI Configuration
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o"
    
    # Application Settings
    app_name: str = "OpenClaims API"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
