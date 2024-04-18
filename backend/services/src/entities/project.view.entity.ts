import { Index, ViewColumn, ViewEntity } from "typeorm"

export const projectViewSQL = `
SELECT 
    prj."projectId" AS id,
    ARRAY_AGG(DISTINCT fullact."techTypes") AS "technologyTypes",
    ARRAY_AGG(DISTINCT fullact."meansOfImplementation") AS "meansOfImplementation",
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
        act."technologyType" AS "techTypes",
        act."meansOfImplementation" AS "meansOfImplementation",
        act."achievedGHGReduction" AS "achievedGHGReduction",
        act."expectedGHGReduction" AS "expectedGHGReduction",
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
export class ProjectViewEntity {
    @Index()
    @ViewColumn()
    id: number

    // From Activity

    @ViewColumn()
    meansOfImplementation: string[]

    @ViewColumn()
    technologyTypes: string[]

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