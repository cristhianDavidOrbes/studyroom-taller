"""Explicit one-time model install; only public MIT model files are downloaded."""
import argparse
import json
from pathlib import Path
from huggingface_hub import snapshot_download
from worker import MODEL_REPO, MODEL_REVISION

parser = argparse.ArgumentParser()
parser.add_argument("--model-dir", required=True)
args = parser.parse_args()
target = Path(args.model_dir).resolve()
snapshot_download(repo_id=MODEL_REPO, revision=MODEL_REVISION, local_dir=str(target), allow_patterns=["config.json", "model.bin", "tokenizer.json", "vocabulary.json", "vocabulary.txt", "preprocessor_config.json"], token=False)
(target / "studyroom-model.json").write_text(json.dumps({"repo": MODEL_REPO, "revision": MODEL_REVISION, "license": "MIT", "computeType": "int8", "device": "cpu"}), encoding="utf-8")
print("Modelo de voz público descargado; no se envió audio.")
