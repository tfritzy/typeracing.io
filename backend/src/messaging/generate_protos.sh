TS_OUT_DIR="../../../frontend/src"
CS_FILE="Protos.cs"

echo "Generating c#"
npx protoc -I=. --csharp_out="." protos.proto

if [ -f "$CS_FILE" ]; then
  sed -i 's/1591, 0612, 3021/1591, 0612, 3021, 8600, 8981/g' "$CS_FILE"
  echo "Replaced text in $CS_FILE"
else
  echo "Warning: $CS_FILE not found. Skipping text replacement."
fi

echo "Generating js"
npx pbjs protos.proto --ts "$TS_OUT_DIR/compiled.ts" 

echo "Protobuf compilation complete."