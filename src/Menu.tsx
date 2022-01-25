import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { USER_TYPES } from './Enum';
import {useAuth, AuthInfo} from "./auth";
import { useSpring, animated } from 'react-spring';

interface MenuProps {
    children: React.ReactElement,
}

interface MenuInnerProps {
    menuLinks: MenuLink[],
    auth: AuthInfo|undefined,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

interface MenuButtonProps {
    className?: string,
}

interface MenuLink {
    title: string,
    link: string,
    visibility?: (auth?: AuthInfo) => boolean,
}

interface MenuContext {
    isOpen?: boolean,
    setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>,
}

const MENU_LINKS: { [userType: string ]: MenuLink[] } = {
    [USER_TYPES.CUSTOMER]: [ //TODO: Implement when a Customer page is created
    ],
    [USER_TYPES.PROVIDER]: [
        {
            title: 'Dashboard',
            link: '/Provider/Default',
        },
        {
            title: 'Job Opportunties',
            link: '/Provider/Jobs',
        },
        {
            title: 'Invoices',
            link: '/Provider/Invoices.aspx',
        },
        {
            title: 'Compliance Issues',
            link: '/Provider/NonCompliances.aspx',
        },
        {
            title: 'Contracts',
            link: '/Provider/ProviderContracts?tab=awaitingsignature',
        },
        {
            title: 'Account Settings',
            link: '/Provider/MyAccount.aspx',
        },
        {
            title: 'Resources',
            link: '/Provider/Resources.aspx',
        },
        {
            title: 'Mobile App',
            link: '/Provider/TechnicianManagement.aspx',
        },
        {
            title: 'Early Pay',
            link: '/Provider/Invoices.aspx?tab=open',
            visibility: auth => !!auth && isImpersonating(auth),
        },
        {
            title: 'Impersonate',
            link: '/Divisions/Impersonate',
            visibility: auth => !!auth && isImpersonating(auth),
        },
        {
            title: 'Stop Impersonating',
            link: '/Divisions/StopImpersonating',
            visibility: auth => !!auth && isImpersonating(auth),
        },
    ],
    [USER_TYPES.RETAIL]: [ //TODO: Implement when a Retail page is created
    ],
    [USER_TYPES.PROPERTY_MANAGER]: [ //TODO: Implement when a Property Manager page is created
    ],
    [USER_TYPES.DIVISIONS]: [
        {
            title: 'Dashboard',
            link: '/Divisions/Default',
        },
        {
            title: 'Invoice Search',
            link: '/Divisions/InvoiceSearch',
        },
        {
            title: 'Approve Contract Work',
            link: '/Divisions/ContractInvoiceApproval',
        },
        {
            title: 'Contract Admin Queue',
            link: '/Divisions/ContractAdminQueue',
        },
        {
            title: 'Zone Managers',
            link: '/Divisions/ZoneManager',
        },
        {
            title: 'Snow',
            link: '/Divisions/Snow',
        },
        {
            title: 'DM Landscaping Quotes',
            link: '/Quote/Index',
            visibility: auth => !!auth && isImpersonating(auth),
        },
        {
            title: 'DM Snow Quotes',
            link: '/SnowQuote/Index',
            visibility: auth => !!auth && isImpersonating(auth),
        },
        {
            title: 'Impersonate',
            link: '/Divisions/Impersonate'
        },
        {
            title: 'Stop Impersonating',
            link: '/Divisions/StopImpersonating',
            visibility: auth => !!auth && isImpersonating(auth),
        },
    ],
};

const SPRING_CONFIG = {
    mass: 1,
    tension: 210,
    friction: 20,
    clamp: true,
};

const MenuContext = React.createContext<MenuContext>({});

const isImpersonating = (auth: AuthInfo): boolean => auth
    && auth.profile?.provider != null
    && auth.token.impersonator != null;

const isLinkVisible = (auth: AuthInfo|undefined) => (entry: MenuLink) => !entry.visibility || entry.visibility(auth || undefined);

interface MenuItemProps {
    menuItem: MenuLink,
}

const MenuItem = ({ menuItem }: MenuItemProps) => {
    const history = useHistory();
    return (
        <li className="pt-3 pr-12 pb-3 pl-6">
            <a
                href={menuItem.link}
                title={menuItem.title}
                onClick={()=> history.push(menuItem.link)}
            >
                {menuItem.title}
            </a>
        </li>
    );
};

const MenuButton = ({ className }: MenuButtonProps) => {
    const { isOpen, setIsOpen } = useContext(MenuContext);
    const auth = useAuth();

    const userType = auth?.profile?.provider != null ? 2 : 5;

    const style = useSpring({
        config: SPRING_CONFIG,
        width: isOpen ? '0%' : '100%',
        opacity: isOpen ? 0 : 1,
    })

    return userType !== USER_TYPES.ANONYMOUS
        ? (
            <div>
                <animated.div style={style} className="overflow-hidden w-menu-icon">
                    <button
                        className={className}
                        onClick={() => setIsOpen && setIsOpen(!isOpen)}
                    >
                        <FontAwesomeIcon icon={faBars} size="2x"/>
                    </button>
                </animated.div>
            </div>
        )
        : null;
};

const MenuInner = ({ menuLinks, auth, setIsOpen }: MenuInnerProps) => (
    <ul className="bg-main-menu opacity-100 h-screen xl:h-full text-white text-sm">
        <li className="pt-6 pr-5 w-full flex justify-end">
            <a href="#" onClick={() => setIsOpen(false)}>
                <FontAwesomeIcon icon={faTimes} size="2x"/>
            </a>
        </li>
        {menuLinks
            .filter(isLinkVisible(auth))
            .map((item, index) =>
                <MenuItem
                    key={index}
                    menuItem={item}
                />)
        }
    </ul>
);

const Menu = ({ children }: MenuProps) => {
    const [ isOpen, setIsOpen ] = useState<boolean>(false);
    //const { userType } = useContext(UserContext);
    const auth = useAuth();

    const userType = auth?.profile?.provider != null ? 2 : 5;
    const mdStyle = useSpring({
        config: SPRING_CONFIG,
        marginLeft: isOpen ? '0%' : '-33.333333%',
    });
    const xlStyle = useSpring({
        config: SPRING_CONFIG,
        marginLeft: isOpen ? '0%' : '-12.5%',
    });
   
    const menuLinks: MenuLink[]  = (userType && MENU_LINKS[userType]) ? MENU_LINKS[userType] : [];

    return (
        <div className="flex h-screen">
            <animated.div style={mdStyle} className="left-menu absolute z-10 w-1/3 xl:hidden">
                <MenuInner menuLinks={menuLinks} auth={auth} setIsOpen={setIsOpen}/>
            </animated.div>
            <animated.div style={xlStyle} className="left-menu static hidden w-1/8 xl:block">
                <MenuInner menuLinks={menuLinks} auth={auth} setIsOpen={setIsOpen}/>
            </animated.div>
            <div className="flex flex-col flex-1">
                <MenuContext.Provider value={{ isOpen, setIsOpen }}>
                    { children }
                </MenuContext.Provider>
            </div>
        </div>
    );
};

Menu.Button = MenuButton;

export default Menu;
