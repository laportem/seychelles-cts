import { Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConnectionContextProvider } from './Context/ConnectionContext/connectionContext';
import 'antd/dist/antd.css';
import './Styles/theme.less';
import './Styles/app.scss';
import Login from './Pages/Login/login';
import { UserInformationContextProvider } from './Context/UserInformationContext/userInformationContext';
import PrivateRoute from './Components/PrivateRoute/privateRoute';
import SignUp from './Pages/Signup/signup';
import CustomLayout from './Components/Layout/layout';
import AddUser from './Pages/AddUser/addUser';
import UserManagement from './Pages/UserManagement/userManagement';
import Dashboard from './Pages/Dashboard/dashboard';
import AddNewCompany from './Pages/Company/addNewCompany';
import CompanyManagement from './Pages/CompanyManagement/companyManagement';
import ProgrammeManagement from './Pages/ProgrammeManagement/programmeManagement';
import ProgrammeView from './Pages/ProgrammeView/programmeView';
import i18next from 'i18next';
import 'mapbox-gl/dist/mapbox-gl.css';
import Homepage from './Pages/Homepage/homepage';
import PrivacyPolicy from './Pages/PrivacyPolicy/privacyPolicy';
import CodeOfConduct from './Pages/CodeofConduct/codeofConduct';
import CookiePolicy from './Pages/CookiePolicy/cookiePolicy';
import TermsOfUse from './Pages/TermsofUse/termsofUse';
import CarbonHelp from './Pages/Help/help';
import UserProfile from './Pages/UserProfile/UserProfile';
import CompanyProfile from './Pages/CompanyProfile/companyProfile';
import { AbilityContext } from './Casl/Can';
import { defineAbility, updateUserAbility } from './Casl/ability';
import { SettingsContextProvider } from './Context/SettingsContext/settingsContext';
import { AddProgrammeComponent } from './Pages/Programme/programmeCreation';
import InvestmentManagement from './Pages/InvestmentManagement/investmentManagement';
import AddNdcAction from './Pages/AddNdcAction/addNdcAction';
import { AddInvestmentComponent } from './Pages/InvestmentManagement/investmentCreation';
import NdcActionManagement from './Pages/NdcActionManagement/ndcActionManagement';
import NdcActionView from './Pages/NdcActionView/ndcActionView';

// message.config({
//   duration: 60,
// });

const App = () => {
  const ability = defineAbility();
  useEffect(() => {
    console.log(process.env.REACT_APP_BACKEND);
    console.log(process.env.REACT_APP_STAT_URL);
    if (
      localStorage.getItem('companyId') &&
      localStorage.getItem('userRole') &&
      localStorage.getItem('userId') &&
      localStorage.getItem('companyState') &&
      localStorage.getItem('companyRole')
    )
      updateUserAbility(ability, {
        id: parseInt(localStorage.getItem('userId') as string),
        role: localStorage.getItem('userRole') as string,
        companyId: parseInt(localStorage.getItem('companyId') as string),
        companyState: parseInt(localStorage.getItem('companyState') as string),
        companyRole: localStorage.getItem('companyRole') as string,
      });
  }, []);
  return (
    <AbilityContext.Provider value={ability}>
      <ConnectionContextProvider
        serverURL={
          process.env.REACT_APP_BACKEND
            ? process.env.REACT_APP_BACKEND
            : 'http://localhost:3000/local'
        }
      >
        <UserInformationContextProvider>
          <SettingsContextProvider>
            <BrowserRouter>
              <Routes>
                <Route path="login" element={<Login />} />
                <Route path="forgotPassword" element={<Login forgotPassword={true} />} />
                <Route path="resetPassword/:requestid" element={<Login resetPassword={true} />} />
                <Route path="signUp" element={<SignUp />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="help" element={<CarbonHelp />} />
                <Route path="codeconduct" element={<CodeOfConduct />} />
                <Route path="cookie" element={<CookiePolicy />} />
                <Route path="terms" element={<TermsOfUse />} />
                <Route path="/" element={<Homepage />} />
                <Route path="/" element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<CustomLayout selectedKey="dashboard" />}>
                    <Route index element={<Dashboard />} />
                  </Route>
                  <Route
                    path="/programmeManagement"
                    element={<CustomLayout selectedKey="programmeManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<ProgrammeManagement />} />
                    <Route path="view" element={<ProgrammeView />} />
                    <Route path="addProgramme" element={<AddProgrammeComponent />} />
                    <Route path="addNdcAction" element={<AddNdcAction />} />
                  </Route>
                  <Route
                    path="/investmentManagement"
                    element={<CustomLayout selectedKey="investmentManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<InvestmentManagement />} />
                    <Route path="addInvestment" element={<AddInvestmentComponent />} />
                  </Route>
                  <Route
                    path="/ndcManagement"
                    element={<CustomLayout selectedKey="ndcManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<NdcActionManagement />} />
                    <Route path="view" element={<NdcActionView />} />
                  </Route>
                  <Route
                    path="/companyManagement"
                    element={<CustomLayout selectedKey="companyManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<CompanyManagement />} />
                    <Route path="addCompany" element={<AddNewCompany />} />
                    <Route path="updateCompany" element={<AddNewCompany />} />
                  </Route>
                  <Route
                    path="/userManagement"
                    element={<CustomLayout selectedKey="userManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<UserManagement />} />
                    <Route path="addUser" element={<AddUser />} />
                    <Route path="updateUser" element={<AddUser />} />
                  </Route>
                  <Route
                    path="/userProfile"
                    element={<CustomLayout selectedKey="userManagement/viewAll" />}
                  >
                    <Route path="view" element={<UserProfile />} />
                  </Route>
                  <Route
                    path="/companyProfile"
                    element={<CustomLayout selectedKey="companyManagement/viewAll" />}
                  >
                    <Route path="view" element={<CompanyProfile />} />
                  </Route>
                  {/* <Route
                      path="/userManagement"
                      element={<CustomLayout selectedKey="userManagement" />}
                    >
                      <Route index element={<UserManagement />} />
                      <Route path="addUser" element={<AddUser />} />
                      <Route path="updateUser" element={<UpdateUser />} />
                    </Route> */}
                </Route>
                <Route path="/*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </SettingsContextProvider>
        </UserInformationContextProvider>
      </ConnectionContextProvider>
    </AbilityContext.Provider>
  );
};

export default App;