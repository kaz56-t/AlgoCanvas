from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:////app/data/db/algocanvas.db"
    data_dir: str = "/app/data/market"
    llm_endpoint: str = "http://host.docker.internal:11434"
    llm_model: str = "llama3"
    llm_api_key: str = ""
    max_upload_size_mb: int = 50
    cors_origins: str = "http://localhost:3000"
    nl_parser_mode: str = "llm"  # "llm" or "rule_based"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def async_database_url(self) -> str:
        url = self.database_url
        if url.startswith("sqlite://") and "+aiosqlite" not in url:
            url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return url

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
