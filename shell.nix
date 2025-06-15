{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js and npm
    nodejs_20
    nodePackages.npm
    nodePackages.typescript
    nodePackages.typescript-language-server

    # Development tools
    git
    vscode
    chromium  # for testing

    # Build tools
    nodePackages.vite
    nodePackages.eslint
    nodePackages.prettier

    # Testing
    nodePackages.vitest
    nodePackages.playwright-cli
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
    echo "🚀 NoServerConvert development environment ready!"
    echo "📦 Available commands:"
    echo "  - npm run dev     # Start development server"
    echo "  - npm run build   # Build for production"
    echo "  - npm run test    # Run tests"
    echo "  - npm run lint    # Run linter"
  '';
}
