import { Index, ViewColumn, ViewEntity } from "typeorm"

export const reportFiveViewSQL = `
SELECT 'action' AS source, * FROM (
	SELECT "actionId", NULL as "programmeId", NULL as "projectId", title as "titleOfAction", NULL as "titleOfProgramme", NULL as "titleOfProject",
description, objective, "instrumentType"::text, status::text, sector::text, ave."ghgsAffected", "startYear" , NULL as "implementingEntities", 
ave."achievedGHGReduction", ave."expectedGHGReduction"
	FROM action act join action_view_entity ave on ave.id = act."actionId"
	WHERE validated = true
) act

UNION ALL

SELECT 'programme' AS source, * FROM (
	SELECT "actionId", "programmeId", NULL as "projectId", NULL as "titleOfAction", title as "titleOfProgramme", NULL as "titleOfProject",
description, objective, NULL as "instrumentType", "programmeStatus"::text, sector::text, pve."ghgsAffected", "startYear" , "natImplementor"::text as "implementingEntities", 
pve."achievedGHGReduction", pve."expectedGHGReduction"
	FROM programme prog join programme_view_entity pve on pve.id = prog."programmeId"
	WHERE validated = true
) prog

UNION ALL

SELECT 'project' AS source, * FROM (
	SELECT pro."actionId", prj."programmeId", "projectId", NULL as "titleOfAction", NULL as "titleOfProgramme", prj.title as "titleOfProject",
prj.description, objective, NULL as "instrumentType", "projectStatus"::text, prj.sector::text, prve."ghgsAffected", 
prj."startYear" , "internationalImplementingEntities"::text as "implementingEntities", 
prve."achievedGHGReduction", prve."expectedGHGReduction"
	FROM project prj 
join programme pro on pro."programmeId" = prj."programmeId"
join project_view_entity prve on prve.id = prj."projectId"
	WHERE prj.validated = true
) proj;`

@ViewEntity({
	name: 'report_five_view_entity',
	materialized: true,
	expression: reportFiveViewSQL,
	synchronize: false,
})
export class ReportFiveViewEntity {

	@ViewColumn()
	source: string;

	@ViewColumn()
	actionId: string;

	@ViewColumn()
	programmeId: string;

	@ViewColumn()
	projectId: string;

	@ViewColumn()
	titleOfAction: string;

	@ViewColumn()
	titleOfProgramme: string;

	@ViewColumn()
	titleOfProject: string;

	@ViewColumn()
	description: string;

	@ViewColumn()
	objective: string;

	@ViewColumn()
	instrumentType: string;

	@ViewColumn()
	status: string;

	@ViewColumn()
	sector: string;

	@ViewColumn()
	ghgsAffected: string;

	@ViewColumn()
	startYear: string;

	@ViewColumn()
	implementingEntities: string;

	@ViewColumn()
	achievedGHGReduction: string;

	@ViewColumn()
	expectedGHGReduction: string;

}