# W-ADE
## **W**eb of Things **A**PI **D**evelopment **E**nvironment

Wade is an API development environment for Web of Things that was designed for the [W3C WoT building blocks](https://w3c.github.io/wot-architecture/). 
It is based on [node-wot](https://www.npmjs.com/org/node-wot), the reference implementation of [W3C's Scripting API](https://w3c.github.io/wot-scripting-api/). 
It supports following protocols: HTTP/HTTPS, CoAP/CoAPS, MQTT.
It is an Electron application.

See the related paper **WADE: Timing Performance Benchmarking in Web of Things**.
```
@inproceedings{skks:2020,    
    author          = {Verena Eileen Schlott, Ege Korkan, Sebastian Kaebisch, Sebastian Steinhorst},
    title           = {W-ADE: Timing Performance Benchmarking in Web of Things},
    booktitle       = {International Conference on Web Engineering (ICWE 2020)},
    location        = {Helsinki, Finland},
    year            = {in press},
    month           = {June},
    day             = {9-12},
}
```
---
## What can you do with W-ADE

- Test your [Thing Description](https://w3c.github.io/wot-thing-description/) (TD)
- Send request and interact with your Thing based on its TD
- Save and organize your Thing Descriptions
- Retrieve timing performance benchmarks of your requests
- Spin up a [Virtual Thing_ / _Shadow Thing](https://github.com/tum-esi/shadow-thing) based on your TD

---
## Prerequisites

You need to have node installed. 

---
## How to install the application

(To be able to easily work and develop functionalities in W-ADE, please read the architecture documentation first!)

Step 1: Clone the repository to your local machine.

```
git clone 
```

Step 2: Navigate into the main folder and install all dependencies.

```
cd wade
npm install 
```

Step 3: Build the electron application.

```
npm run electron:build
```

Step 4: Navigate into the folder 'dist_electron' and install the application. After installing it you can start the application on your machine.

---
## How to get started with development / open in dev mode

After cloning the repository and installing all node dependencies (see step 1 & 2) do not build the app (step 3) but run it in development mode instead. 
This allows for hot-reloads and shows you all potential errors.

```
npm run electron:serve
```

_(If you have problems performing this step or run into an error, check [Errors and known problems](#errors\ and\ known\ problems).)_

If you want to add your changes to W-ADE, please fork the repository and create a pull request.

---
## Errors and Known Problems

- If you already downloaded the W-ADE repository earlier and have problems with either installing the node dependencies or building the application. Delete the node_modules folder and install/ build the application again.

- 
  ```
  cd wade 
  rm -r -f node_modules
  npm install 
  npm run electron:build
  ```

- [Install node-aead-crypto to avoid failing dev build and build](https://github.com/tum-esi/wade/issues/9),
   because coap-binding seems to need it might be necessary (it isn't installed
   with current node version because it shouldn't be needed anymore):

  ```
  npm install -f node-aead-crypto
  ```

  After installing node-aead-crypto you should delete the dependency from your package.json, so it isn't added to the wade package on the next commit. Also installing a previous "node" version could solve the problem (but
  comes with other disadvantages).

- The [*Shadow Thing*](https://github.com/tum-esi/shadow-thing) package needs to be installed locally (not just a symlink in ./node_modules/) in order to work in the production build, and it has to be installed manually anyway if you want to make **Virtual Thing** work in WADE. The reason therefore is, that automatic installation of shadow thing fails under windows and so wouldthe installation of WADE if Shadow Thing was added to the package.json.

- Vuex version 3.1.2 leads to build problems -> [Issue 10](https://github.com/tum-esi/wade/issues/10)

---
## Interaction Timing Vocabulary

To be able to add measured timing performance benchmarks to a Thing Description, a vocabulary set that is aligned with the current Thing Description was developed.   
It is called **Interaction Timing Vocabulary**.   
It's schema can be found in '/interaction-timing-vocabulary'.
