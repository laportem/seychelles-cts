import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { instanceToPlain, plainToClass } from "class-transformer";
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HelperService } from '../util/helpers.service';
import { EmissionDto } from '../dtos/emission.dto';
import { User } from '../entities/user.entity';
import { Role } from '../casl/role.enum';
import { BaselineDto } from 'src/dtos/baseline.dto';
import { ProjectionEntity } from 'src/entities/projection.entity';
import { ProjectionDto } from 'src/dtos/projection.dto';

@Injectable()
export class GhgProjectionService {

    constructor(
        private logger: Logger,
        @InjectEntityManager() private entityManager: EntityManager,
        @InjectRepository(ProjectionEntity) private projectionRepo: Repository<ProjectionEntity>,
        private helperService: HelperService,
    ) { };

    async create(projectionDto: ProjectionDto, user: User) {
        return projectionDto;
    }

    async getProjectionByYear(projectionType: string, projectionYear: string) {
        // return await this.emissionRepo.find({
        //     where: {
        //         projectionType: projectionType,
        //         projectionYear: projectionYear
        //     },
        // });
        return [projectionType, projectionYear]
    }

    async getProjectionSummary(projectionType: string) {
        // const emissions = await this.emissionRepo
        //     .createQueryBuilder("emission_entity")
        //     .select(["year", "state"])
        //     .getRawMany();
            
        // return emissions;

        return projectionType;
    }

    async setBaselineYear(baselineDto: BaselineDto, user: User) {
        // const emissions = await this.emissionRepo
        //     .createQueryBuilder("emission_entity")
        //     .select(["year", "state"])
        //     .getRawMany();
            
        // return emissions;

        return baselineDto;
    }

    private toProjection(projectionDto: ProjectionDto): ProjectionEntity {
        const data = instanceToPlain(projectionDto);
        this.logger.verbose("Converted emissionDto to Emission entity", JSON.stringify(data));
        return plainToClass(ProjectionEntity, data);
    }

    private verifyProjectionValues(emissionData: any) {
        const gasTypes = ['co2', 'ch4', 'n2o', 'co2eq'];
        for (let key in emissionData) {
          if (typeof emissionData[key] === 'object') {
            if (!this.verifyProjectionValues(emissionData[key])) {
              return false;
            }
          } else {
            if (gasTypes.includes(key)) {
              if (typeof emissionData[key] === 'string') {
                throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.invalidDataType", []), HttpStatus.BAD_REQUEST);
              }
              if (typeof emissionData[key] === 'number' && emissionData[key] < 0) {
                throw new HttpException(this.helperService.formatReqMessagesString("ghgInventory.negativeValuesNotAllowed", []), HttpStatus.BAD_REQUEST);
              }
            }
      
          }
        }
        return true;
    }
}