import React from 'react';
import { User } from 'lucide-react';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import type { Profile } from '../../types';

interface PersonalInfoFormProps {
    isEditing: boolean;
    formData: any;
    setFormData: (data: any) => void;
    profile: Profile;
    isPro: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
    isEditing, formData, setFormData, profile, isPro 
}) => {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User size={20} className="text-brand-blue" />
                Informations personnelles
            </h2>

            {isEditing ? (
                <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Nom complet"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Jean Dupont"
                        />
                        <Input
                            label="Téléphone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+33 6 12 34 56 78"
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                                Vous êtes :
                            </label>
                            <select
                                value={formData.client_type}
                                onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:border-brand-blue outline-none transition-all text-slate-700 font-medium bg-white"
                            >
                                <option value="">Sélectionnez votre typologie</option>
                                <optgroup label="Clients Standards">
                                    <option value="particulier">🏡 Particulier</option>
                                    <option value="copropriete_syndic">🏢 Copropriété & Syndic</option>
                                    <option value="entreprise_tertiaire">💼 Entreprise & Tertiaire</option>
                                    <option value="industrie_energie">⚙️ Industrie & Énergie</option>
                                    <option value="collectivite_public">🏛️ Collectivité & Public</option>
                                    <option value="association_evenementiel">🎪 Association & Événementiel</option>
                                </optgroup>
                                <optgroup label="Recrutement Pro (Renfort)">
                                    <option value="entreprise_travaux_hauteur">🏗️ Société de travaux en hauteur</option>
                                    <option value="entreprise_btp">👷 Entreprise du BTP / Génie Civil</option>
                                    <option value="agence_interim">🏢 Agence d'intérim spécialisée</option>
                                    <option value="autre_pro">🤝 Autre professionnel</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                    {isPro && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Nom de l'entreprise"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                placeholder="Cordistes Pro SAS"
                            />
                            <Input
                                label="SIRET"
                                value={formData.siret}
                                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                                placeholder="123 456 789 00012"
                            />
                        </div>
                    )}
                    {isPro && (
                        <TextArea
                            label="Présentation / Bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={4}
                            placeholder="Présentez votre expérience, vos points forts, ce qui vous distingue..."
                        />
                    )}
                </div>
            ) : (
                <div className="space-y-4 text-slate-700">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">Nom complet</p>
                            <p className="font-medium">{profile.full_name || <span className="text-slate-400 italic">Non renseigné</span>}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">Téléphone</p>
                            <p className="font-medium">{profile.phone || <span className="text-slate-400 italic">Non renseigné</span>}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-0.5">Typologie de client</p>
                        <p className="font-medium">
                            {profile.client_type ? (
                                profile.client_type === 'particulier' ? '🏡 Particulier' :
                                profile.client_type === 'copropriete_syndic' ? '🏢 Copropriété & Syndic' :
                                profile.client_type === 'entreprise_tertiaire' ? '💼 Entreprise & Tertiaire' :
                                profile.client_type === 'industrie_energie' ? '⚙️ Industrie & Énergie' :
                                profile.client_type === 'collectivite_public' ? '🏛️ Collectivité & Public' :
                                profile.client_type === 'association_evenementiel' ? '🎪 Association & Événementiel' :
                                profile.client_type === 'entreprise_travaux_hauteur' ? '🏗️ Société de travaux en hauteur' :
                                profile.client_type === 'entreprise_btp' ? '👷 Entreprise du BTP / Génie Civil' :
                                profile.client_type === 'agence_interim' ? '🏢 Agence d\'intérim spécialisée' :
                                profile.client_type === 'autre_pro' ? '🤝 Autre professionnel' :
                                profile.client_type
                            ) : <span className="text-slate-400 italic">Non renseignée</span>}
                        </p>
                    </div>
                    {isPro && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Entreprise</p>
                                <p className="font-medium">{profile.company_name || <span className="text-slate-400 italic">Non renseigné</span>}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">SIRET</p>
                                <p className="font-medium">{profile.siret || <span className="text-slate-400 italic">Non renseigné</span>}</p>
                            </div>
                        </div>
                    )}
                    {isPro && profile.bio && (
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">Présentation</p>
                            <p className="leading-relaxed">{profile.bio}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
