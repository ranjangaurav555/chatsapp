const express =
    require("express");

const router =
    express.Router();

const upload =
    require("../middleware/upload");

const mediaController =
    require("../controllers/mediaController");

const httpAuthentication =
    require("../httpAuth");


// ==========================================
// UPLOAD MEDIA
// ==========================================

router.post(
    "/upload",
    httpAuthentication,
    upload.single("media"),
    mediaController.uploadMedia
);


module.exports =
    router;