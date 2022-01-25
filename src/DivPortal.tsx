import React from 'react';
import ProviderRating from './ProviderRating';
import { NOOP } from '@dmg/core/dist/common-types';
import {useExternalState} from "@dmg/protocol";
import { ProviderRatingsState } from '../../@dmg/protocol/src/gen/divisions/protocol/providerRatingsApi.proto.gen';
import {useAuth, AuthInfo} from "./auth";
import Menu from './Menu';
import Loading from './Loading';

interface Props {

}

interface UserContext {
    authInfo: AuthInfo | undefined
}

const DEFAULT_CONTEXT = {
    authInfo: undefined,
};

export const UserContext = React.createContext<UserContext>(DEFAULT_CONTEXT);

const LogInOutLink = ({ isAuthenticated }: { isAuthenticated: boolean}) =>
    <a
        href="#"
        className="text-sm"
        onClick={NOOP}>
        { isAuthenticated ? "Log Out" : "Log In" }
    </a>;

const DivPortal = ({ children }: React.PropsWithChildren<Props>) => {
    const auth = useAuth();

    const context = { authInfo: auth}
    const isAuthenticated = auth?.profile?.name != null;
    const userName = auth?.profile?.name;
    const offices = auth?.profile?.provider?.offices || [];
    const office = offices.length > 0 ? offices[0] : null;
    const providerOfficeId = office?.id || "";
    const subscription = useExternalState(ProviderRatingsState.RatingInfoForProvider, {providerOfficeId})

    if (subscription.status == "pending" || subscription.status !== "current" && subscription.status !== "stale") {
        return <Loading/>;
    }

    const rating = subscription.state[0].value?.providerOffice?.rating || 0;

    return <div>
        <div className="div-portal h-screen overflow-hidden">
            <UserContext.Provider value={context}>
                <div className="font-sans absolute left-0 w-full min-h-full">
                    <Menu>
                        <>
                            <div className="top-bar bg-blue text-white items-center pr-6 pl-6 w-full flex justify-center min-h-top-bar">
                                <div className="inline-flex justify-start flex-grow-0 flex-shrink flex-basis-0">
                                    <Menu.Button className="mr-auto"/>
                                </div>
                                <div className="inline-flex justify-start flex-grow flex-shrink flex-basis-0">
                                    <div className="flex flex-grow max-h-logo">
                                        <Logo/>
                                    </div>
                                </div>
                                <div className="inline-flex justify-center hidden md:flex lg:justify-end flex-grow flex-shrink flex-basis-0">
                                    <div className="ml-auto">
                                        <div className="text-base mb-1">
                                            { userName }
                                        </div>
                                        <div className="flex flex-no-wrap justify-between">
                                            { office &&
                                            <ProviderRating
                                                className="mr-4"
                                                value={rating}
                                                heightClassName={"h-4"}
                                                marginClassName={"mr-1"}
                                                strokeColor={"yellow"}
                                                fillColor={"yellow"} />
                                            }
                                            <LogInOutLink isAuthenticated={isAuthenticated} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="content flex-1">
                                {children}
                            </div>                                
                            <footer className="flex flex-col flex-wrap">
                                <div className="flex flex-col md:flex-row flex-wrap bg-footerBackground text-footerText p-4">
                                    <address className="not-italic m-4">
                                        <p>Divisions Maintenance Group</p>
                                        <p>One Riverfront Place Suite 510</p>
                                        <p>Newport KY 41071</p>
                                        <p><a href="tel:1-877-448-9730">1-877-448-9730</a></p>
                                    </address>
                                    <div className="m-4">
                                        <p>Accounts Payable</p>
                                        <p><a className="text-footerLink" href="mailto:Accountspayable@divisionsinc.com">Accountspayable@divisionsinc.com</a></p>
                                        <p><a href="tel:1-859-655-1055">859-655-1055</a></p>
                                    </div>
                                    <div className="m-4">
                                        <p>Provider Support</p>
                                        <p><a className="text-footerLink" href="mailto:ProviderSupport@divisionsinc.com">ProviderSupport@divisionsinc.com</a></p>
                                    </div>
                                </div>
                                <div className="flex bg-copyrightBackground text-gray p-4">
                                    <div className="ml-4">
                                        © 2020 Divisions Inc. All rights reserved
                                    </div>
                                </div>
                            </footer>
                        </>
                    </Menu>
                </div>
            </UserContext.Provider>
        </div>
    </div>;
};


