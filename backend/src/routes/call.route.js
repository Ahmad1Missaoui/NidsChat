import express from "express";
import { 
    getCallHistory, 
    createCall, 
    updateCallStatus, 
    deleteCall, 
    getMissedCallsCount 
} from "../controllers/call.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/history", protectRoute, getCallHistory);
router.get("/missed-count", protectRoute, getMissedCallsCount);
router.post("/create", protectRoute, createCall);
router.put("/:callId/status", protectRoute, updateCallStatus);
router.delete("/:callId", protectRoute, deleteCall);

export default router;
