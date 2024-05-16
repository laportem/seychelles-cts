import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import './activityForm.scss';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';
import { ParentType } from '../../../Enums/parentType.enum';
import TimelineTable from '../../../Components/Timeline/timeline';
import {
  ActualRows,
  ActualTimeline,
  ExpectedRows,
  ExpectedTimeline,
} from '../../../Definitions/mtgTimeline.definition';
import { ActivityStatus, ImplMeans, Measure, TechnologyType } from '../../../Enums/activity.enum';
import { IntImplementor, NatImplementor } from '../../../Enums/shared.enum';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { SupportData } from '../../../Definitions/supportDefinitions';
import { ActivityMigratedData, ParentData } from '../../../Definitions/activityDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getValidationRules } from '../../../Utils/validationRules';
import { getFormTitle } from '../../../Utils/utilServices';
import { Action } from '../../../Enums/action.enum';
import { ActivityEntity } from '../../../Entities/activity';
import { useAbilityContext } from '../../../Casl/Can';
import { getSupportTableColumns } from '../../../Definitions/columns/supportColumns';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ActivityForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['activityForm']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Activity', method);

  const navigate = useNavigate();
  const { get, post, put } = useConnection();
  const ability = useAbilityContext();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // Entity Validation Status

  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Parent Selection State

  const [parentType, setParentType] = useState<string>();
  const [connectedParentId, setConnectedParentId] = useState<string>();
  const [parentList, setParentList] = useState<ParentData[]>([]);

  // form state

  const [activityMigratedData, setActivityMigratedData] = useState<ActivityMigratedData>();
  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Spinner When Form Submit Occurs

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);

  // Methodology Doc state

  const [uploadedMthFiles, setUploadedMthFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedMthFiles, setStoredMthFiles] = useState<
    { key: string; title: string; url: string }[]
  >([]);
  const [mthFilesToRemove, setMthFilesToRemove] = useState<string[]>([]);

  // Results Doc state

  const [uploadedRstFiles, setUploadedRstFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedRstFiles, setStoredRstFiles] = useState<
    { key: string; title: string; url: string }[]
  >([]);
  const [rstFilesToRemove, setRstFilesToRemove] = useState<string[]>([]);

  // Support state

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setCurrentPage] = useState<any>(1);
  const [supportPageSize, setPageSize] = useState<number>(10);

  // KPI State

  const [migratedKpiList, setMigratedKpiList] = useState<number[]>([]);

  // MTG Timeline State

  const [expectedTimeline, setExpectedTimeline] = useState<ExpectedTimeline[]>([]);
  const [actualTimeline, setActualTimeline] = useState<ActualTimeline[]>([]);

  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  const handleParentIdSelect = (id: string) => {
    setConnectedParentId(id);
  };

  // Tracking Parent selection

  const handleSelectChange = (value: string) => {
    setParentType(value);
    setConnectedParentId(undefined);
    form.setFieldsValue({
      parentId: '',
      parentDescription: '',
    });
  };

  useEffect(() => {
    const fetchConnectedParent = async () => {
      const tempMigratedData: ActivityMigratedData = {
        description: undefined,
        type: undefined,
        recipient: undefined,
        affSectors: undefined,
        affSubSectors: undefined,
        startYear: undefined,
        endYear: undefined,
        expectedTimeFrame: undefined,
      };

      if (
        (parentType === 'action' || parentType === 'programme' || parentType === 'project') &&
        connectedParentId
      ) {
        const response: any = await get(`national/${parentType}s/${connectedParentId}`);

        if (parentType === 'action') {
          tempMigratedData.description = response.data.description;
          tempMigratedData.affSectors = response.data.sector ?? undefined;
          tempMigratedData.startYear = response.data.startYear;
        } else if (parentType === 'programme') {
          tempMigratedData.description = response.data.description;
          tempMigratedData.recipient = response.data.recipientEntity;
          tempMigratedData.affSectors = response.data.sector ?? undefined;
          tempMigratedData.affSubSectors = response.data.affectedSubSector;
          tempMigratedData.startYear = response.data.startYear;
        } else {
          tempMigratedData.description = response.data.description;
          tempMigratedData.recipient = response.data.recipientEntities;
          tempMigratedData.affSectors = response.data.sector ?? undefined;
          tempMigratedData.affSubSectors = response.data.programme?.affectedSubSector ?? [];
          tempMigratedData.startYear = response.data.startYear;
          tempMigratedData.type = response.data.type;
          tempMigratedData.endYear = response.data.endYear;
          tempMigratedData.expectedTimeFrame = response.data.expectedTimeFrame;
        }
      }
      setActivityMigratedData(tempMigratedData);
    };

    fetchConnectedParent();
  }, [connectedParentId]);

  useEffect(() => {
    const fetchAvailableParents = async () => {
      if (parentType === 'action' || parentType === 'programme' || parentType === 'project') {
        const response: any = await post(`national/${parentType}s/query`, {});

        const tempParentData: ParentData[] = [];
        response.data.forEach((parent: any) => {
          tempParentData.push({
            id:
              parentType === 'action'
                ? parent.actionId
                : parentType === 'programme'
                ? parent.programmeId
                : parent.projectId,
            title: parent.title,
          });
        });
        setParentList(tempParentData);
      }
    };
    fetchAvailableParents();
  }, [parentType]);

  // Initializing Section

  useEffect(() => {
    // Initially Loading the underlying Activity data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        let response: any;
        try {
          response = await get(`national/activities/${entId}`);

          if (response.status === 200 || response.status === 201) {
            const entityData: any = response.data;

            // Populating Action owned data fields
            form.setFieldsValue({
              title: entityData.title,
              description: entityData.description,
              status: entityData.status,
              measure: entityData.measure,
              nationalImplementingEntity: entityData.nationalImplementingEntity ?? undefined,
              internationalImplementingEntity:
                entityData.internationalImplementingEntity ?? undefined,
              anchoredInNationalStrategy: entityData.anchoredInNationalStrategy,
              meansOfImplementation: entityData.meansOfImplementation,
              technologyType: entityData.technologyType,
              etfDescription: entityData.etfDescription,
              comment: entityData.comment,
              achievedGHGReduction: entityData.achievedGHGReduction,
              expectedGHGReduction: entityData.expectedGHGReduction,
            });

            // Populating Mitigation data fields
            form.setFieldsValue({
              mtgMethodName: entityData.mitigationInfo?.mitigationMethodology ?? undefined,
              mtgMethodDesc:
                entityData.mitigationInfo?.mitigationMethodologyDescription ?? undefined,
              mtgCalculateEntity: entityData.mitigationInfo?.mitigationCalcEntity ?? undefined,
              mtgComments: entityData.mitigationInfo?.comments ?? undefined,
            });

            // Parent Data Update

            if (entityData.parentType) {
              form.setFieldsValue({
                parentType: entityData.parentType,
                parentId: entityData.parentId,
              });
              setParentType(entityData.parentType ?? undefined);
              setConnectedParentId(entityData.parentId ?? undefined);
            }

            // Setting validation status

            setIsValidated(entityData.validated ?? false);

            // Setting up uploaded files

            if (entityData.documents?.length > 0) {
              const tempFiles: { key: string; title: string; url: string }[] = [];
              entityData.documents.forEach((document: any) => {
                tempFiles.push({
                  key: document.createdTime,
                  title: document.title,
                  url: document.url,
                });
              });
              setStoredFiles(tempFiles);
            }

            if (entityData.mitigationInfo?.methodologyDocuments?.length > 0) {
              const tempFiles: { key: string; title: string; url: string }[] = [];
              entityData.mitigationInfo?.methodologyDocuments.forEach((document: any) => {
                tempFiles.push({
                  key: document.createdTime,
                  title: document.title,
                  url: document.url,
                });
              });
              setStoredMthFiles(tempFiles);
            }

            if (entityData.mitigationInfo?.resultDocuments?.length > 0) {
              const tempFiles: { key: string; title: string; url: string }[] = [];
              entityData.mitigationInfo?.resultDocuments.forEach((document: any) => {
                tempFiles.push({
                  key: document.createdTime,
                  title: document.title,
                  url: document.url,
                });
              });
              setStoredRstFiles(tempFiles);
            }
          }
        } catch {
          navigate('/activities');
          message.open({
            type: 'error',
            content: t('noSuchEntity'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
      }
    };
    fetchData();

    const fetchSupportData = async () => {
      try {
        const tempSupportData: SupportData[] = [];

        const payload = {
          filterAnd: [
            {
              key: 'activityId',
              operation: '=',
              value: entId,
            },
          ],
          sort: {
            key: 'supportId',
            order: 'ASC',
          },
        };

        const response: any = await post('national/supports/query', payload);

        response.data.forEach((sup: any, index: number) => {
          tempSupportData.push({
            key: index.toString(),
            supportId: sup.supportId,
            financeNature: sup.financeNature,
            direction: sup.direction,
            finInstrument: sup.nationalFinancialInstrument,
            estimatedUSD: sup.requiredAmount,
            estimatedLC: sup.requiredAmountDomestic,
            recievedUSD: sup.receivedAmount,
            recievedLC: sup.receivedAmountDomestic,
          });
        });
        setSupportData(tempSupportData);
      } catch {
        setSupportData([]);
      }
    };
    fetchSupportData();

    // Initializing mtg timeline data when in create mode

    if (method === 'create') {
      const tempExpectedEntries: ExpectedTimeline[] = [];
      Object.entries(ExpectedRows).forEach(([key, value]) => {
        const rowData: ExpectedTimeline = { key: key, ghg: value[0], topic: value[1], total: 0 };
        for (let year = 2023; year <= 2050; year++) {
          rowData[year.toString()] = 0;
        }
        tempExpectedEntries.push(rowData);
      });

      const tempActualEntries: ActualTimeline[] = [];
      Object.entries(ActualRows).forEach(([key, value]) => {
        const rowData: ActualTimeline = { key: key, ghg: value[0], topic: value[1], total: 0 };
        for (let year = 2023; year <= 2050; year++) {
          rowData[year.toString()] = 0;
        }
        tempActualEntries.push(rowData);
      });

      setExpectedTimeline(tempExpectedEntries);
      setActualTimeline(tempActualEntries);
    }
  }, []);

  // Populating Form Migrated Fields, when migration data changes

  useEffect(() => {
    if (activityMigratedData) {
      form.setFieldsValue({
        parentDescription: activityMigratedData.description,
        supportType: activityMigratedData.type,
        recipient: activityMigratedData.recipient,
        sector: activityMigratedData.affSectors,
        affSubSectors: activityMigratedData.affSubSectors,
        startYear: activityMigratedData.startYear,
        endYear: activityMigratedData.endYear,
        expectedTimeFrame: activityMigratedData.expectedTimeFrame,
      });
    }
  }, [activityMigratedData]);

  useEffect(() => {
    const migratedKpis = [];
    for (let i = 0; i < 2; i++) {
      const updatedValues = {
        [`kpi_name_${i}`]: `Name_${i}`,
        [`kpi_unit_${i}`]: `Unit_${i}`,
        [`kpi_ach_${i}`]: 35,
        [`kpi_exp_${i}`]: 55,
      };

      form.setFieldsValue(updatedValues);
      migratedKpis.push(i);
    }

    setMigratedKpiList(migratedKpis);
  }, [supportData]);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      setWaitingForBE(true);

      for (const key in payload) {
        if (key.startsWith('kpi_exp') || key.startsWith('kpi_unit')) {
          delete payload[key];
        }
      }

      if (uploadedFiles.length > 0) {
        if (method === 'create') {
          payload.documents = [];
          uploadedFiles.forEach((file) => {
            payload.documents.push({ title: file.title, data: file.data });
          });
        } else if (method === 'update') {
          payload.newDocuments = [];
          uploadedFiles.forEach((file) => {
            payload.newDocuments.push({ title: file.title, data: file.data });
          });
        }
      }

      if (filesToRemove.length > 0) {
        payload.removedDocuments = [];
        filesToRemove.forEach((removedFileKey) => {
          payload.removedDocuments.push(
            storedFiles.find((file) => file.key === removedFileKey)?.url
          );
        });
      }

      payload.achievedGHGReduction = parseFloat(payload.achievedGHGReduction);
      payload.expectedGHGReduction = parseFloat(payload.expectedGHGReduction);

      payload.mitigationInfo = {
        mitigationMethodology: payload.mtgMethodName,
        mitigationMethodologyDescription: payload.mtgMethodDesc,
        mitigationCalcEntity: payload.mtgCalculateEntity,
        comments: payload.mtgComments,
        methodologyDocuments: [],
        resultDocuments: [],
      };

      uploadedMthFiles.forEach((file) => {
        payload.mitigationInfo.methodologyDocuments.push({ title: file.title, data: file.data });
      });

      uploadedRstFiles.forEach((file) => {
        payload.mitigationInfo.resultDocuments.push({ title: file.title, data: file.data });
      });

      let response: any;

      if (method === 'create') {
        response = await post('national/activities/add', payload);
      } else if (method === 'update') {
        payload.activityId = entId;
        response = await put('national/activities/update', payload);
      }

      if (response.status === 200 || response.status === 201) {
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });

        message.open({
          type: 'success',
          content: t('activityCreationSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        setWaitingForBE(false);
        navigate('/activities');
      }
    } catch (error: any) {
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setWaitingForBE(false);
      navigate('/activities');
    }
  };

  // Entity Validate

  const validateEntity = async () => {
    try {
      if (entId) {
        const payload = {
          entityId: entId,
        };
        const response: any = await post('national/activities/validate', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: 'Successfully Validated !',
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/activities');
        }
      }
    } catch {
      message.open({
        type: 'error',
        content: `${entId} Validation Failed`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
  };

  // Entity Delete

  const deleteEntity = () => {
    console.log('Delete Clicked');
  };

  // Column Definition
  const supportTableColumns = getSupportTableColumns();

  // Table Behaviour

  const handleSupportTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Mtg Data Change

  const onMtgValueEnter = (
    tableType: 'expected' | 'actual',
    rowId: string,
    year: string,
    value: string
  ) => {
    const newValue = value ? parseInt(value) : 0;

    if (tableType === 'expected') {
      setExpectedTimeline((prevState) =>
        prevState.map((entry) => {
          if (entry.topic === rowId) {
            entry[year] = newValue;
            return entry;
          }
          return entry;
        })
      );
    } else {
      setActualTimeline((prevState) =>
        prevState.map((entry) => {
          if (entry.topic === rowId) {
            entry[year] = newValue;
            return entry;
          }
          return entry;
        })
      );
    }
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
      </div>
      {!waitingForBE ? (
        <div className="activity-form">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard calledIn="Activity" entId={entId}></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('activityTitle')}</label>}
                    name="title"
                    rules={[validation.required]}
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('activityDescTitle')}</label>}
                    name="description"
                    rules={[validation.required]}
                  >
                    <TextArea maxLength={250} rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('parentTypeTitle')}</label>}
                    name="parentType"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                      onChange={handleSelectChange}
                    >
                      {Object.values(ParentType).map((parent) => (
                        <Option key={parent} value={parent}>
                          {t(parent)}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('activityStatusTitle')}</label>}
                    name="status"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(ActivityStatus).map((status) => (
                        <Option key={status} value={status}>
                          {status}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              {parentType ? (
                <Row gutter={gutterSize}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {`${t('selectParentTitle')} ${t(parentType)}`}
                        </label>
                      }
                      name="parentId"
                      rules={[validation.required]}
                    >
                      <Select
                        size={'large'}
                        style={{ fontSize: inputFontSize }}
                        allowClear
                        disabled={isView}
                        showSearch
                        onChange={handleParentIdSelect}
                      >
                        {parentList.map((parent) => (
                          <Option key={parent.id} value={parent.id}>
                            {parent.title}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {`${t('parentDescTitle')} ${t(parentType)}`}
                        </label>
                      }
                      name="parentDescription"
                    >
                      <TextArea maxLength={250} rows={3} disabled />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null}
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('natImplementorTitle')}</label>}
                    name="nationalImplementingEntity"
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(NatImplementor).map((implementer) => (
                        <Option key={implementer} value={implementer}>
                          {implementer}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('intImplementorTitle')}</label>}
                    name="internationalImplementingEntity"
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(IntImplementor).map((implementer) => (
                        <Option key={implementer} value={implementer}>
                          {implementer}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('measuresTitle')}</label>}
                    name="measure"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(Measure).map((measure) => (
                        <Option key={measure} value={measure}>
                          {measure}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {parentType === 'project' && (
                  <Col span={12}>
                    <Form.Item
                      label={<label className="form-item-header">{t('supportTypeTitle')}</label>}
                      name="supportType"
                    >
                      <Select
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        allowClear
                        disabled
                        showSearch
                      ></Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={gutterSize}>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('affSectorsTitle')}</label>}
                    name="sector"
                  >
                    <Select size="large" style={{ fontSize: inputFontSize }} disabled></Select>
                  </Form.Item>
                </Col>
                {(parentType === 'programme' || parentType === 'project') && (
                  <Col span={6}>
                    <Form.Item
                      label={<label className="form-item-header">{t('affSubSectorsTitle')}</label>}
                      name="affSubSectors"
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled
                      ></Select>
                    </Form.Item>
                  </Col>
                )}
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('startYearTitle')}</label>}
                    name="startYear"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                {parentType === 'project' && (
                  <Col span={6}>
                    <Form.Item
                      label={<label className="form-item-header">{t('endYearTitle')}</label>}
                      name="endYear"
                    >
                      <Input className="form-input-box" disabled />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={gutterSize}>
                {(parentType === 'programme' || parentType === 'project') && (
                  <Col span={12}>
                    <Form.Item
                      label={
                        <label className="form-item-header">{t('recipientEntityTitle')}</label>
                      }
                      name="recipient"
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled
                      ></Select>
                    </Form.Item>
                  </Col>
                )}
                {parentType === 'project' && (
                  <Col span={12}>
                    <Form.Item
                      label={<label className="form-item-header">{t('timeFrameTitle')}</label>}
                      name="expectedTimeFrame"
                    >
                      <Input className="form-input-box" disabled />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('anchoredTitle')}</label>}
                    name="anchoredInNationalStrategy"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      <Option key={'yes'} value={true}>
                        {'Yes'}
                      </Option>
                      <Option key={'no'} value={false}>
                        {'No'}
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('implMeansTitle')}</label>}
                    name="meansOfImplementation"
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(ImplMeans).map((mean) => (
                        <Option key={mean} value={mean}>
                          {mean}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('techTypeTitle')}</label>}
                    name="technologyType"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(TechnologyType).map((tech) => (
                        <Option key={tech} value={tech}>
                          {tech}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('additionalInfoTitle')}</label>}
                    name="etfDescription"
                  >
                    <TextArea maxLength={250} rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-sub-header">{t('documentsHeader')}</div>
              <UploadFileGrid
                isSingleColumn={false}
                usedIn={method}
                buttonText={t('upload')}
                storedFiles={storedFiles}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                removedFiles={filesToRemove}
                setRemovedFiles={setFilesToRemove}
              ></UploadFileGrid>
              <Row gutter={gutterSize}>
                <Col span={24}>
                  <Form.Item
                    label={<label className="form-item-header">{t('activityCommentsTitle')}</label>}
                    name="comment"
                    rules={[validation.required]}
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-header">{t('mitigationInfoTitle')}</div>
              <div className="form-section-sub-header">{t('emissionInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('achieved')}</label>}
                    name="achievedGHGReduction"
                    rules={[validation.required]}
                  >
                    <Input type="number" className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('expected')}</label>}
                    name="expectedGHGReduction"
                    rules={[validation.required]}
                  >
                    <Input type="number" className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-sub-header">{t('kpiInfoTitle')}</div>
              {migratedKpiList.map((index: number) => (
                <KpiGrid
                  key={index}
                  form={form}
                  rules={[validation.required]}
                  index={index}
                  calledTo={isView ? 'view' : 'add_ach'}
                  gutterSize={gutterSize}
                  headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
                ></KpiGrid>
              ))}
            </div>
            {method !== 'create' && (
              <div className="form-section-card">
                <Row>
                  <Col span={6}>
                    <div className="form-section-header">{t('supportTableHeader')}</div>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <LayoutTable
                      tableData={supportData}
                      columns={supportTableColumns}
                      loading={false}
                      pagination={{
                        current: supportCurrentPage,
                        pageSize: supportPageSize,
                        total: supportData.length,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '30'],
                        showSizeChanger: true,
                        style: { textAlign: 'center' },
                        locale: { page: '' },
                        position: ['bottomRight'],
                      }}
                      handleTableChange={handleSupportTableChange}
                      emptyMessage={t('noSupportsMessage')}
                    />
                  </Col>
                </Row>
              </div>
            )}
            <div className="form-section-card">
              <div className="form-section-header">{t('mitigationInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgMethodName')}</label>}
                    name="mtgMethodName"
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgDocUploadOne')}</label>}
                  >
                    <UploadFileGrid
                      isSingleColumn={true}
                      usedIn={method}
                      buttonText={t('upload')}
                      storedFiles={storedMthFiles}
                      uploadedFiles={uploadedMthFiles}
                      setUploadedFiles={setUploadedMthFiles}
                      removedFiles={mthFilesToRemove}
                      setRemovedFiles={setMthFilesToRemove}
                    ></UploadFileGrid>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgDescTitle')}</label>}
                    name="mtgMethodDesc"
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgDocUploadTwo')}</label>}
                  >
                    <UploadFileGrid
                      isSingleColumn={true}
                      usedIn={method}
                      buttonText={t('upload')}
                      storedFiles={storedRstFiles}
                      uploadedFiles={uploadedRstFiles}
                      setUploadedFiles={setUploadedRstFiles}
                      removedFiles={rstFilesToRemove}
                      setRemovedFiles={setRstFilesToRemove}
                    ></UploadFileGrid>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('mtgCalculateEntityTitle')}</label>
                    }
                    name="mtgCalculateEntity"
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={24}>
                  <Form.Item
                    label={<label className="form-item-header">{t('mtgComments')}</label>}
                    name="mtgComments"
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="form-section-card">
              <Row>
                <Col span={6}>
                  <div className="form-section-header">{t('mitigationTimelineTitle')}</div>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <TimelineTable
                    expectedTimeline={expectedTimeline}
                    actualTimeline={actualTimeline}
                    loading={false}
                    onValueEnter={onMtgValueEnter}
                  />
                </Col>
              </Row>
            </div>
            {isView && (
              <div className="form-section-timelinecard">
                <div className="form-section-header">{t('updatesInfoTitle')}</div>
                <UpdatesTimeline recordType={'activity'} recordId={entId} />
              </div>
            )}
            {method === 'create' && (
              <Row gutter={20} justify={'end'}>
                <Col span={2}>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/activities');
                    }}
                  >
                    {t('cancel')}
                  </Button>
                </Col>
                <Col span={2}>
                  <Form.Item>
                    <Button type="primary" size="large" block htmlType="submit">
                      {t('add')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
            {method === 'view' && (
              <Row gutter={20} justify={'end'}>
                <Col span={2}>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/activities');
                    }}
                  >
                    {t('back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, ActivityEntity) && (
                  <Col span={2.5}>
                    <Form.Item>
                      <Button
                        disabled={isValidated}
                        type="primary"
                        size="large"
                        block
                        onClick={() => {
                          validateEntity();
                        }}
                      >
                        {t('validate')}
                      </Button>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            )}
            {method === 'update' && (
              <Row gutter={20} justify={'end'}>
                <Col span={2}>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/activities');
                    }}
                  >
                    {t('cancel')}
                  </Button>
                </Col>
                <Col span={2}>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      deleteEntity();
                    }}
                    style={{ color: 'red', borderColor: 'red' }}
                  >
                    {t('delete')}
                  </Button>
                </Col>
                <Col span={2.5}>
                  <Form.Item>
                    <Button type="primary" size="large" block htmlType="submit">
                      {t('update')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Form>
        </div>
      ) : (
        <Spin className="loading-center" size="large" />
      )}
    </div>
  );
};

export default ActivityForm;
