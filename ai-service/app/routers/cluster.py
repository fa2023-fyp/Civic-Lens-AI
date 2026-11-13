from datetime import datetime
from math import asin, cos, radians, sin, sqrt
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.nlp.similarity import lexical_similarity

router = APIRouter(tags=["clustering"])

class ClusterRequest(BaseModel):
    complaints: list[dict] = Field(default_factory=list)
    similarity_threshold: float = Field(default=0.35, ge=0, le=1)
    radius_km: float = Field(default=1.0, gt=0, le=20)
    window_days: int = Field(default=30, gt=0, le=365)

def distance_km(a, b):
    lat1, lon1, lat2, lon2 = map(radians, [float(a["latitude"]), float(a["longitude"]), float(b["latitude"]), float(b["longitude"])])
    dlat, dlon = lat2-lat1, lon2-lon1
    h = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    return 6371 * 2 * asin(sqrt(h))

@router.post("/clusters")
def cluster(payload: ClusterRequest):
    rows = payload.complaints
    parents = list(range(len(rows)))
    def find(i):
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i
    for i, left in enumerate(rows):
        for j in range(i + 1, len(rows)):
            right = rows[j]
            if left.get("category") != right.get("category"):
                continue
            has_left_point = left.get("latitude") is not None and left.get("longitude") is not None
            has_right_point = right.get("latitude") is not None and right.get("longitude") is not None
            if has_left_point and has_right_point:
                if distance_km(left, right) > payload.radius_km:
                    continue
            if left.get("created_at") and right.get("created_at"):
                try:
                    delta = abs((datetime.fromisoformat(left["created_at"].replace("Z", "+00:00")) - datetime.fromisoformat(right["created_at"].replace("Z", "+00:00"))).days)
                    if delta > payload.window_days:
                        continue
                except (TypeError, ValueError):
                    continue
            if lexical_similarity(left.get("text", ""), right.get("text", "")) >= payload.similarity_threshold:
                parents[find(j)] = find(i)
    groups = {}
    for index, row in enumerate(rows):
        groups.setdefault(find(index), []).append(row)
    result = []
    for members in groups.values():
        if len(members) < 2:
            continue
        result.append({
            "area": members[0].get("area", ""),
            "category": members[0].get("category", "other"),
            "complaint_count": len(members),
            "affected_streets": sorted({m.get("street", "") for m in members if m.get("street")}),
            "first_reported": min((m.get("created_at", "") for m in members), default=""),
            "status": "active",
            "complaint_ids": [m.get("id") for m in members]
        })
    return {"clusters": result, "method": "lexical similarity + optional geography/time filters"}
