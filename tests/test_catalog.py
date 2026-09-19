import asyncio
from unittest.mock import patch

from backend.main import CatalogRequest, catalog_search


class FakeResponse:
    def __init__(self, collection: str):
        self.collection = collection

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict:
        return {
            "features": [{
                "id": f"{self.collection}-scene",
                "collection": self.collection,
                "bbox": [76.0, 11.4, 76.3, 11.8],
                "properties": {"datetime": "2024-08-01T00:00:00Z"},
                "assets": {},
            }]
        }


class FakeClient:
    requests: list[dict] = []

    def __init__(self, **_kwargs):
        self.requests = FakeClient.requests

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    async def post(self, _url: str, json: dict):
        self.requests.append(json)
        return FakeResponse(json["collections"][0])


def test_mixed_catalog_search_only_applies_cloud_filter_to_optical() -> None:
    FakeClient.requests = []
    request = CatalogRequest(sources=["sentinel-2-l2a", "sentinel-1-grd"], limit=10)

    with patch("backend.main.httpx.AsyncClient", FakeClient):
        result = asyncio.run(catalog_search(request))

    assert result["live"] is True
    assert {scene["mode"] for scene in result["scenes"]} == {"optical", "sar"}
    optical, sar = FakeClient.requests
    assert optical["query"] == {"eo:cloud_cover": {"lte": 30}}
    assert "query" not in sar
