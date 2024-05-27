import { List, Typography } from 'antd';
import { Action } from '../../Enums/action.enum';
import { ActionEntity } from '../../Entities/action';
import { ProgrammeEntity } from '../../Entities/programme';
import { ProjectEntity } from '../../Entities/project';
import { ActivityEntity } from '../../Entities/activity';
import { SupportEntity } from '../../Entities/support';
import {
  CloseCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

export const actionMenuWithAttaching = (
  calledIn: 'action' | 'programme' | 'project',
  ability: any,
  entity: ActionEntity | ProgrammeEntity | ProjectEntity,
  recordId: string,
  validationStatus: 'pending' | 'validated',
  getAttachedEntityIds: (recordId: string) => void,
  setOpenAttaching: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedEntityId: React.Dispatch<React.SetStateAction<string | undefined>>,
  navigate: any,
  t: any
) => {
  const isValidated: boolean = validationStatus === 'validated' ? true : false;
  const viewText = ability.can(Action.Validate, entity)
    ? isValidated
      ? t('tableAction:View')
      : t('tableAction:View/Validate')
    : t('tableAction:View');
  return (
    <List
      className="action-menu"
      size="small"
      dataSource={[
        {
          text: viewText,
          icon: <InfoCircleOutlined style={{ color: '#9155FD' }} />,
          isDisabled: false,
          click: () => {
            {
              navigate(`/${calledIn}s/view/${recordId}`);
            }
          },
        },
        {
          text: t(`tableAction:${calledIn}Attach`),
          icon: <PlusOutlined style={{ color: '#9155FD' }} />,
          isDisabled: !ability.can(Action.Update, entity) || isValidated,
          click: () => {
            {
              setOpenAttaching(true);
              setSelectedEntityId(recordId);
              getAttachedEntityIds(recordId);
            }
          },
        },
        {
          text: t(`tableAction:${calledIn}Edit`),
          icon: <EditOutlined style={{ color: '#9155FD' }} />,
          isDisabled: !ability.can(Action.Update, entity) || isValidated,
          click: () => {
            {
              navigate(`/${calledIn}s/edit/${recordId}`);
            }
          },
        },
      ]}
      renderItem={(item) =>
        !item.isDisabled && (
          <List.Item onClick={item.click}>
            <Typography.Text className="action-icon">{item.icon}</Typography.Text>
            <span>{item.text}</span>
          </List.Item>
        )
      }
    />
  );
};

export const actionMenuWithoutAttaching = (
  calledIn: 'activities' | 'support',
  ability: any,
  entity: ActivityEntity | SupportEntity,
  recordId: string,
  validationStatus: 'pending' | 'validated',
  navigate: any,
  t: any
) => {
  const isValidated: boolean = validationStatus === 'validated' ? true : false;
  const viewText = ability.can(Action.Validate, entity)
    ? isValidated
      ? t('tableAction:View')
      : t('tableAction:View/Validate')
    : t('tableAction:View');
  return (
    <List
      className="action-menu"
      size="small"
      dataSource={[
        {
          text: viewText,
          icon: <InfoCircleOutlined style={{ color: '#9155FD' }} />,
          isDisabled: false,
          click: () => {
            {
              navigate(`/${calledIn}/view/${recordId}`);
            }
          },
        },
        {
          text: t(`tableAction:${calledIn}Edit`),
          icon: <EditOutlined style={{ color: '#9155FD' }} />,
          isDisabled: !ability.can(Action.Update, entity) || isValidated,
          click: () => {
            {
              navigate(`/${calledIn}/edit/${recordId}`);
            }
          },
        },
      ]}
      renderItem={(item) =>
        !item.isDisabled && (
          <List.Item onClick={item.click}>
            <Typography.Text className="action-icon">{item.icon}</Typography.Text>
            <span>{item.text}</span>
          </List.Item>
        )
      }
    />
  );
};

export const detachMenu = (recordId: string, t: any, detachEntity: (recordId: string) => void) => {
  return (
    <List
      className="action-menu"
      size="small"
      dataSource={[
        {
          text: t('detach'),
          icon: <CloseCircleOutlined style={{ color: 'red' }} />,
          click: () => {
            {
              detachEntity(recordId);
            }
          },
        },
      ]}
      renderItem={(item) => (
        <List.Item onClick={item.click}>
          <Typography.Text className="action-icon">{item.icon}</Typography.Text>
          <span>{item.text}</span>
        </List.Item>
      )}
    />
  );
};
