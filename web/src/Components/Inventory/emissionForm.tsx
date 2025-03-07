import { Row, Col, DatePicker, Button, message, Collapse, InputNumber, Tooltip } from 'antd';
import './emissionForm.scss';
import { getCollapseIcon, parseToTwoDecimals } from '../../Utils/utilServices';
import {
  AgrLevels,
  EmissionUnits,
  EnergyLevels,
  EnergyOne,
  EnergyThree,
  EnergyTwo,
  IndustryLevels,
  OtherLevels,
  SectionLevels,
  WasteLevels,
} from '../../Enums/emission.enum';
import NumberChip from '../NumberChip/numberChip';
import {
  AgricultureSection,
  EmissionTotals,
  EnergySection,
  IndustrySection,
  OtherSection,
  SectionDefinition,
  SubSectionsDefinition,
  WasteSection,
  agricultureSectionInit,
  emissionSections,
  emissionTotals,
  energySectionInit,
  indSectionInit,
  otherSectionInit,
  processAgrEmissionData,
  processEnergyEmissionData,
  processIndustryEmissionData,
  processOtherEmissionData,
  processWasteEmissionData,
  wasteSectionInit,
} from '../../Definitions/emissionDefinitions';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getEmissionCreatePayload } from '../../Utils/payloadCreators';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import moment, { Moment } from 'moment';
import { GHGRecordState } from '../../Enums/shared.enum';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';

interface Props {
  index: number;
  year: string | null;
  finalized: boolean;
  availableYears: number[];
  gwpSetting: {
    [EmissionUnits.CH4]: number;
    [EmissionUnits.N2O]: number;
  };
  setActiveYear: React.Dispatch<React.SetStateAction<string | undefined>>;
  getAvailableEmissionReports: () => void;
}

const { Panel } = Collapse;

