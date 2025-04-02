#ifndef MEMORY_STREAM_H
#define MEMORY_STREAM_H

#include <Arduino.h>

class MemoryStream : public Stream {
public:
  MemoryStream(uint8_t* buffer, size_t capacity)
    : _buffer(buffer), _capacity(capacity), _position(0) {}

  size_t write(uint8_t b) override {
    if (_position < _capacity) {
      _buffer[_position++] = b;
      return 1;
    }
    return 0;
  }

  int available() override { return 0; }
  int read() override { return -1; }
  int peek() override { return -1; }
  void flush() override {}

  size_t length() const { return _position; }

private:
  uint8_t* _buffer;
  size_t _capacity;
  size_t _position;
};

#endif // MEMORY_STREAM_H