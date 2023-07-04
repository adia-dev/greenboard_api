import { PrismaClient, Task, Organization, User, Team } from "@prisma/client";
import { RedisClient } from "../config";

export class OrganizationService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getOrganizationById(id: string): Promise<any> {
        const organization = await this.prismaClient.organization.findUnique({
            where: {
                id
            },
            include: {
                tasks: true,
                projects: {
                    include: {
                        teams: {
                            include: {
                                members: true,
                            }
                        },
                        tasks: true,
                    }
                }
            },
        });
        return organization;
    }

    public async createOrganization(data: any): Promise<Organization> {

        if (data.teams) {
            data.teams = {
                connect: data.teams.map(({ id }: { id: string }) => ({ id }))
            }
        }

        const organization = await this.prismaClient.organization.create({
            data,
        });
        return organization;
    }

    public async updateOrganization(id: string, data: Organization): Promise<Organization> {
        const organization = await this.prismaClient.organization.update({
            where: {
                id
            },
            data,
        });
        return organization;
    }

    public async deleteOrganization(id: string): Promise<Organization> {
        const organization = await this.prismaClient.organization.delete({
            where: {
                id
            },
        });
        return organization;
    }

    public async getOrganizations(): Promise<Organization[]> {
        const organizations = await this.prismaClient.organization.findMany();
        return organizations;
    }

    public async addTasksToOrganization(organizationId: string, tasks: Task[]): Promise<Organization> {
        const organization = await this.prismaClient.organization.update({
            where: {
                id: organizationId,
            },
            data: {
                tasks: {
                    connect: tasks.map((task) => ({ id: task.id })),
                },
            },
            include: {
                tasks: true,
            },
        });
        return organization;
    }

    public async getOrganizationTasks(id: string): Promise<Task[]> {
        const organization = await this.prismaClient.organization.findUnique({
            where: {
                id,
            },
            include: {
                tasks: true,
            },
        });
        return organization.tasks;
    }

    public async addTeamsToOrganization(organizationId: string, teams: Team[]): Promise<Organization> {
        const organization = await this.prismaClient.organization.update({
            where: {
                id: organizationId,
            },
            data: {
                teams: {
                    connect: teams.map((team) => ({ id: team.id })),
                },
            },
            include: {
                teams: true,
            },
        });
        return organization;
    }

    public async getOrganizationTeams(organizationId: string): Promise<Team[]> {
        const organization = await this.prismaClient.organization.findUnique({
            where: {
                id: organizationId,
            },
            include: {
                teams: true,
            },
        });
        return organization.teams;
    }
}
