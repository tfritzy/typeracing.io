TS_OUT_DIR="../../frontend/src"

echo "Generating c#"
protoc -I=. --csharp_out="." protos.proto

echo "Generating js"
npm pbjs protos.proto --ts "$TS_OUT_DIR/compiled.ts" 

echo "Protobuf compilation complete."