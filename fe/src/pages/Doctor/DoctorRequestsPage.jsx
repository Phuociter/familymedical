import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Box, Alert } from '@mui/material';
import { RESPOND_TO_DOCTOR_REQUEST } from '../../graphql/doctorMutations';
import { GET_DOCTOR_REQUESTS } from '../../graphql/doctorQueries';
import { MOCK_DOCTOR_REQUESTS } from '../../mocks/doctorRequestsMockData';
import RequestList from '../../components/Doctor/Request/RequestList';
import RequestDetailDialog from '../../components/Doctor/Request/RequestDetailDialog';

export default function DoctorRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [mockRequests, setMockRequests] = useState(MOCK_DOCTOR_REQUESTS);

  const { data, loading, error, refetch } = useQuery(GET_DOCTOR_REQUESTS, {
    fetchPolicy: 'cache-and-network',
    skip: useMockData,
  });

  const [respondToRequest, { loading: responding }] = useMutation(RESPOND_TO_DOCTOR_REQUEST, {
    onCompleted: () => {
      setDetailDialogOpen(false);
      setSelectedRequest(null);
      if (!useMockData) {
        refetch();
      }
    },
    onError: (error) => {
      console.error('Error responding to request:', error);
      setUseMockData(true);
    },
  });

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleRespond = (actionType, message) => {
    if (!selectedRequest) return;

    if (useMockData) {
      const updatedRequests = mockRequests.map(req => {
        if (req.requestID === selectedRequest.requestID) {
          return {
            ...req,
            status: actionType,
            responseDate: new Date().toISOString(),
            responseMessage: message || null,
          };
        }
        return req;
      });
      setMockRequests(updatedRequests);
      handleCloseDialog();
    } else {
      respondToRequest({
        variables: {
          requestId: selectedRequest.requestID,
          status: actionType,
          message: message || undefined,
        },
      });
    }
  };

  

  const requests = data?.doctorRequests;

  return (
    <Box maxWidth="lg">
 
      <RequestList
        requests={requests}
        loading={loading && !useMockData}
        error={!useMockData ? error : null}
        onRequestClick={handleRequestClick}
      />

      <RequestDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        request={selectedRequest}
        onRespond={handleRespond}
        loading={responding}
      />
    </Box>
  );
}
