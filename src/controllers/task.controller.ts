import { Request, Response, Router } from "express";
import { TaskService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";

export class TaskController {
    private taskService: TaskService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.taskService = new TaskService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }

    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getTasks.bind(this));
        router.get("/:id", verifyAuthToken(), this.getTaskById.bind(this));
        router.post("/", verifyAuthToken(), this.createTask.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateTask.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteTask.bind(this));

        // Routes for task attachments
        router.get("/:taskId/attachments", verifyAuthToken(), this.getTaskAttachments.bind(this));
        router.get("/attachments/:id", verifyAuthToken(), this.getTaskAttachmentById.bind(this));
        router.post("/:taskId/attachments", verifyAuthToken(), this.createTaskAttachment.bind(this));
        router.put("/attachments/:id", verifyAuthToken(), this.updateTaskAttachment.bind(this));
        router.delete("/attachments/:id", verifyAuthToken(), this.deleteTaskAttachment.bind(this));

        return router;
    }

    public async getTasks(req: Request, res: Response): Promise<void> {
        const tasks = await this.taskService.getTasks();
        res.json(tasks);
    }

    async getTaskById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const task = await this.taskService.getTaskById(id);

        if (!task) {
            res.status(404).json({
                message: "Task not found",
            });
            return;
        }

        res.json(task);
    }

    async createTask(req: Request, res: Response): Promise<void> {
        const taskData = req.body;

        try {
            const createdTask = await this.taskService.createTask(taskData);
            res.json(createdTask);
        } catch (error) {
            res.status(500).json({
                message: "Failed to create task",
                error: error.message,
            });
        }
    }

    async updateTask(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const taskData = req.body;

        try {
            const updatedTask = await this.taskService.updateTask(id, taskData);
            res.json(updatedTask);
        } catch (error) {
            res.status(500).json({
                message: "Failed to update task",
                error: error.message,
            });
        }
    }

    async deleteTask(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const deletedTask = await this.taskService.deleteTask(id);
            res.json(deletedTask);
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete task",
                error: error.message,
            });
        }
    }

    async getTaskAttachments(req: Request, res: Response): Promise<void> {
        const { taskId } = req.params;
        const attachments = await this.taskService.getTaskAttachments(taskId);
        res.json(attachments);
    }

    async getTaskAttachmentById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const attachment = await this.taskService.getTaskAttachmentById(id);

        if (!attachment) {
            res.status(404).json({
                message: "Task attachment not found",
            });
            return;
        }

        res.json(attachment);
    }

    async createTaskAttachment(req: Request, res: Response): Promise<void> {
        const { taskId } = req.params;
        let attachmentData = req.body;

        try {
            attachmentData.taskId = taskId;
            const createdAttachment = await this.taskService.createTaskAttachment(attachmentData);
            res.json(createdAttachment);
        } catch (error) {
            res.status(500).json({
                message: "Failed to create task attachment",
                error: error.message,
            });
        }
    }

    async updateTaskAttachment(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const attachmentData = req.body;

        try {
            const updatedAttachment = await this.taskService.updateTaskAttachment(id, attachmentData);
            res.json(updatedAttachment);
        } catch (error) {
            res.status(500).json({
                message: "Failed to update task attachment",
                error: error.message,
            });
        }
    }

    async deleteTaskAttachment(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const deletedAttachment = await this.taskService.deleteTaskAttachment(id);
            res.json(deletedAttachment);
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete task attachment",
                error: error.message,
            });
        }
    }
}
