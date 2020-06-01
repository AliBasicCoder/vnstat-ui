# vnstat-ui

a gui for vnstat

## Features

1. you can make your own themes see [how to create a theme](https://github.com/AliBasicCoder/vnstat-ui/blob/master/docs/how_to_create_a_theme.md)
1. themes are configurable
1. easily installed via npm
1. support for both vnstat v1.x and v2.x
1. for developes: made in typescript
1. mac support

## how to install

### installing node

on mac:

```
brew install node
```

on linux:

```js
sudo apt-get install nodejs
```

### installing the cli via npm

```
npm i -g vnstat-ui
```

### installing the default theme

```
vnstat-ui themes install npm:vnstat-ui-default-theme
```

### running the server

```
vnstat-ui start
```

to run it automatically on startup

on linux:

```
crontab -e
```

and add this line

```
@reboot vnstat-ui start
```

## License

copyrights AliBasicCoder (c) 2020
