<h1>Nexa ( Connect. Create. Belong. )</h1>

## 1. Initialization of Project

### Started my Project with
```Javascript
  npm init
```
It creates package.json file which acts as the Index page of the projects , it contains dependencies and scripts used.

### installed Express to create our server 
```
  npm i express
```
Which brings us node_modules folder and package-lock-json file.
1. **node_modules** : it has express module and all the dependecies required for the express module.
1. **package-lock.json** : it contains the information about the exact versions if each dependencies used in the project.

### creating server 
```Javascript
  //acquiring express for our project
  const express = require('express');

  //our server app
  const app = express();

  //accepting request
  app.use("/",(req,res)=>{
      res.send("Hello from the Server!!")
  })
  //server listens at port 300
  app.listen(3000,()=>{
      console.log("Server Started at Port 3000");
  })
```

