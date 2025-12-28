import PageMeta from "@/shared/components/common/PageMeta";
import AuthPageLayout from "./AuthPageLayout";
import SetupPasswordForm from "./SetupPasswordForm";

export default function SetupPasswordPage() {
    return (
        <>
            <PageMeta
                title="Créer mon mot de passe | XetaSuite"
                description="Créez votre mot de passe pour accéder à votre compte XetaSuite"
            />
            <AuthPageLayout>
                <SetupPasswordForm />
            </AuthPageLayout>
        </>
    );
}
