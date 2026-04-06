import React from 'react';
import { Star } from 'lucide-react';
import { getLocalReviews } from '../../constants/seoData';

interface Props {
    cityName: string;
    serviceName?: string;
}

export const SEOLocalReviews: React.FC<Props> = ({ cityName, serviceName }) => {
    const { reviews, rating, count } = getLocalReviews(cityName, serviceName);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm my-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">
                Avis de nos clients à {cityName}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
                {reviews.map((review, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative flex flex-col">
                        <div className="flex text-amber-400 mb-3 gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} className={i < review.rating ? "" : "text-slate-300"} />
                            ))}
                        </div>
                        <p className="text-slate-700 text-sm italic mb-4 flex-grow">"{review.text}"</p>
                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-200/60">
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-sm shrink-0">
                                {review.author.charAt(0)}
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900 text-sm">{review.author}</div>
                                <div className="text-xs text-slate-400">{review.date}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-full">
                    <Star size={16} className="text-amber-500" fill="currentColor" strokeWidth={0} />
                    Ils ont fait confiance à LesCordistes.com — rejoignez-les.
                </div>
            </div>
        </div>
    );
};
