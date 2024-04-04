CSHARP_OUT_DIR="../compiled"
TS_OUT_DIR="../../../frontend/src"

echo "Generating c#"
protoc -I=. --csharp_out="$CSHARP_OUT_DIR" protos.proto

echo "Generating js"
pbjs protos.proto --ts "$TS_OUT_DIR/compiled.ts"

echo "Protobuf compilation complete."