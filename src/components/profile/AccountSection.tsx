'use client'

import React, { useState } from 'react'
import { Lock, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { useToast } from '../ui/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../lib/supabase-browser'

export function AccountSection() {
    const { signOut } = useAuth()
    const router = useRouter()
    const toast = useToast()

    const [newPassword, setNewPassword] = useState('')
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
    const [savingPassword, setSavingPassword] = useState(false)

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)

    async function handlePasswordSave(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword.length < 6) {
            toast.error('Le mot de passe doit faire au moins 6 caractères')
            return
        }
        if (newPassword !== newPasswordConfirm) {
            toast.error('Les mots de passe ne correspondent pas')
            return
        }
        setSavingPassword(true)
        try {
            const client = createSupabaseBrowserClient()
            const { error } = await client.auth.updateUser({ password: newPassword })
            if (error) throw error
            toast.success('Mot de passe défini avec succès !')
            setNewPassword('')
            setNewPasswordConfirm('')
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe')
        } finally {
            setSavingPassword(false)
        }
    }

    async function handleDeleteAccount() {
        if (deleteConfirmText !== 'SUPPRIMER') return
        setIsDeletingAccount(true)
        try {
            const res = await fetch('/api/delete-account', { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erreur serveur')
            }
            await signOut()
            router.replace('/')
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la suppression du compte')
            setIsDeletingAccount(false)
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Mot de passe */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Lock size={18} className="text-brand-blue" />
                    Mot de passe
                </h2>
                <form onSubmit={handlePasswordSave} className="space-y-3">
                    <Input
                        label="Nouveau mot de passe"
                        type="password"
                        placeholder="Minimum 6 caractères"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                    <Input
                        label="Confirmer le mot de passe"
                        type="password"
                        placeholder="Répétez le mot de passe"
                        value={newPasswordConfirm}
                        onChange={e => setNewPasswordConfirm(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!newPassword || !newPasswordConfirm || savingPassword}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-brand-blue rounded-xl hover:bg-brand-blue-light disabled:opacity-40 transition-colors"
                    >
                        {savingPassword && <Loader2 size={15} className="animate-spin" />}
                        {savingPassword ? 'Enregistrement…' : 'Définir le mot de passe'}
                    </button>
                </form>
            </section>

            {/* Zone de danger */}
            <section className="bg-white rounded-2xl shadow-sm border border-red-100 p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-bold text-red-600 flex items-center gap-2 mb-2">
                    <AlertTriangle size={18} />
                    Zone de danger
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                    La suppression de votre compte est irréversible. Toutes vos données (missions, messages, crédits) seront définitivement effacées.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={16} />
                        Supprimer mon compte
                    </button>
                ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-bold text-red-700">
                            Tapez <span className="font-black">SUPPRIMER</span> pour confirmer
                        </p>
                        <Input
                            type="text"
                            placeholder="SUPPRIMER"
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'SUPPRIMER' || isDeletingAccount}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {isDeletingAccount && <Loader2 size={15} className="animate-spin" />}
                                {isDeletingAccount ? 'Suppression…' : 'Confirmer la suppression'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setDeleteConfirmText('')
                                }}
                                disabled={isDeletingAccount}
                                className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