const Logo: React.FC = () => (
    <svg viewBox="0 0 368 96" style={{fill: "#fff", width: 368, height: 96}}>
        <g>
            <g>
                <path d="M234.29,35.62c0,2.74-2.13,4.39-5.44,4.39h-4.66V31.23h4.66C232.16,31.23,234.29,32.89,234.29,35.62Zm-2,0c0-1.81-1.43-2.68-3.54-2.68h-2.5v5.37h2.5C230.82,38.31,232.25,37.44,232.25,35.62Z"/>
                <path d="M236.08,40V31.23h2V40h-2Z"/>
                <path d="M241.5,31.23,244.82,38l3.29-6.79h2.17L245.84,40h-2.12l-4.44-8.78Z"/>
                <path d="M251.49,40V31.23h2V40h-2Z"/>
                <path d="M265.17,37.37c0,1.72-1.64,2.93-4.75,2.93a8.08,8.08,0,0,1-5.37-1.76l1.16-1.37a6.08,6.08,0,0,0,4.28,1.46c1.79,0,2.69-.34,2.69-1.08s-.9-.92-2.94-1.1c-2.51-.22-4.84-.76-4.84-2.64s2-2.85,4.66-2.85a7.73,7.73,0,0,1,4.71,1.35l-1.1,1.39a5.68,5.68,0,0,0-3.58-1.06c-1.19,0-2.65.2-2.65,1s1.26.83,3,1C263.2,34.84,265.17,35.42,265.17,37.37Z"/>
                <path d="M266.81,40V31.23h2V40h-2Z"/>
                <path d="M270.61,35.62c0-2.93,2.15-4.65,5.58-4.65s5.58,1.72,5.58,4.65-2.15,4.66-5.58,4.66S270.61,38.58,270.61,35.62Zm9.12,0c0-1.88-1.37-2.93-3.54-2.93s-3.54,1.05-3.54,2.93,1.37,2.94,3.54,2.94,3.54-1.06,3.54-2.94Z"/>
                <path d="M293.59,31.23V40h-1.75l-6.29-6.36V40H283.6V31.23h2.13l5.91,6v-6Z"/>
                <path d="M305.28,37.37c0,1.72-1.63,2.93-4.75,2.93a8.1,8.1,0,0,1-5.37-1.76l1.16-1.37a6.08,6.08,0,0,0,4.28,1.46c1.79,0,2.69-.34,2.69-1.08s-.9-.92-2.94-1.1c-2.51-.22-4.83-.76-4.83-2.64S297.46,31,300.17,31a7.7,7.7,0,0,1,4.7,1.35l-1.1,1.39a5.66,5.66,0,0,0-3.58-1.06c-1.19,0-2.64.2-2.64,1s1.25.83,3,1C303.31,34.84,305.28,35.42,305.28,37.37Z"/>
            </g>
            <g>
                <path d="M236,44.15v8.78h-2V46.81l-3.85,4.71H230l-3.85-4.7v6.11h-1.95V44.15h2.2l3.7,4.63,3.71-4.63Z"/>
                <path d="M245.55,51.07h-5.3l-.94,1.86h-2.15l4.65-8.78H244l4.66,8.78H246.5Zm-.85-1.64-1.81-3.58-1.81,3.58Z"/>
                <path d="M249.85,52.93V44.15h2v8.78Z"/>
                <path d="M264.23,44.15v8.78h-1.75l-6.29-6.36v6.36h-1.95V44.15h2.13l5.91,6v-6Z"/>
                <path d="M275.29,45.87h-3.82v7.06h-2V45.87h-3.83V44.15h9.67Z"/>
                <path d="M285.73,51.25v1.68h-9.05V44.15h8.92v1.68h-6.92v1.81h5.77v1.68h-5.77v1.93Z"/>
                <path d="M297.46,44.15v8.78h-1.74l-6.3-6.36v6.36h-1.94V44.15h2.12l5.94,6v-6Z"/>
                <path d="M307.07,51.07h-5.31l-.94,1.86h-2.15l4.66-8.78h2.2l4.65,8.78H308Zm-.85-1.64-1.81-3.58-1.82,3.58Z"/>
                <path d="M321.38,44.15v8.78h-1.74l-6.3-6.36v6.36h-1.95V44.15h2.13l5.94,6v-6Z"/>
                <path d="M331.59,50l1.84.92a5.69,5.69,0,0,1-4.82,2.23c-3.29,0-5.44-1.74-5.44-4.65s2.15-4.66,5.53-4.66a5.52,5.52,0,0,1,4.7,2.24l-1.83.92a3.15,3.15,0,0,0-2.89-1.42c-2.09,0-3.47,1-3.47,2.94s1.38,2.93,3.47,2.93A3.23,3.23,0,0,0,331.59,50Z"/>
                <path d="M344,51.25v1.68H335V44.15h8.92v1.68H337v1.81h5.77v1.68H337v1.93Z"/>
            </g>
            <g>
                <path d="M234.29,64.05a6,6,0,0,1-5,2.06c-3.52,0-5.67-1.72-5.67-4.66s2.15-4.66,5.67-4.66a6.4,6.4,0,0,1,4.56,1.68l-1.56,1.15a3.85,3.85,0,0,0-3-1.1c-2.31,0-3.65,1-3.65,2.95s1.39,3,3.72,3a3.73,3.73,0,0,0,3-1.06v-.85h-3.32V60.89h5.2Z"/>
                <path d="M243.81,65.84l-2.53-3H238.1v3h-2V57.06h6.07c2.15,0,3.77,1,3.77,2.89a2.78,2.78,0,0,1-2.45,2.76l2.71,3.13Zm-1.75-4.66c1.05,0,1.84-.24,1.84-1.23s-.79-1.23-1.84-1.23h-4v2.46Z"/>
                <path d="M247.14,61.43c0-2.93,2.15-4.66,5.58-4.66s5.58,1.73,5.58,4.66-2.15,4.66-5.58,4.66S247.14,64.39,247.14,61.43Zm9.14,0c0-1.88-1.36-2.93-3.54-2.93s-3.53,1-3.53,2.93,1.34,2.93,3.53,2.93S256.28,63.31,256.28,61.43Z"/>
                <path d="M269.85,57v4.64c0,2.64-1.75,4.41-4.93,4.41S260,64.3,260,61.68V57h2v4.5a2.94,2.94,0,0,0,5.87,0V57Z"/>
                <path d="M281.81,60c0,1.95-1.5,3-3.76,3h-4v2.84h-2V57.06h6C280.31,57,281.81,58.09,281.81,60Zm-2,0c0-1-.76-1.3-1.88-1.3h-3.83v2.62h3.83c1.12,0,1.88-.33,1.88-1.32Z"/>
            </g>
        </g>
        <path d="M208.61,71.17a.72.72,0,0,1-.72-.7V25.53a.71.71,0,0,1,.7-.72h0a.72.72,0,0,1,.72.72V70.45a.74.74,0,0,1-.72.72"/>
        <path d="M164.55,44.46v9.2h14.82v4.05c-3.13,2.89-7.48,4-13,4-10.87,0-17-4.82-17-13.7s5.93-13.63,16.81-13.63c6,0,10,1.53,13.87,5l9.51-7.07C185,27.92,177,24,165.89,24c-15,0-25.28,5.81-28.57,16.23V25.49H123.43L106.5,47.1,89.68,25.49H75.44V39.28C71.79,30.49,62.27,25.49,49,25.49H24v45H49c13.28,0,22.8-5,26.45-13.79V70.51H88V41.76l17.82,22h.65l17.83-22V70.51h13V55.77C140.61,66.19,150.91,72,165.87,72c12,0,20.78-4,25.57-10V44.46ZM48,60.08H37V35.9H48C57.55,35.9,63.82,40,63.82,48S57.55,60.08,48,60.08Z"/>
    </svg>    
)


export default DivPortal;