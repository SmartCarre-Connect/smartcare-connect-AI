from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "smartcare_connect"

    # JWT
    JWT_SECRET: str = "super-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI
    GEMINI_API_KEY: str = ""
    # HeyGen
    # Read your HeyGen API key from the environment (.env) to avoid committing secrets.
    HEYGEN_API_KEY: str = "sk_V2_hgu_kpcryR8l5LR_p7zRwEADPn6UwU1XtzzKNWvJiusBQvJR"
    HEYGEN_API_URL: str = "https://api.heygen.com"

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""

    # Email
    EMAIL_USERNAME: str = ""
    EMAIL_PASSWORD: str = ""

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 20971520  # 20MB

    # CORS
    CORS_ORIGINS: str = "https://smartcare-connect-ai.vercel.app"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
