import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useAbilityContext } from '../../Casl/Can';
import { CompanyManagementComponent, CompanyManagementColumns } from '@undp/carbon-library';
import { useTranslation } from 'react-i18next';
import './companyManagement.scss';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const { post } = useConnection();
  const { t } = useTranslation(['company']);

  const visibleColumns = [
    CompanyManagementColumns.logo,
    CompanyManagementColumns.name,
    CompanyManagementColumns.taxId,
    CompanyManagementColumns.companyRole,
    CompanyManagementColumns.programmeCount,
  ];

  const navigateToCompanyProfile = (record: any) => {
    navigate('/companyProfile/view', { state: { record } });
  };

  const navigateToAddNewCompany = () => {
    navigate('/companyManagement/addCompany');
  };

  return (
    <CompanyManagementComponent
      t={t}
      useAbilityContext={useAbilityContext}
      post={post}
      visibleColumns={visibleColumns}
      onNavigateToCompanyProfile={navigateToCompanyProfile}
      onClickAddCompany={navigateToAddNewCompany}
    ></CompanyManagementComponent>
  );
};

export default CompanyManagement;