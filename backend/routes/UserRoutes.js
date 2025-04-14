
const express = requiere('express');
const userRouter = express.Router();



userRouter.get("/user/:id", (req, res)=> {
    res.send(req.params);
    });
    
module.exports = userRouter;


