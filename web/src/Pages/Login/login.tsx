import { Button, Col, Form, Input, Row, Select, Spin, message } from 'antd';
import { FC, Suspense, useContext, useEffect, useState } from 'react';
import './login.scss';
import countryLogo from '../../Assets/Images/mrvlogo.svg';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { AbilityContext } from '../../Casl/Can';
import { updateUserAbility } from '../../Casl/ability';
import ForgotPassword from './forgotPassword';
import ResetPassword from './resetPassword';
import { UserState } from '../../Enums/user.state.enum';

export interface LoginPageProps {
  forgotPassword?: boolean;
  resetPassword?: boolean;
}

interface LoginProps {
  email: string;
  password: string;
}

const Login: FC<LoginPageProps> = (props: LoginPageProps) => {
  const { forgotPassword, resetPassword } = props;
  const { post, updateToken, removeToken } = useConnection();
  const { IsAuthenticated, setUserInfo, isTokenExpired, setIsTokenExpired } = useUserContext();
  const { i18n, t } = useTranslation(['common', 'login']);
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const navigate = useNavigate();
  const ability = useContext(AbilityContext);
  const { state } = useLocation();
  const [errorMsg, setErrorMsg] = useState<string>();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const onSubmit = async (values: LoginProps) => {
    const redirectLocation = state?.from?.pathname + state?.from?.search;
    setLoading(true);
    setShowError(false);
    setErrorMsg(undefined);
    try {
      const email = values.email.trim();
      const response = await post('national/auth/login', {
        username: email.trim(),
        password: values.password.trim(),
      });

      updateUserAbility(ability, {
        id: response.data.id,
        role: response.data.role,
        organisationId: response.data.companyId,
        organisationType: response.data.companyRole,
      });

      if (response.status === 200 || response.status === 201) {
        if (showError) setShowError(false);
        updateToken(response.data.access_token);
        setUserInfo({
          id: response.data.id,
          userRole: response.data.role,
          companyName: response.data.companyName,
          userState: response.data.userState,
          userSectors: response.data.sector,
        });
        removeToken();
        setIsTokenExpired(false);
        return IsAuthenticated(response.data.access_token)
          ? navigate(redirectLocation ? redirectLocation : '/dashboard', { replace: true })
          : navigate('/login');
      }
    } catch (error: any) {
      console.log('Error in Login', error);
      setErrorMsg(error?.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('i18nextLng')!.length > 2) {
      i18next.changeLanguage('en');
    }
  }, []);

  useEffect(() => {
    if (IsAuthenticated()) {
      navigate('/dashboard');
    }
  }, []);

  useEffect(() => {
    const currentUserState: string | null = localStorage.getItem('userState');

    if (currentUserState && currentUserState === UserState.SUSPENDED) {
      message.open({
        type: 'error',
        content: t('login:deactivatedUserAccount'),
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      localStorage.removeItem('userState');
    }
  }, []);

  const onClickForgotPassword = () => {
    navigate('/forgotPassword', { replace: true });
  };

  return (
    <Suspense fallback={<Spin />}>
      {!IsAuthenticated() ? (
        <div className="login-container">
          <Row>
            <Col md={24} lg={15} flex="auto">
              <div className="login-img-container container-image">
                <div className="text-ctn">
                  <span>
                    {t('login:nationalNdc')} <br /> {t('login:creditMrv')} <br />
                    {t('login:management')}
                  </span>
                </div>
              </div>
            </Col>
            <Col md={24} lg={9} flex="auto">
              <Row>
                <Col lg={{ span: 18, offset: 4 }} md={{ span: 24 }} flex="auto">
                  <Row>
                    <Col lg={{ span: 9, offset: 15 }} md={{ span: 24 }} flex="auto">
                      <div className="login-country-logo">
                        <img
                          src={countryLogo}
                          alt="country-logo"
                          onClick={() => {
                            navigate('/');
                          }}
                        />
                      </div>
                      <div className="login-country-name">
                        <div className="title">
                          {'TRANSPARENCY'}
                          <span className="title-sub">{'SYSTEM'}</span>
                        </div>

                        <span className="country-name">
                          {process.env.REACT_APP_COUNTRY_NAME || 'CountryX'}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
              {forgotPassword ? (
                <ForgotPassword />
              ) : resetPassword ? (
                <ResetPassword />
              ) : (
                <>
                  <Row>
                    <Col lg={{ span: 18, offset: 3 }} md={24} flex="auto">
                      <div className="login-text-contents">
                        <span className="login-text-signin">
                          {t('common:login')} <br />
                          <span className="login-text-welcome">{t('login:welcome-back')}</span>
                        </span>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={{ span: 18, offset: 3 }} md={{ span: 18 }} flex="fill">
                      <div className="login-input-fields-container login-input-fields">
                        <Form
                          layout="vertical"
                          onFinish={onSubmit}
                          name="login-details"
                          requiredMark={false}
                        >
                          <Form.Item
                            name="email"
                            label={`${t('common:email')}`}
                            validateTrigger={'onSubmit'}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator() {
                                  if (
                                    getFieldValue('email') &&
                                    !getFieldValue('email')
                                      ?.trim()
                                      .match(
                                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                      )
                                  ) {
                                    return Promise.reject('Please enter a valid email');
                                  }
                                  return Promise.resolve();
                                },
                              }),
                              {
                                required: true,
                                message: 'Email cannot be empty',
                              },
                            ]}
                          >
                            <div className="login-input-email">
                              <Input type="username" />
                            </div>
                          </Form.Item>
                          <Form.Item
                            name="password"
                            validateTrigger={'onSubmit'}
                            label={`${t('common:pwd')}`}
                            rules={[
                              {
                                required: true,
                                message: 'Password cannot be empty',
                              },
                            ]}
                          >
                            <div className="login-input-password">
                              <Input.Password type="password" />
                            </div>
                          </Form.Item>
                          {showError && (
                            <div className="login-error-message-container">
                              <ExclamationCircleOutlined
                                style={{
                                  color: 'rgba(255, 77, 79, 0.8)',
                                  marginRight: '0.5rem',
                                  fontSize: '1.1rem',
                                }}
                              />
                              <span className="ant-form-item-explain-error">
                                {errorMsg ? errorMsg : t('common:loginFailed')}
                              </span>
                            </div>
                          )}
                          <div className="login-forget-pwd-container">
                            <span
                              onClick={() => onClickForgotPassword()}
                              className="login-forget-pwd-txt"
                            >
                              {t('login:forgot-pwd')}?
                            </span>
                          </div>
                          <Form.Item>
                            <div className="login-submit-btn-container">
                              <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                block
                                loading={loading}
                              >
                                {t('common:login')}
                              </Button>
                            </div>
                          </Form.Item>
                          {isTokenExpired && !forgotPassword && !resetPassword && !showError && (
                            <div className="logged-out-section">
                              <div className="info-icon">
                                <ExclamationCircleOutlined
                                  style={{
                                    color: 'rgba(255, 77, 79, 0.8)',
                                    marginRight: '0.5rem',
                                    fontSize: '1.1rem',
                                  }}
                                />
                              </div>
                              <div className="msg">{t('common:sessionExpiredErrorMsg')}</div>
                            </div>
                          )}
                        </Form>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <div className="login-language-selection-container">
                      <span className="login-language-selection-txt">
                        {t('common:language')}
                        <span className="sep">{':'}</span>
                        <Select
                          placeholder="Search to Select"
                          defaultValue={
                            localStorage.getItem('i18nextLng') !== null
                              ? localStorage.getItem('i18nextLng')
                              : 'en'
                          }
                          placement="topRight"
                          onChange={(lan: string) => handleLanguageChange(lan)}
                          optionFilterProp="children"
                          filterOption={(input, option) => (option?.label ?? '').includes(input)}
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '')
                              .toLowerCase()
                              .localeCompare((optionB?.label ?? '').toLowerCase())
                          }
                          options={[
                            {
                              value: 'en',
                              label: 'English',
                            },
                            {
                              value: 'es',
                              label: 'Español',
                            },
                            {
                              value: 'fr',
                              label: 'Français',
                            },
                          ]}
                        />
                      </span>
                    </div>
                  </Row>
                </>
              )}
            </Col>
          </Row>
        </div>
      ) : null}
    </Suspense>
  );
};

export default Login;
