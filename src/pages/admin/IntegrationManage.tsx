import React, { Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// Lazy load integration management components
const ManageStripe = React.lazy(() => import('./integrations/stripe/ManageStripe'));

export default function IntegrationManage() {
  const { integrationId } = useParams();
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

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }>
        {integrationId === 'stripe' ? (
          <ManageStripe />
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">Integration not found</p>
          </div>
        )}
      </Suspense>
    </div>
  );
}