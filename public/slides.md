name: inverse
layout: true
class: inverse

---
class: center, middle

# Ember-cli-deploy
## (A gentle introduction)

---

### About me

<img src="images/me.jpg" width="100%" height="100%">

---
# $ whoami

## Mattia - @ghedamat (github/twitter/slack)
## Developer @ [Precision Nutrition](https://precisionnutrition.com)
## Organizer of Toronto EmberJS ([@torontoemberjs](https://twitter.com/torontoemberjs))
## Ember-cli-deploy team ([ember-cli-deploy.com](http://ember-cli-deploy.com))

---
class: center, middle
# Our Goal
---
class: center, middle
<div class="video" id="deploy-video-player-container" data-src="videos/initial-video.json"></div>

???

We want every ember app to be deployed this way
---
class: center, middle

# But...

---
class: center, middle

# Every deploy is different!

---

## S3

--

## Cloudfront

--

## Redis

--

## scp to server

--

## Fastly

--

## Microsoft Azure

--

## (insert deploy thingy here)

???

So, what can we do?

---

class: center, middle

# The 80 %

???

Like Ember does,
we want to find the 80% that is common to every deploy story

leaving escape valves for who needs advanced customization

---

class: center, middle

# A deploy pipeline

--

# +

--

# An ecosystem of plugins

---

class: center, middle

## Each deploy approach will need a similar series of operations

---

# Deploy steps

--

## 0) configure

--

## 1) build

???

equivalent of ember build

--

## 2) prepare

???

defines deploy information

--

## 3) upload

???

uploads the release

--

## 4) activate

---

class: center, middle
## Each plugin can implement one or many of these steps

---

class: center, middle

# An Example

--

## this slidedeck

--

### let's deploy our js/css to amazon S3 and serve it with cloudfront

--

### let's use S3 to serve our `index.html` directly

---

# Deploy example

## 1) install ember-cli-deploy

### `ember install ember-cli-deploy`

---

class: center, middle

# BTW

---

class: center, middle

# We just released [0.6.0](https://github.com/ember-cli/ember-cli-deploy/releases/tag/v0.6.0) !!!

---

# Deploy example

## 2) install some plugins

--

## - a plugin to **build** our app

--

`ember-cli-deploy-build`

--

## - a plugin to **name** our builds

--

`ember-cli-deploy-revision-data`

--

## - a plugin to **upload** our assets (js, css, images)

--

`ember-cli-deploy-s3`

--

## - a plugin to **upload** our html

--

`ember-cli-deploy-s3-index`

---

class: middle

```bash

ember install ember-cli-deploy-build \
              ember-cli-deploy-revision-data \
              ember-cli-deploy-s3 \
              ember-cli-deploy-s3-index

```

---

# Deploy example

## 3) configure `config/deploy.js`

```javascript
module.exports = function(deployTarget) {
  var ENV = {};

  if (deployTarget === 'production') {
    ENV.build = {
      environment: 'production';
    };
    ENV.s3 = {
      accessKeyId: process.env['AWS_ACCESS_KEY'],
      secretAccessKey: process.env['AWS_SECRET_KEY'],
      filePattern: '**/*.{js,css,png,gif,ico,jpg,map,xml,txt,svg,swf,eot,ttf,woff,woff2,md}',
      bucket: 'ember-cli-deploy-intro',
      region: 'us-west-2'
    };
    ENV['s3-index'] = {
      accessKeyId: process.env['AWS_ACCESS_KEY'],
      secretAccessKey: process.env['AWS_SECRET_KEY'],
      bucket: 'ember-cli-deploy-intro',
      region: 'us-west-2',
      allowOverwrite: true
    };
  }
  return ENV;
};
```

???

config file needs to return a single function

ember-cli-deploy will invoke this function with a single paramenter `deployTarget`

the deploy targes is specified after the command `ember deploy TARGET`

this function needs to return a single object (conventionally called ENV)

this object can have properties that are other objects, usually one per plugin

**I created an S3 bucket in advance**

---

# Deploy example

## 3) configure `ember-cli-build.js`

```javascript
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var env = EmberApp.env() || 'development';
  var isProductionLikeBuild = env === 'production';

  var app = new EmberApp(defaults, {
    fingerprint: {
      enabled: isProductionLikeBuild,
          // this is the important part
  		prepend: 'https://d35dkdfrd6svyx.cloudfront.net/',
      extensions: ['js', 'css', 'png', 'jpg', 'gif']
    }
  });

  // ...
  return app.toTree();
};
```

???

this step is needed ONLY because we decided to use cloudfront

**I created a cloudfront distribution in advance**

As you probably know ember includes by default fingerprinting for production builds

we can use fingerprinting to `prepend` our cloudfront distribution URL

because assets are fingerprinted we can cache them forever as cloudfront does

this is also why we'll serve our `index.html` from S3 instead, we don't want it to be cached

---

# Deploy example

## 4) env files `.env.deploy.production`

```
AWS_ACCESS_KEY=yourkeyhere
AWS_SECRET_KEY=yoursecrethere
```

???

different deployTargets will need different ENV variables

`.env.deploy.deployTarget` files
---

# Deploy example

## 5) test your deploy

<div class="video" id="deploy-video-player-container-verbose" data-src="videos/deploy-verbose.json"></div>

???

there are more Pipeline steps than the ones I mentioned

for each one we can see what each plugin that implements it does

**note the last line of the output**

