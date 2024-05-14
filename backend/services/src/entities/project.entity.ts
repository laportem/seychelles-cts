import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ProjectType, ProjectStatus } from "../enums/project.enum";
import { Recipient, IntImplementor } from "../enums/shared.enum";
import { ProgrammeEntity } from "./programme.entity";
import { ActivityEntity } from "./activity.entity";
import { Sector } from "../enums/sector.enum";

@Entity("project")
export class ProjectEntity {
  @PrimaryColumn()
  projectId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: "enum", enum: ProjectType })
  type: string;

  @Column({ nullable: true })
  additionalProjectNumber: string;

  @Column({ type: "enum", enum: ProjectStatus })
  projectStatus: string;

  @Column()
  startYear: number;

  @Column()
  endYear: number;

  @Column({ nullable: true })
  expectedTimeFrame: number;

  @Column("varchar", { array: true, nullable: false })
  recipientEntities: Recipient[];

  @Column("varchar", { array: true, nullable: false })
  internationalImplementingEntities: IntImplementor[];

  @Column({ type: 'jsonb', nullable: true })
  documents: any;

  @Column()
  comment: string;

	@Column("varchar", { array: true, nullable: true })
  sector: Sector;

  @Column({ type: "ltree" })
  path: string;

  @ManyToOne(() => ProgrammeEntity, (programme) => programme.projects, {
    nullable: true,
  })
  @JoinColumn([{ name: "programmeId", referencedColumnName: "programmeId" }])
  programme: ProgrammeEntity;

	activities?: ActivityEntity[];

	@Column({ type: "boolean", default: false })
	validated: boolean;
}
