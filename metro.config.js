const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// ✅ allow .glb files
config.resolver.assetExts.push("glb");

module.exports = config;
