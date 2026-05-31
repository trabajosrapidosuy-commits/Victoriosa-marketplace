module.exports = {
  root: true,
  extends: ["next"],
  ignorePatterns: [".next/**", "node_modules/**", "coverage/**"],
  rules: {
    "react/jsx-no-target-blank": "off",
    "react/no-unknown-property": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
};
