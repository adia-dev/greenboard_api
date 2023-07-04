import { Request, Response, Router } from "express";
import { ActivityService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";

export class ActivityController {
    private activityService: ActivityService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.activityService = new ActivityService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }

    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getActivitys.bind(this));
        router.get("/:id", verifyAuthToken(), this.getActivityById.bind(this));
        router.post("/", verifyAuthToken(), this.createActivity.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateActivity.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteActivity.bind(this));

        return router;
    }

    public async getActivitys(req: Request, res: Response): Promise<void> {
        const activitys = await this.activityService.getActivitys();
        res.json(activitys);
    }

    async getActivityById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const activity = await this.activityService.getActivityById(id);

        if (!activity) {
            res.status(404).json({
                message: "Activity not found",
            });
            return;
        }

        res.json(activity);
    }

    async createActivity(req: Request, res: Response): Promise<void> {
        const activityData = req.body;

        try {
            const createdActivity = await this.activityService.createActivity(activityData);
            res.json(createdActivity);
        } catch (error) {
            res.status(500).json({
                message: "Failed to create activity",
                error: error.message,
            });
        }
    }

    async updateActivity(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const activityData = req.body;

        try {
            const updatedActivity = await this.activityService.updateActivity(id, activityData);
            res.json(updatedActivity);
        } catch (error) {
            res.status(500).json({
                message: "Failed to update activity",
                error: error.message,
            });
        }
    }

    async deleteActivity(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const deletedActivity = await this.activityService.deleteActivity(id);
            res.json(deletedActivity);
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete activity",
                error: error.message,
            });
        }
    }
}
