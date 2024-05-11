TS_OUT_DIR="../../frontend/src"

echo "Generating c#"
npx protoc -I=. --csharp_out="." protos.proto

echo "Generating js"
npx pbjs protos.proto --ts "$TS_OUT_DIR/compiled.ts" 

echo "Protobuf compilation complete."