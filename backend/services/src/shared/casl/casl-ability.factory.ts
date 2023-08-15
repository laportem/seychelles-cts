import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { Action } from "./action.enum";
import { Role } from "./role.enum";
import { EntitySubject } from "../entities/entity.subject";
import { Programme } from "../entities/programme.entity";
import { ProgrammeStage } from "../enum/programme-status.enum";
import { CompanyRole } from "../enum/company.role.enum";
import { Company } from "../entities/company.entity";
import { Stat } from "../dto/stat.dto";
import { ProgrammeCertify } from "../dto/programme.certify";
import { TransferStatus } from "../enum/transform.status.enum";
import { ConfigurationSettings } from "../entities/configuration.settings";
import { Investment } from "../entities/investment.entity";
import { InvestmentStatus } from "../enum/investment.status";
import { NDCAction } from "../entities/ndc.action.entity";
import { ProgrammeDocument } from "../entities/programme.document";
import { ProgrammeDocumentViewEntity } from "../entities/document.view.entity";
import { NDCActionViewEntity } from "../entities/ndc.view.entity";
import { DocumentAction } from "../dto/document.action";

type Subjects = InferSubjects<typeof EntitySubject> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

const unAuthErrorMessage = "This action is unauthorised";

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createAppAbility);
    if (user) {
      if (user.role == Role.Root) {
        can(Action.Manage, "all");
        cannot([Action.Update], Company, {
          companyId: { $ne: user.companyId },
        });
        cannot([Action.Update], User, {
          companyId: { $ne: user.companyId },
        });
      } else if (
        user.role == Role.Admin &&
        (user.companyRole == CompanyRole.GOVERNMENT || user.companyRole == CompanyRole.MINISTRY)
      ) {
        can(Action.Manage, User, { role: { $ne: Role.Root } });
        can([Action.Manage], ConfigurationSettings);
        can([Action.Manage], Company);
        cannot([Action.Update, Action.Delete], User, {
          companyId: { $ne: user.companyId },
        });
        cannot(Action.Update, Company, { companyId: { $ne: user.companyId } });
        if (user.companyRole === CompanyRole.MINISTRY) {
          cannot([Action.Update, Action.Delete, Action.Read], User, {
            companyId: { $ne: user.companyId },
          });
          cannot(Action.Delete, Company, { companyRole: { $eq: user.companyRole } });
          cannot(Action.Delete, Company, { companyId: { $eq: user.companyId } });
        }
      } else if (
        user.role == Role.Admin &&
        user.companyRole != CompanyRole.GOVERNMENT
      ) {
        can(Action.Manage, User, { role: { $ne: Role.Root } });
        can(Action.Read, Company);
        can(Action.Update, Company, { companyId: { $eq: user.companyId } });
        cannot([Action.Update, Action.Delete, Action.Read], User, {
          companyId: { $ne: user.companyId },
        });
        cannot([Action.Create], Company);
      } else {
        if (user.companyRole == CompanyRole.GOVERNMENT) {
          if (user.role === Role.Manager) {
            can([Action.Delete], Company);
          }
          can(Action.Read, User);
        } 
        else {
          can(Action.Read, User, { companyId: { $eq: user.companyId } });
          if(user.companyRole == CompanyRole.MINISTRY) {
            if (user.role === Role.Manager) {
              can([Action.Delete], Company);
              cannot(Action.Delete, Company, { companyRole: { $eq: user.companyRole } });
              cannot(Action.Delete, Company, { companyId: { $eq: user.companyId } });
            }
          }
        }

        cannot([Action.Create], Company);
        cannot(Action.Create, User);
      }

      can(Action.Read, Company);
      can(Action.Update, User, { id: { $eq: user.id } });
      can(Action.Delete, User, { id: { $eq: user.id } });
      cannot(
        Action.Update,
        User,
        ["role", "apiKey", "password", "companyRole", "email"],
        { id: { $eq: user.id } }
      );

      if (user.companyRole == CompanyRole.GOVERNMENT) {
        if (user.role != Role.ViewOnly) {
          can(Action.Manage, DocumentAction);
          can(Action.Manage, Investment);
          can(Action.Manage, Programme);
          can(Action.Manage, Investment);
        } else {
          can(Action.Read, Investment);
          can(Action.Read, Programme);
        }
      }

      if (user.companyRole == CompanyRole.MINISTRY) {
        if (user.role != Role.ViewOnly) {
          can(Action.Manage, Programme);
          can(Action.Manage, DocumentAction);
          can(Action.Manage, Investment);
        } else {
          can(Action.Read, Investment);
          can(Action.Read, Programme);
        }
      }

      if (
        user.role != Role.ViewOnly &&
        user.companyRole != CompanyRole.PROGRAMME_DEVELOPER
      ) {
        can(Action.Manage, ProgrammeCertify);
      }

      if (user.role == Role.Admin && user.companyRole == CompanyRole.API) {
        can([Action.Create, Action.Read, Action.Update], Programme);
      } else if (user.companyRole == CompanyRole.CERTIFIER) {
        can(Action.Manage, DocumentAction);
        can(Action.Read, Programme);
        can(Action.Read, Programme, {
          certifierId: { $elemMatch: { $eq: user.companyId } },
        });

        // can(Action.Read, ProgrammeDocumentViewEntity, {
        //   companyId: { $elemMatch: { $eq: user.companyId } },
        // });

        // can(Action.Read, NDCActionViewEntity, {
        //   companyId: { $elemMatch: { $eq: user.companyId } },
        // });

        can(Action.Read, Investment, {
          status: { $eq: InvestmentStatus.APPROVED },
        });
      } else if (user.companyRole == CompanyRole.PROGRAMME_DEVELOPER) {
        can([Action.Create, Action.Read], DocumentAction);
        can(Action.Read, ProgrammeDocumentViewEntity, {
          companyId: { $elemMatch: { $eq: user.companyId } },
        });

        can(Action.Read, NDCActionViewEntity, {
          companyId: { $elemMatch: { $eq: user.companyId } },
        });

        can(Action.Read, Programme, {
          currentStage: {
            $in: [ProgrammeStage.AUTHORISED, ProgrammeStage.APPROVED],
          },
        });
        can(Action.Read, Investment, {
          status: { $eq: InvestmentStatus.APPROVED },
        });
        if (user.role != Role.ViewOnly) {
          can(Action.Manage, Programme, {
            companyId: { $elemMatch: { $eq: user.companyId } },
          });
          can(Action.Manage, Investment, {
            toCompanyId: { $eq: user.companyId },
          });
          can(Action.Manage, Investment, {
            fromCompanyId: { $eq: user.companyId },
          });
          can(Action.Manage, Investment, {
            initiatorCompanyId: { $eq: user.companyId },
          });
          can(Action.Manage, Investment);
        } else {
          can(Action.Read, Programme, {
            companyId: { $elemMatch: { $eq: user.companyId } },
          });
          can(Action.Read, Investment, {
            toCompanyId: { $eq: user.companyId },
          });
          can(Action.Read, Investment, {
            fromCompanyId: { $eq: user.companyId },
          });
          can(Action.Read, Investment, {
            initiatorCompanyId: { $eq: user.companyId },
          });
        }
      }

      if (user.companyRole == CompanyRole.CERTIFIER) {
        can(Action.Read, Stat);
      } else {
        can(Action.Read, Stat);
      }

      cannot([Action.Delete], Company, {
        companyRole: { $eq: CompanyRole.GOVERNMENT },
      });

      if (user.companyState === 0) {
        cannot(Action.Create, "all");
        cannot(Action.Delete, "all");
        cannot(Action.Update, User, { id: { $ne: user.id } });
        cannot(Action.Update, Programme);
        cannot(Action.Update, Company);
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
