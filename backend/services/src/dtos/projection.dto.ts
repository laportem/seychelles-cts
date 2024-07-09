import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, isString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectionProperties {
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  withoutMeasures: number;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  withMeasures: number;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  withAdditionalMeasures: number;
}

export class ProjectionFuelCombustionActivities {
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    energyIndustries: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    manufacturingIndustriesConstruction: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    transport: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    otherSectors: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    nonSpecified: ProjectionProperties;
}
  
export class ProjectionFugitiveEmissionsFromFuels {
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    solidFuels: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    oilNaturalGas: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    otherEmissionsEnergyProduction: ProjectionProperties;
}
  
export class ProjectionCarbonDioxideTransportStorage {
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    solidFuels: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    oilNaturalGas: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    otherEmissionsEnergyProduction: ProjectionProperties;
}
  
export class ProjectionEnergyEmissions {
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionFuelCombustionActivities)
    fuelCombustionActivities: ProjectionFuelCombustionActivities;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionFugitiveEmissionsFromFuels)
    fugitiveEmissionsFromFuels: ProjectionFugitiveEmissionsFromFuels;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionCarbonDioxideTransportStorage)
    carbonDioxideTransportStorage: ProjectionCarbonDioxideTransportStorage;
}

export class ProjectionIndustrialProcessesProductUse {
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    mineralIndustry: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    chemicalIndustry: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    metalIndustry: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    nonEnergyProductsFuelsSolventUse: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    electronicsIndustry: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    productUsesSubstOzoneDepletingSubs: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    otherProductManufactureUse: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    other: ProjectionProperties;
}

export class ProjectionAgricultureForestryOtherLandUse {
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => ProjectionProperties)
  livestock: ProjectionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => ProjectionProperties)
  land: ProjectionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => ProjectionProperties)
  aggregateNonCo2SourcesLand: ProjectionProperties;

  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => ProjectionProperties)
  other: ProjectionProperties;
}

export class ProjectionWaste {
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    solidWasteDisposal: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    biologicalTreatmentSolidWaste: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    incinerationOpenBurningWaste: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    wastewaterTreatmentDischarge: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    other: ProjectionProperties;
}

export class ProjectionOther {
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    indirectN2oEmissions: ProjectionProperties;
  
    @IsNotEmpty()
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => ProjectionProperties)
    other: ProjectionProperties;
}

export class ProjectionDto {
    @ApiProperty()
    @IsNotEmpty()
    year: string;
  
    @ApiProperty()
    @IsNotEmpty()
    projectionType: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => ProjectionEnergyEmissions)
    energyEmissions: ProjectionEnergyEmissions;
  
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => ProjectionIndustrialProcessesProductUse)
    industrialProcessesProductUse: ProjectionIndustrialProcessesProductUse;
  
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => ProjectionAgricultureForestryOtherLandUse)
    agricultureForestryOtherLandUse: ProjectionAgricultureForestryOtherLandUse;
  
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => ProjectionWaste)
    waste: ProjectionWaste;
  
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => ProjectionOther)
    other: ProjectionOther;
  
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => ProjectionProperties)
    totalCo2WithoutLand: ProjectionProperties;
  
    @ApiProperty()
    @IsNotEmpty()
    @Type(() => ProjectionProperties)
    totalCo2WithLand: ProjectionProperties;
  
    @ApiPropertyOptional()
    @IsString()
    @IsNotEmpty()
    state: string;
}
