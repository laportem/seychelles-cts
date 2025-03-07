import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";
import { SubSector } from "../enums/shared.enum";
import { Sector } from "../enums/sector.enum";
import { NatImplementor } from "../enums/shared.enum";
import { ActionEntity } from "./action.entity";
import { ProjectEntity } from "./project.entity";
import { ActivityEntity } from "./activity.entity";
import { ProgrammeStatus } from "../enums/programme-status.enum";
import { KpiEntity } from "./kpi.entity";
import { ActionType } from "../enums/action.enum";

@Entity("programme")
export class ProgrammeEntity {
  @PrimaryColumn()
  programmeId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  objective: string;

	@Column({ type: "enum", enum: Sector, nullable: true })
  sector: Sector;

  // @Column({ type: "enum", enum: ActionType,nullable: false })
  // type: string;

  @Column("varchar", { array: true, nullable: false })
  affectedSubSector: SubSector[];

  @Column()
  startYear: number;

  @Column("varchar", { array: true, nullable: false })
  natImplementor: NatImplementor[];

  // @Column({nullable: false, type: 'double precision' })
  // investment: number;

	@Column({ type: "enum", enum: ProgrammeStatus })
  programmeStatus: string;

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @Column({ nullable: true })
  comments: string;

  @Column({ type: "ltree" })
  path: string;

  @ManyToOne(() => ActionEntity, (action) => action.programmes, {
    nullable: true,
  })
  @JoinColumn([{ name: "actionId", referencedColumnName: "actionId" }])
  action: ActionEntity;

  @OneToMany(() => ProjectEntity, (projectEntity) => projectEntity.programme)
  projects?: ProjectEntity[];

	activities?: ActivityEntity[];

	kpis?: KpiEntity[];

  @Column({ type: "boolean", default: false })
	validated: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdTime: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	updatedTime: Date;
}
