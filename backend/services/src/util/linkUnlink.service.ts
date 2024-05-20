import { Injectable } from "@nestjs/common";
import { ActionEntity } from "../entities/action.entity";
import { ActivityEntity } from "../entities/activity.entity";
import { LogEntity } from "../entities/log.entity";
import { ProgrammeEntity } from "../entities/programme.entity";
import { ProjectEntity } from "../entities/project.entity";
import { User } from "../entities/user.entity";
import { LogEventType, EntityType } from "../enums/shared.enum";
import { EntityManager } from "typeorm";
import { LinkActivitiesDto } from "src/dtos/link.activities.dto";
import { UnlinkActivitiesDto } from "src/dtos/unlink.activities.dto";
import { Sector } from "src/enums/sector.enum";
import { SupportEntity } from "src/entities/support.entity";
import { AchievementEntity } from "src/entities/achievement.entity";

@Injectable()
export class LinkUnlinkService {

	async linkProgrammesToAction(
		action: ActionEntity,
		programmes: ProgrammeEntity[],
		payload: any,
		user: User,
		entityManager: EntityManager
	) {
		await entityManager
			.transaction(async (em) => {
				for (const programme of programmes) {
					programme.action = action;
					programme.path = action.actionId;
					programme.sector = action.sector;

					const linkedProgramme = await em.save<ProgrammeEntity>(programme);

					if (linkedProgramme) {

						if (programme.activities && programme.activities.length > 0) {
							const activities = [];
							// update each activity's path that are directly linked to the programme
							for (const activity of programme.activities) {
								activity.sector = action.sector;
								activity.path = this.addActionToActivityPath(activity.path, action.actionId)
								activities.push(activity);
							}
							await em.save<ActivityEntity>(activities)
						}
						if (programme.projects && programme.projects.length > 0) {
							const projects = [];
							for (const project of programme.projects) {
								// update project's path
								project.sector = action.sector;
								project.path = this.addActionToProjectPath(project.path, action.actionId);
								projects.push(project);

								// update each activity's path that are linked to the project
								if (project.activities && project.activities.length > 0) {
									const activities = [];
									for (const activity of project.activities) {
										activity.sector = action.sector;
										activity.path = this.addActionToActivityPath(activity.path, action.actionId);
										activities.push(activity);
									}
									await em.save<ActivityEntity>(activities)
								}

							}
							await em.save<ProjectEntity>(projects)
						}
						await em.save<LogEntity>(
							this.buildLogEntity(
								LogEventType.LINKED_TO_ACTION,
								EntityType.PROGRAMME,
								programme.programmeId,
								user.id,
								payload
							)
						);
					}
				}
			});
	}

	async unlinkProgrammesFromAction(
		programme: ProgrammeEntity,
		payload: any,
		user: User,
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[]
	) {
		await entityManager
			.transaction(async (em) => {

				programme.action = null;
				programme.path = "";
				programme.sector = null;

				const unlinkedProgramme = await em.save<ProgrammeEntity>(programme);

				if (unlinkedProgramme) {
					if (programme.activities && programme.activities.length > 0) {
						// update each activity's path that are directly linked to the programme
						const activities = [];
						for (const activity of programme.activities) {
							const parts = activity.path.split(".");
							activity.path = ["_", parts[1], parts[2]].join(".");
							activity.sector = null;
							activities.push(activity);
						}
						await em.save<ActivityEntity>(activities)
					}
					if (programme.projects && programme.projects.length > 0) {
						const projects = [];
						const activities = [];
						for (const project of programme.projects) {
							// update project's path
							const parts = project.path.split(".");
							// const partOne = parts[0].replace("_", action.actionId);
							project.path = ["_", parts[1]].join(".");
							project.sector = null;
							projects.push(project);

							// update each activity's path that are linked to the project
							if (project.activities && project.activities.length > 0) {
								for (const activity of project.activities) {
									const parts = activity.path.split(".");
									// const partOne = parts[0].replace("_", action.actionId);
									activity.path = ["_", parts[1], parts[2]].join(".");
									activity.sector = null;
									activities.push(activity);
								}
							}

						}
						await em.save<ProjectEntity>(projects)
						await em.save<ActivityEntity>(activities)
					}
					await this.deleteAchievements(achievementsToRemove, em);
					await em.save<LogEntity>(
						this.buildLogEntity(
							LogEventType.UNLINKED_FROM_ACTION,
							EntityType.PROGRAMME,
							programme.programmeId,
							user.id,
							payload
						)
					);
				}
			});
	}

