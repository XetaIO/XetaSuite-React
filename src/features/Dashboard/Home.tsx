import { useSearchParams } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PageMeta from "@/shared/components/common/PageMeta";
import ComponentCard from "@/shared/components/common/ComponentCard";
import LineChartOne from "@/shared/components/charts/line/LineChartOne";
import BarChartOne from "@/shared/components/charts/bar/BarChartOne";
import { QrCodeScanModal } from "@/features/Qrcode/views";
import {
  StatCard,
  RecentActivityCard,
  UpcomingMaintenancesCard,
  LowStockItemsCard,
  IncidentsSummaryCard,
  type Activity,
  type Maintenance,
  type LowStockItem,
  type IncidentsSummary,
} from "../../shared/components/dashboard";
import {
  FaScrewdriverWrench,
  FaTriangleExclamation,
  FaBoxesStacked,
  FaBuilding,
} from "react-icons/fa6";

// Fake data
const recentActivities: Activity[] = [
  {
    id: 1,
    type: "maintenance",
    title: "Maintenance CVC - Bâtiment A",
    description: "Remplacement des filtres climatisation",
    time: "Il y a 2 heures",
    status: "completed",
  },
  {
    id: 2,
    type: "incident",
    title: "Fuite d'eau détectée",
    description: "Zone B2 - Sanitaires niveau 2",
    time: "Il y a 4 heures",
    status: "in_progress",
  },
  {
    id: 3,
    type: "cleaning",
    title: "Nettoyage quotidien terminé",
    description: "Hall d'entrée principal",
    time: "Il y a 5 heures",
    status: "completed",
  },
  {
    id: 4,
    type: "item",
    title: "Réception de stock",
    description: "45 unités de produits d'entretien",
    time: "Il y a 6 heures",
    status: "completed",
  },
  {
    id: 5,
    type: "incident",
    title: "Panne ascenseur",
    description: "Ascenseur n°2 - Tour Est",
    time: "Hier",
    status: "pending",
  },
];

const upcomingMaintenances: Maintenance[] = [
  {
    id: 1,
    title: "Révision groupe électrogène",
    location: "Local technique - Sous-sol",
    date: "02 Déc. 2025 - 09:00",
    priority: "high",
    type: "preventive",
  },
  {
    id: 2,
    title: "Contrôle extincteurs",
    location: "Tous les bâtiments",
    date: "05 Déc. 2025 - 14:00",
    priority: "medium",
    type: "preventive",
  },
  {
    id: 3,
    title: "Réparation porte automatique",
    location: "Entrée principale",
    date: "06 Déc. 2025 - 10:30",
    priority: "low",
    type: "corrective",
  },
];

const lowStockItems: LowStockItem[] = [
  {
    id: 1,
    name: "Gants de protection",
    sku: "EPI-GLV-001",
    currentStock: 12,
    minStock: 50,
    unit: "paires",
  },
  {
    id: 2,
    name: "Détergent multi-surfaces",
    sku: "CLN-DET-003",
    currentStock: 8,
    minStock: 20,
    unit: "L",
  },
  {
    id: 3,
    name: "Ampoules LED E27",
    sku: "ELC-LED-027",
    currentStock: 15,
    minStock: 30,
    unit: "unités",
  },
  {
    id: 4,
    name: "Filtres CVC",
    sku: "CVC-FLT-012",
    currentStock: 4,
    minStock: 10,
    unit: "unités",
  },
];

const incidentsSummary: IncidentsSummary = {
  total: 47,
  open: 8,
  inProgress: 12,
  resolved: 27,
  bySeverity: {
    critical: 2,
    high: 6,
    medium: 18,
    low: 21,
  },
};

export default function Home() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // QR Code scan detection
  const source = searchParams.get("source");
  const materialId = searchParams.get("material");
  const itemId = searchParams.get("item");

  const qrScanInfo = useMemo(() => {
    if (source !== "qr") return null;

    if (materialId) {
      const id = parseInt(materialId, 10);
      if (!isNaN(id)) return { type: "material" as const, id };
    }
    if (itemId) {
      const id = parseInt(itemId, 10);
      if (!isNaN(id)) return { type: "item" as const, id };
    }
    return null;
  }, [source, materialId, itemId]);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    if (qrScanInfo) {
      setIsQrModalOpen(true);
    }
  }, [qrScanInfo]);

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    // Clean URL parameters
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("source");
    newParams.delete("material");
    newParams.delete("item");
    setSearchParams(newParams, { replace: true });
  };



  return (
    <>
      <PageMeta
        title={t('dashboard.pageTitle')}
        description={t('dashboard.pageDescription')}
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Stats Row */}
        <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
          <StatCard
            title={t('dashboard.stats.maintenancesThisMonth')}
            value={24}
            icon={<FaScrewdriverWrench className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
            color="brand"
          />
          <StatCard
            title={t('dashboard.stats.openIncidents')}
            value={8}
            icon={<FaTriangleExclamation className="h-5 w-5" />}
            trend={{ value: 5, isPositive: false }}
            color="error"
          />
          <StatCard
            title={t('dashboard.stats.itemsInStock')}
            value="1,247"
            icon={<FaBoxesStacked className="h-5 w-5" />}
            trend={{ value: 3, isPositive: true }}
            color="success"
          />
          <StatCard
            title={t('dashboard.stats.activeSites')}
            value={6}
            icon={<FaBuilding className="h-5 w-5" />}
            color="info"
          />
        </div>

        {/* Main Content Row */}
        <div className="col-span-12 xl:col-span-7">
          <RecentActivityCard activities={recentActivities} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <IncidentsSummaryCard summary={incidentsSummary} />
        </div>

        {/* Bottom Row */}
        <div className="col-span-12 xl:col-span-7">
          <UpcomingMaintenancesCard maintenances={upcomingMaintenances} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <LowStockItemsCard items={lowStockItems} />
        </div>

        {/* Charts Row */}
        <div className="col-span-12 xl:col-span-7">
          <ComponentCard title={t('dashboard.charts.maintenanceEvolution')} desc={t('dashboard.charts.maintenanceEvolutionDesc')}>
            <LineChartOne />
          </ComponentCard>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <ComponentCard title={t('dashboard.charts.incidentsByMonth')} desc={t('dashboard.charts.incidentsByMonthDesc')}>
            <BarChartOne />
          </ComponentCard>
        </div>
      </div>

      {/* QR Code Scan Modal */}
      {qrScanInfo && (
        <QrCodeScanModal
          isOpen={isQrModalOpen}
          onClose={handleCloseQrModal}
          scanType={qrScanInfo.type}
          scanId={qrScanInfo.id}
        />
      )}
    </>
  );
}
