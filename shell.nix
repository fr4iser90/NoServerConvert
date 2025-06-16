# shell.nix
with import <nixpkgs> {};
mkShell {
  buildInputs = [
    gcc
    jasper
    libjpeg
    libpng
    zlib
    libtiff
    lcms2
    libraw
    rustc
    cargo
    wasm-pack
  ];
}