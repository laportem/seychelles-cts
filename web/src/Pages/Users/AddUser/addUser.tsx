import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import { useAbilityContext } from '../../../Casl/Can';
import { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Input, message, Skeleton, Radio, Select } from 'antd';
import PhoneInput, {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
} from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './addNewUserComponent.scss';
import '../../../Styles/app.scss';
import { Action } from '../../../Enums/action.enum';
import { plainToClass } from 'class-transformer';
import { User } from '../../../Entities/user';
import ChangePasswordModel from '../../../Components/Models/changePasswordModel';
import { Role } from '../../../Enums/role.enum';
import { Sector } from '../../../Enums/sector.enum';
import { Organisation } from '../../../Enums/organisation.enum';
import { BankOutlined, ExperimentOutlined, KeyOutlined, StarOutlined } from '@ant-design/icons';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';
import ForceResetPasswordModel from '../../../Components/Models/forceResetPasswordModel';

const AddUser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['addUser', 'changePassword', 'userProfile']);
  const themeColor = '#9155fd';

  const { post, put, get } = useConnection();
  const [formOne] = Form.useForm();
  const { state } = useLocation();
  const { updateToken } = useConnection();
  const { removeUserInfo } = useUserContext();
  const { userInfoState } = useUserContext();
  const ability = useAbilityContext();

  // General State

  const [loading, setLoading] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>('');
  const [countries, setCountries] = useState<[]>([]);
  const [isCountryListLoading, setIsCountryListLoading] = useState(false);
  const [role, setRole] = useState(state?.record?.role);
  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  // Password Change Auth State

  const [isProfilePasswordReset, setIsProfilePasswordReset] = useState<boolean>(false);
  const [isForcePasswordReset, setIsForcePasswordReset] = useState<boolean>(true);

  // Profile Password Change State

  const [openPasswordChangeModal, setopenPasswordChangeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Force Password Change State

  const [forcePasswordChangeVisible, setForcePasswordChangeVisible] = useState<boolean>(false);
  const [forcePasswordChangeRunning, setForcePasswordChangeRunning] = useState<boolean>(false);

  const onNavigateToUserManagement = () => {
    navigate('/userManagement/viewAll', { replace: true });
  };

  const onNavigateToLogin = () => {
    navigate('/login', { replace: true });
  };

  const getCountryList = async () => {
    setIsCountryListLoading(true);
    try {
      const response = await get('national/users/countries');
      if (response.data) {
        const alpha2Names = response.data.map((item: any) => {
          return item.alpha2;
        });
        setCountries(alpha2Names);
      }
    } catch (error: any) {
      displayErrorMessage(error);
    } finally {
      setIsCountryListLoading(false);
    }
  };

  const onAddUser = async (values: any) => {
    setLoading(true);
    try {
      if (values.phoneNo && values.phoneNo.length > 4) {
        values.phoneNo = formatPhoneNumberIntl(values.phoneNo);
      } else {
        values.phoneNo = undefined;
      }
      const response = await post('national/users/add', values);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('addUserSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        onNavigateToUserManagement();
        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateUser = async () => {
    setLoading(true);
    const formOneValues = formOne.getFieldsValue();
    if (formOneValues.phoneNo && formOneValues.phoneNo.length > 4) {
      formOneValues.phoneNo = formatPhoneNumberIntl(formOneValues.phoneNo);
    } else {
      formOneValues.phoneNo = undefined;
    }
    try {
      const values: any = {
        id: state?.record?.id,
        name: formOneValues?.name,
        phoneNo: formOneValues?.phoneNo,
        organisation: formOneValues?.organisation,
        sector: formOneValues?.sector,
        subRole: formOneValues?.subRole,
      };

      if (ability.can(Action.Update, plainToClass(User, state?.record), 'role'))
        values.role = formOneValues?.role;

      if (ability.can(Action.Update, plainToClass(User, state?.record), 'email'))
        values.email = formOneValues?.email;

      const response = await put('national/users/update', values);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('updateUserSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        onNavigateToUserManagement();
        state.record = {};
        setLoading(false);
      }
    } catch (error: any) {
      displayErrorMessage(error);
      setLoading(false);
    }
  };

  const onSubmitData = async (values: any) => {
    if (isUpdate) onUpdateUser();
    else onAddUser(values);
  };

  const signOut = (): void => {
    onNavigateToLogin();
    updateToken();
    removeUserInfo();
  };

  const onPasswordChangeCompleted = async (props: any) => {
    setIsLoading(true);
    try {
      const response = await put('national/users/resetPassword', {
        newPassword: props.newPassword,
        oldPassword: props.oldPassword,
      });
      const responseMsg = response.message;
      setopenPasswordChangeModal(false);
      message.open({
        type: 'success',
        content: responseMsg,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setErrorMsg('');
      signOut();
    } catch (exception: any) {
      setErrorMsg(exception.message);
    } finally {
      setIsLoading(false);
    }
  };

  const forceResetPasswordAction = async (props: any) => {
    setForcePasswordChangeRunning(true);
    try {
      const response = await put('national/users/forceResetPassword', {
        userId: state?.record?.id,
        newPassword: props.newPassword,
      });

      setForcePasswordChangeRunning(false);
      setForcePasswordChangeVisible(false);

      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('forcePasswordReset'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      setForcePasswordChangeRunning(false);
      setForcePasswordChangeVisible(false);
      displayErrorMessage(error);
    }
  };

  const onChangedPassword = () => {
    setErrorMsg('');
    setopenPasswordChangeModal(true);
  };

  const onPasswordChangeCanceled = () => {
    setopenPasswordChangeModal(false);
  };

  const onFormsValueChanged = async () => {
    setErrorMsg('');
  };

  const onChangeuserRole = (event: any) => {
    const value = event.target.value;
    setRole(value);
    formOne.setFieldsValue({ subRole: undefined });
  };

  useEffect(() => {
    getCountryList();

    if (state?.record) {
      setIsUpdate(true);
      setIsSaveButtonDisabled(true);

      // Permission Setting for the Password Change
      if (userInfoState?.id === state?.record?.id.toString()) {
        setIsProfilePasswordReset(true);
      } else if (userInfoState?.userRole === Role.Root || userInfoState?.userRole === Role.Admin) {
        setIsForcePasswordReset(true);
      } else {
        setIsProfilePasswordReset(false);
        setIsForcePasswordReset(false);
      }
    } else {
      setIsUpdate(false);
    }
  }, []);

  const handleValuesChange = () => {
    setIsSaveButtonDisabled(false);
  };

  return (
    <div className="add-user-main-container">
      <div className="title-container">
        <div className="titles">
          <div className="main">{isUpdate ? t('addUser:editUser') : t('addUser:addNewUser')}</div>
        </div>
        {isUpdate && (
          <div className="actions">
            <Button
              className="mg-left-1"
              type="primary"
              onClick={
                isProfilePasswordReset
                  ? onChangedPassword
                  : isForcePasswordReset
                  ? () => setForcePasswordChangeVisible(true)
                  : undefined
              }
            >
              {t('userProfile:changePassword')}
            </Button>
          </div>
        )}
      </div>
      <div className="content-card user-content-card">
        <Form
          name="user-details"
          className="user-details-form"
          layout="vertical"
          form={formOne}
          requiredMark={true}
          onFinish={onSubmitData}
          onValuesChange={handleValuesChange}
        >
          <Row className="row" gutter={[16, 16]}>
            <Col xl={12} md={24}>
              <div className="details-part-one">
                <Form.Item
                  label={t('addUser:name')}
                  initialValue={state?.record?.name}
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: '',
                    },
                    {
                      // eslint-disable-next-line no-unused-vars
                      validator: async (rule, value) => {
                        if (
                          String(value).trim() === '' ||
                          String(value).trim() === undefined ||
                          value === null ||
                          value === undefined
                        ) {
                          throw new Error(`${t('addUser:name')} ${t('addUser:isRequired')}`);
                        }
                      },
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
                <Form.Item
                  label={t('addUser:email')}
                  name="email"
                  initialValue={state?.record?.email}
                  rules={[
                    {
                      required: true,
                      message: '',
                    },
                    {
                      // eslint-disable-next-line no-unused-vars
                      validator: async (rule, value) => {
                        if (
                          String(value).trim() === '' ||
                          String(value).trim() === undefined ||
                          value === null ||
                          value === undefined
                        ) {
                          throw new Error(`${t('addUser:email')} ${t('addUser:isRequired')}`);
                        } else {
                          const val = value.trim();
                          const reg =
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                          const matches = val.match(reg) ? val.match(reg) : [];
                          if (matches.length === 0) {
                            throw new Error(`${t('addUser:email')} ${t('addUser:isInvalid')}`);
                          }
                        }
                      },
                    },
                  ]}
                >
                  <Input
                    disabled={
                      isUpdate &&
                      !ability.can(Action.Update, plainToClass(User, state?.record), 'email')
                    }
                    size="large"
                  />
                </Form.Item>
                <Skeleton loading={isCountryListLoading} active>
                  {countries.length > 0 && (
                    <Form.Item
                      name="phoneNo"
                      label={t('addUser:phoneNo')}
                      initialValue={state?.record?.phoneNo}
                      rules={[
                        {
                          required: false,
                        },
                        {
                          // eslint-disable-next-line no-unused-vars
                          validator: async (rule: any, value: any) => {
                            const phoneNo = formatPhoneNumber(String(value));
                            if (String(value).trim() !== '') {
                              if (
                                (String(value).trim() !== '' &&
                                  String(value).trim() !== undefined &&
                                  value !== null &&
                                  value !== undefined &&
                                  phoneNo !== null &&
                                  phoneNo !== '' &&
                                  phoneNo !== undefined &&
                                  !isPossiblePhoneNumber(String(value))) ||
                                value?.length > 17
                              ) {
                                throw new Error(`${t('addUser:phoneNo')} ${t('isInvalid')}`);
                              }
                            }
                          },
                        },
                      ]}
                    >
                      <PhoneInput
                        placeholder={t('addUser:phoneNo')}
                        international
                        defaultCountry="LK"
                        countryCallingCodeEditable={false}
                        onChange={() => {}}
                        countries={countries}
                      />
                    </Form.Item>
                  )}
                </Skeleton>
                {(role === Role.GovernmentUser || role === Role.Observer) && (
                  <Form.Item
                    label={t('addUser:organisation')}
                    initialValue={state?.record?.organisation}
                    name="organisation"
                    rules={[
                      {
                        required: true,
                        message: `${t('addUser:organisation')} ${t('isRequired')}`,
                      },
                    ]}
                  >
                    <Select size="large" allowClear showSearch>
                      {Object.values(Organisation).map((instrument) => (
                        <Select.Option key={instrument} value={instrument}>
                          {instrument}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </div>
            </Col>
            <Col xl={12} md={24}>
              <div className="details-part-two">
                <Form.Item
                  className="role-group"
                  label={t('addUser:userRole')}
                  initialValue={state?.record?.role}
                  name="role"
                  rules={[
                    {
                      required: true,
                      message: `${t('addUser:userRole')} ${t('addUser:isRequired')}`,
                    },
                  ]}
                >
                  <Radio.Group
                    value={state?.record?.role}
                    size="large"
                    disabled={
                      isUpdate &&
                      !ability.can(Action.Update, plainToClass(User, state?.record), 'role')
                    }
                    onChange={onChangeuserRole}
                  >
                    {state?.record?.role === Role.Root && isUpdate ? (
                      <div className="root-radio-container">
                        {/* <Tooltip placement="top" title={t('addUser:viewerToolTip')}> */}
                        <Radio.Button className="root" value="Root">
                          <KeyOutlined className="role-icons" />
                          {t('addUser:root')}
                        </Radio.Button>
                        {/* </Tooltip> */}
                      </div>
                    ) : (
                      <>
                        <div className="administrator-radio-container">
                          {/* <Tooltip placement="top" title={t('addUser:viewerToolTip')}> */}
                          <Radio.Button className="administrator" value="Admin">
                            <StarOutlined className="role-icons" />
                            {t('addUser:administrator')}
                          </Radio.Button>
                          {/* </Tooltip> */}
                        </div>
                        <div className="government-radio-container">
                          {/* <Tooltip placement="top" title={t('addUser:adminToolTip')}> */}
                          <Radio.Button className="government" value="GovernmentUser">
                            <BankOutlined className="role-icons" />
                            {t('addUser:government')}
                          </Radio.Button>
                          {/* </Tooltip> */}
                        </div>
                        <div className="observer-radio-container">
                          {/* <Tooltip placement="top" title={t('addUser:viewerToolTip')}> */}
                          <Radio.Button className="observer" value="Observer">
                            <ExperimentOutlined className="role-icons" />
                            {t('addUser:observer')}
                          </Radio.Button>
                          {/* </Tooltip> */}
                        </div>
                      </>
                    )}
                  </Radio.Group>
                </Form.Item>

                {role === Role.GovernmentUser && (
                  <Form.Item
                    className="role-group"
                    label={t('addUser:subRole')}
                    initialValue={state?.record?.subRole}
                    name="subRole"
                    rules={[
                      {
                        required: true,
                        message: `${t('addUser:subRole')} ${t('addUser:isRequired')}`,
                      },
                    ]}
                  >
                    <Radio.Group
                      value={state?.record?.subRole}
                      size="large"
                      disabled={
                        isUpdate &&
                        !ability.can(Action.Update, plainToClass(User, state?.record), 'subRole')
                      }
                    >
                      <div className="department-radio-container">
                        {/* <Tooltip placement="top" title={t('addUser:adminToolTip')}> */}
                        <Radio.Button className="department" value="GovernmentDepartment">
                          {t('addUser:department')}
                        </Radio.Button>
                        {/* </Tooltip> */}
                      </div>
                      <div className="consultant-radio-container">
                        {/* <Tooltip placement="top" title={t('addUser:viewerToolTip')}> */}
                        <Radio.Button className="consultant" value="Consultant">
                          {t('addUser:consultant')}
                        </Radio.Button>
                        {/* </Tooltip> */}
                      </div>
                      <div className="seo-radio-container">
                        {/* <Tooltip placement="top" title={t('addUser:viewerToolTip')}> */}
                        <Radio.Button className="seo" value="SEO">
                          {t('addUser:seo')}
                        </Radio.Button>
                        {/* </Tooltip> */}
                      </div>
                    </Radio.Group>
                  </Form.Item>
                )}
                {role === Role.Observer && (
                  <Form.Item
                    className="role-group"
                    label={t('addUser:subRole')}
                    initialValue={state?.record?.subRole}
                    name="subRole"
                    rules={[
                      {
                        required: true,
                        message: `${t('addUser:subRole')} ${t('addUser:isRequired')}`,
                      },
                    ]}
                  >
                    <Radio.Group
                      value={state?.record?.subRole}
                      size="large"
                      disabled={
                        isUpdate &&
                        !ability.can(Action.Update, plainToClass(User, state?.record), 'subRole')
                      }
                    >
                      <div className="tec-rev-radio-container">
                        {/* <Tooltip placement="top" title={t('addUser:adminToolTip')}> */}
                        <Radio.Button className="tec-rev" value="TechnicalReviewer">
                          {t('addUser:tecRev')}
                        </Radio.Button>
                        {/* </Tooltip> */}
                      </div>
                      <div className="dev-partner-radio-container">
                        {/* <Tooltip placement="top" title={t('addUser:viewerToolTip')}> */}
                        <Radio.Button className="dev-partner" value="DevelopmentPartner">
                          {t('addUser:devPartner')}
                        </Radio.Button>
                        {/* </Tooltip> */}
                      </div>
                    </Radio.Group>
                  </Form.Item>
                )}
                {(role === Role.GovernmentUser || role === Role.Observer) && (
                  <Form.Item
                    label={t('addUser:sectors')}
                    initialValue={state?.record?.sector}
                    name="sector"
                    rules={[
                      {
                        required: true,
                        message: `${t('addUser:sector')} ${t('isRequired')}`,
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      // style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      allowClear
                      showSearch
                      disabled={
                        isUpdate &&
                        !ability.can(Action.Update, plainToClass(User, state?.record), 'sector')
                      }
                    >
                      {Object.values(Sector).map((instrument) => (
                        <Select.Option key={instrument} value={instrument}>
                          {instrument}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </div>
            </Col>
          </Row>
          <div className="actions">
            <Form.Item>
              <div className="create-user-btn-container">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={isSaveButtonDisabled}
                >
                  {isUpdate ? t('addUser:update') : t('addUser:submit')}
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      </div>
      <ChangePasswordModel
        t={t}
        onPasswordChanged={onPasswordChangeCompleted}
        onFieldsChanged={onFormsValueChanged}
        onCanceled={onPasswordChangeCanceled}
        openModal={openPasswordChangeModal}
        errorMsg={errorMsg}
        loadingBtn={isLoading}
        themeColor={themeColor}
      ></ChangePasswordModel>
      <ForceResetPasswordModel
        t={t}
        themeColor={themeColor}
        doPasswordReset={forceResetPasswordAction}
        passwordChangeRunning={forcePasswordChangeRunning}
        isModelVisible={forcePasswordChangeVisible}
        setIsModelVisible={setForcePasswordChangeVisible}
      ></ForceResetPasswordModel>
    </div>
  );
};

export default AddUser;
