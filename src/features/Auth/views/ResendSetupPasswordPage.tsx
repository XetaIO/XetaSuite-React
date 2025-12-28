import PageMeta from "@/shared/components/common/PageMeta";
import AuthPageLayout from "./AuthPageLayout";
import ResendSetupPasswordForm from "./ResendSetupPasswordForm";

export default function ResendSetupPasswordPage() {
    return (
        <>
            <PageMeta
                title="Renvoyer le lien de configuration | XetaSuite"
                description="Demandez un nouveau lien de configuration de mot de passe"
            />
            <AuthPageLayout>
                <ResendSetupPasswordForm />
            </AuthPageLayout>
        </>
    );
}
