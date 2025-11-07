import { useState } from 'react';
import { useSelector } from 'react-redux';
import paymentApi from '../../api/paymentApi';

export const useMomoPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.user);
  const userId = user?.userID;

  const packages = [
    { duration: "1 tháng", price: "100.000đ", amount: 100000, packageType: "ONE_MONTH" },
    { duration: "6 tháng", price: "500.000đ", amount: 500000, packageType: "SIX_MONTHS" },
    { duration: "1 năm", price: "900.000đ", amount: 900000, packageType: "ONE_YEAR" },
  ];

  const initiateMomoPayment = async (pkg) => {
    if (!userId) {
      setError("Bạn cần đăng nhập để thực hiện thanh toán.");
      return;
    }
    setLoading(true);
    setError(null);
    try {

      const response = await paymentApi.createMomoPayment(parseInt(userId), pkg.packageType, pkg.amount);
      if (response && response.payUrl) {
        window.location.href = response.payUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán từ server.");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra trong quá trình tạo thanh toán.");
      console.error("Payment Error:", err);
      setLoading(false);
    }
  };

  return { loading, error, packages, initiateMomoPayment };
};
