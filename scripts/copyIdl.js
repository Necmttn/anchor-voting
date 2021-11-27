const fs = require("fs");
const path = require("path");

fs.copyFileSync(
  path.join(__dirname + "/../anchor-voting/target/idl/anchor_voting.json"),
  path.join(__dirname + "/../solana/idl.json")
);
