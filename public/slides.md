name: inverse
layout: true
class: inverse

---
class: center, middle

# Ember CLI Mirage

---

### About me

<img src="images/me.jpg" width="100%" height="100%">

---
# $ whoami

## Mattia - @ghedamat (github/twitter/slack)
## Developer @ [Precision Nutrition](https://precisionnutrition.com)
## Organizer of Toronto EmberJS ([@torontoemberjs](https://twitter.com/torontoemberjs))



---
class: center, middle
# JS Acceptance Testing

---
class: center, middle
# Needs a (fake) API

---

# Options:

--

## API Mocks in node

--

## Real API weirdo integration

--

## Capybara testing

---
class: center, middle
# Nooooooo
<img src="images/photo.jpg" style="max-width: 70%">

---
class: center, middle
# Pretender.js

## To the rescue!

---
class: center, middle
# Fixtures!

## (stub your responses)

---
class: center, middle
# Your tests grow...

---
class: center, middle
<img src="images/kitty-string.jpg" style="max-width: 100%">
---
class: center, middle

# Ember CLI Mirage (0.1)

---
class: center, middle

<img src="images/this-makes-me-so-happy-63975.jpg" style="max-width: 100%">

---
# Mirage all the things!

--

## Factories NOT Fixtures

--

## Works in dev as well

--

## Mock server (but runs on the client side, so no XHR requests)

--

## Fancy DSL

--

## Datastore (you can store changes too!)

---
# Example /1


```javascript
// app/mirage/factories/users.js
import Mirage, { faker } from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  admin: false,
  created_at() { return new Date(); },
  email: faker.internet.email,
  first_name: faker.name.firstName,
  last_name: faker.name.lastName,
  gender: 'F',
  birthdate() { return new Date('1980-02-01'); },
});

```

---
# Example /2


```javascript
// app/mirage/config.js
export default function() {
  this.namespace = 'api/v1';
  this.get('users');
}

// tests/acceptance/users-test.js
...
test('lists users', function(assert) {
  server.createList('users', 10);
  visit('/users');
  andThen() {
    // asserts users are rendered
  }
});

```


---
class: center, middle

# Sounds good !

---
class: center, middle
<img src="images/technical-problems-its-all-good-bro-well-wait.jpg" style="max-width: 100%">



---
# Some problems:

## Relationships

## JSON Api

## Custom serialization

---
class: center, middle

# Ember CLI Mirage 0.2


---
# What's new ?

## A new abstraction level

## Relationship support

## Great docs

## ember-cli generators

## Models

## Serializers

---
class: center, middle

# Wait, is this an ORM ???

---
class: center, middle

# Well, yes

--

## But there is a reason for it

---
# Models

## They match factories
--

## Unrelated to the Ember Data models *

--

## They define relationships

```javascript
// mirage/models/author.js
import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  blogPosts: hasMany()
});

// mirage/models/blog-post.js
import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  author: belongsTo()
});
```


---
# Serializers

--

## They translate Models and relationships into payloads


--

## Embedding


--

## Sideloading


--

## JSON Api (just works)


--

## ActiveModelSerializer Api

```javascript
// mirage/serializers/author.js
import { Serializer } from 'ember-cli-mirage';

export default Serializer.extend({
  include: ['blogPosts']
});
```

---
# Datastore ORM

## No more messing with the `db`

```javascript
this.get('users', function(schema, request) {
  // schema is the new db
  return schema.users.all();
});

this.get('users/:id', function({ db }, request) {
  // but db is still there !
});
```





---
class: center, middle

# Upgrading


<img src="/images/Futurama-Fry.jpg">

---

# Upgrading /2

--

## New `/mirage` directory

--

## Dasherized file names

--

## All properties are camelCased
`db.blog_posts` to `db.blogPosts`

--

## One Model per Factory

--

## At least one Serializer



---
class: center, middle
# Protips

---
# Protips

## Logging

### Remember: no XHR request is happening

```javascript
// inside mirage/config.js
this.pretender.handledRequest = function(verb, path, req) {
  console.debug(`${verb} ${path} STATUS: ${req.status}`);
  console.debug(req.responseText);
};

// or inside a specific test
server.logging = true;
```

---
# Protips

## You can stub directly in the tests if needed
```javascript
// acceptance-test.js
import { Response } from 'ember-cli-mirage';

test('my test', function(assert) {
  // ...
  server.put('/users/:id', function() {
    return new Response(422, {
      errors: ['name already taken']
    });
  });
});
```

---
# Protips

## Complicated stubbing

### Avoid creating endpoints for very specific cases

### In some cases a fixture paylod served from a stubbed enpoint is good

### You can also test behaviour (assert some endpoints are NOT called in a test)

```javascript
test('posts route uses sideloaded user', function(assert) {
  let done = assert.async;
  this.get('/users', function() {
    assert.ok(false, 'users?ids=.. should not be called')
    done();
  });
  visit('/posts');
});
```




---
# Future

--
## Improve ORM

### Problems with one way relationships, many to many, reflexive, one to one

--
## Auto-infer models from Ember Data

--
## Make mirage work in node (real XHR requests!)

--
## More Docs/Docs overhaul

---
# How can I help?

--
## Triage Issues

--
## Slack channel #ec-mirage

--
## Docs

--
## Sponsor feature development



---
class: center, middle

# Thanks!

## [@ghedamat](https://twitter.com/ghedamat)

### Memes: @heycarsten

### @samselikoff for all the work

### @tehviking for a great talk about this topic


