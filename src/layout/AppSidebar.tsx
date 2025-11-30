import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../contexts/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import {
    FaBuildingUser,
    FaBuildingFlag,
    FaBroom,
    FaChevronDown,
    FaCubes,
    FaGear,
    FaMicrochip,
    FaRightLeft,
    FaScrewdriverWrench,
    FaShieldHalved,
    FaSignsPost,
    FaTriangleExclamation,
    FaTruckRampBox,
    FaUsersGear,
    FaUserShield,
    FaUserTie,
} from "react-icons/fa6";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";

type NavItem = {
    nameKey: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { icon: React.ReactNode; nameKey: string; path: string; beta?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
    {
        icon: <LuLayoutDashboard />,
        nameKey: "sidebar.dashboard",
        path: "/"
    },
    {
        icon: <FaScrewdriverWrench />,
        nameKey: "sidebar.maintenances",
        subItems: [
            {
                icon: <FaScrewdriverWrench />,
                nameKey: "sidebar.manageMaintenances",
                path: "/maintenances"
            },
            {
                icon: <FaBuildingUser />,
                nameKey: "sidebar.manageCompanies",
                path: "/compagnies"
            }
        ],
    },
    {
        icon: <FaTriangleExclamation />,
        nameKey: "sidebar.incidents",
        path: "/incidents",
    },
    {
        icon: <FaCubes />,
        nameKey: "sidebar.items",
        subItems: [
            {
                icon: <FaCubes />,
                nameKey: "sidebar.manageItems",
                path: "/items"
            },
            {
                icon: <FaRightLeft />,
                nameKey: "sidebar.manageItemsMovements",
                path: "/items-movements"
            },
            {
                icon: <FaTruckRampBox />,
                nameKey: "sidebar.manageSuppliers",
                path: "/suppliers"
            }
        ],
    },
    {
        icon: <FaBroom />,
        nameKey: "sidebar.cleanings",
        path: "/cleanings",
    },
    {
        icon: <FaMicrochip />,
        nameKey: "sidebar.materials",
        subItems: [
            {
                icon: <FaMicrochip />,
                nameKey: "sidebar.manageMaterials",
                path: "/materials"
            }
        ],
    },
    {
        icon: <FaSignsPost />,
        nameKey: "sidebar.zones",
        subItems: [
            {
                icon: <FaSignsPost />,
                nameKey: "sidebar.manageZones",
                path: "/zones"
            }
        ],
    },
    {
        icon: <FaBuildingFlag />,
        nameKey: "sidebar.sites",
        subItems: [
            {
                icon: <FaBuildingFlag />,
                nameKey: "sidebar.manageSites",
                path: "/sites"
            }
        ],
    },
];

const othersItems: NavItem[] = [
    {
        icon: <FaUsersGear />,
        nameKey: "sidebar.users",
        subItems: [
            {
                icon: <FaUsersGear />,
                nameKey: "sidebar.manageUsers",
                path: "/users"
            }
        ],
    },
    {
        icon: <FaShieldHalved />,
        nameKey: "sidebar.rolesPermissions",
        subItems: [
            {
                icon: <FaUserTie />,
                nameKey: "sidebar.manageRoles",
                path: "/roles"
            },
            {
                icon: <FaUserShield />,
                nameKey: "sidebar.managePermissions",
                path: "/permissions"
            }
        ],
    },
    {
        icon: <FaGear />,
        nameKey: "sidebar.settings",
        path: "/settings",
    },
];

const AppSidebar: React.FC = () => {
    const { t } = useTranslation();
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: "main" | "others";
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
        {}
    );
    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const isActive = useCallback(
        (path: string) => {
            // Exact match for root path
            if (path === "/") {
                return location.pathname === "/";
            }
            // For other paths, check if the current path starts with the menu path
            return location.pathname === path || location.pathname.startsWith(`${path}/`);
        },
        [location.pathname]
    );

    useEffect(() => {
        let submenuMatched = false;
        ["main", "others"].forEach((menuType) => {
            const items = menuType === "main" ? navItems : othersItems;
            items.forEach((nav, index) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        if (isActive(subItem.path)) {
                            setOpenSubmenu({
                                type: menuType as "main" | "others",
                                index,
                            });
                            submenuMatched = true;
                        }
                    });
                }
            });
        });

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [location, isActive]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0,
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return { type: menuType, index };
        });
    };

    const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
        <ul className="flex flex-col gap-4">
            {items.map((nav, index) => (
                <li key={nav.nameKey}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index, menuType)}
                            className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                ? "menu-item-active"
                                : "menu-item-inactive"
                                } cursor-pointer ${!isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "lg:justify-start"
                                }`}
                        >
                            <span
                                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                    ? "menu-item-icon-active"
                                    : "menu-item-icon-inactive"
                                    }`}
                            >
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">{t(nav.nameKey)}</span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <FaChevronDown
                                    className={`ml-auto w-4 h-4 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                        ? "rotate-180 text-brand-500"
                                        : ""
                                        }`}
                                />
                            )}
                        </button>
                    ) : (
                        nav.path && (
                            <Link
                                to={nav.path}
                                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                                    }`}
                            >
                                <span
                                    className={`menu-item-icon-size ${isActive(nav.path)
                                        ? "menu-item-icon-active"
                                        : "menu-item-icon-inactive"
                                        }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{t(nav.nameKey)}</span>
                                )}
                            </Link>
                        )
                    )}
                    {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                        <div
                            ref={(el) => {
                                subMenuRefs.current[`${menuType}-${index}`] = el;
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                height:
                                    openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                        : "0px",
                            }}
                        >
                            <ul className="mt-2 space-y-1 ml-9">
                                {nav.subItems.map((subItem) => (
                                    <li key={subItem.nameKey}>
                                        <Link
                                            to={subItem.path}
                                            className={`menu-dropdown-item ${isActive(subItem.path)
                                                ? "menu-dropdown-item-active"
                                                : "menu-dropdown-item-inactive"
                                                }`}
                                        >
                                            {subItem.icon}
                                            {t(subItem.nameKey)}
                                            <span className="flex items-center gap-1 ml-auto">
                                                {subItem.new && (
                                                    <span
                                                        className={`ml-auto ${isActive(subItem.path)
                                                            ? "menu-dropdown-badge-active"
                                                            : "menu-dropdown-badge-inactive"
                                                            } menu-dropdown-badge`}
                                                    >
                                                        {t('common.new')}
                                                    </span>
                                                )}
                                                {subItem.beta && (
                                                    <span
                                                        className={`ml-auto ${isActive(subItem.path)
                                                            ? "menu-dropdown-badge-active"
                                                            : "menu-dropdown-badge-inactive"
                                                            } menu-dropdown-badge`}
                                                    >
                                                        {t('common.beta')}
                                                    </span>
                                                )}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen
                    ? "w-[290px]"
                    : isHovered
                        ? "w-[290px]"
                        : "w-[90px]"
                }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`${!isMobileOpen ? "py-8" : "py-4"} flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
            >
                <Link to="/" className="hidden lg:flex items-center gap-2">
                    {isExpanded || isHovered ? (
                        <>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                                <span className="text-lg font-bold text-white">X</span>
                            </div>
                            <span className="text-xl font-semibold text-slate-800 dark:text-white/90">XetaSuite</span>
                        </>
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                            <span className="text-lg font-bold text-white">X</span>
                        </div>
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    t('sidebar.jobCategories')
                                ) : (
                                    <HiDotsHorizontal className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(navItems, "main")}
                        </div>
                        <div className="">
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    t('sidebar.managementCategories')
                                ) : (
                                    <HiDotsHorizontal className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(othersItems, "others")}
                        </div>
                    </div>
                </nav>
                {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
            </div>
        </aside>
    );
};

export default AppSidebar;
