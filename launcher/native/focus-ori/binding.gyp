{
  "targets": [
    {
      "target_name": "focus_ori",
      "sources": [
        "focus_ori_linux.cc",
        "focus_ori_windows.cc"
      ],
      'conditions': [
        ['OS=="linux"', {'sources!': ['focus_ori_windows.cc']}],
        ['OS=="win"', {'sources!': ['focus_ori_linux.cc']}]
      ],
    }
  ]
}
