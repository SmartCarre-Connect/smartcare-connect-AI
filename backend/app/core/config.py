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

    # Email / SMTP
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 20971520  # 20MB
    EMERGENCY_NUMBER: str = "102"

    # CORS
    # Allowed frontend origins (comma-separated). Set this in your hosting env for production.
    # Keep localhost entries for local development.
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://smartcare-connect-ai.vercel.app"

    # Optional: additional origins can be provided via EXTRA_CORS_ORIGINS env var
    # This is useful to add Vercel preview URLs without changing code.
    EXTRA_CORS_ORIGINS: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        base = [o.strip() for o in (self.CORS_ORIGINS or "").split(",") if o.strip()]
        extra = [o.strip() for o in (self.EXTRA_CORS_ORIGINS or "").split(",") if o.strip()]
        # Merge and deduplicate while preserving order
        seen = set()
        merged = []
        for o in base + extra:
            if o not in seen:
                seen.add(o)
                merged.append(o)
        return merged

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
