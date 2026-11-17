{
  description = "ja-dev-docsの開発環境";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAll = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});

      basePackages = pkgs: [
        pkgs.nodejs_24
        pkgs.pnpm_12
        pkgs.git
        pkgs.shellcheck
        pkgs.actionlint
      ];
    in
    {
      devShells = forAll (pkgs: {
        default = pkgs.mkShellNoCC { packages = basePackages pkgs; };
      });

      formatter = forAll (pkgs: pkgs.nixfmt);

      # devShellが壊れていないことをnix flake checkで確かめる。
      checks = nixpkgs.lib.genAttrs systems (system: {
        default = self.devShells.${system}.default;
      });
    };
}
