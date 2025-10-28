import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { bookingAPI } from "@/services/api";
import { toast } from "sonner";

interface BookingDetailsData {
  booking_id: string;
  guest_name: string;
  phone_number: string;
  number_of_persons: number;
  booking_type: string;
  total_hours: number;
  booking_date: string;
  in_time: string;
  out_time: string;
  proof_type: string;
  proof_id: string;
  price_per_person: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_method: string;
  booking_status: string;
  worker_name?: string;
  admin_name?: string;
  created_at?: string;
  updated_at?: string;
}

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetailsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getBookingById(id);
        const bookingData = response.data?.booking;

        if (!bookingData) {
          toast.error("Booking not found");
          return;
        }

        setBooking(bookingData);
      } catch (error: any) {
        console.error("Error fetching booking", error);
        toast.error(
          error.response?.data?.message || "Failed to load booking details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const formatDate = (value?: string) => {
    if (!value) return "";
    if (value.includes("T")) return value.split("T")[0];
    return value;
  };

  const formatTime = (value?: string) => {
    if (!value) return "";
    return value.slice(0, 5);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) {
      return value;
    }
    return dateObj.toLocaleString();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const balanceAmount = useMemo(() => {
    if (!booking) return 0;
    const balance = (booking.total_amount || 0) - (booking.paid_amount || 0);
    return Math.max(balance, 0);
  }, [booking]);

  return (
    <div className="min-h-screen bg-muted">
      <Navigation />

      <main className="p-6">
        <div className="bg-black text-white rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Completed Booking</h1>
              <p className="text-gray-300">
                {loading
                  ? "Fetching booking details..."
                  : booking
                  ? "Final summary of the booking"
                  : "Booking details unavailable"}
              </p>
            </div>
            {booking?.booking_status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-sm uppercase tracking-wide">
                Status: {booking.booking_status}
              </span>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-8">
          {loading && (
            <p className="text-center text-muted-foreground">
              Loading booking details...
            </p>
          )}

          {!loading && !booking && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No booking information found for ID {id}.
              </p>
              <Button variant="outline" onClick={handleBack}>
                Go Back
              </Button>
            </div>
          )}

          {!loading && booking && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booking ID
                  </label>
                  <Input
                    value={booking.booking_id}
                    readOnly
                    className="bg-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Guest Name
                  </label>
                  <Input
                    value={booking.guest_name || "-"}
                    readOnly
                    className="bg-muted/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={booking.phone_number || "-"}
                    readOnly
                    className="bg-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assigned Worker
                  </label>
                  <Input
                    value={booking.worker_name || "-"}
                    readOnly
                    className="bg-muted/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Persons
                  </label>
                  <Input
                    value={booking.number_of_persons?.toString() || "-"}
                    readOnly
                    className="bg-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booking Type
                  </label>
                  <Input
                    value={booking.booking_type || "-"}
                    readOnly
                    className="bg-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Handled By
                  </label>
                  <Input
                    value={booking.admin_name || "-"}
                    readOnly
                    className="bg-muted/40"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Booking Date
                    </label>
                    <Input
                      value={formatDate(booking.booking_date)}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Check-in Time
                    </label>
                    <Input
                      value={formatTime(booking.in_time)}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Checkout Time
                    </label>
                    <Input
                      value={formatTime(booking.out_time)}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Hours
                    </label>
                    <Input
                      value={booking.total_hours?.toString() || "0"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Guest Proof</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proof Type
                    </label>
                    <Input
                      value={booking.proof_type || "-"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proof ID
                    </label>
                    <Input
                      value={booking.proof_id || "-"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price per Person (₹)
                    </label>
                    <Input
                      value={booking.price_per_person?.toString() || "0"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Amount (₹)
                    </label>
                    <Input
                      value={booking.total_amount?.toString() || "0"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Paid Amount (₹)
                    </label>
                    <Input
                      value={booking.paid_amount?.toString() || "0"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Balance Amount (₹)
                    </label>
                    <Input
                      value={balanceAmount.toString()}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Payment Method
                    </label>
                    <Input
                      value={booking.payment_method || "-"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Created At
                    </label>
                    <Input
                      value={formatDateTime(booking.created_at)}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Updated At
                    </label>
                    <Input
                      value={formatDateTime(booking.updated_at)}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;
