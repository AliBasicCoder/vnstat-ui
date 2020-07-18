declare module "merge" {
  type MergeFunction = (
    ...args: any
  ) => {
    [key: string]: any;
  };
  const merge: MergeFunction & {
    recursive: MergeFunction;
  };
  export default merge;
}

declare module "unflatten" {
  const unflatten: (obj: {
    [key: string]: any;
  }) => {
    [key: string]: any;
  };
  export default unflatten;
}

declare module "format-json" {
  const formatJson: {
    plain: (obj: { [key: string]: any }) => string;
  };
  export = formatJson;
}
