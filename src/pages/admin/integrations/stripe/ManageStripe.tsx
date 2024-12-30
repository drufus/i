import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { StripeErrorBoundary } from '../../../../components/admin/integrations/stripe/ErrorBoundary';
import { StripeSettings } from '../../../../components/admin/integrations/stripe/StripeSettings';

export default function ManageStripe() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="secondary"
        onClick={() => navigate('/admin')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Integrations
      </Button>

      <StripeErrorBoundary>
        <StripeSettings />
      </StripeErrorBoundary>
    </div>
  );
}