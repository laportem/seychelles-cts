import { useTranslation } from 'react-i18next';
import '../../../Styles/app.scss';
import LayoutTable from '../../../Components/common/Table/layout.table';
import './projectList.scss';
import { Action } from '../../../Enums/action.enum';
import { Button, Col, Row, Input, Dropdown, Popover, Radio, Space, MenuProps } from 'antd';
import { EllipsisOutlined, FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAbilityContext } from '../../../Casl/Can';
import { ActionEntity } from '../../../Entities/action';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import StatusChip from '../../../Components/StatusChip/statusChip';
import ScrollableList from '../../../Components/ScrollableList/scrollableList';
import { actionMenuWithAttaching } from '../../../Components/Popups/tableAction';
import { ProjectEntity } from '../../../Entities/project';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';
import {
  addActionBps,
  filterDropdownBps,
  listSearchBarBps,
  searchBoxBps,
} from '../../../Definitions/breakpoints/breakpoints';

interface Item {
  key: number;
  projectId: string;
  programmeId: string;
  title: string;
  projectStatus: string;
  recipientEntity: string[];
  intImplementingEntity: string[];
  validationStatus: string;
  natImplementingEntity: string[];
  estimatedInvestment: number;
}

interface Filter {
  searchBy: string;
  statusFilter: string;
  validationFilter: string;
}

