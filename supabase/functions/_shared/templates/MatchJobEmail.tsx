import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Button,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface MatchJobEmailProps {
  proName: string;
  jobTitle: string;
  location: string;
  jobId: string;
  isRenfort?: boolean;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const MatchJobEmail = ({ proName, jobTitle, location, jobId, isRenfort }: MatchJobEmailProps) => (
  <BaseLayout previewText={`🔔 Nouvelle mission à ${location} : ${jobTitle}`}>
    <Section>
      <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
        🔔 Nouvelle mission dans votre zone !
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Bonjour {proName},
      </Text>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Une nouvelle mission {isRenfort ? 'de **Renfort PRO**' : ''} vient d'être publiée à <strong>{location}</strong> et correspond à vos zones d'intervention.
      </Text>
      
      <Section style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
        <Text style={{ margin: '0', fontWeight: 'bold', fontSize: '18px' }}>{jobTitle}</Text>
        <Text style={{ margin: '4px 0 0', color: '#64748b' }}>📍 {location}</Text>
      </Section>

      <Section style={{ padding: '24px 0' }}>
        <Button
          href={`https://lescordistes.com/jobs/${jobId}`}
          style={{
            backgroundColor: brandOrange,
            borderRadius: '6px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            textDecoration: 'none',
            textAlign: 'center' as const,
            display: 'block',
            padding: '12px 24px',
          }}
        >
          Voir les détails de la mission
        </Button>
      </Section>
      
      <Text style={{ fontSize: '14px', color: '#666' }}>
        Ne tardez pas trop, les missions les plus intéressantes sont débloquées rapidement !
      </Text>
    </Section>
  </BaseLayout>
);
