import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client (using public URL/Key for read-only operations)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing Supabase env variables. Generating static sitemap only. Make sure to run with --env-file=.env.local on Node v20.6+');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

async function generateSitemap() {
  const baseUrl = 'https://lescordistes.com';
  
  // Static URLs
  const urls = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/jobs', changefreq: 'always', priority: 0.9 },
    { loc: '/login', changefreq: 'monthly', priority: 0.5 },
    { loc: '/register', changefreq: 'monthly', priority: 0.8 },
  ];

  if (supabase) {
    // Fetch live jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('slug, updated_at')
      .eq('status', 'live');
      
    if (jobs) {
      jobs.forEach(job => {
        urls.push({
          loc: `/jobs/${job.slug}`,
          lastmod: new Date(job.updated_at).toISOString().split('T')[0],
          changefreq: 'daily',
          priority: 0.8
        });
      });
    }

    // Fetch pro profiles
    const { data: pros } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('role', 'pro');
      
    if (pros) {
      pros.forEach(pro => {
        urls.push({
          loc: `/pros/${pro.id}`,
          lastmod: new Date(pro.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.7
        });
      });
    }
  }

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);
  console.log(`✅ Sitemap successfully generated at ${outputPath} with ${urls.length} URLs.`);
}

generateSitemap().catch(console.error);
