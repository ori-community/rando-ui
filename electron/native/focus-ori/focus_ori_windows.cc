#include <node.h>
#include <windows.h>

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Object;
using v8::String;
using v8::Value;

void focus_ori(const FunctionCallbackInfo<Value>& args) {
    auto window_handle = FindWindowA(nullptr, "OriAndTheWillOfTheWisps");

    if (window_handle == nullptr) {
        window_handle = FindWindowA(nullptr, "OriAndTheWillOfTheWisps-PC");
    }

    if (window_handle != nullptr) {
        SetForegroundWindow(window_handle);
    }
}

void initialize_module(Local<Object> exports) {
    NODE_SET_METHOD(exports, "focusOri", focus_ori);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, initialize_module)
