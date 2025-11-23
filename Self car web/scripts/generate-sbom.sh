#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="sbom"
mkdir -p "$OUT_DIR"

echo "Generating SBOMs with syft (docker)..."

docker run --rm -v "$(pwd)":/src -w /src anchore/syft:latest packages dir:/src/backend -o cyclonedx-json > "$OUT_DIR/backend-sbom.json"
docker run --rm -v "$(pwd)":/src -w /src/frontend anchore/syft:latest packages dir:/src/frontend -o cyclonedx-json > "../$OUT_DIR/frontend-sbom.json"

echo "SBOMs written to $OUT_DIR"

