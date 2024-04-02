#include <node.h>

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Object;
using v8::String;
using v8::Value;

void focus_ori(const FunctionCallbackInfo<Value>& args) {
    // noop
}

void initialize_module(Local<Object> exports) {
    NODE_SET_METHOD(exports, "focusOri", focus_ori);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, initialize_module)
