TS_OUT_DIR="../../frontend/src"
API_DIR="."
CS_FILE="Protos.cs"
echo "Generating c#"
protoc -I=. --csharp_out="." protos.proto
if [ -f "$CS_FILE" ]; then
  # Replace warning suppressions
  sed -i 's/1591, 0612, 3021/1591, 0612, 3021, 8600, 8981/g' "$CS_FILE"
  echo "Replaced warning suppressions in $CS_FILE"
  
  # Replace Id with id
  sed -i 's/\bId/id/g' "$CS_FILE"
  echo "Replaced 'Id' with 'id' in $CS_FILE"
else
  echo "Warning: $CS_FILE not found. Skipping text replacements and copy."
fi
echo "Generating js"
npx pbjs protos.proto --ts "$TS_OUT_DIR/compiled.ts"
echo "Protobuf compilation complete."