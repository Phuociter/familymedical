import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import paymentApi from '../../api/paymentApi';

export const useMomoCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.user);

  const [paymentStatusMessage, setPaymentStatusMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resultCode = parseInt(queryParams.get('resultCode'));
    const orderId = queryParams.get('orderId');

    const updateStatus = async () => {
      if (orderId && !isNaN(resultCode)) {
        try {
          setLoading(true);
          const data = await paymentApi.updateMomoPaymentStatus(orderId, resultCode);
          const status = data.paymentStatus;
          if (status === 'Completed') {
            setPaymentStatusMessage('Thanh toán thành công!');
            setIsError(false);
          } else {
            setPaymentStatusMessage('Thanh toán thất bại.');
            setIsError(true);
          }
        } catch (error) {
          setPaymentStatusMessage('Lỗi khi cập nhật trạng thái thanh toán: ' + error.message);
          setIsError(true);
          console.error("Update MoMo Payment Status Error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setPaymentStatusMessage('Không tìm thấy thông tin thanh toán hợp lệ.');
        setIsError(true);
        setLoading(false);
      }
    };

    updateStatus();
  }, [location.search]);

  const navigateToRoleBasedDashboard = () => {
    if (role === 'ChuHo') {
      navigate('/families');
    } else if (role === 'BacSi') {
      navigate('/doctor');
    } else {
      navigate('/');
    }
  };

  return { paymentStatusMessage, isError, loading, navigateToRoleBasedDashboard };
};
