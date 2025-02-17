import { Index, ViewColumn, ViewEntity } from "typeorm"

export const projectViewSQL = `
SELECT 
    prj."projectId" AS id,
    ARRAY_AGG(DISTINCT fullact."techTypes") FILTER (WHERE fullact."techTypes" IS NOT NULL) AS "technologyTypes",
	ARRAY_AGG(DISTINCT fullact."ghgsAffected") FILTER (WHERE fullact."ghgsAffected" IS NOT NULL) AS "ghgsAffected",
	ARRAY_AGG(DISTINCT fullact."meansOfImplementation") FILTER (WHERE fullact."meansOfImplementation" IS NOT NULL) AS "meansOfImplementation",
	CUSTOM_ARRAY_AGG(fullact."recipientEntities") FILTER (WHERE fullact."recipientEntities" IS NOT NULL) AS "recipientEntities",
    CUSTOM_ARRAY_AGG(fullact."internationalImplementingEntities") FILTER (WHERE fullact."internationalImplementingEntities" IS NOT NULL) AS "internationalImplementingEntities",
    SUM(fullact."requiredAmount") AS "estimatedAmount",
    SUM(fullact."receivedAmount") AS "receivedAmount",
    SUM(fullact."requiredAmountDomestic") AS "estimatedAmountDomestic",
    SUM(fullact."receivedAmountDomestic") AS "receivedAmountDomestic",
    SUM(fullact."achievedGHGReduction") AS "achievedGHGReduction",
    SUM(fullact."expectedGHGReduction") AS "expectedGHGReduction"
FROM 
    project prj
LEFT JOIN (
    SELECT 
        act."activityId",
        act."parentId" AS "projectId",
        act."technologyType"::character varying AS "techTypes",
		act."ghgsAffected"::character varying AS "ghgsAffected",
        act."meansOfImplementation" AS "meansOfImplementation",
        act."achievedGHGReduction" AS "achievedGHGReduction",
        act."expectedGHGReduction" AS "expectedGHGReduction",
		act."recipientEntities" AS "recipientEntities",
        act."internationalImplementingEntity" AS "internationalImplementingEntities",
        sup."requiredAmount",
        sup."receivedAmount",
        sup."requiredAmountDomestic",
        sup."receivedAmountDomestic"
    FROM 
        activity act
    LEFT JOIN (
        SELECT 
            "activityId",
            SUM("requiredAmount") AS "requiredAmount",
            SUM("receivedAmount") AS "receivedAmount",
            SUM("requiredAmountDomestic") AS "requiredAmountDomestic",
            SUM("receivedAmountDomestic") AS "receivedAmountDomestic"
        FROM 
            support
        GROUP BY 
            "activityId"
        ) sup ON act."activityId" = sup."activityId"
    ) fullact ON prj."projectId" = fullact."projectId"
GROUP BY 
    prj."projectId";`

@ViewEntity({
	name: 'project_view_entity',
	materialized: true,
	expression: projectViewSQL,
	synchronize: false,
})
@Index("idx_project_view_entity_id")
export class ProjectViewEntity {

	@ViewColumn()
	id: string;

	// From Activity

	@ViewColumn()
	meansOfImplementation: string[]

    @ViewColumn()
    recipientEntities: string[];

    @ViewColumn()
    internationalImplementingEntities: string[];

	@ViewColumn()
	technologyTypes: string[]

    @ViewColumn()
	ghgsAffected: string[]

	@ViewColumn()
	achievedGHGReduction: number;

	@ViewColumn()
	expectedGHGReduction: number;

	// From Support

	@ViewColumn()
	estimatedAmount: number

	@ViewColumn()
	receivedAmount: number

	@ViewColumn()
	estimatedAmountDomestic: number

	@ViewColumn()
	receivedAmountDomestic: number
}