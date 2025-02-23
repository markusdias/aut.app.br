{ pkgs ? import <nixpkgs> {} }:

with pkgs;

buildEnv {
  name = "node-env";
  paths = [
    nodejs_20
  ];
} 