import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/shared/hooks/useSidebar";
import { useAuth } from "@/features/Auth/hooks/useAuth";
import { SiteSwitcher } from "@/shared/components/header";
import {
    FaBuildingUser,
    FaBuildingFlag,
    FaBroom,
    FaChevronDown,
    FaCubes,
    FaGear,
    FaRightLeft,
    FaScrewdriverWrench,
    FaShieldHalved,
    FaSignsPost,
    FaTriangleExclamation,
    FaTruckRampBox,
    FaUsersGear,
    FaUserShield,
    FaUserTie,
    FaWrench,
} from "react-icons/fa6";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";

type NavSubItem = {
    icon: React.ReactNode;
    nameKey: string;
    path: string;
    beta?: boolean;
    new?: boolean;
    /** Permission required to view this item */
    permission?: string;
    /** If true, requires current site to be headquarters */
    requiresHQ?: boolean;
};

type NavItem = {
    nameKey: string;
    icon: React.ReactNode;
    path?: string;
    /** Permission required to view this item (for items without subItems) */
    permission?: string;
    /** If true, requires current site to be headquarters */
    requiresHQ?: boolean;
    subItems?: NavSubItem[];
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
                path: "/maintenances",
                permission: "maintenance.viewAny",
            },
            {
                icon: <FaBuildingUser />,
                nameKey: "sidebar.manageCompanies",
                path: "/companies",
                permission: "company.viewAny",
            }
        ],
    },
    {
        icon: <FaTriangleExclamation />,
        nameKey: "sidebar.incidents",
        path: "/incidents",
        permission: "incident.viewAny",
    },
    {
        icon: <FaCubes />,
        nameKey: "sidebar.items",
        subItems: [
            {
                icon: <FaCubes />,
                nameKey: "sidebar.manageItems",
                path: "/items",
                permission: "item.viewAny",
            },
            {
                icon: <FaRightLeft />,
                nameKey: "sidebar.manageItemsMovements",
                path: "/items-movements",
                permission: "item-movement.viewAny",
            },
            {
                icon: <FaTruckRampBox />,
                nameKey: "sidebar.manageSuppliers",
                path: "/suppliers",
                permission: "supplier.viewAny",
            }
        ],
    },
    {
        icon: <FaBroom />,
        nameKey: "sidebar.cleanings",
        path: "/cleanings",
        permission: "cleaning.viewAny",
    },
    {
        icon: <FaWrench />,
        nameKey: "sidebar.materials",
        subItems: [
            {
                icon: <FaWrench />,
                nameKey: "sidebar.manageMaterials",
                path: "/materials",
                permission: "material.viewAny",
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
                path: "/zones",
                permission: "zone.viewAny",
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
                path: "/sites",
                permission: "site.viewAny",
                requiresHQ: true,
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
                path: "/users",
                permission: "user.viewAny",
                requiresHQ: true,
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
                path: "/roles",
                permission: "role.viewAny",
                requiresHQ: true,
            },
            {
                icon: <FaUserShield />,
                nameKey: "sidebar.managePermissions",
                path: "/permissions",
                permission: "permission.viewAny",
                requiresHQ: true,
            }
        ],
    },
    {
        icon: <FaGear />,
        nameKey: "sidebar.settings",
        path: "/settings",
    },
];

export const AppSidebar: React.FC = () => {
    const { t } = useTranslation();
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const { user, hasPermission } = useAuth();
    const location = useLocation();

    // Check if current site is headquarters
    const isOnHeadquarters = useMemo(() => {
        if (!user?.current_site_id || !user?.sites) return false;
        const currentSite = user.sites.find(site => site.id === user.current_site_id);
        return currentSite?.is_headquarters ?? false;
    }, [user?.current_site_id, user?.sites]);

    // Filter navigation items based on permissions and HQ context
    const filterNavItems = useCallback((items: NavItem[]): NavItem[] => {
        return items
            .map(item => {
                // If item has subItems, filter them
                if (item.subItems) {
                    const filteredSubItems = item.subItems.filter(subItem => {
                        // Check HQ requirement
                        if (subItem.requiresHQ && !isOnHeadquarters) return false;
                        // Check permission requirement
                        if (subItem.permission && !hasPermission(subItem.permission)) return false;
                        return true;
                    });

                    // If no subItems remain, exclude the parent
                    if (filteredSubItems.length === 0) return null;

                    return { ...item, subItems: filteredSubItems };
                }

                // For items without subItems
                // Check HQ requirement
                if (item.requiresHQ && !isOnHeadquarters) return null;
                // Check permission requirement
                if (item.permission && !hasPermission(item.permission)) return null;

                return item;
            })
            .filter((item): item is NavItem => item !== null);
    }, [isOnHeadquarters, hasPermission]);

    // Filtered navigation items
    const filteredNavItems = useMemo(() => filterNavItems(navItems), [filterNavItems]);
    const filteredOthersItems = useMemo(() => filterNavItems(othersItems), [filterNavItems]);

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: "main" | "others";
        index: number;
    } | null>(null);
    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
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
            const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
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
    }, [location, isActive, filteredNavItems, filteredOthersItems]);

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

            {/* Site Switcher - Mobile/Tablet only */}
            {isMobileOpen && (
                <div className="px-0 pb-4 lg:hidden">
                    <SiteSwitcher fullWidth dropdownDirection="down" />
                </div>
            )}

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
                            {renderMenuItems(filteredNavItems, "main")}
                        </div>
                        {filteredOthersItems.length > 0 && (
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
                                {renderMenuItems(filteredOthersItems, "others")}
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </aside>
    );
};
