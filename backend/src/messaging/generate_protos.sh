TS_OUT_DIR="../../../frontend/src"
API_DIR="../../api"
CS_FILE="Protos.cs"

echo "Generating c#"
protoc -I=. --csharp_out="." protos.proto

if [ -f "$CS_FILE" ]; then
  sed -i 's/1591, 0612, 3021/1591, 0612, 3021, 8600, 8981/g' "$CS_FILE"
  echo "Replaced text in $CS_FILE"
  
  if [ -d "$API_DIR" ]; then
    cp "$CS_FILE" "$API_DIR/$CS_FILE"
    echo "Copied $CS_FILE to $API_DIR"
  else
    echo "Warning: API directory $API_DIR not found. Could not copy $CS_FILE"
  fi
else
  echo "Warning: $CS_FILE not found. Skipping text replacement and copy."
fi

echo "Generating js"
npx pbjs protos.proto --ts "$TS_OUT_DIR/compiled.ts" 

echo "Protobuf compilation complete."