import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import { RedisClient } from "../config";
import { verifyAuthToken } from "../middlewares";
import { CommentService } from "../services";

export class CommentController {
  private commentService: CommentService;
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
    this.commentService = new CommentService(prismaClient, redisClient);
    this.redisClient = redisClient;
  }

  routes(): Router {
    const router = Router();

    router.get("/", verifyAuthToken(), this.getComments.bind(this));
    router.get("/:id", verifyAuthToken(), this.getCommentById.bind(this));
    router.post("/", verifyAuthToken(), this.createComment.bind(this));
    router.put("/:id", verifyAuthToken(), this.updateComment.bind(this));
    router.delete("/:id", verifyAuthToken(), this.deleteComment.bind(this));

    router.get(
      "/:id/mentions",
      verifyAuthToken(),
      this.getCommentMentions.bind(this)
    );

    return router;
  }

  public async getComments(req: Request, res: Response): Promise<void> {
    const comments = await this.commentService.getComments();
    res.json(comments);
  }

  async getCommentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const comment = await this.commentService.getCommentById(id);

    if (!comment) {
      res.status(404).json({
        message: "Comment not found",
      });
      return;
    }

    res.json(comment);
  }

  async createComment(req: Request, res: Response): Promise<void> {
    const commentData = req.body;

    const createdComment = await this.commentService.createComment(commentData);
    res.json(createdComment);
  }

  async updateComment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const commentData = req.body;

    const updatedComment = await this.commentService.updateComment(
      id,
      commentData
    );
    res.json(updatedComment);
  }

  async deleteComment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const deletedComment = await this.commentService.deleteComment(id);
    res.json(deletedComment);
  }

  async getCommentMentions(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const mentions = await this.commentService.getCommentMentions(id);
    res.json(mentions);
  }
}
