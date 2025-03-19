const express = require("express");
const router = express.Router();
const contestController = require("../controllers/contestControllers");

router.post("/get-savedcontests", contestController.getSavedContests);
router.get("/get-solutions/:id", contestController.getSolutions);
router.get("/get-contests", contestController.getContests);

module.exports = router;
