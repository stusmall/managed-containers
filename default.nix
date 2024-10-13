let
  pkgs = import
    (builtins.fetchTarball
      # Head of release-24.05
      "https://github.com/nixos/nixpkgs/archive/a61a90ec86d19366afea31833bdb532c0e87563f.tar.gz"
    ){};
in
pkgs.mkShell {
    name = "dev-env";
    buildInputs = [
        pkgs.nodejs_22
        pkgs.typescript
        pkgs.web-ext
    ];
}