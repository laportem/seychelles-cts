import { EllipsisOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import { detachMenu } from '../../Components/Popups/tableAction';

export const getProgrammeTableColumns = (
  isView: boolean,
  detachProgramme: (arg0: string) => void
) => {
  const { t } = useTranslation(['actionForm']);

  const programmeTableColumns = [
    { title: t('programmeId'), dataIndex: 'programmeId', key: 'programmeId' },
    { title: t('actionId'), dataIndex: 'actionId', key: 'actionId' },
    { title: t('programmeTitle'), dataIndex: 'title', key: 'title' },
    { title: t('programmeType'), dataIndex: 'type', key: 'type' },
    { title: t('programmeStatus'), dataIndex: 'status', key: 'status' },
    {
      title: t('subSectorAffected'),
      dataIndex: 'subSectorsAffected',
      key: 'subSectorsAffected',
    },
    {
      title: t('investmentNeeds'),
      dataIndex: 'estimatedInvestment',
      key: 'estimatedInvestment',
    },
    {
      title: '',
      key: 'programmeId',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <>
            {!isView && (
              <Popover
                key={`${record.programmeId}_prg_detach`}
                showArrow={false}
                trigger={'click'}
                placement="bottomRight"
                content={detachMenu(record.programmeId, t, detachProgramme)}
              >
                <EllipsisOutlined
                  rotate={90}
                  style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                />
              </Popover>
            )}
          </>
        );
      },
    },
  ];

  return programmeTableColumns;
};
