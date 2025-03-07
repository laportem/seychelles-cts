import './transparencyLogo.scss';
import { Col, Row } from 'antd';
// import countryLogo from '../../Assets/Images/mrvlogo.svg';
import { useNavigate } from 'react-router-dom';
import countryLogo from '../../Assets/Images/gos.png';

const TransparencyLogo: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mrv-logo">
      <Row>
        <Col span={4}>
          <div className="logo-image">
            <img
              src={countryLogo}
              alt="country-logo"
              onClick={() => {
                navigate('/');
              }}
            />
          </div>
        </Col>
        <Col span={18} style={{ marginLeft: '20px' }}>
          <Row className="logo-text">
            <Col span={14}>
              <div className="bold-logo-title">{'TRANSPARENCY'}</div>
            </Col>
            <Col span={10}>
              <div className="logo-title">{'SYSTEM'}</div>
            </Col>
            <Col span={24}>
              <div className="country-logo-title">
                {process.env.REACT_APP_COUNTRY_NAME || 'CountryX'}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default TransparencyLogo;
