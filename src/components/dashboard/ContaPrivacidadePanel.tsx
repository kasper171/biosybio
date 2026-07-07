import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AtSign,
  Eye,
  Globe,
  Hash,
  KeyRound,
  Link2,
  Mail,
  Save,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile-storage";
import { setPublicTemplateEnabled } from "@/lib/profile-template";
import { BiosyToggle } from "@/components/ui/BiosyToggle";
import { cn } from "@/lib/utils";
import { DashboardAccountLayout, DashCard } from "./DashboardAccountLayout";

type Props = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
};

function PrivacyToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-all duration-200",
        "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]",
        checked && "border-pink-500/25 bg-pink-500/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
      )}
    >
      <span>
        <span className={cn("block text-sm font-medium transition-colors", checked ? "text-white" : "text-white/90")}>
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-white/40">{description}</span>
      </span>
      <BiosyToggle
        checked={checked}
        onChange={onChange}
        variant="switch"
        aria-label={label}
        className="mt-0.5"
      />
    </label>
  );
}

export function ContaPrivacidadePanel({ profile, onProfileChange }: Props) {
  const [username, setUsername] = useState(profile.username);
  const [showUsername, setShowUsername] = useState(profile.show_username !== false);
  const [showViews, setShowViews] = useState(profile.show_view_count !== false);
  const [showUid, setShowUid] = useState(profile.show_public_uid !== false);
  const [publicTemplate, setPublicTemplate] = useState(profile.public_template_enabled === true);
  const [togglingTemplate, setTogglingTemplate] = useState(false);
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setNewEmail(data.user?.email ?? "");
    });
  }, []);

  useEffect(() => {
    setUsername(profile.username);
    setShowUsername(profile.show_username !== false);
    setShowViews(profile.show_view_count !== false);
    setShowUid(profile.show_public_uid !== false);
    setPublicTemplate(profile.public_template_enabled === true);
  }, [profile]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const saveProfileSettings = async () => {
    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) {
      toast.error("O nome de usuário precisa ter pelo menos 3 caracteres");
      return;
    }
    if (clean.length > 30) {
      toast.error("O nome de usuário pode ter no máximo 30 caracteres");
      return;
    }

    setSavingProfile(true);

    if (clean !== profile.username) {
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", profile.id)
        .maybeSingle();
      if (taken) {
        setSavingProfile(false);
        toast.error("Este nome de usuário já está em uso");
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: clean,
        show_username: showUsername,
        show_view_count: showViews,
        show_public_uid: showUid,
      })
      .eq("id", profile.id);

    setSavingProfile(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const updated = {
      ...profile,
      username: clean,
      show_username: showUsername,
      show_view_count: showViews,
      show_public_uid: showUid,
    };
    onProfileChange(updated);
    setUsername(clean);
    toast.success("Configurações de privacidade salvas!");
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === email) {
      toast.error("Informe um e-mail diferente do atual");
      return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSavingEmail(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verifique sua caixa de entrada para confirmar o novo e-mail");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Senha atualizada com sucesso!");
  };

  const handlePublicTemplateToggle = async (enabled: boolean) => {
    setTogglingTemplate(true);
    setPublicTemplate(enabled);
    try {
      const updated = await setPublicTemplateEnabled(profile, enabled);
      onProfileChange(updated);
      toast.success(
        enabled
          ? "Template público ativado! Seu estilo será publicado e atualizado automaticamente."
          : "Template público desativado.",
      );
    } catch (e) {
      setPublicTemplate(!enabled);
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar template público");
    } finally {
      setTogglingTemplate(false);
    }
  };

  return (
    <DashboardAccountLayout profile={profile} activeSection="privacidade">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <Shield className="h-5 w-5 text-pink-400" />
            Privacidade
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Controle o que aparece no seu perfil e gerencie os dados da sua conta.
          </p>
        </div>

        <DashCard title="Nome de usuário">
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            Seu link público é baseado no nome de usuário. Ao alterá-lo, o link antigo deixa de
            funcionar.
          </p>
          <label className="mb-1 block text-xs font-medium text-white/55">Link do perfil</label>
          <div className="mb-3 flex items-center rounded-xl border border-white/[0.08] bg-black/30 px-3">
            <Link2 className="mr-2 h-4 w-4 shrink-0 text-white/35" />
            <span className="shrink-0 text-sm text-white/40">{origin ? `${origin.replace(/^https?:\/\//, "")}/` : "/"}</span>
            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
              minLength={3}
              maxLength={30}
              className="w-full bg-transparent py-3 text-sm text-white outline-none"
              placeholder="seuusuario"
            />
          </div>
          <Link
            to="/$username"
            params={{ username: username || profile.username }}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-pink-400 transition hover:text-pink-300"
          >
            <AtSign className="h-3.5 w-3.5" />
            Ver página @{username || profile.username}
          </Link>
        </DashCard>

        <DashCard title="Template público">
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            Publique seu estilo atual como template da comunidade. Qualquer pessoa pode copiar layout,
            cores, tamanhos e efeitos — avatar, imagens e músicas de quem usar continuam os deles.
            O template aparece como{" "}
            <span className="text-white/70">Template de {profile.display_name || profile.username}</span>{" "}
            e atualiza automaticamente quando você salva o perfil.
          </p>
          <PrivacyToggle
            label="Template público"
            description="Sincroniza seu estilo ao vivo na galeria de templates públicos"
            checked={publicTemplate}
            onChange={(v) => {
              if (!togglingTemplate) void handlePublicTemplateToggle(v);
            }}
          />
          <Link
            to="/dashboard"
            search={{ section: "templates" }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-pink-400 transition hover:text-pink-300"
          >
            <Globe className="h-3.5 w-3.5" />
            Ver galeria de templates
          </Link>
        </DashCard>

        <DashCard title="Visibilidade no card">
          <p className="mb-4 text-xs text-white/45">
            Escolha quais informações ficam visíveis no canto do seu card público.
          </p>
          <div className="space-y-2">
            <PrivacyToggle
              label="Mostrar @ no card"
              description="Exibe o nome de usuário (@username) abaixo do nome exibido"
              checked={showUsername}
              onChange={setShowUsername}
            />
            <PrivacyToggle
              label="Mostrar visualizações"
              description="Exibe o contador de visualizações no canto superior direito"
              checked={showViews}
              onChange={setShowViews}
            />
            <PrivacyToggle
              label="Mostrar UID"
              description={
                profile.public_uid != null
                  ? `Exibe #${profile.public_uid.toLocaleString("pt-BR")} no canto superior esquerdo`
                  : "Exibe seu UID no canto superior esquerdo do card"
              }
              checked={showUid}
              onChange={setShowUid}
            />
          </div>
          <button
            type="button"
            onClick={saveProfileSettings}
            disabled={savingProfile}
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? "Salvando..." : "Salvar alterações"}
          </button>
        </DashCard>

        <DashCard title="E-mail da conta">
          <form onSubmit={handleEmailChange} className="space-y-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <Mail className="h-3.5 w-3.5" />
                E-mail atual
              </label>
              <input
                value={email}
                readOnly
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-white/50 outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">Novo e-mail</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                placeholder="novo@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={savingEmail}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {savingEmail ? "Enviando..." : "Alterar e-mail"}
            </button>
          </form>
        </DashCard>

        <DashCard title="Senha">
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <KeyRound className="h-3.5 w-3.5" />
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                placeholder="Repita a senha"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {savingPassword ? "Salvando..." : "Alterar senha"}
            </button>
          </form>
        </DashCard>
      </div>
    </DashboardAccountLayout>
  );
}
