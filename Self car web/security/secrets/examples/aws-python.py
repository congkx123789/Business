import json
import os
import boto3


def get_secret_string(secret_id: str, region: str | None = None) -> str:
    client = boto3.client("secretsmanager", region_name=region or os.getenv("AWS_REGION"))
    res = client.get_secret_value(SecretId=secret_id)
    if "SecretString" in res:
        return res["SecretString"]
    return res["SecretBinary"].decode("utf-8")


def get_database_credentials() -> tuple[str, str]:
    secret_id = os.getenv("DB_SECRET_ID")
    if not secret_id:
        raise RuntimeError("DB_SECRET_ID is not set")
    payload = json.loads(get_secret_string(secret_id))
    return payload["username"], payload["password"]