const projectList = () => {
  const navigate = useNavigate();
  const { post } = useConnection();
  const ability = useAbilityContext();

  const { t } = useTranslation(['projectList', 'tableAction', 'columnHeader', 'entityAction']);

  // General Page State

  const [loading, setLoading] = useState<boolean>(false);

  // Table Data State

  const [tableData, setTableData] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [totalRowCount, setTotalRowRowCount] = useState<number>();

  const [sortField, setSortField] = useState<string>('projectId');
  const [sortOrder, setSortOrder] = useState<string>('DESC');

  // Filters State
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const [appliedFilterValue, setAppliedFilterValue] = useState<Filter>({
    searchBy: 'projectId',
    statusFilter: 'All',
    validationFilter: 'All',
  });
  const [tempFilterValue, setTempFilterValue] = useState<Filter>({
    searchBy: 'projectId',
    statusFilter: 'All',
    validationFilter: 'All',
  });

  // Search Value State

  const [tempSearchValue, setTempSearchValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  // Data Read from DB

  const getAllData = async () => {
    setLoading(true);
    try {
      const payload: any = { page: currentPage, size: pageSize };

      // Adding Sort By Conditions

      payload.sort = {
        key: sortField,
        order: sortOrder,
      };

      // Adding Filter Conditions

      if (appliedFilterValue.statusFilter !== 'All') {
        payload.filterAnd = [];
        payload.filterAnd.push({
          key: 'projectStatus',
          operation: '=',
          value: appliedFilterValue.statusFilter,
        });
      }

      if (appliedFilterValue.validationFilter !== 'All') {
        if (!payload.hasOwnProperty('filterAnd')) {
          payload.filterAnd = [];
        }
        payload.filterAnd.push({
          key: 'validated',
          operation: '=',
          value: appliedFilterValue.validationFilter === 'Validated' ? true : false,
        });
      }
      if (searchValue !== '') {
        if (!payload.hasOwnProperty('filterAnd')) {
          payload.filterAnd = [];
        }
        payload.filterAnd.push({
          key: appliedFilterValue.searchBy,
          operation: 'LIKE',
          value: `%${searchValue}%`,
        });
      }

      const response: any = await post('national/projects/query', payload);
      if (response) {
        const unstructuredData: any[] = response.data;
        const structuredData: Item[] = [];
        for (let i = 0; i < unstructuredData.length; i++) {
          structuredData.push({
            key: i,
            projectId: unstructuredData[i].projectId,
            programmeId: unstructuredData[i].programme?.programmeId ?? '',
            title: unstructuredData[i].title,
            projectStatus: unstructuredData[i].projectStatus,
            recipientEntity: unstructuredData[i].migratedData[0]?.recipientEntities ?? [],
            intImplementingEntity:
              unstructuredData[i].migratedData[0]?.internationalImplementingEntities ?? [],
            validationStatus: unstructuredData[i].validated ? 'validated' : 'pending',
            natImplementingEntity: unstructuredData[i].programme?.natImplementor ?? [],
            estimatedInvestment: Math.round(
              unstructuredData[i].migratedData[0]?.estimatedAmount ?? 0
            ),
          });
        }
        setTableData(structuredData);
        setTotalRowRowCount(response.response.data.total);
        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  // Handling Table Pagination and Sorting Changes

  // eslint-disable-next-line no-unused-vars
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Setting Pagination
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);

    // Setting the Sort Direction
    if (sorter.order === 'ascend') {
      setSortOrder('ASC');
    } else if (sorter.order === 'descend') {
      setSortOrder('DESC');
    } else if (sorter.order === undefined) {
      setSortOrder('DESC');
    }

    // Setting the Sort By Column
    if (sorter.columnKey !== undefined) {
      setSortField(sorter.field);
    } else {
      setSortField('projectId');
    }
  };

  // Search Value Handling

  const onSearch = () => {
    setCurrentPage(1);
    setSearchValue(tempSearchValue);
  };

  // Search Value Handling

  const updatedTempFilters = (filterSection: string, newValue: string) => {
    const updatedFilters = { ...tempFilterValue };
    if (filterSection === 'validation') {
      updatedFilters.validationFilter = newValue;
      setTempFilterValue(updatedFilters);
    } else if (filterSection === 'status') {
      updatedFilters.statusFilter = newValue;
      setTempFilterValue(updatedFilters);
    } else if (filterSection === 'search') {
      updatedFilters.searchBy = newValue;
      setTempFilterValue(updatedFilters);
    }
  };

  // State Management

  useEffect(() => {
    getAllData();
  }, [currentPage, pageSize, sortField, sortOrder, searchValue, appliedFilterValue]);

  // Action List Table Columns

  const columns = [
    { title: t('projectId'), width: 85, dataIndex: 'projectId', key: 'projectId', sorter: false },
    {
      title: t('programmeId'),
      width: 112,
      dataIndex: 'programmeId',
      key: 'programmeId',
      sorter: false,
    },
    { title: t('titleOfProject'), width: 125, dataIndex: 'title', key: 'title', sorter: false },
    {
      title: t('projectStatus'),
      width: 112,
      dataIndex: 'projectStatus',
      key: 'projectStatus',
      sorter: false,
    },
    {
      title: t('columnHeader:recipientEntity'),
      sorter: false,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.recipientEntity}></ScrollableList>;
      },
    },
    {
      title: t('columnHeader:internationalImplementingEntity'),
      sorter: false,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.intImplementingEntity}></ScrollableList>;
      },
    },
    {
      title: t('columnHeader:validationStatus'),
      key: 'validationStatus',
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <StatusChip message={record.validationStatus} defaultMessage="pending" />;
      },
    },
    {
      title: t('columnHeader:nationalImplementingEntity'),
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return <ScrollableList listToShow={record.natImplementingEntity}></ScrollableList>;
      },
    },
    {
      title: t('columnHeader:estimatedInvestment'),
      dataIndex: 'estimatedInvestment',
      key: 'estimatedInvestment',
      sorter: false,
    },
    {
      title: '',
      key: 'projectId',
      align: 'right' as const,
      width: 6,
      // eslint-disable-next-line no-unused-vars
      render: (_: any, record: any) => {
        return (
          <Popover
            showArrow={false}
            trigger={'click'}
            placement="bottomRight"
            content={actionMenuWithAttaching(
              'project',
              ability,
              ProjectEntity,
              record.projectId,
              record.validationStatus ?? 'pending',
              navigate,
              t
            )}
          >
            <EllipsisOutlined
              rotate={90}
              style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
            />
          </Popover>
        );
      },
    },
  ];

  // Items for the filter dropdown

  const items: MenuProps['items'] = [
    {
      key: '1',
      title: 'Search by',
      label: (
        <div className="filter-menu-item">
          <div className="filter-title">{t('user:searchBy')}</div>
          <Radio.Group
            onChange={(e) => {
              updatedTempFilters('search', e?.target?.value);
            }}
            value={tempFilterValue.searchBy}
          >
            <Space direction="vertical">
              <Radio value="projectId">ID</Radio>
              <Radio value="title">Title</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: '2',
      title: 'Filter by Action Status',
      label: (
        <div className="filter-menu-item">
          <div className="filter-title">{t('filterByProjectStatus')}</div>
          <Radio.Group
            onChange={(e) => {
              updatedTempFilters('status', e?.target?.value);
            }}
            value={tempFilterValue.statusFilter}
          >
            <Space direction="vertical">
              <Radio value="All">All</Radio>
              <Radio value="Planned">Planned</Radio>
              <Radio value="Ongoing">Ongoing</Radio>
              <Radio value="Completed">Completed</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: '3',
      title: 'Filter by Validation Status',
      label: (
        <div className="filter-menu-item">
          <div className="filter-title">{t('columnHeader:filterByValidationStatus')}</div>
          <Radio.Group
            onChange={(e) => {
              updatedTempFilters('validation', e?.target?.value);
            }}
            value={tempFilterValue.validationFilter}
          >
            <Space direction="vertical">
              <Radio value="All">All</Radio>
              <Radio value="Pending">Pending</Radio>
              <Radio value="Validated">Validated</Radio>
            </Space>
          </Radio.Group>
        </div>
      ),
    },
    {
      key: '4',
      title: 'Action',
      label: (
        <div className="filter-menu-actions">
          <Row gutter={10}>
            <Col span={12}>
              <Button
                style={{ width: '100%' }}
                size="small"
                type="default"
                onClick={() => {
                  setFilterVisible(false);
                  setTempFilterValue({ ...appliedFilterValue });
                }}
              >
                {t('entityAction:cancel')}
              </Button>
            </Col>
            <Col span={12}>
              <Button
                style={{ width: '100%' }}
                size="small"
                type="primary"
                onClick={() => {
                  setFilterVisible(false);
                  setSearchValue('');
                  setTempSearchValue('');
                  setCurrentPage(1);
                  setAppliedFilterValue({ ...tempFilterValue });
                }}
              >
                {t('entityAction:apply')}
              </Button>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t('viewTitle')}</div>
      </div>
      <div className="content-card">
        <Row className="table-actions-section">
          <Col {...addActionBps}>
            <div className="action-bar">
              {ability.can(Action.Create, ActionEntity) && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => {
                    navigate('/projects/add');
                  }}
                >
                  {t('addProject')}
                </Button>
              )}
            </div>
          </Col>
          <Col {...listSearchBarBps}>
            <Row gutter={10}>
              <Col {...searchBoxBps} className="search-bar">
                <Input
                  addonAfter={<SearchOutlined style={{ color: '#615d67' }} onClick={onSearch} />}
                  placeholder={
                    appliedFilterValue.searchBy === 'projectId'
                      ? 'Search by Project ID'
                      : 'Search by Project Title'
                  }
                  allowClear
                  onPressEnter={onSearch}
                  onChange={(e) => setTempSearchValue(e.target.value)}
                  style={{ width: 265 }}
                  value={tempSearchValue}
                />
              </Col>
              <Col {...filterDropdownBps} className="filter-bar">
                <Dropdown
                  arrow={false}
                  placement="bottomRight"
                  trigger={['click']}
                  open={filterVisible}
                  menu={{ items }}
                  overlayStyle={{ width: '240px' }}
                >
                  <FilterOutlined
                    style={{
                      color: '#615d67',
                      fontSize: '20px',
                    }}
                    onClick={() => {
                      setFilterVisible(true);
                    }}
                  />
                </Dropdown>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <LayoutTable
              tableData={tableData}
              columns={columns}
              loading={loading}
              pagination={{
                total: totalRowCount,
                current: currentPage,
                pageSize: pageSize,
                showQuickJumper: true,
                pageSizeOptions: ['10', '20', '30'],
                showSizeChanger: true,
                style: { textAlign: 'center' },
                locale: { page: '' },
                position: ['bottomRight'],
              }}
              handleTableChange={handleTableChange}
              emptyMessage="No Projects Available"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default projectList;
