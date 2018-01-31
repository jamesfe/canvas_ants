.PHONY: run
run:
	python3 -m http.server 8000 --bind 127.0.0.1

$(SRCDIR)=./src/cpp
$(WASMDIR)=./web/wasm

.PHONY: wasm
wasm:
	emcc $(SRCDIR)/hello.c -s WASM=1 -o $(WASMDIR)/hello.html
