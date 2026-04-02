import * as React from 'npm:react@18.3.1';
import { Section, Text, Heading, Button, Hr } from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface JobStatusEmailProps {
  name: string;
  jobTitle: string;
  status: 'live' | 'rejected';
  rejectionReason?: string;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate700 = '#334155';
const slate500 = '#64748b';

export const JobStatusEmail = ({ name, jobTitle, status, rejectionReason }: JobStatusEmailProps) => {
  const isApproved = status === 'live';

  return (
    <BaseLayout
      previewText={
        isApproved
          ? `Votre projet "${jobTitle}" est en ligne — les pros peuvent maintenant vous contacter`
          : `Votre projet "${jobTitle}" nécessite des modifications`
      }
    >
      {/* Status badge */}
      <Section style={{
        backgroundColor: isApproved ? '#f0fdf4' : '#fef2f2',
        borderLeft: `4px solid ${isApproved ? '#16a34a' : '#dc2626'}`,
        borderRadius: '0 6px 6px 0',
        padding: '14px 18px',
        margin: '0 0 28px',
      }}>
        <Text style={{
          fontSize: '13px',
          fontWeight: '700',
          color: isApproved ? '#15803d' : '#b91c1c',
          margin: '0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {isApproved ? 'Projet approuvé et publié' : 'Publication refusée'}
        </Text>
      </Section>

      <Heading style={{ fontSize: '22px', fontWeight: '700', color: brandBlue, margin: '0 0 8px', lineHeight: '30px' }}>
        {isApproved ? 'Votre projet est en ligne !' : 'Votre projet n\'a pas été publié'}
      </Heading>
      <Text style={{ fontSize: '15px', color: slate500, margin: '0 0 24px', lineHeight: '22px' }}>
        Bonjour {name},
      </Text>

      {/* Job title card */}
      <Section style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px' }}>
        <Text style={{ fontSize: '12px', color: slate500, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
          Projet concerné
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: brandBlue, margin: '0' }}>
          {jobTitle}
        </Text>
      </Section>

      {isApproved ? (
        <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 28px' }}>
          Votre projet a été validé par notre équipe et est désormais visible par l'ensemble des professionnels du réseau. Les cordistes correspondant à vos critères peuvent maintenant vous contacter.
        </Text>
      ) : (
        <>
          <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 20px' }}>
            Notre équipe de modération n'a pas pu valider votre projet en l'état. Vous pouvez le modifier et le soumettre à nouveau.
          </Text>
          {rejectionReason && (
            <Section style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px 20px',
              margin: '0 0 28px',
            }}>
              <Text style={{ fontSize: '13px', fontWeight: '600', color: '#b91c1c', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Motif
              </Text>
              <Text style={{ fontSize: '14px', color: '#7f1d1d', margin: '0', lineHeight: '21px' }}>
                {rejectionReason}
              </Text>
            </Section>
          )}
        </>
      )}

      <Button
        href="https://lescordistes.com/dashboard/client"
        style={{
          backgroundColor: brandBlue,
          borderRadius: '6px',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '600',
          textDecoration: 'none',
          textAlign: 'center' as const,
          display: 'block',
          padding: '14px 24px',
        }}
      >
        {isApproved ? 'Voir mon tableau de bord' : 'Modifier mon projet'}
      </Button>

      <Hr style={{ borderColor: '#e2e8f0', margin: '28px 0' }} />

      <Text style={{ fontSize: '13px', color: slate500, margin: '0', lineHeight: '20px' }}>
        Une question sur la modération ? Contactez-nous à{' '}
        <span style={{ color: brandBlueLight }}>contact@lescordistes.com</span>
      </Text>

    </BaseLayout>
  );
};
