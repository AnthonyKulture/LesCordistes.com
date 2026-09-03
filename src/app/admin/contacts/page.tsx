import { fetchContacts } from '@/lib/ops/fetchContacts'
import { isCurrentUserAdmin } from '@/lib/ops/guard'
import { isContactAudience, isLifecycleStage } from '@/lib/types/crm'
import { ContactsList } from './ContactsList'
import { CONTACTS_LIST_LIMIT } from './contactsKeys'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Contacts · Admin',
}

type SearchParams = {
    q?: string
    stage?: string
    audience?: string
    account?: string
    source?: string
}

export default async function ContactsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const sp = await searchParams

    // Fail-closed : le layout redirige déjà les non-admins, mais layout et page
    // sont rendus concurremment — sans ce garde, la lecture service_role
    // partirait quand même.
    const initialContacts = (await isCurrentUserAdmin())
        ? await fetchContacts({ limit: CONTACTS_LIST_LIMIT })
        : null

    return (
        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
            <header className="mb-5">
                <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
                <p className="text-sm text-slate-500">
                    Une personne, une fiche. Captures, demandes de rappel, comptes et achats sont
                    réunis sur le même journal.
                </p>
            </header>

            <ContactsList
                initialContacts={initialContacts}
                initialQuery={sp.q ?? ''}
                initialStage={isLifecycleStage(sp.stage) ? sp.stage : 'all'}
                initialAudience={isContactAudience(sp.audience) ? sp.audience : 'all'}
                initialAccount={sp.account === 'yes' || sp.account === 'no' ? sp.account : 'all'}
                initialSource={sp.source ?? ''}
            />
        </div>
    )
}
