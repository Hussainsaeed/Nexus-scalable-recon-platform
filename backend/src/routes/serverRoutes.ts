import express, {
    Request,
    Response,
  } from "express";
  
  import Server from "../models/Server.model";
  
  import protect from "../middleware/authMiddleware";

  import adminOnly from "../middleware/adminMiddleware";
  
  const router = express.Router();
  
  // ======================================
  // GET ALL SERVERS (PROTECTED)
  // ======================================
  
  router.get(
    "/",
    protect,
  
    async (req: Request, res: Response) => {
      try {
        const servers = await Server.find();
  
        // ======================================
        // DEBUG LOG
        // ======================================
  
        console.log("SERVERS DATA:");
        console.log(servers);
  
        return res.status(200).json({
          success: true,
          count: servers.length,
          data: servers,
        });
  
      } catch (error) {
        console.error(error);
  
        return res.status(500).json({
          success: false,
          error: "Failed to fetch servers",
        });
      }
    }
  );
  
  // ======================================
  // CREATE SERVER (PROTECTED)
  // ======================================
  
  router.post(
    "/",
    protect,
    adminOnly,
  
    async (req: Request, res: Response) => {
      try {
        const { name, ip } = req.body;
  
        // ======================================
        // VALIDATION
        // ======================================
  
        if (!name) {
          return res.status(400).json({
            success: false,
            error: "Server name is required",
          });
        }
  
        // ======================================
        // CREATE SERVER
        // ======================================
  
        const newServer = new Server({
          name,
          ip: ip || "45.249.79.52",
        });
  
        await newServer.save();
  
        console.log("NEW SERVER CREATED:");
        console.log(newServer);
  
        return res.status(201).json({
          success: true,
          message: "Server created successfully",
          data: newServer,
        });
  
      } catch (error) {
        console.error(error);
  
        return res.status(500).json({
          success: false,
          error: "Failed to save server",
        });
      }
    }
  );
  
  export default router;