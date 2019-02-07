/**
 * Simple JSON object used for environment configuration e.g. Debugging / Feature Switches
 */

var environmentConfiguration = {
  "name": "Local",
  "description": "Local development environment",
  "debugEnabled": false,
  "features": {
    "updateJira": {
      "enabled": true
    }
  }
}

// Node required code block
module.exports = environmentConfiguration;
// End of Node required code block