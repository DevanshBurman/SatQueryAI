import base64
import io
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from PIL import Image

from backend.main import app
from backend.vision import Observation, VisionRequest, image_block, interpretation_limitations, invoke, validate_inputs


def observation(modality="optical"):
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), "green").save(buffer, "PNG")
    return Observation(label="test image", modality=modality,
                       image="data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode())


def test_unconfigured_status_and_answer(monkeypatch):
    monkeypatch.setenv("SATQUERY_VISION_ENABLED", "false")
    client = TestClient(app)
    assert client.get("/api/vision/status").json()["configured"] is False
    response = client.post("/api/vision/answer", json={"query": "Describe water", "task": "single-image", "observations": [observation().model_dump()]})
    assert response.status_code == 503


def test_private_token_required(monkeypatch):
    for key, value in {"SATQUERY_VISION_ENABLED": "true", "AWS_REGION": "test-region", "BEDROCK_MODEL_ID": "test-model", "SATQUERY_VISION_TOKEN": "private-secret"}.items():
        monkeypatch.setenv(key, value)
    client = TestClient(app)
    assert "private-secret" not in client.get("/api/vision/status").text
    response = client.post("/api/vision/answer", json={"query": "Describe", "task": "single-image", "observations": [observation().model_dump()]})
    assert response.status_code == 401


@pytest.mark.parametrize("task,modes", [("single-image", ["optical", "optical"]), ("temporal", ["optical", "sar"]), ("cross-modal", ["optical", "optical"])])
def test_incompatible_inputs(task, modes):
    with pytest.raises(HTTPException):
        validate_inputs(VisionRequest(query="What changed?", task=task, observations=[observation(mode) for mode in modes]))


def test_invalid_image():
    item = observation()
    item.image = "data:image/png;base64,not-valid"
    with pytest.raises(HTTPException):
        image_block(item)


def test_query_and_images_reach_provider(monkeypatch):
    monkeypatch.setenv("BEDROCK_MODEL_ID", "configured-profile")
    client = Mock()
    client.converse.return_value = {"output": {"message": {"content": [{"text": "Observation 1 shows water."}]}}, "usage": {"inputTokens": 10, "outputTokens": 7}}
    request = VisionRequest(query="Where is the water?", task="cross-modal", observations=[observation(), observation("sar")])
    result = invoke(request, client)
    kwargs = client.converse.call_args.kwargs
    assert kwargs["modelId"] == "configured-profile"
    content = kwargs["messages"][0]["content"]
    assert request.query in content[-1]["text"]
    assert isinstance(content[1]["image"]["source"]["bytes"], bytes)
    assert len([part for part in content if "image" in part]) == 2
    assert result["answer"] == "Observation 1 shows water."
    assert result["trace"][0]["observations"] == 2
    assert result["usage"]["outputTokens"] == 7


def test_empty_provider_response(monkeypatch):
    monkeypatch.setenv("BEDROCK_MODEL_ID", "configured-profile")
    client = Mock()
    client.converse.return_value = {}
    with pytest.raises(HTTPException) as error:
        invoke(VisionRequest(query="Describe", task="single-image", observations=[observation()]), client)
    assert error.value.status_code == 502


def test_limitations_match_selected_workflow():
    single = interpretation_limitations(VisionRequest(query="Describe", task="single-image", observations=[observation()]))
    temporal = interpretation_limitations(VisionRequest(query="Compare", task="temporal", observations=[observation(), observation()]))
    paired = interpretation_limitations(VisionRequest(query="Use both", task="cross-modal", observations=[observation(), observation("sar")]))
    radar = interpretation_limitations(VisionRequest(query="Describe", task="single-image", observations=[observation("sar")]))
    assert any("mixed pixels" in item for item in single)
    assert any("Season" in item for item in temporal)
    assert any("backscatter" in item for item in paired)
    assert any("Speckle" in item for item in radar)
    assert all("fine-tuned" not in item for group in (single, temporal, paired, radar) for item in group)
