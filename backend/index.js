const express = require('express');

 const app = express();
 const port = 3000;

const userRouter = require('./routes/UserRoutes');

 app.get("/first-endpoint", (req, res)=> {
res.send("Hello from the first endpoint!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

  app.use(userRouter);