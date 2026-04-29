import { MarketingSubNav } from './MarketingSubNav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <MarketingSubNav />
            {children}
        </div>
    )
}