export const EmissionForm: React.FC<Props> = ({
  index,
  year,
  finalized,
  availableYears,
  gwpSetting,
  setActiveYear,
  getAvailableEmissionReports,
}) => {
  // context Usage
  const { t } = useTranslation(['emission', 'entityAction', 'error']);
  const { get, post } = useConnection();
  const { isValidationAllowed, isGhgAllowed } = useUserContext();

  // Button Controls

  const [isEdited, setIsEdited] = useState<boolean>(false);

  // Year State

  const [emissionYear, setEmissionYear] = useState<string>();
  const [isYearFixed, setIsYearFixed] = useState<boolean>();

  // Finalized State

  const [isFinalized, setIsFinalized] = useState<boolean>();

  // Section State

  const [energySection, setEnergySection] = useState<EnergySection>(
    JSON.parse(JSON.stringify(energySectionInit))
  );
  const [industrySection, setIndustrySection] = useState<IndustrySection>({ ...indSectionInit });
  const [agrSection, setAgrSection] = useState<AgricultureSection>({ ...agricultureSectionInit });
  const [wasteSection, setWasteSection] = useState<WasteSection>({ ...wasteSectionInit });
  const [otherSection, setOtherSection] = useState<OtherSection>({ ...otherSectionInit });

  // Total State

  const [emissionTotal, setEmissionTotal] = useState<EmissionTotals>({ ...emissionTotals });

  // Emission Total Update for Section State Change

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EnergyLevels).forEach((mainLevel) => {
      Object.values(EmissionUnits).forEach((unit) => {
        let unitTotal = 0;
        if (mainLevel === EnergyLevels.OneA) {
          Object.values(EnergyOne).forEach((level) => {
            unitTotal = unitTotal + (energySection[mainLevel][level][unit] ?? 0);
          });
        } else if (mainLevel === EnergyLevels.OneB) {
          Object.values(EnergyTwo).forEach((level) => {
            unitTotal = unitTotal + (energySection[mainLevel][level][unit] ?? 0);
          });
        } else {
          Object.values(EnergyThree).forEach((level) => {
            unitTotal = unitTotal + (energySection[mainLevel][level][unit] ?? 0);
          });
        }
        currentEmissionTotal[SectionLevels.One][mainLevel][unit] = unitTotal;
      });
    });
    setEmissionTotal(currentEmissionTotal);
  }, [energySection]);

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EmissionUnits).forEach((unit) => {
      let unitTotal = 0;
      Object.values(IndustryLevels).forEach((level) => {
        unitTotal = unitTotal + (industrySection[level][unit] ?? 0);
      });
      currentEmissionTotal[SectionLevels.Two][unit] = unitTotal;
    });
    setEmissionTotal(currentEmissionTotal);
  }, [industrySection]);

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EmissionUnits).forEach((unit) => {
      let unitTotal = 0;
      Object.values(AgrLevels).forEach((level) => {
        unitTotal = unitTotal + (agrSection[level][unit] ?? 0);
      });
      currentEmissionTotal[SectionLevels.Three][unit] = unitTotal;
    });
    setEmissionTotal(currentEmissionTotal);
  }, [agrSection]);

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EmissionUnits).forEach((unit) => {
      let unitTotal = 0;
      Object.values(WasteLevels).forEach((level) => {
        unitTotal = unitTotal + (wasteSection[level][unit] ?? 0);
      });
      currentEmissionTotal[SectionLevels.Four][unit] = unitTotal;
    });
    setEmissionTotal(currentEmissionTotal);
  }, [wasteSection]);

  useEffect(() => {
    const currentEmissionTotal = { ...emissionTotal };
    Object.values(EmissionUnits).forEach((unit) => {
      let unitTotal = 0;
      Object.values(OtherLevels).forEach((level) => {
        unitTotal = unitTotal + (otherSection[level][unit] ?? 0);
      });
      currentEmissionTotal[SectionLevels.Five][unit] = unitTotal;
    });
    setEmissionTotal(currentEmissionTotal);
  }, [otherSection]);

  // Initializing Function

  // Year Emission Data Loading Function

  const getYearEmission = async () => {
    if (year) {
      try {
        const response = await get(`national/emissions/${year}`);

        if (response.status === 200 || response.status === 201) {
          setEnergySection(processEnergyEmissionData(response.data[0].energyEmissions));
          setIndustrySection(
            processIndustryEmissionData(response.data[0].industrialProcessesProductUse)
          );
          setAgrSection(processAgrEmissionData(response.data[0].agricultureForestryOtherLandUse));
          setWasteSection(processWasteEmissionData(response.data[0].waste));
          setOtherSection(processOtherEmissionData(response.data[0].other));
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error);
        displayErrorMessage(error, t('errorFetchingEmissionForYear'));
      }
    }
  };

  // Revert All State to Zero

  const revertToInit = () => {
    setEnergySection(JSON.parse(JSON.stringify(energySectionInit)));
    setIndustrySection({ ...indSectionInit });
    setAgrSection({ ...agricultureSectionInit });
    setWasteSection({ ...wasteSectionInit });
    setOtherSection({ ...otherSectionInit });

    setEmissionTotal({ ...emissionTotals });
    setEmissionYear(undefined);
    setIsFinalized(false);
    setIsYearFixed(false);
  };

  useEffect(() => {
    if (year) {
      setEmissionYear(year);
      setIsFinalized(finalized);
      setIsYearFixed(true);
      getYearEmission();
    }
  }, []);

  // Handle Data Enter

  const setIndividualEntry = (
    enteredValue: number | undefined,
    section: string,
    levelTwo: any,
    levelThree: any,
    unit: EmissionUnits
  ) => {
    if (!isEdited) {
      setIsEdited(true);
    }
    const newValue = enteredValue ? parseToTwoDecimals(enteredValue) : 0;
    switch (section) {
      case '1':
        const energy = levelTwo as EnergyLevels;
        let secondLevel;
        const newEnergyState: EnergySection = { ...energySection };

        if (energy === EnergyLevels.OneA) {
          secondLevel = levelThree as EnergyOne;
          newEnergyState[energy][secondLevel][unit] = newValue;
        } else if (energy === EnergyLevels.OneB) {
          secondLevel = levelThree as EnergyTwo;
          newEnergyState[energy][secondLevel][unit] = newValue;
        } else if (energy === EnergyLevels.OneC) {
          secondLevel = levelThree as EnergyThree;
          newEnergyState[energy][secondLevel][unit] = newValue;
        }
        setEnergySection(newEnergyState);
        return;
      case '2':
        const industry = levelTwo as IndustryLevels;
        setIndustrySection((prevState) => ({
          ...prevState,
          [industry]: {
            ...prevState[industry],
            [unit]: newValue,
          },
        }));
        return;
      case '3':
        const agriculture = levelTwo as AgrLevels;
        setAgrSection((prevState) => ({
          ...prevState,
          [agriculture]: {
            ...prevState[agriculture],
            [unit]: newValue,
          },
        }));
        return;
      case '4':
        const waste = levelTwo as WasteLevels;
        setWasteSection((prevState) => ({
          ...prevState,
          [waste]: {
            ...prevState[waste],
            [unit]: newValue,
          },
        }));
        return;
      case '5':
        const other = levelTwo as OtherLevels;
        setOtherSection((prevState) => ({
          ...prevState,
          [other]: {
            ...prevState[other],
            [unit]: newValue,
          },
        }));
        return;
    }
  };

  // Getter for Correct State

  const getIndividualEntry = (
    section: string,
    levelTwo: any,
    levelThree: any,
    unit: EmissionUnits
  ) => {
    switch (section) {
      case '1':
        const energy = levelTwo as EnergyLevels;
        let secondLevel;

        if (energy === EnergyLevels.OneA) {
          secondLevel = levelThree as EnergyOne;
          return energy && secondLevel ? energySection[energy][secondLevel][unit] : undefined;
        } else if (energy === EnergyLevels.OneB) {
          secondLevel = levelThree as EnergyTwo;
          return energy && secondLevel ? energySection[energy][secondLevel][unit] : undefined;
        } else if (energy === EnergyLevels.OneC) {
          secondLevel = levelThree as EnergyThree;
          return energy && secondLevel ? energySection[energy][secondLevel][unit] : undefined;
        } else {
          return undefined;
        }
      case '2':
        const industry = levelTwo as IndustryLevels;
        return industry ? industrySection[industry][unit] : undefined;
      case '3':
        const agriculture = levelTwo as AgrLevels;
        return agriculture ? agrSection[agriculture][unit] : undefined;
      case '4':
        const waste = levelTwo as WasteLevels;
        return waste ? wasteSection[waste][unit] : undefined;
      case '5':
        const other = levelTwo as OtherLevels;
        return other ? otherSection[other][unit] : undefined;
    }
  };

  // Get Section Sum

  const getSubSectionUnitSum = (subSection: EnergyLevels, unit: EmissionUnits) => {
    return emissionTotal[SectionLevels.One][subSection][unit] ?? 0;
  };

  // Get Section Sum

  const getSectionUnitSum = (section: string, unit: EmissionUnits) => {
    switch (section) {
      case '1':
        return (
          getSubSectionUnitSum(EnergyLevels.OneA, unit) +
          getSubSectionUnitSum(EnergyLevels.OneB, unit) +
          getSubSectionUnitSum(EnergyLevels.OneC, unit)
        );
      case '2':
        return emissionTotal[section][unit];
      case '3':
        return emissionTotal[section][unit];
      case '4':
        return emissionTotal[section][unit];
      case '5':
        return emissionTotal[section][unit];
    }
  };

  // Get Overall Sum

  const getOverallUnitSum = (unit: EmissionUnits) => {
    let overallSum = 0;

    Object.values(SectionLevels).map(
      (section) => (overallSum += getSectionUnitSum(section, unit) ?? 0)
    );

    return overallSum ?? 0;
  };

  // GWP Multiplier

  const convertToEquivalentEmission = (rawValue: number, unit: EmissionUnits) => {
    switch (unit) {
      case EmissionUnits.CH4:
        return gwpSetting[EmissionUnits.CH4] * rawValue;
      case EmissionUnits.N2O:
        return gwpSetting[EmissionUnits.N2O] * rawValue;
      default:
        return 1 * rawValue;
    }
  };

  // Get EQV Sum with Land

  const getOverallEquivalentWithLands = (unit: EmissionUnits) => {
    let overallSum = 0;

    Object.values(SectionLevels).map(
      (section) => (overallSum += getSectionUnitSum(section, unit) ?? 0)
    );

    const convertedSum = convertToEquivalentEmission(overallSum, unit);

    return convertedSum ?? 0;
  };

  // Get EQV Sum without Land

  const getOverallEquivalentWithoutLands = (unit: EmissionUnits) => {
    let overallSum = 0;

    Object.values(SectionLevels).map(
      (section) => (overallSum += getSectionUnitSum(section, unit) ?? 0)
    );

    const overallSumWithoutLand = overallSum - (agrSection[AgrLevels.ThreeB][unit] ?? 0);
    const convertedSum = convertToEquivalentEmission(overallSumWithoutLand, unit);

    return convertedSum ?? 0;
  };

  // Handle Submit

  const handleEmissionAction = async () => {
    try {
      if (emissionYear) {
        const emissionCreatePayload = getEmissionCreatePayload(
          emissionYear,
          energySection,
          industrySection,
          agrSection,
          wasteSection,
          otherSection
        );

        const response: any = await post('national/emissions/add', emissionCreatePayload);

        if (response.status === 200 || response.status === 201) {
          setIsEdited(false);
          message.open({
            type: 'success',
            content: index === 0 ? t('emissionCreationSuccess') : t('emissionUpdateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          getAvailableEmissionReports();

          if (index === 0) {
            revertToInit();
            setActiveYear(emissionYear);
          }
        }
      } else {
        message.open({
          type: 'error',
          content: t('emissionYearRequired'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
      }
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  // Handle Validate

  const handleValidateAction = async (state: GHGRecordState) => {
    try {
      if (emissionYear) {
        const emissionValidatePayload = {
          year: emissionYear,
          state: state,
        };

        const response: any = await post('national/emissions/validate', emissionValidatePayload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content:
              state === GHGRecordState.FINALIZED
                ? t('emissionValidateSuccess')
                : t('emissionUnvalidateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          getAvailableEmissionReports();
          setActiveYear(emissionYear);
          setIsFinalized(state === GHGRecordState.FINALIZED);
        }
      }
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const disabledDate = (current: Moment | null): boolean => {
    return current ? availableYears.includes(current.year()) : false;
  };

  return (
    <div key={index} className="emission-form">
      <Row gutter={25} className="first-row" align={'middle'}>
        <Col span={6} className="year-picker-column">
          <DatePicker
            key={`date_picker_${index}`}
            disabled={isYearFixed || !isGhgAllowed}
            value={emissionYear ? moment(emissionYear, 'YYYY') : null}
            onChange={(value) => setEmissionYear(value ? value.format('YYYY') : undefined)}
            className="year-picker"
            picker="year"
            size="middle"
            placeholder="Select Emission Year"
            autoFocus={index === 0 ? true : false}
            disabledDate={disabledDate}
          />
        </Col>
      </Row>
      <Row gutter={25} className="unit-row" align={'middle'}>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`unit_${unit}`} span={3}>
            <div className="unit-div">{t(`${unit}`)}</div>
          </Col>
        ))}
      </Row>
      <Row gutter={25} className="total-row" align={'middle'}>
        <Col className="total-div" span={12}>
          {t('totalRowHeader')}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`total_${unit}`} span={3}>
            <NumberChip value={getOverallUnitSum(unit)} valueType={unit} />
          </Col>
        ))}
      </Row>
      <Row className="collapsing-row">
        <Col span={24}>
          <Collapse ghost={true} expandIcon={({ isActive }) => getCollapseIcon(isActive ?? false)}>
            {emissionSections.map((section: SectionDefinition, sectionIndex: number) => (
              <Panel
                header={
                  <Row gutter={25} className="sector-header-row">
                    <Col className="title-div" span={12}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span>{sectionIndex + 1}</span>
                        <span>{t(`${section.id}_title`)}</span>
                      </div>
                    </Col>
                    {Object.values(EmissionUnits).map((unit) => (
                      <Col key={`section_${section.id}_${unit}`} span={3}>
                        <NumberChip
                          value={getSectionUnitSum(section.id, unit) ?? 0}
                          valueType={unit}
                        />
                      </Col>
                    ))}
                  </Row>
                }
                key={`emission_section${section.id}`}
              >
                {section.mainSections &&
                  section.mainSections.map((mainSection: any) => (
                    <Row
                      key={`level_two_${mainSection}`}
                      gutter={25}
                      className="input-number-row"
                      align={'middle'}
                    >
                      <Col span={12} className="title-div">
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span>{mainSection}</span>
                          <span>{t(`${mainSection}_title`)}</span>
                        </div>
                      </Col>
                      {Object.values(EmissionUnits).map((unit) => (
                        <Col key={`${mainSection}_${unit}`} span={3} className="number-column">
                          <InputNumber
                            disabled={isFinalized || !isGhgAllowed}
                            value={getIndividualEntry(section.id, mainSection, null, unit)}
                            onChange={(value) =>
                              setIndividualEntry(
                                value ?? undefined,
                                section.id,
                                mainSection,
                                null,
                                unit
                              )
                            }
                            decimalSeparator="."
                            controls={false}
                            className="input-emission"
                          />
                        </Col>
                      ))}
                    </Row>
                  ))}
                {section.subSections &&
                  section.subSections.map((subSection: SubSectionsDefinition) => (
                    <div key={`level_three_${subSection.id}`}>
                      <Row gutter={25} className="sector-sub-header-row" align={'middle'}>
                        <Col className="title-div" span={12}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <span>{subSection.id}</span>
                            <span>{t(`${subSection.id}_title`)}</span>
                          </div>
                        </Col>
                        {Object.values(EmissionUnits).map((unit) => (
                          <Col key={`subsection_${subSection.id}_${unit}`} span={3}>
                            <NumberChip
                              value={getSubSectionUnitSum(subSection.id, unit)}
                              valueType={unit}
                            />
                          </Col>
                        ))}
                      </Row>
                      {subSection.sections &&
                        subSection.sections.map((secondarySection: any) => (
                          <Row
                            key={`level_three_${secondarySection}`}
                            gutter={25}
                            className="input-number-row"
                            align={'middle'}
                          >
                            <Col className="title-div" span={12}>
                              <div style={{ display: 'flex', gap: '10px', paddingLeft: '50px' }}>
                                <span>{secondarySection}</span>
                                <span>{t(`${secondarySection}_title`)}</span>
                              </div>
                            </Col>
                            {Object.values(EmissionUnits).map((unit) => (
                              <Col
                                key={`${secondarySection}_${unit}`}
                                span={3}
                                className="number-column"
                              >
                                <InputNumber
                                  disabled={isFinalized || !isGhgAllowed}
                                  value={getIndividualEntry(
                                    section.id,
                                    subSection.id,
                                    secondarySection,
                                    unit
                                  )}
                                  onChange={(value) =>
                                    setIndividualEntry(
                                      value ?? undefined,
                                      section.id,
                                      subSection.id,
                                      secondarySection,
                                      unit
                                    )
                                  }
                                  decimalSeparator="."
                                  controls={false}
                                  className="input-emission"
                                />
                              </Col>
                            ))}
                          </Row>
                        ))}
                    </div>
                  ))}
              </Panel>
            ))}
          </Collapse>
        </Col>
      </Row>
      <Row gutter={25} className="input-number-row" align={'middle'}>
        <Col className="title-div" span={12}>
          {t('eqWithoutHeader')}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`eqWithout_${unit}`} span={3} className="number-column">
            <InputNumber
              disabled={true}
              value={getOverallEquivalentWithoutLands(unit)}
              decimalSeparator="."
              controls={false}
              className="input-emission"
            />
          </Col>
        ))}
      </Row>
      <Row gutter={25} className="input-number-row" align={'middle'}>
        <Col className="title-div" span={12}>
          {t('eqWithHeader')}
        </Col>
        {Object.values(EmissionUnits).map((unit) => (
          <Col key={`eqWith_${unit}`} span={3} className="number-column">
            <InputNumber
              disabled={true}
              value={getOverallEquivalentWithLands(unit)}
              decimalSeparator="."
              controls={false}
              className="input-emission"
            />
          </Col>
        ))}
      </Row>
      {isGhgAllowed && (
        <Row gutter={20} className="action-row" justify={'end'}>
          {!isFinalized && (
            <Col>
              <Button
                disabled={isFinalized || !isEdited}
                type="primary"
                size="large"
                block
                onClick={() => handleEmissionAction()}
              >
                {t('entityAction:update')}
              </Button>
            </Col>
          )}
          {index !== 0 && (
            <Col>
              <Tooltip
                placement="topRight"
                title={!isValidationAllowed ? t('error:validationPermissionRequired') : undefined}
                showArrow={false}
              >
                <Button
                  disabled={year === null || isEdited || !isValidationAllowed}
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  onClick={() =>
                    handleValidateAction(
                      isFinalized ? GHGRecordState.SAVED : GHGRecordState.FINALIZED
                    )
                  }
                >
                  {isFinalized ? t('entityAction:unvalidate') : t('entityAction:validate')}
                </Button>
              </Tooltip>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};