---

# Deploy example

## 5) activate

<div class="video" id="deploy-video-player-container-activate" data-src="videos/deploy-activate.json"></div>


???

`ember deploy:activate TARGET` is another ember-cli-deploy command

it will take an already upload "revision" and mark it as the "active" one

---

# Deploy example

## 6) look at your newly deployed site!

<br>
<br>
<br>
<center>
<!-- getto md -->
<img src="http://www.reactiongifs.com/wp-content/uploads/2011/09/mind_blown.gif">
<br>
<br>
<center>
<a href="http://ember-cli-deploy-intro.s3-website-us-west-2.amazonaws.com">http://ember-cli-deploy-intro.s3-website-us-west-2.amazonaws.com/</a>
</center>

---

class: center, middle

![](http://i.imgur.com/9Zv4V.gif)


---
class: center, middle

# Tell me more...

???

what is a plugin?

---
class: center, middle

# What IS a plugin?

---
class: center, middle

##It's an ember-cli-addon

--

## that implements one or many **pipeline hooks**

--

### (and has the keyword `ember-cli-deploy-plugin`)

---
class: center, middle

# How does this work?

---

# Fitting the pieces together

## ember-cli-deploy implements `commands`

* `ember deploy TARGET`
* `ember deploy:activate TARGET`
* `ember deploy:list TARGET`

--

## each command calls several `pipeline hooks` in order

--

## a `hook` is executed on all plugins that implement it

---

class: center, middle

![](http://ember-cli.com/ember-cli-deploy/public/images/context-example.gif)

[(credits @lukemelia and @achambers)](https://www.youtube.com/watch?v=fcSL5poJ1gQ&list=PL4eq2DPpyBbnMrndBpPUFFdYiMLdp8__L&index=8)

---

class: center, middle

# But..

---

class: center, middle

# What plugins should I use?

---

class: center, middle

# Deploy Strategies

---

class: middle

## Def:

## A deploy strategy is a particular composition of plugins

### -- ghedamat, today

???

what plugins you use will determine the deploy you'll have

---

# Deploy Strategies examples:

## S3 strategy (used for this slidedeck)

## The lightning strategy (S3/redis)

## Microsoft Azure

## AWS strategy (S3/cloudfront with cache invalidation)

---

class: center, middle

![](https://gsnaps.s3.amazonaws.com/ember-cli-deploy_plugins_-_Ember_Observer_2016-02-20_19-08-10.png)

---

class: center, middle

# TOO MANY PLUGINS!

---
class: center, middle

# Another wild 80% appears...

---

class: center, middle

# Plugin packs to the rescue!

---

class: center, middle

## just an ember-cli-addon

--

## that installs a group of plugins

--

## and (optionally) provides a way to share configuration

--

### (ember-cli-deploy-plugin-pack npm keyword)

---

# Plugin packs examples

## ember-cli-deploy-s3-pack (we could have used it here)
## ember-cli-deploy-lightning-pack
## ember-cli-deploy-azure-pack
## ember-cli-deploy-aws-pack

---

class: center, middle

# But..

---

class: center, middle

# I want something *slightly* different

---
class: center, middle

# No Problem!

---
class: center, middle

## Use a plugin pack as base/inspiration

--

## and add other plugins

---
class: center, middle

# Or...

---
class: center, middle

# Company packs

---

class: middle

## Def:

## A company pack is a plugin pack created by a company to share their own variation of a certain Deploy Strategy

### A company pack is ideally open-source so others can take inspiration

### -- ghedamat, today, 2 minutes later

---

# Company packs examples:

## [Yapp pack](https://github.com/yappbox/ember-cli-deploy-yapp-pack) -> lightning strategy + slack notifications

## [Zesty pack](https://github.com/zestyzesty/ember-cli-deploy-zesty-pack) -> same but with PR deploy goodness

## [PN pack](https://github.com/precisionnutrition/ember-cli-deploy-pn-pack) -> example on how to share config via plugin pack

---

class: center, middle

# Where to go next

---

class: center, middle

# [http://www.ember-cli-deploy.com](http://www.ember-cli-deploy.com)

## Guides

## &

## Examples

---

class: center, middle

# Plugin READMEs

## Consistent README format

## ember-cli-deploy badges

## Find them on the [website](http://www.ember-cli-deploy.com) or on [ember-addons](https://www.emberaddons.com/)

---

class: center, middle

# Videos

## [Lukemelia's talk from Emberconf 2015](https://www.youtube.com/watch?v=4EDetv_Rw5U)

## [Embercamp's ember-cli-deploy in action](https://www.youtube.com/watch?v=fcSL5poJ1gQ)

---

class: center, middle

# Community

## #ember-cli-deploy on the [ember-community-slack](https://ember-community-slackin.herokuapp.com/)

---

class: center, middle

# Credits

![](https://gsnaps.s3.amazonaws.com/Resources__Ember_CLI_Deploy_2016-02-21_15-40-57.jpg)
---

class: center, middle

# Credits

## All the amazing plugin authors and contributors
---

class: center, middle

# Wait!

---

class: center, middle

# What about 1.0?

---

class: center, middle

![](https://gsnaps.s3.amazonaws.com/1.0_Release_Checklist__Issue_358__ember-cliember-cli-deploy_2016-02-21_15-52-02.jpg)
---

class: center, middle

# Thanks for listening!

## [@ghedamat](https://twitter.com/ghedamat)