	async updateActionChildrenSector(
		children: {
			haveChildren: boolean; 
			programmeChildren: ProgrammeEntity[]; 
			projectChildren: ProjectEntity[]; 
			activityChildren: ActivityEntity[]},
		newSector: Sector,
		entityManager: EntityManager
	) {
		await entityManager
			.transaction(async (em) => {

				const programmes = []
				for (const programme of children.programmeChildren) {
					programme.sector = newSector;
					programmes.push(programme)
				}

				await em.save<ProgrammeEntity>(programmes);

				const projects = []
				for (const project of children.projectChildren) {
					project.sector = newSector;
					projects.push(project)
				}

				await em.save<ProjectEntity>(projects);

				const activities = []
				for (const activity of children.activityChildren) {
					activity.sector = newSector;
					activities.push(activity)

					const supports = []
					for (const support of activity.support) {
						support.sector = newSector;
						supports.push(support)
					}

					await em.save<SupportEntity>(supports);
				}

				await em.save<ActivityEntity>(activities);
				
			});
	}

	async linkProjectsToProgramme(programme: ProgrammeEntity, projects: ProjectEntity[], payload: any, user: User, entityManager: EntityManager) {
		await entityManager
			.transaction(async (em) => {

				for (const project of projects) {
					project.programme = programme;
					project.path = this.addProgrammeToProjectPath(project.path, programme.programmeId, programme.path);
					project.sector = programme.sector;

					const linkedProject = await em.save<ProjectEntity>(project);

					if (linkedProject) {
						const activities = [];
						const supports = [];
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {
										support.sector = programme.sector;
										supports.push(support);
									});
								}
								activity.path = this.addProgrammeToActivityPath(activity.path, programme.programmeId, programme.path);
								activity.sector = programme.sector;
								activities.push(activity);
							}
							await em.save<SupportEntity>(supports);
							await em.save<ActivityEntity>(activities);
						}

						await em.save<LogEntity>(
							this.buildLogEntity(
								LogEventType.LINKED_TO_PROGRAMME,
								EntityType.PROJECT,
								project.projectId,
								user.id,
								payload
							)
						);
					}
				}
			});
	}

	async unlinkProjectsFromProgramme(
		projects: ProjectEntity[], 
		payload: any, 
		user: User, 
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[]
	) {
		await entityManager
			.transaction(async (em) => {
				for (const project of projects) {
					project.programme = null;
					project.path = `_._`;
					project.sector = null;

					const unLinkedProgramme = await em.save<ProjectEntity>(project);

					if (unLinkedProgramme) {
						const activities = [];
						const supports = [];
						if (project.activities && project.activities.length > 0) {
							for (const activity of project.activities) {
								if (activity.support && activity.support.length > 0) {
									activity.support.forEach((support) => {
										support.sector = null;
										supports.push(support);
									});
								}
								activity.path = `_._.${project.projectId}`
								activity.sector = null;
								activities.push(activity);
							}
							await em.save<SupportEntity>(supports);
							await em.save<ActivityEntity>(activities);
						}
						await this.deleteAchievements(achievementsToRemove, em);
						
						await em.save<LogEntity>(
							this.buildLogEntity(
								LogEventType.UNLINKED_FROM_PROGRAMME,
								EntityType.PROJECT,
								project.projectId,
								user.id,
								payload
							)
						);
					}
				}
			});
	}

	async linkActivitiesToParent(
		parentEntity: any,
		activities: ActivityEntity[],
		linkActivitiesDto: LinkActivitiesDto,
		user: User,
		entityManager: EntityManager
	) {
		const act = await entityManager
			.transaction(async (em) => {
				for (const activity of activities) {
					let logEventType;
					switch (linkActivitiesDto.parentType) {
						case EntityType.ACTION: {
							activity.path = `${linkActivitiesDto.parentId}._._`;
							logEventType = LogEventType.LINKED_TO_ACTION;
							activity.sector = parentEntity?.sector;
							break;
						}
						case EntityType.PROGRAMME: {
							activity.path = parentEntity.path && parentEntity.path.trim() !== ''  ? `${parentEntity.path}.${linkActivitiesDto.parentId}._` : `_.${linkActivitiesDto.parentId}._`;
							logEventType = LogEventType.LINKED_TO_PROGRAMME;
							activity.sector = parentEntity?.sector;
							break;
						}
						case EntityType.PROJECT: {
							activity.path = parentEntity.path && parentEntity.path.trim() !== '' ? `${parentEntity.path}.${linkActivitiesDto.parentId}` : `_._.${linkActivitiesDto.parentId}`;
							logEventType = LogEventType.LINKED_TO_PROJECT;
							activity.sector = parentEntity?.sector;
							break;
						}
					}
					activity.parentId = linkActivitiesDto.parentId;
					activity.parentType = linkActivitiesDto.parentType;

					const linkedActivity = await em.save<ActivityEntity>(activity);

					if (linkedActivity) {
						const supports = [];
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sector = linkedActivity.sector;
								supports.push(support);
							});
						}

						await em.save<SupportEntity>(supports);
						await em.save<LogEntity>(
							this.buildLogEntity(
								logEventType,
								EntityType.ACTIVITY,
								activity.activityId,
								user.id,
								linkActivitiesDto.parentId
							)
						);
					}
				}
			});
	}

	async unlinkActivitiesFromParent(
		activities: ActivityEntity[],
		unlinkActivitiesDto: UnlinkActivitiesDto,
		user: User,
		entityManager: EntityManager,
		achievementsToRemove: AchievementEntity[] 
	) {
		const act = await entityManager
			.transaction(async (em) => {
				for (const activity of activities) {
					let logEventType;
					switch (activity.parentType) {
						case EntityType.ACTION: {
							logEventType = LogEventType.UNLINKED_FROM_ACTION;
							break;
						}
						case EntityType.PROGRAMME: {
							logEventType = LogEventType.UNLINKED_FROM_PROGRAMME;
							break;
						}
						case EntityType.PROJECT: {
							logEventType = LogEventType.UNLINKED_FROM_PROJECT;
							break;
						}
					}
					activity.parentId = null;
					activity.parentType = null;
					activity.path = '_._._';
					activity.sector = null;

					const unlinkedActivity = await em.save<ActivityEntity>(activity);

					if (unlinkedActivity) {
						const supports = [];
						if (activity.support && activity.support.length > 0) {
							activity.support.forEach((support) => {
								support.sector = null;
								supports.push(support);
							});
						}
						await em.save<SupportEntity>(supports)
						await em.remove<AchievementEntity>(achievementsToRemove);
						await em.save<LogEntity>(
							this.buildLogEntity(
								logEventType,
								EntityType.ACTIVITY,
								activity.activityId,
								user.id,
								unlinkActivitiesDto
							)
						);
					}
				}
			});

	}

	// Adding here to avoid circular dependencies
	async deleteAchievements(achievements: any[], em: EntityManager) {
    const queryBuilder = em.createQueryBuilder()
        .delete()
        .from(AchievementEntity);

    for (const achievement of achievements) {
        queryBuilder.orWhere('"kpiId" = :kpiId AND "activityId" = :activityId', { kpiId: achievement.kpiId, activityId: achievement.activityId });
    }

		const query = queryBuilder.getQueryAndParameters();
		console.log("Generated SQL Query:", query[0]);
		console.log("Query Parameters:", query[1]);

    const result = await queryBuilder.execute();
    return result;
}

	addActionToActivityPath(currentActivityPath: string, actionId: string) {
		const parts = currentActivityPath.split(".");
		parts[0] = actionId;
		return [parts[0], parts[1], parts[2]].join(".");
	}

	addActionToProjectPath(currentProjectPath: string, actionId: string) {
		const parts = currentProjectPath.split(".");
		parts[0] = actionId;
		return [parts[0], parts[1]].join(".");
	}

	addProgrammeToActivityPath(currentActivityPath: string, programmeId: string, currentProgrammePath: string) {
		const parts = currentActivityPath.split(".");
		parts[0] = currentProgrammePath && currentProgrammePath.trim() !== '' ? currentProgrammePath : "_";
		parts[1] = programmeId;
		return [parts[0], parts[1], parts[2]].join(".");
	}

	addProgrammeToProjectPath(currentProjectPath: string, programmeId: string, currentProgrammePath: string) {
		const parts = currentProjectPath.split(".");
		parts[0] = currentProgrammePath && currentProgrammePath.trim() !== '' ? currentProgrammePath : "_";
		parts[1] = programmeId;
		return [parts[0], parts[1]].join(".");
	}

	buildLogEntity = (
		eventType: LogEventType,
		recordType: EntityType,
		recordId: any,
		userId: number,
		data: any) => {
		const log = new LogEntity();
		log.eventType = eventType;
		log.recordType = recordType;
		log.recordId = recordId;
		log.userId = userId;
		log.logData = data;
		return log;
	}
}