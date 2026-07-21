module.exports = {
  multipass: true,
  plugins: [
    "removeComments",
    "removeMetadata",
    "removeXMLProcInst",
    "removeUselessDefs",
    "removeEmptyAttrs",
    "removeHiddenElems",
    "removeEmptyText",
    "removeEmptyContainers",
    "collapseGroups",
    "convertStyleToAttrs",
    {
      name: "removeUselessStrokeAndFill",
      params: { removeNone: true }
    }
  ]
};