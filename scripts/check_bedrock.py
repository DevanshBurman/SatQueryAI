"""Load backend/.env and diagnose Bedrock without printing credentials."""
import argparse
import json
import os
from pathlib import Path

from dotenv import load_dotenv


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--invoke", action="store_true", help="Make one short billable Nova call")
    args = parser.parse_args()
    load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env", override=False)
    missing = [key for key in ("AWS_REGION", "BEDROCK_MODEL_ID") if not os.getenv(key, "").strip()]
    if missing:
        print(json.dumps({"status": "missing_configuration", "missing": missing}))
        return 1
    if not args.invoke:
        print(json.dumps({"status": "configuration_only", "region": os.getenv("AWS_REGION"),
                          "model": os.getenv("BEDROCK_MODEL_ID"),
                          "access_key_present": bool(os.getenv("AWS_ACCESS_KEY_ID")),
                          "secret_key_present": bool(os.getenv("AWS_SECRET_ACCESS_KEY")),
                          "note": "No network call made. Profiles/roles can also supply credentials. Use --invoke to verify access."}))
        return 0
    try:
        import boto3
        from botocore.config import Config
        from botocore.exceptions import BotoCoreError, ClientError
    except ImportError:
        print("Install backend/requirements.txt first.")
        return 1
    try:
        client = boto3.client("bedrock-runtime", region_name=os.environ["AWS_REGION"],
                              config=Config(connect_timeout=5, read_timeout=30, retries={"max_attempts": 0}))
        response = client.converse(modelId=os.environ["BEDROCK_MODEL_ID"],
                                   messages=[{"role": "user", "content": [{"text": "Reply with: Connection successful."}]}],
                                   inferenceConfig={"maxTokens": 20, "temperature": 0})
        answer = " ".join(part.get("text", "") for part in response.get("output", {}).get("message", {}).get("content", []))
        print(json.dumps({"status": "connected", "reply": answer, "usage": response.get("usage", {})}))
        return 0
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "Unknown")
        hints = {
            "AccessDeniedException": "Check IAM for the chosen model/profile, account restrictions and model availability.",
            "ValidationException": "Check model ID, region and whether an inference profile is required.",
            "UnrecognizedClientException": "Check the access key, secret and temporary-session token.",
            "ExpiredTokenException": "Refresh temporary credentials including the session token.",
            "ThrottlingException": "Check model quota and retry later; do not loop requests.",
            "ServiceUnavailableException": "Provider unavailable; retry once later.",
        }
        print(json.dumps({"status": "aws_error", "code": code, "hint": hints.get(code, "Inspect this AWS error code; raw provider details suppressed.")}))
        return 1
    except BotoCoreError as exc:
        print(json.dumps({"status": "client_error", "code": type(exc).__name__, "hint": "Check credentials and network configuration."}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
