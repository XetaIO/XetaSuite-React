import { useState, useEffect, useCallback, type FC } from "react";
import { useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
    FaArrowLeft,
    FaBuilding,
    FaCalendar,
    FaUsers,
    FaEnvelope,
    FaPhone,
    FaMobile,
    FaLocationDot,
    FaPenToSquare,
    FaMagnifyingGlass,
} from "react-icons/fa6";
import { PageMeta, PageBreadcrumb, Pagination } from "@/shared/components/common";
import { Button, Table, TableHeader, TableBody, TableRow, TableCell } from "@/shared/components/ui";
import { NotFoundContent } from "@/shared/components/errors";
import { useModal } from "@/shared/hooks";
import type { PaginationMeta } from "@/shared/types";
import { formatDate } from "@/shared/utils";
import { useAuth } from "@/features/Auth";
import { SiteManager } from "../services";
import { SiteModal } from "./SiteModal";
import type { Site, SiteMember } from "../types";

const SiteDetailPage: FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { hasPermission } = useAuth();
    const siteId = Number(id);

    // Site state
    const [site, setSite] = useState<Site | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Members state
    const [members, setMembers] = useState<SiteMember[]>([]);
    const [membersMeta, setMembersMeta] = useState<PaginationMeta | null>(null);
    const [membersPage, setMembersPage] = useState(1);
    const [membersSearch, setMembersSearch] = useState("");
    const [isMembersLoading, setIsMembersLoading] = useState(false);

    // Permissions
    const canUpdate = hasPermission("site.update");

    // Modal
    const editModal = useModal();

    // Fetch site details
    useEffect(() => {
        const fetchSite = async () => {
            if (!siteId) return;

            setIsLoading(true);
            setError(null);
            const result = await SiteManager.getById(siteId);
            if (result.success && result.data) {
                setSite(result.data.data);
            } else {
                setError(result.error || t("errors.generic"));
            }
            setIsLoading(false);
        };

        fetchSite();
    }, [siteId, t]);

    // Fetch members with pagination and search
    const fetchMembers = useCallback(async (page: number, search: string) => {
        if (!siteId) return;

        setIsMembersLoading(true);
        const result = await SiteManager.getMembers(siteId, page, search || undefined);
        if (result.success && result.data) {
            setMembers(result.data.data);
            setMembersMeta(result.data.meta);
        }
        setIsMembersLoading(false);
    }, [siteId]);

    useEffect(() => {
        fetchMembers(membersPage, membersSearch);
    }, [fetchMembers, membersPage, membersSearch]);

    const handleMembersPageChange = (page: number) => {
        setMembersPage(page);
    };

    const handleMembersSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMembersSearch(e.target.value);
        setMembersPage(1); // Reset to first page on search
    };

    const handleEditSuccess = async () => {
        // Refresh site data after edit
        const result = await SiteManager.getById(siteId);
        if (result.success && result.data) {
            setSite(result.data.data);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <>
                <PageMeta title={`${t("common.loading")} | XetaSuite`} description={t("common.loading")} />
                <div className="flex h-96 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                </div>
            </>
        );
    }

    // Error state (404 - not found)
    if (error || !site) {
        return (
            <>
                <PageMeta title={`${t("errors.notFound")} | XetaSuite`} description={t("errors.pageNotFound")} />
                <NotFoundContent
                    title={t("sites.notFound")}
                    message={t("sites.notFoundMessage")}
                    backTo="/sites"
                    backLabel={t("sites.detail.backToList")}
                />
            </>
        );
    }

    return (
        <>
            <PageMeta
                title={`${site.name} | ${t("sites.title")} | XetaSuite`}
                description={t("sites.description")}
            />
            <PageBreadcrumb
                pageTitle={site.name}
                breadcrumbs={[{ label: t("sites.title"), path: "/sites" }, { label: site.name }]}
            />

            {/* Site Info Card */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <Link
                                to="/sites"
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                title={t("common.back")}
                            >
                                <FaArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{site.name}</h1>
                            {site.is_headquarters && (
                                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                                    {t("sites.detail.headquarters")}
                                </span>
                            )}
                        </div>
                    </div>
                    {canUpdate && (
                        <Button
                            variant="outline"
                            size="sm"
                            startIcon={<FaPenToSquare className="h-4 w-4" />}
                            onClick={() => editModal.openModal()}
                        >
                            {t("common.edit")}
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-500/20">
                            <FaBuilding className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{site.zone_count}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("sites.detail.totalZones")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 dark:bg-success-500/20">
                            <FaUsers className="h-5 w-5 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{site.user_count}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("sites.detail.totalUsers")}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-500/20">
                            <FaCalendar className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(site.created_at)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("common.createdAt")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Contact Information */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                        {t("sites.detail.contactInfo")}
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <FaEnvelope className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("sites.form.email")}</p>
                                <p className="text-gray-900 dark:text-white">
                                    {site.email ? (
                                        <a href={`mailto:${site.email}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                                            {site.email}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaPhone className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("sites.form.officePhone")}</p>
                                <p className="text-gray-900 dark:text-white">
                                    {site.office_phone ? (
                                        <a href={`tel:${site.office_phone}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                                            {site.office_phone}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaMobile className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("sites.form.cellPhone")}</p>
                                <p className="text-gray-900 dark:text-white">
                                    {site.cell_phone ? (
                                        <a href={`tel:${site.cell_phone}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                                            {site.cell_phone}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FaLocationDot className="mt-0.5 h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("sites.form.address")}</p>
                                <p className="text-gray-900 dark:text-white">
                                    {site.address || site.city || site.zip_code ? (
                                        <>
                                            {site.address && <span>{site.address}<br /></span>}
                                            {(site.zip_code || site.city) && (
                                                <span>
                                                    {site.zip_code} {site.city}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Managers */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                        {t("sites.detail.managers")}
                    </h3>
                    {site.managers && site.managers.length > 0 ? (
                        <div className="space-y-3">
                            {site.managers.map((manager) => (
                                <div
                                    key={manager.id}
                                    className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                                        {manager.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-gray-900 dark:text-white">{manager.full_name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">{t("sites.detail.noManagers")}</p>
                    )}
                </div>
            </div>

            {/* Site Members Table */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                            {t("sites.detail.members")}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t("sites.detail.membersDescription")}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="relative max-w-md">
                        <FaMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("common.search")}
                            value={membersSearch}
                            onChange={handleMembersSearchChange}
                            className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                        {membersSearch && (
                            <button
                                onClick={() => {
                                    setMembersSearch("");
                                    setMembersPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title={t("common.clearSearch")}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-200 dark:border-gray-800">
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("sites.table.fullName")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("sites.table.email")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("sites.table.roles")}
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t("sites.table.createdAt")}
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isMembersLoading ? (
                                [...Array(5)].map((_, index) => (
                                    <TableRow key={index} className="border-b border-gray-100 dark:border-gray-800">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : members.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-gray-500 dark:text-gray-400" colSpan={4}>
                                        {membersSearch ? (
                                            <div>
                                                <p>{t("common.noSearchResults")}</p>
                                                <button
                                                    onClick={() => {
                                                        setMembersSearch("");
                                                        setMembersPage(1);
                                                    }}
                                                    className="mt-2 text-sm text-brand-500 hover:text-brand-600"
                                                >
                                                    {t("common.clearSearch")}
                                                </button>
                                            </div>
                                        ) : (
                                            t("sites.detail.noMembers")
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                members.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {member.avatar ? (
                                                    <img
                                                        src={member.avatar}
                                                        alt={member.full_name}
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                                                        {member.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {member.full_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                                            >
                                                {member.email}
                                            </a>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {member.roles.length > 0 ? (
                                                    member.roles.map((role) => (
                                                        <span
                                                            key={role}
                                                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatDate(member.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {membersMeta && <Pagination meta={membersMeta} onPageChange={handleMembersPageChange} />}
            </div>

            {/* Edit Modal */}
            <SiteModal
                isOpen={editModal.isOpen}
                onClose={editModal.closeModal}
                site={site}
                onSuccess={handleEditSuccess}
            />
        </>
    );
};

export default SiteDetailPage;
