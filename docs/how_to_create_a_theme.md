# how to create a theme

## data.json

first thing you need to create a file called `data.json`

then type:

```json
{
  "name": "<YOUR_THEME_NAME>",
  "htmlFile": "<HTML_FILE>",
  "jsFiles": [<JS_FILES_NEEDED>],
  "cssFiles": [<CSS_FILES_NEEDED>],
  "options": { ... },
  "defaultOptions": { ... }
}
```

and replace:

<YOUR_THEME_NAME>: with you themes name (required)

<HTML_FILE>: the html file for your theme (required)

NOTE: html will be instated to the body

<JS_FILES_NEEDED>: with any js files you need (required)

<CSS_FILES_NEEDED>: with any css files you need (optional)

what about options and defaultOptions?

### options

is the type defs for your options that are configurable via visiting `/configure`

example:

```json
{
  // defining a string
  "someStr": {
    "type": "string",
    // (optional) if you want your str to only one of an array
    "oneOf": ["foo", "bar"]
  },
  // defining a boolean
  "someBool": {
    "type": "boolean"
  },
  // defining a number
  "someNumber": {
    "type": "number"
  },
  // defining a object
  "someObject": {
    "type": "object",
    "attrs": {
      ...
    }
  },
  // defining an any key object
  "someObjectWithAnyKeys": {
    "type": "object",
    "attrs": {
      "__any": someType
    }
  }
}
```

### defaultOptions

the default options for your theme

example:

```json
{
  "someStr": "foo",
  "someBool": true,
  "someNumber": 10,
  "someObject": { ... },
  "someObjectWithAnyKeys": {}
}
```

## vnstat-ui-deps

vnstat-ui-deps is a set of tools that allow you to:

see it's docs [here](https://github.com/AliBasicCoder/vnstat-ui-deps)

1. get the vnstat data
2. get any configuration you need
3. calculating 5 min, daily, monthly, yearly data
