import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Button,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface JobStatusEmailProps {
  name: string;
  jobTitle: string;
  status: 'live' | 'rejected';
  rejectionReason?: string;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const JobStatusEmail = ({ name, jobTitle, status, rejectionReason }: JobStatusEmailProps) => {
  const isApproved = status === 'live';
  
  return (
    <BaseLayout 
      previewText={isApproved ? `Votre mission « ${jobTitle} » est en ligne !` : `Action requise : Votre mission « ${jobTitle} » a été refusée`}
    >
      <Section>
        <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {isApproved ? 'Votre mission est en ligne !' : 'Votre mission a été refusée'}
        </Heading>
        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          Bonjour {name},
        </Text>
        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          {isApproved 
            ? `Bonne nouvelle ! Votre mission « ${jobTitle} » a été validée par nos modérateurs et est désormais visible par les professionnels du réseau.`
            : `Nous n'avons pas pu valider votre mission « ${jobTitle} » en l'état.`
          }
        </Text>
        
        {!isApproved && rejectionReason && (
          <Section style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f87171', margin: '16px 0' }}>
            <Text style={{ margin: '0', fontWeight: 'bold', color: '#991b1b' }}>Motif du refus :</Text>
            <Text style={{ margin: '8px 0 0', color: '#7f1d1d' }}>{rejectionReason}</Text>
          </Section>
        )}

        <Section style={{ padding: '24px 0' }}>
          <Button
            href="https://lescordistes.com/dashboard/client"
            style={{
              backgroundColor: isApproved ? brandOrange : brandBlue,
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
            {isApproved ? 'Voir ma mission en ligne' : 'Modifier ma mission'}
          </Button>
        </Section>
        
        <Text style={{ fontSize: '14px', color: '#666' }}>
          L'équipe LesCordistes.com
        </Text>
      </Section>
    </BaseLayout>
  );
};
