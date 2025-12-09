import PageMeta from "@/shared/components/common/PageMeta";
import AuthPageLayout from "./AuthPageLayout";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <>
            <PageMeta
                title="Réinitialiser le mot de passe | XetaSuite"
                description="Créez un nouveau mot de passe pour votre compte XetaSuite"
            />
            <AuthPageLayout>
                <ResetPasswordForm />
            </AuthPageLayout>
        </>
    );
}
