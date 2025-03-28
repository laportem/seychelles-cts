import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import './layout.footer.scss';
import { CcCircle } from 'react-bootstrap-icons';

const LayoutFooter = () => {
  const { t } = useTranslation(['common', 'homepage']);

  return (
    <div className="homepage-footer-container">
      <Row>
        <Col md={10} lg={10}>
          <div className="footertext-bottom">
            <span className="footertext1">{t('homepage:footertext1')}</span>
            <CcCircle className="cc" color="#FFFF" size="14px" />
          </div>
        </Col>
        <Col md={14} lg={14}>
          <div className="footertext-link-container">
            <div>
              {/* Accordion 
              <a href="/info/help" className="footertext-links">
                {t('homepage:Help')}
              </a>
              <a href="/info/status" className="footertext-links">
                {t('homepage:Status')}
              </a>
              */}
              <a href="/info/cookie" className="footertext-links">
                {t('homepage:Cookie')}
              </a>
              <a href="/info/codeOfConduct" className="footertext-links">
                {t('homepage:codeOfConduct')}
              </a>
              <a href="/info/termsOfUse" className="footertext-links">
                {t('homepage:terms')}
              </a>
              <a href="/info/privacy" className="footertext-links">
                {t('homepage:privacy')}
              </a>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LayoutFooter;
