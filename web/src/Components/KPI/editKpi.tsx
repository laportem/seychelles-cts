import { Form, Input, Row, Col, Card } from 'antd';
import './kpiGrid.scss';
import { CreatedKpiData } from '../../Definitions/kpiDefinitions';
import { DeleteOutlined } from '@ant-design/icons';

interface Props {
  index: number;
  form: any;
  rules: any;
  kpi: CreatedKpiData;
  headerNames: string[];
  isFromActivity: boolean;
  updateKPI?: (index: number, property: any, value: string, inWhich: 'created' | 'new') => void;
  removeKPI?: (kpiId: number, inWhich: 'created' | 'new') => void;
}

export const EditKpi: React.FC<Props> = ({
  rules,
  index,
  headerNames,
  kpi,
  updateKPI,
  removeKPI,
  isFromActivity,
}) => {
  return (
    <Row key={index} gutter={30} className="kpi-grid">
      <Col span={12}>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[0]}</label>}
              name={`kpi_name_${index}`}
              rules={isFromActivity ? [] : rules}
              initialValue={kpi?.name}
            >
              <Input
                className="form-input-box"
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'name', e.target.value, 'created');
                  }
                }}
                disabled={isFromActivity}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[1]}</label>}
              name={`kpi_unit_${index}`}
              rules={isFromActivity ? [] : rules}
              initialValue={kpi?.unit}
            >
              <Input
                className="form-input-box"
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'unit', e.target.value, 'created');
                  }
                }}
                disabled={isFromActivity}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={12}>
        <Row gutter={15}>
          <Col span={isFromActivity ? 12 : 11}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[2]}</label>}
              name={`kpi_ach_${index}`}
              initialValue={kpi?.achieved}
              rules={isFromActivity ? rules : []}
            >
              <Input
                type="number"
                min={0}
                step={0.01}
                className="form-input-box"
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'achieved', e.target.value, 'created');
                  }
                }}
                disabled={!isFromActivity}
              />
            </Form.Item>
          </Col>
          <Col span={isFromActivity ? 12 : 11}>
            <Form.Item
              label={<label className="form-item-header">{headerNames[3]}</label>}
              name={`kpi_exp_${index}`}
              rules={isFromActivity ? [] : rules}
              initialValue={kpi?.expected}
            >
              <Input
                type="number"
                min={0}
                step={0.01}
                className="form-input-box"
                onChange={(e) => {
                  if (updateKPI) {
                    updateKPI(index, 'expected', e.target.value, 'created');
                  }
                }}
                disabled={isFromActivity}
              />
            </Form.Item>
          </Col>
          {!isFromActivity && (
            <Col span={2}>
              <Card className="delete-card">
                <DeleteOutlined
                  style={{ cursor: 'pointer', color: '#3A3541', opacity: 0.8 }}
                  onClick={() => {
                    if (removeKPI) {
                      removeKPI(index, 'created');
                    }
                  }}
                />
              </Card>
            </Col>
          )}
        </Row>
      </Col>
    </Row>
  );
};
